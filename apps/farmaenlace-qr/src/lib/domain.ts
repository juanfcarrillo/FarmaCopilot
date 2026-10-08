import 'server-only';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { isValidDocument, isValidEmail } from './validation';
import type { SessionView } from './client';
export class DomainError extends Error { constructor(readonly status: number, message: string, readonly code = 'invalid') { super(message); } }
export type Registration = { document: string; email: string; marketing: boolean };
export type StoredSession = { id: string; ownerHash: string; tokenHash?: string; createdAt: number; expiresAt: number; status: SessionView['status']; location: string; register: string; code?: string; customerId?: string; submissionHash?: string; recordedAt?: number; manualTicket?: string; registrationMethod?: 'qr' | 'assisted'; [key: string]: unknown };
export function validateRegistration(input: unknown): Registration {
  if (!input || typeof input !== 'object') throw new DomainError(400, 'Completa tus datos para continuar.');
  const data = input as Record<string, unknown>;
  if (!isValidDocument(data.document)) throw new DomainError(400, 'Revisa tu cédula: debe tener 10 dígitos y ser válida.', 'document');
  if (typeof data.email !== 'string' || !isValidEmail(data.email.trim())) throw new DomainError(400, 'Ingresa un correo electrónico válido.', 'email');
  if (data.marketing !== undefined && typeof data.marketing !== 'boolean') throw new DomainError(400, 'Revisa la preferencia de promociones.');
  return { document: data.document, email: data.email.trim().toLowerCase(), marketing: data.marketing === true };
}
export const opaqueToken = () => randomBytes(32).toString('base64url');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const documentKey = (value: string, secret: string) => createHmac('sha256', secret).update(value).digest('hex');
export function secretMatches(value: string, hash: string) { const actual = digest(value); return actual.length === hash.length && timingSafeEqual(Buffer.from(actual), Buffer.from(hash)); }
export function makeCode() { const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = ''; for (let i = 0; i < 10; i++) code += alphabet[randomInt(alphabet.length)]; return `FA-${code.slice(0,4)}-${code.slice(4,8)}-${code.slice(8)}`; }
export function assertOwner(session: StoredSession | undefined, capability: string) { if (!session || !secretMatches(capability, session.ownerHash)) throw new DomainError(404, 'Esta sesión no está disponible en esta caja.', 'not_found'); }
export function assertAccepting(session: StoredSession, now: number) {
  if (session.status === 'cancelled') throw new DomainError(410, 'Este QR fue cancelado. Pide uno nuevo al dependiente.', 'cancelled');
  if (session.status === 'expired' || session.expiresAt <= now) throw new DomainError(410, 'Este QR venció. Pide uno nuevo al dependiente.', 'expired');
  if (session.status !== 'awaiting_customer') throw new DomainError(409, 'Este QR ya fue utilizado.', 'consumed');
}
export function publicSession(session: StoredSession, now = Date.now()): SessionView {
  return { id: session.id, createdAt: session.createdAt, expiresAt: session.expiresAt, status: session.status === 'awaiting_customer' && session.expiresAt <= now ? 'expired' : session.status, location: session.location, register: session.register, code: session.code || null, recordedAt: session.recordedAt || null, integrationStatus: 'not_connected', registrationMethod: session.registrationMethod || null };
}
