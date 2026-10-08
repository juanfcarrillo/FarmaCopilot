export type SessionView = { id: string; status: 'awaiting_customer' | 'registered' | 'recorded_manual' | 'cancelled' | 'expired'; code: string | null; createdAt: number; expiresAt: number; recordedAt: number | null; location: string; register: string; integrationStatus: 'not_connected' };
export class ApiFailure extends Error { constructor(message: string, readonly code: string, readonly status: number) { super(message); } }
export async function api<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new ApiFailure(data.error || 'No pudimos completar la solicitud. Intenta otra vez.', data.code || 'unavailable', response.status);
  return data;
}
export function messageOf(error: unknown) { return error instanceof ApiFailure ? error.message : 'No hay conexión con el servicio. Revisa tu red e intenta otra vez.'; }
