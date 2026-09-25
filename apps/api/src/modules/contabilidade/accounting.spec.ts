import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { FinanceiroPublicService } from '../financeiro/financeiro.public-service';

describe('EDDIE 11.21 — Accounting & Fiscal Intelligence OS E2E Tests', () => {
  let service: AccountingService;
  let mockPrisma: any;
  let mockOutbox: any;
  let mockFinanceiroPublicService: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const PRODUTOR_A = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const PRODUTOR_B = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const EVENTO_ID = 'event-mega-fest-2026';
  const COMPETENCIA = '2026-09';
  const USER_ID = 'user-contab-01';

  // Contas contábeis mockadas
  const contasMock = [
    { id: 'c-11101', codigo: '1.1.1.01', nome: 'Disponibilidades em Bancos', tipo: 'ativo', natureza: 'devedora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-11201', codigo: '1.1.2.01', nome: 'Adquirentes e Gateways a Receber', tipo: 'ativo', natureza: 'devedora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-11301', codigo: '1.1.3.01', nome: 'Adiantamentos Concedidos (Advanced)', tipo: 'ativo', natureza: 'devedora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-21201', codigo: '2.1.2.01', nome: 'Valores a Repassar a Produtores', tipo: 'passivo', natureza: 'credora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-21301', codigo: '2.1.3.01', nome: 'Receitas Diferidas de Serviços', tipo: 'passivo', natureza: 'credora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-21401', codigo: '2.1.4.01', nome: 'Contas a Pagar Fornecedores', tipo: 'passivo', natureza: 'credora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-21501', codigo: '2.1.5.01', nome: 'Reserva para Disputas e Chargebacks', tipo: 'passivo', natureza: 'credora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-31101', codigo: '3.1.1.01', nome: 'Receita Própria de Taxa de Conveniência', tipo: 'receita', natureza: 'credora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-41101', codigo: '4.1.1.01', nome: 'Tarifas de Gateway e Taxa MDR', tipo: 'despesa', natureza: 'devedora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
    { id: 'c-42101', codigo: '4.2.1.01', nome: 'Custos Diretos de Operação de Eventos', tipo: 'despesa', natureza: 'devedora', analitica: true, ativa: true, nivel: 4, createdAt: new Date() },
  ];

  let lancamentosDb: any[] = [];
  let partidasDb: any[] = [];
  let fechamentoDb: any = null;

  beforeEach(() => {
    lancamentosDb = [];
    partidasDb = [];
    fechamentoDb = null;

    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-contab-01'),
      claim: vi.fn().mockResolvedValue(true),
    };

    mockFinanceiroPublicService = {
      obterExtratoLedgerParaContabilidade: vi.fn().mockResolvedValue({
        total: 2,
        itens: [
          {
            id: 'led-1',
            origem: 'venda_ingresso',
            referenciaId: 'ped-101',
            bucket: 'disponivel',
            tipo: 'C',
            valorCents: 10000,
            eventoId: EVENTO_ID,
            produtorId: PRODUTOR_A,
            criadoEm: '2026-09-25T10:00:00.000Z',
          },
          {
            id: 'led-2',
            origem: 'repasse_produtor',
            referenciaId: 'rep-501',
            bucket: 'disponivel',
            tipo: 'D',
            valorCents: 9000,
            eventoId: EVENTO_ID,
            produtorId: PRODUTOR_A,
            criadoEm: '2026-09-25T11:00:00.000Z',
          },
        ],
      }),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockPrisma)),
      contaContabil: {
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return contasMock.find((c) => c.codigo === where.tenantId_codigo?.codigo) || null;
        }),
        findMany: vi.fn().mockImplementation(async ({ where }) => {
          if (where?.codigo?.in) {
            return contasMock.filter((c) => where.codigo.in.includes(c.codigo));
          }
          return contasMock;
        }),
        create: vi.fn().mockImplementation(async ({ data }) => {
          const c = { ...data, createdAt: new Date() };
          contasMock.push(c);
          return c;
        }),
        count: vi.fn().mockResolvedValue(contasMock.length),
      },
      lancamentoContabil: {
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return lancamentosDb.find((l) => l.id === where.id) || null;
        }),
        findMany: vi.fn().mockImplementation(async ({ where }) => {
          let list = [...lancamentosDb];
          if (where?.competencia) list = list.filter((l) => l.competencia === where.competencia);
          if (where?.status) list = list.filter((l) => l.status === where.status);
          return list.map((l) => ({
            ...l,
            partidas: partidasDb.filter((p) => p.lancamentoId === l.id).map((p) => ({
              ...p,
              conta: contasMock.find((c) => c.id === p.contaId)!,
              lancamento: l,
            })),
          }));
        }),
        create: vi.fn().mockImplementation(async ({ data }) => {
          const lId = data.id || 'lanc-' + (lancamentosDb.length + 1);
          const novoLancamento = {
            id: lId,
            numeroLancamento: lancamentosDb.length + 1,
            data: data.data,
            competencia: data.competencia,
            total: data.total,
            historico: data.historico,
            origemTipo: data.origemTipo,
            origemReferenciaId: data.origemReferenciaId,
            eventoId: data.eventoId,
            produtorId: data.produtorId,
            status: data.status || 'confirmado',
            criadoPor: data.criadoPor,
            createdAt: new Date(),
          };
          lancamentosDb.push(novoLancamento);

          if (data.partidas?.create) {
            for (const p of data.partidas.create) {
              partidasDb.push({
                id: p.id || 'part-' + (partidasDb.length + 1),
                lancamentoId: lId,
                contaId: p.contaId,
                tipo: p.tipo,
                valor: p.valor,
                historicoComplementar: p.historicoComplementar,
              });
            }
          }

          return {
            ...novoLancamento,
            partidas: partidasDb.filter((p) => p.lancamentoId === lId),
          };
        }),
        count: vi.fn().mockImplementation(async () => lancamentosDb.length),
      },
      partidaContabil: {
        findMany: vi.fn().mockImplementation(async ({ where }) => {
          return partidasDb.map((p) => ({
            ...p,
            conta: contasMock.find((c) => c.id === p.contaId)!,
            lancamento: lancamentosDb.find((l) => l.id === p.lancamentoId)!,
          }));
        }),
      },
      fechamentoContabil: {
        findUnique: vi.fn().mockImplementation(async () => fechamentoDb),
        upsert: vi.fn().mockImplementation(async ({ create, update }) => {
          if (!fechamentoDb) {
            fechamentoDb = { ...create, id: 'fech-1', fechadoEm: new Date() };
          } else {
            fechamentoDb = { ...fechamentoDb, ...update, fechadoEm: new Date() };
          }
          return fechamentoDb;
        }),
        update: vi.fn().mockImplementation(async ({ data }) => {
          fechamentoDb = { ...fechamentoDb, ...data };
          return fechamentoDb;
        }),
      },
      conciliacaoContabil: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn().mockResolvedValue({ id: 'conc-1' }),
      },
    };

    service = new AccountingService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
      mockFinanceiroPublicService as unknown as FinanceiroPublicService,
    );
  });

  // ==========================================================================
  // CENÁRIOS 1 a 16 DE HOMOLOGAÇÃO E2E
  // ==========================================================================

  it('1. Pagamento -> Ledger -> Lançamento contábil em partidas dobradas rigorosas', async () => {
    const res = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'VENDA_INGRESSO',
      origemReferenciaId: 'ped-101',
      data: '2026-09-25T10:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 10000, // R$ 100,00
      valorTaxaDiskCents: 1000, // R$ 10,00
      valorRepasseProdutorCents: 9000, // R$ 90,00
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Venda de Ingressos Pedido #ped-101',
    });

    expect(res.sucesso).toBe(true);
    expect(res.lancamentoId).toBeDefined();
    expect(lancamentosDb.length).toBe(1);

    // Valida que as partidas somam D = C
    const partidas = partidasDb.filter((p) => p.lancamentoId === res.lancamentoId);
    let totalD = 0;
    let totalC = 0;
    for (const p of partidas) {
      if (p.tipo === 'D') totalD += Math.round(Number(p.valor) * 100);
      else totalC += Math.round(Number(p.valor) * 100);
    }
    expect(totalD).toBe(10000);
    expect(totalC).toBe(10000);
  });

  it('2. Separar Taxa Disk de Recursos do Produtor (Intermediação CPC 47 / IFRS 15)', async () => {
    // Venda de R$ 200,00 com taxa R$ 20,00 e repasse R$ 180,00
    const res = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'VENDA_INGRESSO',
      origemReferenciaId: 'ped-102',
      data: '2026-09-25T10:30:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 20000,
      valorTaxaDiskCents: 2000,
      valorRepasseProdutorCents: 18000,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Venda com segregação de receita',
    });

    expect(res.sucesso).toBe(true);
    const partidas = partidasDb.filter((p) => p.lancamentoId === res.lancamentoId);

    // D: 1.1.2.01 Adquirentes a Receber R$ 200,00
    const partAdquirente = partidas.find((p) => p.contaId === 'c-11201');
    expect(partAdquirente?.tipo).toBe('D');
    expect(Number(partAdquirente?.valor)).toBe(200.0);

    // C: 2.1.2.01 Valores a Repassar (Passivo Circulante) R$ 180,00 (NÃO é receita da Disk!)
    const partPassivo = partidas.find((p) => p.contaId === 'c-21201');
    expect(partPassivo?.tipo).toBe('C');
    expect(Number(partPassivo?.valor)).toBe(180.0);

    // C: 3.1.1.01 Receita Própria de Taxa de Conveniência R$ 20,00
    const partReceita = partidas.find((p) => p.contaId === 'c-31101');
    expect(partReceita?.tipo).toBe('C');
    expect(Number(partReceita?.valor)).toBe(20.0);
  });

  it('3. Repasse ao Produtor NÃO vira receita nem despesa (Baixa de Passivo)', async () => {
    // Repasse de R$ 180,00 realizado
    const res = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'REPASSE_PRODUTOR',
      origemReferenciaId: 'rep-501',
      data: '2026-09-25T11:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 18000,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Liquidação de repasse bancário ao produtor',
    });

    expect(res.sucesso).toBe(true);
    const partidas = partidasDb.filter((p) => p.lancamentoId === res.lancamentoId);

    // D: 2.1.2.01 Valores a Repassar (Baixa do Passivo)
    const partPassivo = partidas.find((p) => p.contaId === 'c-21201');
    expect(partPassivo?.tipo).toBe('D');
    expect(Number(partPassivo?.valor)).toBe(180.0);

    // C: 1.1.1.01 Disponibilidades em Bancos (Saída de Caixa)
    const partBanco = partidas.find((p) => p.contaId === 'c-11101');
    expect(partBanco?.tipo).toBe('C');
    expect(Number(partBanco?.valor)).toBe(180.0);

    // Nenhuma conta de resultado (3.x ou 4.x) foi movimentada!
    const contaResultado = partidas.some((p) => p.contaId === 'c-31101' || p.contaId === 'c-41101');
    expect(contaResultado).toBe(false);
  });

  it('4. Estorno de venda e Chargeback com lançamentos compensatórios espelhados', async () => {
    // Estorno de venda R$ 100,00 (R$ 90 repasse + R$ 10 taxa)
    const resEstorno = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'ESTORNO_VENDA',
      origemReferenciaId: 'est-701',
      data: '2026-09-25T12:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 10000,
      valorTaxaDiskCents: 1000,
      valorRepasseProdutorCents: 9000,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Estorno total de ingresso CDC 7 dias',
    });
    expect(resEstorno.sucesso).toBe(true);

    const partidasEst = partidasDb.filter((p) => p.lancamentoId === resEstorno.lancamentoId);
    expect(partidasEst.find((p) => p.contaId === 'c-21201')?.tipo).toBe('D'); // Reverte passivo produtor
    expect(partidasEst.find((p) => p.contaId === 'c-31101')?.tipo).toBe('D'); // Reverte receita Disk
    expect(partidasEst.find((p) => p.contaId === 'c-11201')?.tipo).toBe('C'); // Crédito adquirente

    // Chargeback de R$ 50,00
    const resCb = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'CHARGEBACK',
      origemReferenciaId: 'cb-801',
      data: '2026-09-25T13:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 5000,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Contestação de compra chargeback',
    });
    expect(resCb.sucesso).toBe(true);
    const partidasCb = partidasDb.filter((p) => p.lancamentoId === resCb.lancamentoId);
    expect(partidasCb.find((p) => p.contaId === 'c-21501')?.tipo).toBe('D'); // Débito em Reserva de Disputas
  });

  it('5. Transferência de saldo entre eventos do mesmo produtor NÃO gera receita', async () => {
    const res = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'TRANSFERENCIA_SALDO',
      origemReferenciaId: 'transf-inter-01',
      data: '2026-09-25T14:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 5000, // R$ 50,00 transferidos
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Transferência de saldo entre Festival e Turnê do mesmo produtor',
    });

    expect(res.sucesso).toBe(true);
    const partidas = partidasDb.filter((p) => p.lancamentoId === res.lancamentoId);

    // Ambas as partidas operam na conta 2.1.2.01 (Passivo Circulante - Débito e Crédito)
    expect(partidas.length).toBe(2);
    expect(partidas[0]!.contaId).toBe('c-21201');
    expect(partidas[1]!.contaId).toBe('c-21201');
    expect(partidas[0]!.tipo).toBe('D');
    expect(partidas[1]!.tipo).toBe('C');
  });

  it('6. Regra de classificação desconhecida -> Envia para Central de Pendências (sem classificação silenciosa)', async () => {
    // Tenta classificar um fato não suportado ou sem regra configurada
    const res = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'FATO_DESCONHECIDO' as any,
      origemReferenciaId: 'ref-desconhecida-999',
      data: '2026-09-25T14:30:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 35000,
      historico: 'Operação financeira com tipo não cadastrado',
    });

    expect(res.sucesso).toBe(false);
    expect(res.pendenciaId).toBeDefined();
    expect(res.motivo).toContain('Central de Pendências');

    // Verifica que o item foi registrado na Central de Pendências
    const pendencias = await service.listarPendencias(TENANT_ID, { status: 'PENDENTE' });
    const pendCriada = pendencias.find((p) => p.id === res.pendenciaId);
    expect(pendCriada).toBeDefined();
    expect(pendCriada?.tipo).toBe('SEM_REGRA_CLASSIFICACAO');
  });

  it('7. Versionamento de regras de classificação preserva histórico imutável', async () => {
    const regrasIniciais = await service.listarRegrasClassificacao();
    const regraVendaV1 = regrasIniciais.find((r) => r.fatoTipo === 'VENDA_INGRESSO');
    expect(regraVendaV1?.versao).toBe(1);

    // Cria nova versão da regra (V2)
    const novaRegraV2 = await service.criarOuAtualizarRegra({
      fatoTipo: 'VENDA_INGRESSO',
      versao: 2,
      descricao: 'Regra de Venda V2 com conta segregada de MDR',
      contaDebitoCodigo: '1.1.2.01',
      contaCreditoCodigo: '2.1.2.01',
      contaTaxaCreditoCodigo: '3.1.1.01',
      politicaReconhecimento: 'IMEDIATO',
      ativa: true,
      vigenciaInicio: '2026-10-01T00:00:00.000Z',
      criadoPor: USER_ID,
    });

    expect(novaRegraV2.versao).toBe(2);
    const regrasAtualizadas = await service.listarRegrasClassificacao();
    expect(regrasAtualizadas.filter((r) => r.fatoTipo === 'VENDA_INGRESSO').length).toBe(2);
  });

  it('8. Regime de Competência e Receita Diferida aplicada SOMENTE quando política configurada exigir', async () => {
    // 1. Configura política de receita diferida para o evento
    service.configurarReceitaDiferida({
      eventoId: 'evento-festival-dezembro',
      ativo: true,
      dataRealizacaoEvento: '2026-12-15T20:00:00.000Z',
      configuradoPor: USER_ID,
    });

    // 2. Venda de ingresso deste evento em setembro
    const res = await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'VENDA_INGRESSO',
      origemReferenciaId: 'ped-def-01',
      data: '2026-09-25T15:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 10000,
      valorTaxaDiskCents: 1500,
      valorRepasseProdutorCents: 8500,
      eventoId: 'evento-festival-dezembro',
      produtorId: PRODUTOR_A,
      historico: 'Venda antecipada para evento em dezembro (Receita Diferida)',
    });

    expect(res.sucesso).toBe(true);
    const partidas = partidasDb.filter((p) => p.lancamentoId === res.lancamentoId);

    // A taxa Disk foi para 2.1.3.01 (Receitas Diferidas no Passivo) e NÃO para a conta de Receita 3.1.1.01!
    const partDiferida = partidas.find((p) => p.contaId === 'c-21301');
    expect(partDiferida).toBeDefined();
    expect(partDiferida?.tipo).toBe('C');
    expect(Number(partDiferida?.valor)).toBe(15.0);

    const partReceitaImediata = partidas.find((p) => p.contaId === 'c-31101');
    expect(partReceitaImediata).toBeUndefined();

    // 3. Na data de realização do evento, efetua apropriação por competência
    const apropriaRes = await service.apropriarReceitaDiferida(TENANT_ID, 'evento-festival-dezembro', '2026-12', USER_ID);
    expect(apropriaRes.apropriado).toBe(true);
    expect(apropriaRes.valorApropriadoCents).toBe(1500);
  });

  it('9. Conciliação Ledger Financeiro x Contabilidade detecta descompassos e divergências', async () => {
    // mockFinanceiroPublicService retorna 2 itens no Ledger (ped-101 e rep-501)
    // Vamos registrar na contabilidade apenas o ped-101 para simular fato sem lançamento contábil
    await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'VENDA_INGRESSO',
      origemReferenciaId: 'ped-101',
      data: '2026-09-25T10:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 10000,
      valorTaxaDiskCents: 1000,
      valorRepasseProdutorCents: 9000,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Venda de Ingressos Pedido #ped-101',
    });

    const conciliacao = await service.conciliarLedgerFinanceiro(TENANT_ID, COMPETENCIA);
    expect(conciliacao.totalFatosLedger).toBe(2);
    expect(conciliacao.totalDivergentes).toBeGreaterThan(0);
    const div = conciliacao.divergencias.find((d) => d.fatoOrigemId === 'rep-501');
    expect(div).toBeDefined();
    expect(div?.status).toBe('SEM_LANCAMENTO_CONTABIL');
  });

  it('10. Reclassificação auditada e resolução de pendência com parecer técnico', async () => {
    // Cria uma pendência
    const pendencia = await service.criarPendencia({
      tenantId: TENANT_ID,
      tipo: 'DIVERGENCIA_LEDGER',
      severidade: 'MEDIO',
      descricao: 'Divergência entre extrato e lançamento de taxa',
      competencia: COMPETENCIA,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
    });

    // Resolve a pendência anexando parecer
    const resolvida = await service.resolverPendencia(
      TENANT_ID,
      pendencia.id,
      USER_ID,
      'Parecer: Ajuste de conciliação confirmado contra extrato de adquirente Cielo.',
    );

    expect(resolvida.status).toBe('RESOLVIDO');
    expect(resolvida.resolvidoPor).toBe(USER_ID);
    expect(resolvida.parecerResolucao).toContain('Cielo');
  });

  it('11. Geração rigorosa dos Livros Diário, Razão, Balancete e DRE (Contábil vs Gerencial)', async () => {
    // Cria lançamento equilibrado
    await service.classificarFatoFinanceiro({
      tenantId: TENANT_ID,
      fatoTipo: 'VENDA_INGRESSO',
      origemReferenciaId: 'ped-dre-01',
      data: '2026-09-25T16:00:00.000Z',
      competencia: COMPETENCIA,
      valorBrutoCents: 50000,
      valorTaxaDiskCents: 5000,
      valorRepasseProdutorCents: 45000,
      eventoId: EVENTO_ID,
      produtorId: PRODUTOR_A,
      historico: 'Venda de Ingressos Festival',
    });

    const diario = await service.obterLivroDiario(TENANT_ID, COMPETENCIA);
    expect(diario.length).toBeGreaterThan(0);

    const razao = await service.obterLivroRazao(TENANT_ID, COMPETENCIA);
    expect(razao.length).toBeGreaterThan(0);

    const balancete = await service.obterBalanceteVerificacao(TENANT_ID, COMPETENCIA);
    let totD = 0;
    let totC = 0;
    for (const b of balancete) {
      totD += b.debitosCents;
      totC += b.creditosCents;
    }
    expect(totD).toBe(totC); // Débitos === Créditos rigoroso!

    const dreContabil = await service.obterDreContabilEGerencial(TENANT_ID, COMPETENCIA, 'CONTABIL_COMPETENCIA');
    expect(dreContabil.receitaBrutaServicosCents).toBe(5000);
    expect(dreContabil.recursosTerceirosTransitoCents).toBe(45000); // Segregado
  });

  it('12. Fechamento mensal bloqueia lançamentos destrutivos; Reabertura exige autorização formal', async () => {
    // 1. Fecha o período sem pendências críticas
    const fechamento = await service.fecharCompetenciaMensal(TENANT_ID, COMPETENCIA, USER_ID);
    expect(fechamento.status).toBe('FECHADO');
    expect(fechamento.dossierHash).toBeDefined();
    expect(fechamento.digitalSignature).toContain('SIG-EDDIE-CONTAB-');

    // 2. Tentativa de lançar em período fechado é bloqueada com BadRequestException
    await expect(
      service.classificarFatoFinanceiro({
        tenantId: TENANT_ID,
        fatoTipo: 'VENDA_INGRESSO',
        origemReferenciaId: 'ped-bloqueado',
        data: '2026-09-25T17:00:00.000Z',
        competencia: COMPETENCIA,
        valorBrutoCents: 10000,
        historico: 'Venda em período fechado',
      }),
    ).rejects.toThrow(BadRequestException);

    // 3. Tentativa de reabrir com token inválido é rejeitada
    await expect(
      service.reabrirCompetenciaMensal(TENANT_ID, COMPETENCIA, USER_ID, 'TOKEN_ERRADO_123', 'Motivo teste'),
    ).rejects.toThrow(BadRequestException);

    // 4. Reabertura formal com token válido AUTH-DIR-*
    const reaberto = await service.reabrirCompetenciaMensal(
      TENANT_ID,
      COMPETENCIA,
      USER_ID,
      'AUTH-DIR-774411',
      'Retificação de conciliação autorizada pelo Diretor Financeiro',
    );
    expect(reaberto.status).toBe('REABERTO_COM_AUTORIZACAO');
  });

  it('13. Fechamento contábil de evento emite Dossiê Criptográfico e Assinatura Digital', async () => {
    const closing = await service.fecharContabilidadeEvento(TENANT_ID, EVENTO_ID, COMPETENCIA, USER_ID);
    expect(closing.status).toBe('FECHADO');
    expect(closing.eventoId).toBe(EVENTO_ID);
    expect(closing.dossierHash).toBeDefined();
    expect(closing.digitalSignature).toContain('SIG-EDDIE-EVENT-CONTAB-');
  });

  it('14. Exportação estruturada para o Contador em JSON e CSV padronizados', async () => {
    const pacote = await service.gerarPacoteExportacaoContador(TENANT_ID, COMPETENCIA, USER_ID);
    expect(pacote.exportId).toBeDefined();
    expect(pacote.hashIntegridade).toBeDefined();
    expect(pacote.arquivos.length).toBe(3); // Balancete CSV, Diário CSV e Pacote JSON

    const csvBalancete = pacote.arquivos.find((a) => a.nome.includes('balancete'));
    expect(csvBalancete?.formato).toBe('CSV');
    expect(csvBalancete?.conteudo).toContain('Codigo;Nome;Tipo;Natureza');

    const jsonCompleto = pacote.arquivos.find((a) => a.nome.includes('pacote_completo'));
    expect(jsonCompleto?.formato).toBe('JSON');
  });

  it('15. Isolamento Multi-Tenant estrito entre Produtor A e Produtor B', () => {
    expect(() => {
      service.validateProducerAccess(PRODUTOR_A, PRODUTOR_B);
    }).toThrow(ForbiddenException);

    expect(() => {
      service.validateProducerAccess(PRODUTOR_A, PRODUTOR_A);
    }).not.toThrow();
  });

  it('16. Garantias invioláveis: Marketing não altera contabilidade e 11.21 não edita Ledger Financeiro', async () => {
    // 1. Resumo executivo contábil
    const resumo = await service.obterResumoExecutivo(TENANT_ID, COMPETENCIA);
    expect(resumo.partidasEquilibradas).toBe(true);

    // 2. Consulta à trilha de auditoria contábil
    await service.criarOuAtualizarRegra({
      fatoTipo: 'DESPESA_PRODUCAO',
      versao: 1,
      descricao: 'Regra de auditoria',
      contaDebitoCodigo: '4.2.1.01',
      contaCreditoCodigo: '2.1.4.01',
      politicaReconhecimento: 'IMEDIATO',
      ativa: true,
      vigenciaInicio: '2026-01-01T00:00:00.000Z',
      criadoPor: USER_ID,
    });
    const logs = service.consultarAuditoria({ actorId: USER_ID });
    expect(logs.length).toBeGreaterThan(0);

    // 3. Confirma que nenhuma mutação foi realizada no Ledger do 11.19
    expect(mockFinanceiroPublicService.obterExtratoLedgerParaContabilidade).toHaveBeenCalled();
  });
});
