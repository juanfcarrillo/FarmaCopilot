import 'server-only';
import { randomUUID } from 'node:crypto';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import { assertAccepting, assertOwner, digest, documentKey, DomainError, makeCode, opaqueToken, publicSession, secretMatches, validateRegistration, type StoredSession } from './domain';
import type { SessionView } from './client';
class CodeCollision extends Error {}
export class RegistrationService {
  private readonly now: () => number;
  private readonly code: () => string;
  constructor(readonly db: Firestore, private options: { secret: string; now?: () => number; code?: () => string }) { this.now = options.now || Date.now; this.code = options.code || makeCode; }
  async create(owner: string, location: string, register: string) {
    if (typeof location !== 'string' || !location.trim() || location.length > 60 || typeof register !== 'string' || !register.trim() || register.length > 40) throw new DomainError(400, 'Completa el local y la caja.');
    const id = randomUUID(), qrToken = opaqueToken(), now = this.now();
    const session: StoredSession = { id, ownerHash: digest(owner), tokenHash: digest(qrToken), createdAt: now, expiresAt: now + 600000, status: 'awaiting_customer', location: location.trim(), register: register.trim() };
    const batch = this.db.batch(); batch.create(this.db.doc(`registrationSessions/${id}`), session);
    batch.create(this.db.doc(`events/${id}.created`), { type: 'session_created', sessionId: id, at: now, source: 'pos_qr' }); await batch.commit();
    return { session: publicSession(session, now), qrToken };
  }
  private async owned(id: string, owner: string) { const doc = await this.db.doc(`registrationSessions/${id}`).get(); const session = doc.data() as StoredSession | undefined; assertOwner(session, owner); return session!; }
  async get(id: string, owner: string) { return publicSession(await this.owned(id, owner), this.now()); }
  async submit(id: string, token: string, input: unknown) {
    return this.register(id, { method: 'qr', capability: token }, input);
  }
  async submitAssisted(id: string, owner: string, input: unknown) {
    await this.owned(id, owner);
    return this.register(id, { method: 'assisted', capability: owner }, input);
  }
  private async register(id: string, authorization: { method: 'qr' | 'assisted'; capability: string }, input: unknown) {
    const registration = validateRegistration(input);
    const key = (input as Record<string, unknown>).idempotencyKey;
    if (typeof key !== 'string' || key.length < 8 || key.length > 100) throw new DomainError(400, 'No pudimos identificar este envío. Vuelve a intentarlo.');
    const fingerprint = documentKey(JSON.stringify(registration), this.options.secret);
    const customerKey = documentKey(registration.document, this.options.secret);
    const newCustomerId = randomUUID();
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = this.code();
      try {
        return await this.db.runTransaction(async tx => {
          const sessionRef = this.db.doc(`registrationSessions/${id}`), snapshot = await tx.get(sessionRef), session = snapshot.data() as StoredSession | undefined;
          if (authorization.method === 'assisted') assertOwner(session, authorization.capability);
          else if (!session || !session.tokenHash || !secretMatches(authorization.capability, session.tokenHash)) throw new DomainError(404, 'Este QR no está disponible. Pide uno nuevo al dependiente.', 'not_found');
          if (!session) throw new DomainError(404, 'La sesión no está disponible.', 'not_found');
          if (session.code) { if (session.submissionHash !== fingerprint) throw new DomainError(409, 'Esta compra ya tiene un cliente registrado. Continúa en caja o inicia el siguiente registro.', 'consumed'); return { code: session.code, status: 'registered' as const }; }
          const source = authorization.method === 'qr' ? 'pos_qr' : 'pos_assisted';
          const now = this.now(); assertAccepting(session, now);
          const codeRef = this.db.doc(`registrationCodes/${code}`), keyRef = this.db.doc(`customerKeys/${customerKey}`);
          const [codeSnapshot, keySnapshot] = await Promise.all([tx.get(codeRef), tx.get(keyRef)]);
          if (codeSnapshot.exists) throw new CodeCollision();
          const customerId = keySnapshot.exists ? keySnapshot.get('customerId') as string : newCustomerId;
          const customerRef = this.db.doc(`customers/${customerId}`), customerSnapshot = await tx.get(customerRef);
          if (!keySnapshot.exists) {
            tx.create(keyRef, { customerId, createdAt: now });
            tx.create(customerRef, { ...registration, id: customerId, documentVerified: false, emailVerified: false, source, createdAt: now, updatedAt: now });
          } else if (customerSnapshot.get('email') !== registration.email || customerSnapshot.get('marketing') !== registration.marketing) {
            // La captura pública no puede cambiar la identidad ni preferencias canónicas.
            tx.create(this.db.doc(`customerObservations/${id}`), { customerId, sessionId: id, email: registration.email, marketing: registration.marketing, status: 'pending_unverified', source, createdAt: now });
          }
          tx.create(codeRef, { sessionId: id, customerId, createdAt: now });
          tx.update(sessionRef, { status: 'registered', code, customerId, submissionHash: fingerprint, registeredAt: now, registrationMethod: authorization.method });
          tx.create(this.db.doc(`events/${id}.registered`), { type: 'customer_registered', customerId, sessionId: id, at: now, source });
          tx.create(this.db.doc(`events/${id}.code`), { type: 'code_issued', customerId, sessionId: id, at: now, source });
          return { code, status: 'registered' as const };
        });
      } catch (error) { if (!(error instanceof CodeCollision)) throw error; }
    }
    throw new DomainError(503, 'No pudimos emitir el código. Vuelve a intentar.', 'unavailable');
  }
  async cancel(id: string, owner: string) {
    return this.db.runTransaction(async tx => {
      const ref = this.db.doc(`registrationSessions/${id}`), snapshot = await tx.get(ref), session = snapshot.data() as StoredSession | undefined;
      assertOwner(session, owner);
      if (session!.status === 'cancelled') return publicSession(session!, this.now());
      assertAccepting(session!, this.now()); const next = { ...session!, status: 'cancelled' as const };
      tx.update(ref, { status: 'cancelled', cancelledAt: this.now() }); return publicSession(next, this.now());
    });
  }
  async record(id: string, owner: string, code: string, ticket: string) {
    if (typeof code !== 'string' || typeof ticket !== 'string' || ticket.length > 80) throw new DomainError(400, 'Revisa el código y la referencia de ticket.');
    ticket = ticket.trim();
    return this.db.runTransaction(async tx => {
      const ref = this.db.doc(`registrationSessions/${id}`), snapshot = await tx.get(ref), session = snapshot.data() as StoredSession | undefined; assertOwner(session, owner);
      if (!session!.code || code !== session!.code) throw new DomainError(409, 'El código no corresponde a esta sesión.', 'conflict');
      if (session!.status === 'recorded_manual') { if (session!.manualTicket !== ticket) throw new DomainError(409, 'Ya existe una constancia manual con otra referencia.', 'conflict'); return publicSession(session!, this.now()); }
      if (session!.status !== 'registered') throw new DomainError(409, 'Primero espera el registro del cliente.', 'conflict');
      const now = this.now(); tx.create(this.db.doc(`manualVendixRecords/${id}`), { code, sessionId: id, customerId: session!.customerId, ticket: ticket || null, createdAt: now, source: 'manual_unverified', integrationStatus: 'not_connected' });
      tx.create(this.db.doc(`events/${id}.manual`), { type: 'vendix_recorded_manual', customerId: session!.customerId, sessionId: id, at: now, source: 'manual_unverified' });
      tx.update(ref, { status: 'recorded_manual', manualTicket: ticket, recordedAt: now });
      return publicSession({ ...session!, status: 'recorded_manual', manualTicket: ticket, recordedAt: now }, now);
    });
  }
  async rateLimit(key: string, limit: number, windowMs: number) {
    const id = documentKey(key, this.options.secret), ref = this.db.doc(`rateLimits/${id}`);
    await this.db.runTransaction(async tx => {
      const snapshot = await tx.get(ref), now = this.now(), data = snapshot.data();
      const reset = !data || data.resetAt <= now;
      if (!reset && data.count >= limit) throw new DomainError(429, 'Demasiados intentos. Espera un momento y vuelve a probar.', 'rate_limit');
      const resetAt = reset ? now + windowMs : data!.resetAt;
      tx.set(ref, { count: reset ? 1 : data!.count + 1, resetAt, deleteAfter: Timestamp.fromMillis(resetAt + 3600000) });
    });
  }
  watch(id: string, owner: string, next: (view: SessionView) => void, error: () => void) {
    return this.db.doc(`registrationSessions/${id}`).onSnapshot(snapshot => { try { const session = snapshot.data() as StoredSession | undefined; assertOwner(session, owner); next(publicSession(session!, this.now())); } catch { error(); } }, error);
  }
}
