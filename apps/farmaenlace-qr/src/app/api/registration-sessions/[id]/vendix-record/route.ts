import { service } from '@/lib/firebase';
import { errorResponse, identifier, readBody, requireCapability, requireOrigin, response, text } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { requireOrigin(request); const owner = requireCapability(request), id = identifier((await context.params).id), body = await readBody(request), store = service(); await store.rateLimit(`mutation:${owner}`,30,60000); return response(await store.record(id,owner,text(body.code,20),text(body.ticket,80,true))); } catch (error) { return errorResponse(error); }
}
