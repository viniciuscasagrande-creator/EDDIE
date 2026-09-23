import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperacaoService } from './operacao.service';

describe('OperacaoService (EDDIE 11.10 - Centro de Operações)', () => {
  let service: OperacaoService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      evento: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'evento-1',
          nome: 'Show Rock Festival 2026',
          local: { nome: 'Arena Principal' },
          sessoes: [
            { id: 'sessao-1', identificador: 'Sessão 1', dataHoraInicio: '2026-10-15T20:00:00Z' },
          ],
        }),
      },
      pedidoVenda: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'ped-1',
            numero: 'PED-001',
            status: 'PAGO',
            total: 250.0,
            paidAt: new Date('2026-10-15T18:00:00Z'),
            compradorNome: 'Carlos Silva',
            pagamentos: [{ metodo: 'pix' }],
          },
          {
            id: 'ped-2',
            numero: 'PED-002',
            status: 'PENDENTE',
            total: 150.0,
            compradorNome: 'Ana Souza',
            pagamentos: [{ metodo: 'credito' }],
          },
        ]),
      },
      ingressoVenda: {
        count: vi.fn().mockResolvedValue(100),
      },
      checkinRegistro: {
        count: vi.fn().mockImplementation(({ where }) => {
          if (where?.resultado === 'VALIDO') return Promise.resolve(45);
          if (where?.resultado?.not === 'VALIDO') return Promise.resolve(3);
          return Promise.resolve(48);
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'chk-1',
            numeroIngresso: 'ING-001',
            resultado: 'VALIDO',
            portaria: 'Portaria Principal',
            operadorId: 'op-1',
            timestamp: new Date('2026-10-15T19:30:00Z'),
          },
        ]),
      },
      dispositivoPortaria: {
        count: vi.fn().mockResolvedValue(4),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'disp-1',
            nome: 'Scanner 01',
            portaria: 'Portaria Principal',
            status: 'ATIVO',
            leiturasValidas: 30,
            leiturasRecusadas: 2,
            ultimoHeartbeat: new Date(),
          },
        ]),
      },
      lote: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'lote-1', quantidadeTotal: 500, setor: { nome: 'Pista' } },
        ]),
      },
      lancamentoLedger: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      solicitacaoRepasse: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      campanhaMarketing: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      utmLink: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      alertaAntifraude: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'alt-1',
            codigoSinal: 'LEITURA_RAPIDA',
            descricao: 'Leitura repetida em intervalo curto',
            severidade: 'ATENCAO',
            origem: 'PORTARIA',
            status: 'ABERTO',
            createdAt: new Date('2026-10-15T19:40:00Z'),
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: 'alt-1',
          tenantId: '00000000-0000-0000-0000-000000000001',
          status: 'ABERTO',
        }),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'alt-1', ...data })),
      },
      chargeback: {
        count: vi.fn().mockResolvedValue(0),
      },
      ocorrenciaEvento: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'inc-1', ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'inc-1', ...data })),
      },
    };

    service = new OperacaoService(mockPrisma as any);
  });

  it('obterResumo calcula receita confirmada SOMENTE de pedidos pagos (nunca pendentes)', async () => {
    const resumo = await service.obterResumo('tenant-1', 'evento-1');

    expect(resumo.eventoId).toBe('evento-1');
    expect(resumo.nome).toBe('Show Rock Festival 2026');
    // ped-1 = 250 (PAGO), ped-2 = 150 (PENDENTE)
    // Receita confirmada deve ser APENAS 25000 cents (R$ 250.00), NUNCA 40000 cents!
    expect(resumo.kpis.receitaConfirmadaCents).toBe(25000);
    expect(resumo.kpis.pedidosPagos).toBe(1);
    expect(resumo.kpis.pagamentosPendentes).toBe(1);
    expect(resumo.kpis.checkins).toBe(45);
    expect(resumo.kpis.pessoasDentro).toBe(45);
    expect(resumo.statusOperacional).toBe('AO_VIVO');
  });

  it('obterTimeline unifica vendas, check-ins e alertas sem duplicar IDs', async () => {
    const timeline = await service.obterTimeline('tenant-1', 'evento-1');

    expect(timeline.eventoId).toBe('evento-1');
    expect(timeline.itens.length).toBeGreaterThan(0);

    const ids = timeline.itens.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    // Contém itens de venda, checkin e alerta
    const tipos = timeline.itens.map((i) => i.tipo);
    expect(tipos).toContain('VENDA');
    expect(tipos).toContain('CHECKIN');
    expect(tipos).toContain('ALERTA');
  });

  it('reconhecerAlerta atualiza status para REVISADO e grava auditoria', async () => {
    const res = await service.reconhecerAlerta('00000000-0000-0000-0000-000000000001', 'alt-1', 'user-123');
    expect(res.status).toBe('REVISADO');
    expect(res.resolvidoPor).toBe('user-123');
  });

  it('degrada graciosamente se campanhas de marketing ou tabelas externas retornarem vazio', async () => {
    mockPrisma.campanhaMarketing.findMany = vi.fn().mockRejectedValue(new Error('Marketing DB timeout'));
    const resumo = await service.obterResumo('tenant-1', 'evento-1');

    // Falha em marketing NÃO pode derrubar portaria nem financeiro!
    expect(resumo.kpis.checkins).toBe(45);
    expect(resumo.kpis.receitaConfirmadaCents).toBe(25000);
    expect(resumo.portaria.scannersOnline).toBe(4);
  });
});
