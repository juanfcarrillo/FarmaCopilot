import { service } from '@/lib/firebase';
import { errorResponse, identifier, requireCapability, response } from '@/lib/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const owner = requireCapability(request), id = identifier((await context.params).id), store = service(); await store.rateLimit(`read:${owner}`,180,60000); return response(await store.get(id,owner)); } catch (error) { return errorResponse(error); }
}
