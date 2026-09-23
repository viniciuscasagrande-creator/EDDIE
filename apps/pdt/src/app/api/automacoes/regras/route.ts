import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type AutomationRule = {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'VENDAS' | 'PORTARIA' | 'PAGAMENTOS' | 'FINANCEIRO' | 'ANTIFRAUDE' | 'INFRAESTRUTURA';
  gatilho: string;
  condicao: string;
  acao: string;
  severidade: 'INFO' | 'ATENCAO' | 'ALTA' | 'CRITICA';
  cooldownMinutos: number;
  requerAprovacao: boolean;
  status: 'ATIVA' | 'PAUSADA';
  escopo: 'GLOBAL' | 'POR_EVENTO';
  eventoId?: string;
  disparosHoje: number;
  ultimoDisparoEm?: string;
};

// Dados padrão operacionais do Motor de Regras
const regrasIniciais: AutomationRule[] = [
  {
    id: 'reg-01',
    nome: 'Alerta de Lotação Crítica na Portaria',
    descricao: 'Dispara alerta operacional e abre setor reserva quando a ocupação do evento atinge 90%.',
    categoria: 'PORTARIA',
    gatilho: 'OCUPACAO_EVENTO',
    condicao: 'ocupacaoPercentual >= 90',
    acao: 'NOTIFICAR_PORTARIA_E_ABRIR_CONTINGENCIA',
    severidade: 'ALTA',
    cooldownMinutos: 15,
    requerAprovacao: false,
    status: 'ATIVA',
    escopo: 'GLOBAL',
    disparosHoje: 1,
    ultimoDisparoEm: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'reg-02',
    nome: 'Risco de Ruptura de Lote Comercial',
    descricao: 'Notifica marketing e equipe de vendas quando o lote atual atinge menos de 5% de ingressos disponíveis.',
    categoria: 'VENDAS',
    gatilho: 'ESTOQUE_LOTE',
    condicao: 'percentualDisponivel <= 5',
    acao: 'ALERTA_COMERCIAL_E_PREPARAR_PROXIMO_LOTE',
    severidade: 'ATENCAO',
    cooldownMinutos: 30,
    requerAprovacao: false,
    status: 'ATIVA',
    escopo: 'GLOBAL',
    disparosHoje: 3,
    ultimoDisparoEm: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'reg-03',
    nome: 'Contingência de Leitor / Scanner Offline',
    descricao: 'Aciona equipe técnica local e chaveia portaria para modo de validação com cache offline caso scanner fique sem sinal.',
    categoria: 'INFRAESTRUTURA',
    gatilho: 'SCANNER_HEARTBEAT',
    condicao: 'segundosSemHeartbeat >= 120',
    acao: 'CHAVEAR_MODO_OFFLINE_E_NOTIFICAR_TI',
    severidade: 'CRITICA',
    cooldownMinutos: 5,
    requerAprovacao: false,
    status: 'ATIVA',
    escopo: 'GLOBAL',
    disparosHoje: 1,
    ultimoDisparoEm: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'reg-04',
    nome: 'Detecção de Anomalia de Recusas no Gateway',
    descricao: 'Se houver mais de 15 pagamentos recusados em janela de 5 minutos, chaveia adquirente reserva.',
    categoria: 'PAGAMENTOS',
    gatilho: 'TAXA_RECUSA_PAGAMENTOS',
    condicao: 'recusasJanela5m >= 15',
    acao: 'CHAVEAR_ROTEAMENTO_ADQUIRENTE_RESERVA',
    severidade: 'CRITICA',
    cooldownMinutos: 10,
    requerAprovacao: true,
    status: 'ATIVA',
    escopo: 'GLOBAL',
    disparosHoje: 0,
  },
  {
    id: 'reg-05',
    nome: 'Bloqueio de Tentativa de Reutilização de QR',
    descricao: 'Gera alerta no NOC e sinaliza catraca se mesmo código for apresentado mais de 2 vezes consecutivas.',
    categoria: 'ANTIFRAUDE',
    gatilho: 'QR_DUPLICADO',
    condicao: 'tentativasReutilizacao >= 2',
    acao: 'SINALIZAR_CATRACA_E_GERAR_ALERTA_SEGURANCA',
    severidade: 'ALTA',
    cooldownMinutos: 1,
    requerAprovacao: false,
    status: 'ATIVA',
    escopo: 'GLOBAL',
    disparosHoje: 2,
    ultimoDisparoEm: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'reg-06',
    nome: 'Alçada para Liberação de Repasse Antecipado',
    descricao: 'Exige aprovação do gestor financeiro antes de qualquer liquidação de repasse para produtor superior a R$ 50.000.',
    categoria: 'FINANCEIRO',
    gatilho: 'SOLICITACAO_REPASSE',
    condicao: 'valorCents >= 5000000',
    acao: 'ENVIAR_FILA_APROVACAO_DIRETORIA',
    severidade: 'ATENCAO',
    cooldownMinutos: 60,
    requerAprovacao: true,
    status: 'ATIVA',
    escopo: 'GLOBAL',
    disparosHoje: 1,
    ultimoDisparoEm: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

let storeRegras = [...regrasIniciais];

export async function GET(req: NextRequest) {
  const categoria = req.nextUrl.searchParams.get('categoria');
  const status = req.nextUrl.searchParams.get('status');

  let filtradas = [...storeRegras];
  if (categoria && categoria !== 'TODAS') {
    filtradas = filtradas.filter((r) => r.categoria === categoria);
  }
  if (status && status !== 'TODAS') {
    filtradas = filtradas.filter((r) => r.status === status);
  }

  return NextResponse.json({
    total: storeRegras.length,
    ativas: storeRegras.filter((r) => r.status === 'ATIVA').length,
    pausadas: storeRegras.filter((r) => r.status === 'PAUSADA').length,
    regras: filtradas,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const novaRegra: AutomationRule = {
      id: `reg-${Date.now().toString(36)}`,
      nome: body.nome || 'Nova Regra Operacional',
      descricao: body.descricao || '',
      categoria: body.categoria || 'VENDAS',
      gatilho: body.gatilho || 'PERSONALIZADO',
      condicao: body.condicao || '',
      acao: body.acao || 'GERAR_ALERTA',
      severidade: body.severidade || 'ATENCAO',
      cooldownMinutos: Number(body.cooldownMinutos) || 15,
      requerAprovacao: Boolean(body.requerAprovacao),
      status: 'ATIVA',
      escopo: body.escopo || 'GLOBAL',
      eventoId: body.eventoId,
      disparosHoje: 0,
    };
    storeRegras.unshift(novaRegra);
    return NextResponse.json(novaRegra, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    const idx = storeRegras.findIndex((r) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 });
    }
    storeRegras[idx] = {
      ...storeRegras[idx],
      status: status === 'ATIVA' ? 'ATIVA' : 'PAUSADA',
    };
    return NextResponse.json(storeRegras[idx]);
  } catch {
    return NextResponse.json({ error: 'Falha ao atualizar regra' }, { status: 400 });
  }
}
