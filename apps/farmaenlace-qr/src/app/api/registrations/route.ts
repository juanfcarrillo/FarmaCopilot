import { service } from '@/lib/firebase';
import { clientKey, errorResponse, identifier, readBody, requireOrigin, response, text } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    requireOrigin(request); const body = await readBody(request), store = service();
    await store.rateLimit(`submit:ip:${clientKey(request)}`,30,60000);
    const id = identifier(text(body.sessionId,36)), token = text(body.token,43);
    await store.rateLimit(`submit:session:${id}`,12,60000);
    return response(await store.submit(id, token, body));
  } catch (error) { return errorResponse(error); }
}
