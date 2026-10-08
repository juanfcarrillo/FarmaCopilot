import 'server-only';
import { NextResponse } from 'next/server';
import { DomainError } from './domain';
export const COOKIE = 'fa_console';
export function consoleCapability(request: Request): string | null { const value = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1); return value && /^[\w-]{43}$/.test(value) ? value : null; }
export function requireCapability(request: Request) { const capability = consoleCapability(request); if (!capability) throw new DomainError(404, 'Esta sesión no está disponible en esta caja.', 'not_found'); return capability; }
export function requireOrigin(request: Request) {
  const origin = request.headers.get('origin'), expected = process.env.APP_BASE_URL ? new URL(process.env.APP_BASE_URL).origin : new URL(request.url).origin;
  if (!origin || origin !== expected) throw new DomainError(403, 'Abre el registro desde el enlace de esta aplicación.', 'origin');
}
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new DomainError(415, 'Formato de solicitud no válido.');
  if (Number(request.headers.get('content-length') || 0) > 8192) throw new DomainError(413, 'La solicitud es demasiado grande.');
  const reader = request.body?.getReader(); if (!reader) throw new DomainError(400, 'La solicitud está vacía.');
  const parts: Uint8Array[] = []; let size = 0;
  try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 8192) { await reader.cancel(); throw new DomainError(413, 'La solicitud es demasiado grande.'); } parts.push(value); } } finally { reader.releaseLock(); }
  try { const value: unknown = JSON.parse(Buffer.concat(parts).toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value as Record<string, unknown>; } catch { throw new DomainError(400, 'Revisa los datos enviados e intenta otra vez.'); }
}
export function identifier(value: string) { if (!/^[a-f\d-]{36}$/.test(value)) throw new DomainError(404, 'La sesión no está disponible.', 'not_found'); return value; }
export function text(value: unknown, max: number, optional = false) { if (optional && value === undefined) return ''; if (typeof value !== 'string' || value.length > max || (!optional && !value.trim())) throw new DomainError(400, 'Revisa los datos enviados.'); return value; }
export function response(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }); }
export function errorResponse(error: unknown) { const known = error instanceof DomainError ? error : new DomainError(503, 'No pudimos conectar con el servicio. Tus datos no se han confirmado; vuelve a intentar.', 'unavailable'); return response({ error: known.message, code: known.code }, known.status); }
export function clientKey(request: Request) { return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0,100) || 'local'; }
