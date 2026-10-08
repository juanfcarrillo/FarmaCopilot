import { service } from '@/lib/firebase';
import { errorResponse, identifier, readBody, requireCapability, requireOrigin, response } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { requireOrigin(request); await readBody(request); const owner = requireCapability(request), id = identifier((await context.params).id), store = service(); await store.rateLimit(`mutation:${owner}`,30,60000); return response(await store.cancel(id,owner)); } catch (error) { return errorResponse(error); }
}
