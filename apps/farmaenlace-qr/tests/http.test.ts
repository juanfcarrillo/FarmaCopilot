import { describe, expect, it } from 'vitest';
import { readBody, requireOrigin, consoleCapability, errorResponse } from '../src/lib/http';
import { DomainError } from '../src/lib/domain';
const origin = 'http://localhost:3000';
describe('barrera HTTP', () => {
  it('limita cuerpo incluso sin content-length y rechaza tipo/formato inválido', async () => {
    await expect(readBody(new Request(origin, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: 'x'.repeat(9000) }) }))).rejects.toMatchObject({ status: 413 });
    await expect(readBody(new Request(origin, { method: 'POST', body: '{}' }))).rejects.toMatchObject({ status: 415 });
    await expect(readBody(new Request(origin, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '[' }))).rejects.toMatchObject({ status: 400 });
  });
  it('rechaza origen ajeno o ausente', () => {
    expect(() => requireOrigin(new Request(origin, { headers: { origin } }))).not.toThrow();
    expect(() => requireOrigin(new Request(origin, { headers: { origin: 'https://evil.test' } }))).toThrow();
    expect(() => requireOrigin(new Request(origin))).toThrow();
  });
  it('capacidad cookie requerida y error interno no revela PII ni detalles', async () => {
    expect(consoleCapability(new Request(origin))).toBeNull();
    expect(consoleCapability(new Request(origin, { headers: { cookie: 'fa_console=wrong' } }))).toBeNull();
    const secret = 'x'.repeat(43);
    expect(consoleCapability(new Request(origin, { headers: { cookie: `fa_console=${secret}` } }))).toBe(secret);
    const response = errorResponse(new Error('private@example.com private-key'));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain('private');
    expect(errorResponse(new DomainError(410, 'Este QR venció.', 'expired')).status).toBe(410);
  });
});
