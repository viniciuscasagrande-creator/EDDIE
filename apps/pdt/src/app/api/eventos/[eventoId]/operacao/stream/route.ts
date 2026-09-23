import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const sessaoId = req.nextUrl.searchParams.get('sessaoId') || 'sessao-principal';

  let sequence = 0;
  let intervalId: any = null;

  const stream = new ReadableStream({
    start(controller) {
      // Mensagem inicial de conexão estabelecida
      const initialPayload = JSON.stringify({
        eventId: `init-${Date.now()}`,
        type: 'live.connected',
        eventoId,
        sessaoId,
        occurredAt: new Date().toISOString(),
        sequence: sequence++,
        payload: {
          status: 'AO_VIVO',
          message: 'Canal operacional em tempo real estabelecido com sucesso.',
        },
      });
      controller.enqueue(new TextEncoder().encode(`data: ${initialPayload}\n\n`));

      // Emite batimento periódico a cada 5 segundos
      intervalId = setInterval(() => {
        try {
          const beat = JSON.stringify({
            eventId: `hb-${Date.now()}`,
            type: 'live.heartbeat',
            eventoId,
            sessaoId,
            occurredAt: new Date().toISOString(),
            sequence: sequence++,
            payload: {
              status: 'AO_VIVO',
              timestamp: Date.now(),
            },
          });
          controller.enqueue(new TextEncoder().encode(`data: ${beat}\n\n`));
        } catch {
          if (intervalId) clearInterval(intervalId);
        }
      }, 5000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
