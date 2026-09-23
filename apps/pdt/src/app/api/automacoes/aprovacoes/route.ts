import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type PendingApproval = {
  id: string;
  tipoAcao: 'REPASSE_PRODUTOR' | 'ESTORNO_EM_LOTE' | 'BLOQUEIO_SETOR' | 'ALTERACAO_PRECO_LOTE' | 'ROTEAMENTO_GATEWAY';
  titulo: string;
  descricao: string;
  regraOrigem: string;
  impacto: string;
  impactoFinanceiroCents?: number;
  severidade: 'ATENCAO' | 'ALTA' | 'CRITICA';
  solicitante: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  criadoEm: string;
  decididoPor?: string;
  decididoEm?: string;
  justificativa?: string;
};

const aprovacoesIniciais: PendingApproval[] = [
  {
    id: 'aprov-01',
    tipoAcao: 'REPASSE_PRODUTOR',
    titulo: 'Liberação de Repasse Financeiro Antecipado',
    descricao: 'Produtor solicitou adiantamento de receita da Sessão 1 no valor de R$ 75.000,00 com base em R$ 120.000,00 de GMV já liquidado.',
    regraOrigem: 'Alçada para Liberação de Repasse Antecipado (reg-06)',
    impacto: 'Débito na conta gráfica do evento para TED/PIX bancário',
    impactoFinanceiroCents: 7500000,
    severidade: 'ALTA',
    solicitante: 'Motor de Regras (Regra #06)',
    status: 'PENDENTE',
    criadoEm: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'aprov-02',
    tipoAcao: 'ROTEAMENTO_GATEWAY',
    titulo: 'Chaveamento de Adquirente de Pagamentos para Contingência',
    descricao: 'Detecção de 18 recusas consecutivas no adquirente primário em janela de 5 min. Motor sugere direcionar tráfego para adquirente secundário.',
    regraOrigem: 'Detecção de Anomalia de Recusas no Gateway (reg-04)',
    impacto: 'Taxa transacional aumenta em 0.25% durante o período de contingência',
    severidade: 'CRITICA',
    solicitante: 'Motor de Regras (Regra #04)',
    status: 'PENDENTE',
    criadoEm: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'aprov-03',
    tipoAcao: 'BLOQUEIO_SETOR',
    titulo: 'Bloqueio Preventivo de Vendas no Setor Pista Lateral',
    descricao: 'Ocupação do setor atingiu 98% da capacidade limite com risco de superlotação.',
    regraOrigem: 'Prevenção de Lotação por Setor',
    impacto: 'Interrompe venda imediata de novos ingressos para Pista Lateral',
    severidade: 'ATENCAO',
    solicitante: 'Sensor de Portaria B2',
    status: 'PENDENTE',
    criadoEm: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

let storeAprovacoes = [...aprovacoesIniciais];

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || 'PENDENTE';
  let lista = [...storeAprovacoes];
  if (status !== 'TODOS') {
    lista = lista.filter((a) => a.status === status);
  }

  return NextResponse.json({
    totalPendentes: storeAprovacoes.filter((a) => a.status === 'PENDENTE').length,
    aprovacoes: lista,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { id, decisao, justificativa } = await req.json();
    const idx = storeAprovacoes.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    storeAprovacoes[idx] = {
      ...storeAprovacoes[idx],
      status: decisao === 'APROVAR' ? 'APROVADO' : 'REJEITADO',
      decididoPor: 'Operador PDT (Diretoria)',
      decididoEm: new Date().toISOString(),
      justificativa: justificativa || '',
    };

    return NextResponse.json(storeAprovacoes[idx]);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar aprovação' }, { status: 400 });
  }
}
