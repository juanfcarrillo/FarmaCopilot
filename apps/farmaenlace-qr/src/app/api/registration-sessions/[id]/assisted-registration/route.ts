import { service } from '@/lib/firebase';
import { errorResponse, identifier, readBody, requireCapability, requireOrigin, response } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireOrigin(request);
    const owner = requireCapability(request), id = identifier((await context.params).id);
    const body = await readBody(request), store = service();
    await store.rateLimit(`mutation:${owner}`, 30, 60000);
    await store.rateLimit(`assisted:${id}:${owner}`, 12, 60000);
    await store.submitAssisted(id, owner, body);
    return response(await store.get(id, owner));
  } catch (error) { return errorResponse(error); }
}
