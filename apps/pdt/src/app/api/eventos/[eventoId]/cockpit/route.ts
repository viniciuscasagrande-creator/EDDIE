import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await ctx.params;
  const agora = new Date().toISOString();

  return NextResponse.json({
    eventoId,
    nome: `Festival DiskIngressos Live · ${eventoId.slice(0, 8)}`,
    local: 'Arena Central de Eventos',
    sessaoAtiva: 'Sessão 1 (Noturna)',
    dataEvento: agora,
    statusExecutivo: 'EM_ANDAMENTO',
    ultimaSincronizacao: agora,
    kpis: {
      receitaRealCents: 4895000,
      receitaMetaCents: 6000000,
      atingimentoMetaPercentual: 81.6,
      projecaoFechamentoCents: 5850000,
      ticketMedioCents: 15015,
      ingressosVendidos: 580,
      capacidadeTotal: 1200,
      ocupacaoPercentual: 48.3,
      pessoasDentro: 312,
      ritmoEntradaMinuto: 8.5,
      projecaoEntradaPicoMinuto: 18.0,
      liquidoProdutorCents: 4405500,
      taxasDiskCents: 489500,
      disponivelRepasseCents: 3405500,
    },
    radarSaude: [
      { subsistema: 'Vendas', status: 'NORMAL', score: 98 },
      { subsistema: 'Portaria & Catracas', status: 'NORMAL', score: 95 },
      { subsistema: 'Pagamentos / Gateway', status: 'NORMAL', score: 92 },
      { subsistema: 'Infraestrutura / Redes', status: 'NORMAL', score: 96 },
      { subsistema: 'Marketing & Tráfego', status: 'ATENCAO', score: 78 },
      { subsistema: 'Antifraude & Risco', status: 'NORMAL', score: 99 },
    ],
    canaisVendas: [
      { canal: 'Venda Direta (Site Oficial)', receitaCents: 2450000, ingressos: 290, share: 50 },
      { canal: 'Campanhas Meta Ads (Instagram)', receitaCents: 1620000, ingressos: 192, share: 33 },
      { canal: 'Search Google Ads', receitaCents: 625000, ingressos: 74, share: 13 },
      { canal: 'Afiliados & Promoters', receitaCents: 200000, ingressos: 24, share: 4 },
    ],
    alertasEstrategicos: [
      {
        id: 'alt-01',
        tipo: 'ATENCAO',
        titulo: 'Setor Camarote VIP com 70% vendido',
        descricao: 'Previsão de esgotamento nas próximas 2 horas caso o ritmo de vendas se mantenha.',
      },
    ],
    acoesRecomendadas: [
      { id: 'rec-01', acao: 'Liberar lote adicional para Área VIP', impacto: '+ R$ 45.000 de potencial' },
      { id: 'rec-02', acao: 'Reforçar equipe de triagem na Portaria Principal às 20h30', impacto: 'Evita filas de pico' },
    ],
  });
}
