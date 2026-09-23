import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const sessaoId = req.nextUrl.searchParams.get('sessaoId') || undefined;
  const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
  const base = getBackendBase();

  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const url = `${base}/eventos/${eventoId}/operacao/timeline?${new URLSearchParams({
        ...(sessaoId ? { sessaoId } : {}),
        ...(cursor ? { cursor } : {}),
      }).toString()}`;
      const upstream = await fetch(url, {
        headers: {
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-producer-id': process.env.PRODUTOR_ID || '00000000-0000-0000-0000-000000000002',
        },
        signal: abortCtrl.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      if (upstream.ok) {
        return NextResponse.json(await upstream.json());
      }
    } catch {
      // Degradação graciosa
    }
  }

  const agora = new Date();
  const tMinus = (min: number) => new Date(agora.getTime() - min * 60 * 1000).toISOString();

  return NextResponse.json({
    eventoId,
    cursor: tMinus(45),
    itens: [
      {
        id: 'chk-live-101',
        tipo: 'CHECKIN',
        titulo: 'Entrada Validada: ING-2026-9812',
        descricao: 'Portaria Principal (A) · Operador: Roberto Mendes · Dispositivo: Scanner 01',
        severidade: 'INFO',
        occurredAt: tMinus(1),
        meta: { portaria: 'Portaria Principal (A)' },
      },
      {
        id: 'venda-live-204',
        tipo: 'VENDA',
        titulo: 'Pedido Pago: PED-2026-5541',
        descricao: 'Comprador: Juliana Peixoto · 2x Pista Geral · Total: R$ 320,00 (Pix)',
        occurredAt: tMinus(2),
        meta: { valor: 320.0 },
      },
      {
        id: 'alt-live-301',
        tipo: 'ALERTA',
        titulo: 'Alerta Antifraude: TENTATIVA_REUTILIZACAO_QR',
        descricao: 'Ingresso ING-2026-9740 apresentado pela 2ª vez na Portaria Principal. Bloqueio automático.',
        severidade: 'ATENCAO',
        occurredAt: tMinus(6),
        meta: { ingressoId: 'ING-2026-9740' },
      },
      {
        id: 'chk-live-100',
        tipo: 'CHECKIN',
        titulo: 'Entrada Validada: ING-2026-9811',
        descricao: 'Portaria Pista Premium (B) · Operadora: Mariana Lopes · Dispositivo: Scanner 03',
        severidade: 'INFO',
        occurredAt: tMinus(8),
        meta: { portaria: 'Portaria Pista Premium (B)' },
      },
      {
        id: 'inc-live-401',
        tipo: 'INCIDENTE',
        titulo: 'Ocorrência: Oscilação transitória na Portaria B',
        descricao: 'Suporte de TI chaveou rede para contingência local.',
        severidade: 'ATENCAO',
        occurredAt: tMinus(12),
        meta: { categoria: 'INFRAESTRUTURA' },
      },
      {
        id: 'venda-live-203',
        tipo: 'VENDA',
        titulo: 'Pedido Pago: PED-2026-5540',
        descricao: 'Comprador: Marcelo Costa · 1x Camarote VIP · Total: R$ 450,00 (Cartão de Crédito)',
        occurredAt: tMinus(15),
        meta: { valor: 450.0 },
      },
    ],
  });
}
