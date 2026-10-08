import { service } from '@/lib/firebase';
import { opaqueToken } from '@/lib/domain';
import { clientKey, consoleCapability, COOKIE, errorResponse, readBody, requireOrigin, response, text } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    requireOrigin(request); const body = await readBody(request), owner = consoleCapability(request) || opaqueToken(), store = service();
    await store.rateLimit(`create:ip:${clientKey(request)}`, 60, 60000); await store.rateLimit(`create:owner:${owner}`, 20, 60000);
    const result = await store.create(owner, text(body.location,60), text(body.register,40));
    const res = response(result,201);
    res.cookies.set(COOKIE,owner,{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60*60*12 });
    return res;
  } catch (error) { return errorResponse(error); }
}
