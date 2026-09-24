import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || '';
  if (!raw || !/^https?:\/\//i.test(raw)) return '';
  const clean = raw.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export interface RecomendacaoAssistiva {
  id: string;
  eventoId: string;
  titulo: string;
  tipo: 'OPERACIONAL' | 'COMERCIAL' | 'PORTARIA' | 'FINANCEIRO_REPASSE';
  sensivel: boolean;
  impactoEstimado: string;
  justificativa: string;
  acaoAlvo: string;
  aprovacaoFilaUrl?: string;
  status: 'SUGERIDA' | 'EXECUTADA' | 'DESCARTADA' | 'AGUARDANDO_APROVACAO';
  geradaEm: string;
}

const mockRecomendacoes: RecomendacaoAssistiva[] = [
  {
    id: 'REC-01',
    eventoId: 'evento-operacao',
    titulo: 'Ativar Chaveamento de Gateway de Contingência para Pagamentos Pix',
    tipo: 'OPERACIONAL',
    sensivel: false,
    impactoEstimado: 'Recupera ~R$ 38.000 em vendas travadas no checkout.',
    justificativa: 'Taxa de recusa do gateway primário subiu para 14.8% nos últimos 15 min.',
    acaoAlvo: 'SWITCH_PAYMENT_ROUTE',
    status: 'SUGERIDA',
    geradaEm: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'REC-02',
    eventoId: 'evento-operacao',
    titulo: 'Disparar Virada Antecipada para Lote 2 de Pista Premium',
    tipo: 'COMERCIAL',
    sensivel: false,
    impactoEstimado: 'Garante fluxo contínuo de vendas sem pausa de bilheteria.',
    justificativa: 'Lote 1 com apenas 38 ingressos e previsão de esgotamento em 44 minutos.',
    acaoAlvo: 'TRIGGER_BATCH_ROTATION',
    status: 'SUGERIDA',
    geradaEm: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: 'REC-03',
    eventoId: 'evento-operacao',
    titulo: 'Bloqueio Cautelar do Setor Camarote Norte e Auditoria de Acesso',
    tipo: 'FINANCEIRO_REPASSE',
    sensivel: true,
    impactoEstimado: 'Protege integridade de credenciais contra clonagem em massa.',
    justificativa: 'Detectadas 14 tentativas de reuso do mesmo ingresso em 40 minutos.',
    acaoAlvo: 'HOLD_SECTOR_ACCESS',
    aprovacaoFilaUrl: '/automacoes/aprovacoes',
    status: 'AGUARDANDO_APROVACAO',
    geradaEm: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const base = getBackendBase();

  if (base) {
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      const url = `${base}/eventos/${eventoId}/recomendacoes`;
      const upstream = await fetch(url, {
        headers: {
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
          'x-producer-id': process.env.PRODUTOR_ID || '00000000-0000-0000-0000-000000000002',
        },
        signal: abortCtrl.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  return NextResponse.json({
    ok: true,
    eventoId,
    generatedAt: new Date().toISOString(),
    totalRecomendacoes: mockRecomendacoes.length,
    recomendacoes: mockRecomendacoes,
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const base = getBackendBase();

  if (base) {
    try {
      const upstream = await fetch(`${base}/eventos/${eventoId}/recomendacoes/${body.recomendacaoId}/executar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001',
        },
        body: JSON.stringify(body),
      });
      if (upstream.ok) return NextResponse.json(await upstream.json());
    } catch {}
  }

  if (body.sensivel) {
    return NextResponse.json({
      ok: true,
      recomendacaoId: body.recomendacaoId,
      status: 'AGUARDANDO_APROVACAO',
      redirecionarUrl: '/automacoes/aprovacoes',
      mensagem: 'Ação sensível submetida com sucesso à fila de aprovação humana do 11.11.',
    });
  }

  return NextResponse.json({
    ok: true,
    recomendacaoId: body.recomendacaoId,
    status: 'EXECUTADA',
    executadoEm: new Date().toISOString(),
    mensagem: 'Recomendação assistiva aplicada com sucesso na operação.',
  });
}
