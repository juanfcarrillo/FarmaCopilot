import { describe, expect, it } from 'vitest';
import { validateRegistration, opaqueToken, digest, documentKey, makeCode, publicSession, assertOwner, assertAccepting } from '../src/lib/domain';
const valid = { document: '1710034065', email: ' Cliente@Example.com ', marketing: false };
describe('registro QR y privacidad', () => {
  it('valida cédula ecuatoriana, correo y consentimiento opcional', () => {
    expect(validateRegistration(valid)).toEqual({ document: '1710034065', email: 'cliente@example.com', marketing: false });
    for (const document of ['1710034064', '0000000000', '9910034065', '1790012345001', '171-0034065']) expect(() => validateRegistration({ ...valid, document })).toThrow();
    expect(() => validateRegistration({ ...valid, email: 'a@' })).toThrow();
    expect(() => validateRegistration({ ...valid, marketing: 'si' })).toThrow();
  });
  it('genera capacidades opacas, códigos distintos y claves HMAC', () => {
    const qr = opaqueToken(), owner = opaqueToken();
    expect(qr).toMatch(/^[\w-]{43}$/); expect(qr).not.toBe(owner);
    expect(makeCode()).toMatch(/^FA-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$/);
    expect(documentKey(valid.document, 'secret-a')).not.toBe(digest(valid.document));
    expect(documentKey(valid.document, 'secret-a')).not.toBe(documentKey(valid.document, 'secret-b'));
  });
  it('rechaza vencimiento, cancelación y capacidad de otra consola', () => {
    const s = { id: 'session', ownerHash: digest('owner'), expiresAt: 2000, status: 'awaiting_customer' as const, createdAt: 1000, location: 'Local 1', register: 'Caja 1' };
    expect(() => assertAccepting(s, 1999)).not.toThrow();
    expect(() => assertAccepting(s, 2000)).toThrow();
    expect(() => assertAccepting({ ...s, status: 'cancelled' }, 1000)).toThrow();
    expect(() => assertOwner(s, 'other')).toThrow();
    expect(() => assertOwner(s, 'owner')).not.toThrow();
    expect(publicSession({ ...s, email: 'private@example.com', document: valid.document, tokenHash: 'private', customerId: 'internal' }, 2001)).toEqual({ id: 'session', expiresAt: 2000, createdAt: 1000, status: 'expired', location: 'Local 1', register: 'Caja 1', code: null, recordedAt: null, integrationStatus: 'not_connected' });
  });
});
