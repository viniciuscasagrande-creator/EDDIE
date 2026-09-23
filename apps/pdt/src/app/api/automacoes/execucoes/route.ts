import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type AutomationExecution = {
  id: string;
  regraId: string;
  regraNome: string;
  categoria: 'VENDAS' | 'PORTARIA' | 'PAGAMENTOS' | 'FINANCEIRO' | 'ANTIFRAUDE' | 'INFRAESTRUTURA';
  gatilhoDetectado: string;
  condicaoAtingida: string;
  acaoExecutada: string;
  status: 'SUCESSO' | 'FALHA' | 'REQUER_APROVACAO' | 'IGNORADO_COOLDOWN';
  executor: 'MOTOR_AUTOMACAO' | 'OPERADOR';
  tempoRespostaMs: number;
  detalhes: string;
  eventoId?: string;
  ocorreuEm: string;
};

const execucoesIniciais: AutomationExecution[] = [
  {
    id: 'exec-101',
    regraId: 'reg-01',
    regraNome: 'Alerta de Lotação Crítica na Portaria',
    categoria: 'PORTARIA',
    gatilhoDetectado: 'Ocupação atingiu 90.4% (1.085/1.200 pessoas)',
    condicaoAtingida: 'ocupacaoPercentual >= 90',
    acaoExecutada: 'Disparado alerta sonoro no NOC e notificado coordenador de acesso',
    status: 'SUCESSO',
    executor: 'MOTOR_AUTOMACAO',
    tempoRespostaMs: 42,
    detalhes: 'Push notification entregue com sucesso aos dispositivos de portaria',
    eventoId: 'evento-1',
    ocorreuEm: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-102',
    regraId: 'reg-05',
    regraNome: 'Bloqueio de Tentativa de Reutilização de QR',
    categoria: 'ANTIFRAUDE',
    gatilhoDetectado: 'Segunda leitura consecutiva do código ING-2026-9740 em catraca distinta',
    condicaoAtingida: 'tentativasReutilizacao >= 2',
    acaoExecutada: 'Catraca bloqueou passagem e gerou sinal antifraude',
    status: 'SUCESSO',
    executor: 'MOTOR_AUTOMACAO',
    tempoRespostaMs: 18,
    detalhes: 'Código invalidado para novas entradas sem revalidação manual',
    eventoId: 'evento-1',
    ocorreuEm: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-103',
    regraId: 'reg-06',
    regraNome: 'Alçada para Liberação de Repasse Antecipado',
    categoria: 'FINANCEIRO',
    gatilhoDetectado: 'Solicitação de liquidação de repasse no valor de R$ 75.000,00',
    condicaoAtingida: 'valorCents >= 5000000',
    acaoExecutada: 'Encaminhado para fila de aprovação da Diretoria Financeira',
    status: 'REQUER_APROVACAO',
    executor: 'MOTOR_AUTOMACAO',
    tempoRespostaMs: 55,
    detalhes: 'Aguardando parecer do gestor financeiro',
    eventoId: 'evento-1',
    ocorreuEm: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-104',
    regraId: 'reg-02',
    regraNome: 'Risco de Ruptura de Lote Comercial',
    categoria: 'VENDAS',
    gatilhoDetectado: 'Lote 1 Noturno atingiu 24 ingressos restantes (3.8% do estoque)',
    condicaoAtingida: 'percentualDisponivel <= 5',
    acaoExecutada: 'Disparado alerta comercial e gerado rascunho de ativação do Lote 2',
    status: 'SUCESSO',
    executor: 'MOTOR_AUTOMACAO',
    tempoRespostaMs: 38,
    detalhes: 'Equipe de marketing notificada via Slack e e-mail operacional',
    eventoId: 'evento-1',
    ocorreuEm: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'exec-105',
    regraId: 'reg-03',
    regraNome: 'Contingência de Leitor / Scanner Offline',
    categoria: 'INFRAESTRUTURA',
    gatilhoDetectado: 'Scanner 03 da Portaria B sem heartbeat há 140 segundos',
    condicaoAtingida: 'segundosSemHeartbeat >= 120',
    acaoExecutada: 'Modo contingência ativado no scanner e técnico acionado',
    status: 'SUCESSO',
    executor: 'MOTOR_AUTOMACAO',
    tempoRespostaMs: 76,
    detalhes: 'Dispositivo reconectado à rede cabeada reserva',
    eventoId: 'evento-1',
    ocorreuEm: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  const categoria = req.nextUrl.searchParams.get('categoria');

  let filtradas = [...execucoesIniciais];
  if (status && status !== 'TODOS') {
    filtradas = filtradas.filter((e) => e.status === status);
  }
  if (categoria && categoria !== 'TODAS') {
    filtradas = filtradas.filter((e) => e.categoria === categoria);
  }

  const totalHoje = 142;
  const sucessoHoje = 140;
  const taxaSucesso = ((sucessoHoje / totalHoje) * 100).toFixed(1);

  return NextResponse.json({
    kpis: {
      execucoesHoje: totalHoje,
      taxaSucesso: `${taxaSucesso}%`,
      falhas: 2,
      aguardandoAprovacao: 3,
      tempoMedioMs: 46,
    },
    total: filtradas.length,
    execucoes: filtradas,
  });
}
