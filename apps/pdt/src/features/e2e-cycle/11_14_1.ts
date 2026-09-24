export interface EventConfigE2E {
  eventoId: string;
  produtorId: string;
  nome: string;
  categoria: string;
  capacidadeTotal: number;
  sessoes: Array<{
    sessaoId: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    status: 'CONFIRMADA' | 'EM_ANDAMENTO' | 'FINALIZADA';
  }>;
  setores: Array<{
    setorId: string;
    nome: string;
    capacidade: number;
  }>;
  lotes: Array<{
    loteId: string;
    nome: string;
    setorId: string;
    precoCentavos: number;
    taxaServicoCentavos: number;
    quantidadeTotal: number;
    quantidadeDisponivel: number;
    status: 'ATIVO' | 'ESGOTADO' | 'ENCERRADO';
  }>;
}

export const EVENTO_PADRAO_E2E: EventConfigE2E = {
  eventoId: 'evento-operacao',
  produtorId: '00000000-0000-0000-0000-000000000002',
  nome: 'Festival DiskIngressos Live 2026',
  categoria: 'FESTIVAL_MUSICA',
  capacidadeTotal: 15000,
  sessoes: [
    {
      sessaoId: 'sessao-principal-01',
      dataHoraInicio: '2026-10-15T18:00:00Z',
      dataHoraFim: '2026-10-16T04:00:00Z',
      status: 'CONFIRMADA'
    }
  ],
  setores: [
    { setorId: 'setor-pista', nome: 'Pista Premium', capacidade: 10000 },
    { setorId: 'setor-vip', nome: 'Camarote VIP', capacidade: 3500 },
    { setorId: 'setor-backstage', nome: 'Backstage Experience', capacidade: 1500 }
  ],
  lotes: [
    {
      loteId: 'lote-pista-1',
      nome: 'Pista 1º Lote',
      setorId: 'setor-pista',
      precoCentavos: 12000, // R$ 120,00
      taxaServicoCentavos: 1200, // R$ 12,00 (10%)
      quantidadeTotal: 5000,
      quantidadeDisponivel: 4120,
      status: 'ATIVO'
    },
    {
      loteId: 'lote-vip-1',
      nome: 'Camarote VIP 1º Lote',
      setorId: 'setor-vip',
      precoCentavos: 28000, // R$ 280,00
      taxaServicoCentavos: 2800, // R$ 28,00 (10%)
      quantidadeTotal: 2000,
      quantidadeDisponivel: 1450,
      status: 'ATIVO'
    }
  ]
};

export function validateEventConfig(config: EventConfigE2E): {
  valid: boolean;
  errors: string[];
  totalAllocatedCapacity: number;
} {
  const errors: string[] = [];
  const totalAllocated = config.setores.reduce((acc, s) => acc + s.capacidade, 0);

  if (totalAllocated > config.capacidadeTotal) {
    errors.push(`Capacidade dos setores (${totalAllocated}) excede capacidade total do evento (${config.capacidadeTotal})`);
  }

  if (config.lotes.length === 0) {
    errors.push('O evento deve possuir pelo menos um lote ativo configurado');
  }

  if (config.sessoes.length === 0) {
    errors.push('O evento deve possuir pelo menos uma sessão cadastrada');
  }

  return {
    valid: errors.length === 0,
    errors,
    totalAllocatedCapacity: totalAllocated
  };
}

export const featureManifest = {
  phase: "11.14.1",
  title: "EDDIE 11.14.1 — Cadastro e Configuração do Evento E2E",
  routes: [
    "/api/e2e/ciclo/configuracao",
    "/api/eventos/:eventoId/e2e/validar-configuracao"
  ],
  e2eValidated: true
} as const;
