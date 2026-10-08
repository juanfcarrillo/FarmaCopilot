import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { RegistrationService } from '../src/lib/service';
let db: ReturnType<typeof getFirestore>, service: RegistrationService;
let now = 100000;
const body = { document: '1710034065', email: 'cliente@example.com', marketing: false, idempotencyKey: 'retry-one' };
beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8085';
  db = getFirestore(initializeApp({ projectId: 'demo-farmaenlace' }, 'integration'));
});
beforeEach(async () => {
  await fetch('http://127.0.0.1:8085/emulator/v1/projects/demo-farmaenlace/databases/(default)/documents', { method: 'DELETE' });
  now = 100000; service = new RegistrationService(db, { secret: 'integration-only-secret-never-use-production', now: () => now });
});
describe('Firestore transaccional real', () => {
  it('captura asistida exige la caja propietaria y conserva fuente sin exponer PII', async () => {
    const a = await service.create('owner', 'A', '1');
    await expect(service.submitAssisted(a.session.id, 'other', body)).rejects.toMatchObject({ status: 404 });
    expect((await db.collection('customers').get()).size).toBe(0);
    const result = await service.submitAssisted(a.session.id, 'owner', body);
    expect(result.status).toBe('registered');
    const view = await service.get(a.session.id, 'owner');
    expect(view.registrationMethod).toBe('assisted');
    expect(JSON.stringify(view)).not.toContain(body.document);
    expect(JSON.stringify(view)).not.toContain(body.email);
    const customer = (await db.collection('customers').get()).docs[0].data();
    expect(customer).toMatchObject({ source: 'pos_assisted', marketing: false, documentVerified: false });
    expect((await db.doc(`events/${a.session.id}.registered`).get()).get('source')).toBe('pos_assisted');
    await expect(service.submitAssisted(a.session.id, 'owner', body)).resolves.toEqual(result);
    const b = await service.create('owner', 'A', '1');
    await service.submitAssisted(b.session.id, 'owner', { ...body, email: 'dictado@example.com', marketing: true });
    expect((await db.collection('customers').get()).size).toBe(1);
    expect((await db.collection('customers').get()).docs[0].get('email')).toBe(body.email);
    expect((await db.doc(`customerObservations/${b.session.id}`).get()).data()).toMatchObject({ source: 'pos_assisted', status: 'pending_unverified' });
  });
  it('QR y dictado concurrentes confirman un único registro; no reemplazan datos ni fuente', async () => {
    const a = await service.create('owner', 'A', '1');
    const results = await Promise.allSettled([
      service.submit(a.session.id, a.qrToken, body),
      service.submitAssisted(a.session.id, 'owner', { ...body, document: '0926687856' }),
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.find(r => r.status === 'rejected')).toMatchObject({ reason: { status: 409 } });
    expect((await db.collection('customers').get()).size).toBe(1);
    expect((await db.collection('events').get()).size).toBe(3);
    const stored = (await db.doc(`registrationSessions/${a.session.id}`).get()).data()!;
    const method = stored.registrationMethod;
    const canonical = (await db.collection('customers').get()).docs[0].data();
    await Promise.all([service.submit(a.session.id, a.qrToken, { ...body, document: canonical.document }), service.submitAssisted(a.session.id, 'owner', { ...body, document: canonical.document })]);
    expect((await service.get(a.session.id, 'owner')).registrationMethod).toBe(method);
  });
  it('registro asistido rechaza sesiones vencidas y canceladas sin crear clientes', async () => {
    const a = await service.create('owner', 'A', '1');
    now += 600000;
    await expect(service.submitAssisted(a.session.id, 'owner', body)).rejects.toMatchObject({ status: 410 });
    const b = await service.create('owner', 'A', '1'); await service.cancel(b.session.id, 'owner');
    await expect(service.submitAssisted(b.session.id, 'owner', body)).rejects.toMatchObject({ status: 410 });
    expect((await db.collection('customers').get()).size).toBe(0);
  });
  it('emite un código único y eventos una sola vez bajo reintentos concurrentes', async () => {
    const created = await service.create('owner', 'Local 1', 'Caja 1');
    const results = await Promise.all(Array.from({ length: 4 }, () => service.submit(created.session.id, created.qrToken, body)));
    expect(new Set(results.map(x => x.code)).size).toBe(1);
    expect((await db.collection('customers').get()).size).toBe(1);
    expect((await db.collection('events').get()).size).toBe(3);
    await expect(service.submit(created.session.id, created.qrToken, { ...body, email: 'otro@example.com' })).rejects.toMatchObject({ status: 409 });
    const visible = await service.get(created.session.id, 'owner');
    expect(JSON.stringify(visible)).not.toContain(body.document); expect(JSON.stringify(visible)).not.toContain(body.email);
  });
  it('converge por documento y conserva canónico ante correo distinto', async () => {
    const a = await service.create('owner', 'A', '1'), b = await service.create('other', 'B', '2');
    await Promise.all([service.submit(a.session.id, a.qrToken, body), service.submit(b.session.id, b.qrToken, { ...body, email: 'observacion@example.com' })]);
    expect((await db.collection('customers').get()).size).toBe(1);
    const customer = (await db.collection('customers').get()).docs[0].data();
    expect([body.email, 'observacion@example.com']).toContain(customer.email);
    expect((await db.collection('customerObservations').get()).size).toBe(1);
    const firstEmail = customer.email;
    const c = await service.create('owner', 'A', '1');
    await service.submit(c.session.id, c.qrToken, { ...body, email: 'tercero@example.com' });
    expect((await db.collection('customers').get()).docs[0].data().email).toBe(firstEmail);
  });
  it('no fusiona documentos distintos por correo y reintenta colisiones del código', async () => {
    let index = 0;
    service = new RegistrationService(db, { secret: 'integration-only-secret-never-use-production', now: () => now, code: () => ['FA-AAAA-AAAA-AA','FA-AAAA-AAAA-AA','FA-BBBB-BBBB-BB'][index++] || 'FA-CCCC-CCCC-CC' });
    const a = await service.create('owner', 'A', '1'), b = await service.create('owner', 'A', '1');
    expect((await service.submit(a.session.id, a.qrToken, body)).code).toBe('FA-AAAA-AAAA-AA');
    expect((await service.submit(b.session.id, b.qrToken, { ...body, document: '0926687856' })).code).toBe('FA-BBBB-BBBB-BB');
    expect((await db.collection('customers').get()).size).toBe(2);
  });
  it('aísla consolas; invalida vencido/cancelado; constancia manual idempotente', async () => {
    const a = await service.create('owner', 'A', '1');
    await expect(service.get(a.session.id, 'other')).rejects.toMatchObject({ status: 404 });
    await expect(service.cancel(a.session.id, 'other')).rejects.toMatchObject({ status: 404 });
    await expect(service.submit(a.session.id, 'bad-token', body)).rejects.toMatchObject({ status: 404 });
    now += 600000;
    await expect(service.submit(a.session.id, a.qrToken, body)).rejects.toMatchObject({ status: 410 });
    const b = await service.create('owner', 'A', '1'); await service.cancel(b.session.id, 'owner');
    await expect(service.submit(b.session.id, b.qrToken, body)).rejects.toMatchObject({ status: 410 });
    const c = await service.create('owner', 'A', '1'); const result = await service.submit(c.session.id, c.qrToken, body);
    await expect(service.record(c.session.id, 'owner', 'FA-OTHER', '')).rejects.toMatchObject({ status: 409 });
    await service.record(c.session.id, 'owner', result.code, ''); await service.record(c.session.id, 'owner', result.code, '');
    expect((await db.collection('manualVendixRecords').get()).size).toBe(1);
    expect((await service.get(c.session.id, 'owner')).status).toBe('recorded_manual');
    await expect(service.record(c.session.id, 'owner', result.code, 'different')).rejects.toMatchObject({ status: 409 });
    const entry = (await db.collection('manualVendixRecords').get()).docs[0].data(); expect(entry.source).toBe('manual_unverified');
  });
  it('rate limit compartido persiste entre instancias', async () => {
    await service.rateLimit('test', 2, 10000); await service.rateLimit('test', 2, 10000);
    const second = new RegistrationService(db, { secret: 'integration-only-secret-never-use-production', now: () => now });
    await expect(second.rateLimit('test', 2, 10000)).rejects.toMatchObject({ status: 429 });
    now += 10001; await expect(second.rateLimit('test', 2, 10000)).resolves.toBeUndefined();
  });
});
