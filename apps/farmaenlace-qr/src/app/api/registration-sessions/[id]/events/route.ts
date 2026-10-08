import { service } from '@/lib/firebase';
import { errorResponse, identifier, requireCapability } from '@/lib/http';
import type { SessionView } from '@/lib/client';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const owner = requireCapability(request), id = identifier((await context.params).id), store = service();
    await store.rateLimit(`stream:${owner}`,40,60000); const initial = await store.get(id,owner);
    const encoder = new TextEncoder(); let stop = () => {};
    const stream = new ReadableStream<Uint8Array>({ start(controller) {
      let closed = false, unsubscribe = () => {}, last = '', current: SessionView = initial;
      let expiration: ReturnType<typeof setTimeout> | undefined;
      const close = () => { if (closed) return; closed = true; unsubscribe(); clearTimeout(deadline); clearInterval(heartbeat); clearTimeout(expiration); request.signal.removeEventListener('abort',close); try { controller.close(); } catch {} };
      stop = close;
      const send = (value: SessionView) => {
        if (closed) return; current = value; const serialized = JSON.stringify(value);
        if (serialized !== last) { controller.enqueue(encoder.encode(`event: session\ndata: ${serialized}\n\n`)); last = serialized; }
        if (value.status !== 'awaiting_customer') close();
      };
      controller.enqueue(encoder.encode('retry: 1500\n\n'));
      const deadline = setTimeout(close,24000); const heartbeat = setInterval(() => { if (!closed) controller.enqueue(encoder.encode(': heartbeat\n\n')); },10000);
      request.signal.addEventListener('abort',close,{ once:true });
      send(initial);
      if (!closed) {
        unsubscribe = store.watch(id,owner,send,close);
        expiration = setTimeout(() => { if (!closed && current.status === 'awaiting_customer') send({ ...current, status:'expired' }); },Math.max(0,initial.expiresAt-Date.now())+5);
      }
      if (request.signal.aborted) close();
    }, cancel() { stop(); } });
    return new Response(stream,{ headers: { 'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-store, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no','Referrer-Policy':'no-referrer' } });
  } catch (error) { return errorResponse(error); }
}
