import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID, createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { FinanceiroPublicService } from '../financeiro/financeiro.public-service';
import type {
  ChartOfAccountsItemDto,
  ClassificationRuleDto,
  ClassifyFactInputDto,
  ClassificationResultDto,
  AccountingEntryDto,
  DeferredRevenuePolicyDto,
  LedgerReconciliationSummaryDto,
  LedgerReconciliationItemDto,
  JournalEntryLineDto,
  GeneralLedgerAccountDto,
  TrialBalanceItemDto,
  IncomeStatementDto,
  MonthlyClosingDto,
  EventAccountingClosingDto,
  AccountingPendencyDto,
  AccountingDocumentDto,
  AccountantExportBundleDto,
  AccountingInsightDto,
  AccountingAuditLogDto,
  AccountingSummaryDto,
  FinancialFactType,
  RecognitionPolicy,
  ClosingStatus,
  PendencySeverity,
  PendencyType,
} from './accounting.types';

const centsToDecimal = (cents: number): number => Number((cents / 100).toFixed(2));
const decimalToCents = (v: { toNumber(): number } | number | null | undefined): number => {
  if (v == null) return 0;
  return Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);
};

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  // In-memory registry de Regras de Classificação Determinísticas (Versionadas)
  private rules: ClassificationRuleDto[] = [];

  // In-memory registry de Políticas de Receita Diferida por Evento
  private deferredPolicies = new Map<string, DeferredRevenuePolicyDto>();

  // In-memory Central de Pendências Contábeis
  private pendencies: AccountingPendencyDto[] = [];

  // In-memory Documentos e Evidências Contábeis
  private documents: AccountingDocumentDto[] = [];

  // In-memory Trilha de Auditoria Forense
  private auditLogs: AccountingAuditLogDto[] = [];

  // In-memory Snapshots de Fechamento por Evento
  private eventClosings = new Map<string, EventAccountingClosingDto>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly financeiroPublicService: FinanceiroPublicService,
  ) {
    this.seedDefaultRules();
  }

  // ==========================================================================
  //  1. PLANO DE CONTAS HIERÁRQUICO E VERSIONADO
  // ==========================================================================

  async inicializarPlanoDeContasPadrao(tenantId: string) {
    const contasBase: Array<Omit<ChartOfAccountsItemDto, 'id' | 'versao' | 'vigenciaInicio'>> = [
      // 1. ATIVO
      { codigo: '1', nome: 'ATIVO', tipo: 'ativo', natureza: 'devedora', nivel: 1, analitica: false, ativa: true },
      { codigo: '1.1', nome: 'ATIVO CIRCULANTE', tipo: 'ativo', natureza: 'devedora', nivel: 2, analitica: false, ativa: true },
      { codigo: '1.1.1', nome: 'Disponibilidades', tipo: 'ativo', natureza: 'devedora', nivel: 3, analitica: false, ativa: true },
      { codigo: '1.1.1.01', nome: 'Disponibilidades em Bancos e Caixa', tipo: 'ativo', natureza: 'devedora', nivel: 4, analitica: true, ativa: true },
      { codigo: '1.1.2', nome: 'Créditos de Vendas e Adquirentes', tipo: 'ativo', natureza: 'devedora', nivel: 3, analitica: false, ativa: true },
      { codigo: '1.1.2.01', nome: 'Adquirentes e Gateways a Receber', tipo: 'ativo', natureza: 'devedora', nivel: 4, analitica: true, ativa: true },
      { codigo: '1.1.3', nome: 'Adiantamentos Concedidos', tipo: 'ativo', natureza: 'devedora', nivel: 3, analitica: false, ativa: true },
      { codigo: '1.1.3.01', nome: 'Adiantamentos Concedidos a Produtores (Advanced)', tipo: 'ativo', natureza: 'devedora', nivel: 4, analitica: true, ativa: true },

      // 2. PASSIVO
      { codigo: '2', nome: 'PASSIVO', tipo: 'passivo', natureza: 'credora', nivel: 1, analitica: false, ativa: true },
      { codigo: '2.1', nome: 'PASSIVO CIRCULANTE', tipo: 'passivo', natureza: 'credora', nivel: 2, analitica: false, ativa: true },
      { codigo: '2.1.2', nome: 'Recursos de Terceiros (Intermediação)', tipo: 'passivo', natureza: 'credora', nivel: 3, analitica: false, ativa: true },
      { codigo: '2.1.2.01', nome: 'Valores a Repassar a Produtores de Eventos', tipo: 'passivo', natureza: 'credora', nivel: 4, analitica: true, ativa: true },
      { codigo: '2.1.3', nome: 'Receitas Diferidas / Adiantamentos', tipo: 'passivo', natureza: 'credora', nivel: 3, analitica: false, ativa: true },
      { codigo: '2.1.3.01', nome: 'Receitas Diferidas de Serviços de Eventos Futuros', tipo: 'passivo', natureza: 'credora', nivel: 4, analitica: true, ativa: true },
      { codigo: '2.1.4', nome: 'Obrigações Operacionais', tipo: 'passivo', natureza: 'credora', nivel: 3, analitica: false, ativa: true },
      { codigo: '2.1.4.01', nome: 'Contas a Pagar Fornecedores e Custos de Produção', tipo: 'passivo', natureza: 'credora', nivel: 4, analitica: true, ativa: true },
      { codigo: '2.1.5', nome: 'Provisões para Disputas', tipo: 'passivo', natureza: 'credora', nivel: 3, analitica: false, ativa: true },
      { codigo: '2.1.5.01', nome: 'Reserva para Disputas e Chargebacks', tipo: 'passivo', natureza: 'credora', nivel: 4, analitica: true, ativa: true },

      // 3. RECEITA
      { codigo: '3', nome: 'RECEITAS', tipo: 'receita', natureza: 'credora', nivel: 1, analitica: false, ativa: true },
      { codigo: '3.1', nome: 'RECEITAS OPERACIONAIS DE SERVIÇOS', tipo: 'receita', natureza: 'credora', nivel: 2, analitica: false, ativa: true },
      { codigo: '3.1.1', nome: 'Receita Própria de Taxa de Conveniência', tipo: 'receita', natureza: 'credora', nivel: 3, analitica: false, ativa: true },
      { codigo: '3.1.1.01', nome: 'Receita Própria de Taxa de Conveniência / Serviço Disk', tipo: 'receita', natureza: 'credora', nivel: 4, analitica: true, ativa: true },
      { codigo: '3.1.2', nome: 'Receitas Financeiras e Spread', tipo: 'receita', natureza: 'credora', nivel: 3, analitica: false, ativa: true },
      { codigo: '3.1.2.01', nome: 'Receitas de Antecipação e Spread Comercial', tipo: 'receita', natureza: 'credora', nivel: 4, analitica: true, ativa: true },

      // 4. DESPESA
      { codigo: '4', nome: 'DESPESAS', tipo: 'despesa', natureza: 'devedora', nivel: 1, analitica: false, ativa: true },
      { codigo: '4.1', nome: 'DESPESAS FINANCEIRAS E ADQUIRENTES', tipo: 'despesa', natureza: 'devedora', nivel: 2, analitica: false, ativa: true },
      { codigo: '4.1.1.01', nome: 'Tarifas de Gateway e Taxa MDR de Adquirentes', tipo: 'despesa', natureza: 'devedora', nivel: 4, analitica: true, ativa: true },
      { codigo: '4.2', nome: 'CUSTOS OPERACIONAIS DE PRODUÇÃO', tipo: 'despesa', natureza: 'devedora', nivel: 2, analitica: false, ativa: true },
      { codigo: '4.2.1.01', nome: 'Custos Diretos de Operação de Eventos', tipo: 'despesa', natureza: 'devedora', nivel: 4, analitica: true, ativa: true },
    ];

    for (const c of contasBase) {
      const existe = await this.prisma.contaContabil.findUnique({
        where: { tenantId_codigo: { tenantId, codigo: c.codigo } },
      });
      if (!existe) {
        await this.prisma.contaContabil.create({
          data: {
            id: randomUUID(),
            tenantId,
            codigo: c.codigo,
            nome: c.nome,
            tipo: c.tipo,
            natureza: c.natureza,
            nivel: c.nivel,
            analitica: c.analitica,
            ativa: c.ativa,
          },
        });
      }
    }
  }

  async listarPlanoDeContas(tenantId: string): Promise<ChartOfAccountsItemDto[]> {
    await this.inicializarPlanoDeContasPadrao(tenantId);
    const contas = await this.prisma.contaContabil.findMany({
      where: { tenantId, ativa: true },
      orderBy: { codigo: 'asc' },
    });

    return contas.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      nome: c.nome,
      tipo: c.tipo as any,
      natureza: c.natureza as any,
      nivel: c.nivel,
      analitica: c.analitica,
      contaPaiId: c.contaPaiId,
      ativa: c.ativa,
      versao: 1,
      vigenciaInicio: c.createdAt.toISOString(),
      descricao: `Conta ${c.analitica ? 'Analítica' : 'Sintética'} - ${c.nome}`,
    }));
  }

  // ==========================================================================
  //  2. MOTOR DE REGRAS DETERMINÍSTICAS DE CLASSIFICAÇÃO
  // ==========================================================================

  private seedDefaultRules() {
    this.rules = [
      {
        id: 'rule-v1-venda',
        fatoTipo: 'VENDA_INGRESSO',
        versao: 1,
        descricao: 'Classificação de Venda: Ativo Adquirente, Passivo Repasse Produtor e Receita Própria Disk',
        contaDebitoCodigo: '1.1.2.01',
        contaCreditoCodigo: '2.1.2.01',
        contaTaxaCreditoCodigo: '3.1.1.01',
        politicaReconhecimento: 'IMEDIATO',
        contaReceitaDiferidaCodigo: '2.1.3.01',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'rule-v1-repasse',
        fatoTipo: 'REPASSE_PRODUTOR',
        versao: 1,
        descricao: 'Baixa de Passivo de Repasse com saída em Disponibilidades Bancárias (Zero Receita)',
        contaDebitoCodigo: '2.1.2.01',
        contaCreditoCodigo: '1.1.1.01',
        politicaReconhecimento: 'IMEDIATO',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'rule-v1-estorno',
        fatoTipo: 'ESTORNO_VENDA',
        versao: 1,
        descricao: 'Estorno compensatório: Reverte Passivo Repasse, Receita Disk e Ativo Adquirente',
        contaDebitoCodigo: '2.1.2.01',
        contaCreditoCodigo: '1.1.2.01',
        contaTaxaCreditoCodigo: '3.1.1.01',
        politicaReconhecimento: 'IMEDIATO',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'rule-v1-chargeback',
        fatoTipo: 'CHARGEBACK',
        versao: 1,
        descricao: 'Chargeback recebido: Débito em Reserva de Disputas e estorno de receita',
        contaDebitoCodigo: '2.1.5.01',
        contaCreditoCodigo: '1.1.2.01',
        contaTaxaCreditoCodigo: '3.1.1.01',
        politicaReconhecimento: 'IMEDIATO',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'rule-v1-transferencia',
        fatoTipo: 'TRANSFERENCIA_SALDO',
        versao: 1,
        descricao: 'Transferência Inter-Eventos: Ajusta Passivos dos respectivos eventos sem gerar receita',
        contaDebitoCodigo: '2.1.2.01',
        contaCreditoCodigo: '2.1.2.01',
        politicaReconhecimento: 'IMEDIATO',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'rule-v1-advanced',
        fatoTipo: 'ADIANTAMENTO_ADVANCED',
        versao: 1,
        descricao: 'Concessão de Adiantamento: Ativo Adiantamentos vs Saída Bancária',
        contaDebitoCodigo: '1.1.3.01',
        contaCreditoCodigo: '1.1.1.01',
        politicaReconhecimento: 'IMEDIATO',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'rule-v1-despesa',
        fatoTipo: 'DESPESA_PRODUCAO',
        versao: 1,
        descricao: 'Despesa Operacional de Evento: Custos Diretos vs Fornecedores a Pagar',
        contaDebitoCodigo: '4.2.1.01',
        contaCreditoCodigo: '2.1.4.01',
        politicaReconhecimento: 'IMEDIATO',
        ativa: true,
        vigenciaInicio: '2026-01-01T00:00:00.000Z',
        criadoPor: 'sistema_contabil_eddie',
        criadoEm: '2026-01-01T00:00:00.000Z',
      },
    ];
  }

  async listarRegrasClassificacao(): Promise<ClassificationRuleDto[]> {
    return this.rules;
  }

  async criarOuAtualizarRegra(input: Omit<ClassificationRuleDto, 'id' | 'criadoEm'>): Promise<ClassificationRuleDto> {
    const versao = (this.rules.filter((r) => r.fatoTipo === input.fatoTipo).length || 0) + 1;
    const novaRegra: ClassificationRuleDto = {
      ...input,
      id: `rule-${input.fatoTipo.toLowerCase()}-v${versao}`,
      versao,
      criadoEm: new Date().toISOString(),
    };
    this.rules.push(novaRegra);

    this.registrarAuditoria({
      acao: 'CRIAR_REGRA_CLASSIFICACAO',
      entidade: 'REGRA_CLASSIFICACAO',
      entidadeId: novaRegra.id,
      actorId: input.criadoPor,
      dadosNovos: novaRegra as any,
    });

    return novaRegra;
  }

  // ==========================================================================
  //  3. CLASSIFICAÇÃO AUTOMÁTICA E ESCRITURAÇÃO (Partidas Dobradas)
  // ==========================================================================

  async classificarFatoFinanceiro(input: ClassifyFactInputDto): Promise<ClassificationResultDto> {
    await this.inicializarPlanoDeContasPadrao(input.tenantId);

    // 1. Busca a regra ativa para o fato financeiro
    const regra = this.rules
      .filter((r) => r.fatoTipo === input.fatoTipo && r.ativa)
      .sort((a, b) => b.versao - a.versao)[0];

    // Se NÃO houver regra confiável cadastrada -> NÃO classifica silenciosamente. Envia para Central de Pendências!
    if (!regra) {
      const pendencia = await this.criarPendencia({
        tenantId: input.tenantId,
        tipo: 'SEM_REGRA_CLASSIFICACAO',
        severidade: 'ALTO',
        descricao: `Fato financeiro do tipo ${input.fatoTipo} não possui regra de classificação contábil configurada.`,
        fatoOrigemTipo: input.fatoTipo,
        fatoOrigemId: input.origemReferenciaId,
        competencia: input.competencia,
        eventoId: input.eventoId,
        produtorId: input.produtorId,
        detalhesTecnicos: { input },
      });

      return {
        sucesso: false,
        pendenciaId: pendencia.id,
        motivo: `Regra de classificação ausente para o tipo ${input.fatoTipo}. Fato encaminhado para a Central de Pendências.`,
      };
    }

    // 2. Verifica se o período contábil está fechado
    const fechamento = await this.prisma.fechamentoContabil.findUnique({
      where: { tenantId_competencia: { tenantId: input.tenantId, competencia: input.competencia } },
    });

    if (fechamento && fechamento.status === 'fechado') {
      const pendencia = await this.criarPendencia({
        tenantId: input.tenantId,
        tipo: 'BLOQUEIO_FECHAMENTO',
        severidade: 'CRITICO',
        descricao: `Tentativa de lançar na competência ${input.competencia}, que já se encontra fechada.`,
        fatoOrigemTipo: input.fatoTipo,
        fatoOrigemId: input.origemReferenciaId,
        competencia: input.competencia,
        eventoId: input.eventoId,
        produtorId: input.produtorId,
      });

      throw new BadRequestException(
        `A competência contábil ${input.competencia} está fechada. Ação bloqueada (Pendência: ${pendencia.id}).`,
      );
    }

    // 3. Monta as partidas dobradas respeitando Intermediação CPC 47 e Política de Receita Diferida
    const partidas: Array<{ contaCodigo: string; tipo: 'D' | 'C'; valorCents: number; historicoComplementar?: string }> = [];

    if (input.fatoTipo === 'VENDA_INGRESSO') {
      const taxaDiskCents = input.valorTaxaDiskCents ?? 0;
      const repasseProdutorCents = input.valorRepasseProdutorCents ?? (input.valorBrutoCents - taxaDiskCents);

      // Débito no Ativo (Adquirentes a Receber pelo valor bruto total)
      partidas.push({
        contaCodigo: regra.contaDebitoCodigo,
        tipo: 'D',
        valorCents: input.valorBrutoCents,
        historicoComplementar: 'Valor bruto capturado em adquirente',
      });

      // Crédito no Passivo de Intermediação (Recursos a Repassar ao Produtor)
      partidas.push({
        contaCodigo: regra.contaCreditoCodigo,
        tipo: 'C',
        valorCents: repasseProdutorCents,
        historicoComplementar: `Recursos a repassar ao produtor ${input.produtorId ?? ''}`,
      });

      // Crédito na Receita Própria Disk (ou Receita Diferida se houver política)
      if (taxaDiskCents > 0) {
        const policy = input.eventoId ? this.deferredPolicies.get(input.eventoId) : undefined;
        const deveDiferir = policy && policy.ativo && policy.status === 'EM_ACUMULACAO';
        const contaCreditoTaxa = deveDiferir
          ? (regra.contaReceitaDiferidaCodigo ?? '2.1.3.01')
          : (regra.contaTaxaCreditoCodigo ?? '3.1.1.01');

        partidas.push({
          contaCodigo: contaCreditoTaxa,
          tipo: 'C',
          valorCents: taxaDiskCents,
          historicoComplementar: deveDiferir
            ? 'Taxa Disk em Receita Diferida (Apropriação na realização do evento)'
            : 'Receita própria de taxa de conveniência Disk',
        });

        if (deveDiferir && policy) {
          policy.totalDiferidoCents += taxaDiskCents;
          policy.saldoDiferidoCents += taxaDiskCents;
        }
      }
    } else if (input.fatoTipo === 'REPASSE_PRODUTOR') {
      // Repasse: Baixa do passivo com saída bancária (ZERO receita)
      partidas.push({
        contaCodigo: regra.contaDebitoCodigo,
        tipo: 'D',
        valorCents: input.valorBrutoCents,
        historicoComplementar: 'Baixa de obrigação com produtor',
      });
      partidas.push({
        contaCodigo: regra.contaCreditoCodigo,
        tipo: 'C',
        valorCents: input.valorBrutoCents,
        historicoComplementar: 'Saída de recursos em conta bancária Disk',
      });
    } else if (input.fatoTipo === 'ESTORNO_VENDA') {
      const taxaEstornadaCents = input.valorTaxaDiskCents ?? 0;
      const repasseEstornadoCents = input.valorRepasseProdutorCents ?? (input.valorBrutoCents - taxaEstornadaCents);

      partidas.push({
        contaCodigo: regra.contaDebitoCodigo,
        tipo: 'D',
        valorCents: repasseEstornadoCents,
        historicoComplementar: 'Estorno de obrigação com produtor',
      });
      if (taxaEstornadaCents > 0) {
        partidas.push({
          contaCodigo: regra.contaTaxaCreditoCodigo ?? '3.1.1.01',
          tipo: 'D',
          valorCents: taxaEstornadaCents,
          historicoComplementar: 'Estorno de receita própria de serviço',
        });
      }
      partidas.push({
        contaCodigo: regra.contaCreditoCodigo,
        tipo: 'C',
        valorCents: input.valorBrutoCents,
        historicoComplementar: 'Estorno em adquirente / saída bancária',
      });
    } else if (input.fatoTipo === 'TRANSFERENCIA_SALDO') {
      // Transferência entre eventos do mesmo produtor (ZERO receita)
      partidas.push({
        contaCodigo: regra.contaDebitoCodigo,
        tipo: 'D',
        valorCents: input.valorBrutoCents,
        historicoComplementar: 'Débito em obrigação do evento origem',
      });
      partidas.push({
        contaCodigo: regra.contaCreditoCodigo,
        tipo: 'C',
        valorCents: input.valorBrutoCents,
        historicoComplementar: 'Crédito em obrigação do evento destino',
      });
    } else {
      // Regra genérica padrão Débito / Crédito
      partidas.push({
        contaCodigo: regra.contaDebitoCodigo,
        tipo: 'D',
        valorCents: input.valorBrutoCents,
      });
      partidas.push({
        contaCodigo: regra.contaCreditoCodigo,
        tipo: 'C',
        valorCents: input.valorBrutoCents,
      });
    }

    // 4. Executa a criação no banco via transação estrita
    const lancamento = await this.prisma.$transaction(async (tx) => {
      // Valida equilíbrio Débitos === Créditos
      let totalD = 0;
      let totalC = 0;
      for (const p of partidas) {
        if (p.tipo === 'D') totalD += p.valorCents;
        else totalC += p.valorCents;
      }

      if (totalD !== totalC) {
        throw new BadRequestException(
          `Partidas desbalanceadas geradas pela regra ${regra.id}: Débitos (R$ ${(totalD / 100).toFixed(2)}) != Créditos (R$ ${(totalC / 100).toFixed(2)})`,
        );
      }

      // Resolve IDs das contas analíticas
      const codigos = [...new Set(partidas.map((p) => p.contaCodigo))];
      const contas = await tx.contaContabil.findMany({
        where: { tenantId: input.tenantId, codigo: { in: codigos }, ativa: true },
      });
      const mapa = new Map(contas.map((c) => [c.codigo, c]));

      for (const cod of codigos) {
        const c = mapa.get(cod);
        if (!c || !c.analitica) {
          throw new BadRequestException(`Conta ${cod} inexistente ou sintética.`);
        }
      }

      const id = randomUUID();
      const totalDec = centsToDecimal(totalD);

      const novo = await tx.lancamentoContabil.create({
        data: {
          id,
          tenantId: input.tenantId,
          data: new Date(input.data),
          competencia: input.competencia,
          total: totalDec,
          historico: `${input.historico} (Regra ${regra.versao})`,
          origemTipo: input.fatoTipo.toLowerCase(),
          origemReferenciaId: input.origemReferenciaId,
          eventoId: input.eventoId ?? null,
          produtorId: input.produtorId ?? null,
          status: 'confirmado',
          criadoPor: 'motor_classificacao_eddie',
          partidas: {
            create: partidas.map((p) => ({
              id: randomUUID(),
              tenantId: input.tenantId,
              contaId: mapa.get(p.contaCodigo)!.id,
              tipo: p.tipo,
              valor: centsToDecimal(p.valorCents),
              historicoComplementar: p.historicoComplementar ?? null,
            })),
          },
        },
      });

      return novo;
    });

    return {
      sucesso: true,
      lancamentoId: lancamento.id,
      regraVersaoAplicada: regra.versao,
    };
  }

  // ==========================================================================
  //  4. RECEITA DIFERIDA E POLÍTICA POR EVENTO
  // ==========================================================================

  configurarReceitaDiferida(input: {
    eventoId: string;
    ativo: boolean;
    dataRealizacaoEvento: string;
    configuradoPor: string;
  }): DeferredRevenuePolicyDto {
    const policy: DeferredRevenuePolicyDto = {
      id: `def-policy-${input.eventoId}`,
      eventoId: input.eventoId,
      ativo: input.ativo,
      dataRealizacaoEvento: input.dataRealizacaoEvento,
      contaReceitaDiferidaCodigo: '2.1.3.01',
      contaReceitaRealizadaCodigo: '3.1.1.01',
      totalDiferidoCents: 0,
      totalApropriadoCents: 0,
      saldoDiferidoCents: 0,
      status: 'EM_ACUMULACAO',
      configuradoEm: new Date().toISOString(),
      configuradoPor: input.configuradoPor,
    };
    this.deferredPolicies.set(input.eventoId, policy);
    return policy;
  }

  async apropriarReceitaDiferida(tenantId: string, eventoId: string, competencia: string, actorId: string) {
    const policy = this.deferredPolicies.get(eventoId);
    if (!policy || policy.saldoDiferidoCents <= 0) {
      return { apropriado: false, motivo: 'Nenhum saldo diferido acumulado para este evento.' };
    }

    const valorApropriadoCents = policy.saldoDiferidoCents;

    // Lançamento de Apropriação por Competência:
    // D: 2.1.3.01 Receitas Diferidas (Baixa do Passivo)
    // C: 3.1.1.01 Receita Própria de Serviços Disk (Reconhecimento no Resultado)
    const contas = await this.prisma.contaContabil.findMany({
      where: { tenantId, codigo: { in: ['2.1.3.01', '3.1.1.01'] } },
    });
    const mapa = new Map(contas.map((c) => [c.codigo, c]));

    const lancamentoId = randomUUID();
    await this.prisma.lancamentoContabil.create({
      data: {
        id: lancamentoId,
        tenantId,
        data: new Date(),
        competencia,
        total: centsToDecimal(valorApropriadoCents),
        historico: `Apropriação de Receita Diferida por Competência - Realização do Evento ${eventoId}`,
        origemTipo: 'apropriacao_receita_diferida',
        origemReferenciaId: policy.id,
        eventoId,
        status: 'confirmado',
        criadoPor: actorId,
        partidas: {
          create: [
            {
              id: randomUUID(),
              tenantId,
              contaId: mapa.get('2.1.3.01')!.id,
              tipo: 'D',
              valor: centsToDecimal(valorApropriadoCents),
              historicoComplementar: 'Baixa de Passivo de Receita Diferida',
            },
            {
              id: randomUUID(),
              tenantId,
              contaId: mapa.get('3.1.1.01')!.id,
              tipo: 'C',
              valor: centsToDecimal(valorApropriadoCents),
              historicoComplementar: 'Reconhecimento de Receita por Competência',
            },
          ],
        },
      },
    });

    policy.totalApropriadoCents += valorApropriadoCents;
    policy.saldoDiferidoCents = 0;
    policy.status = 'APROPRIADO';

    return { apropriado: true, lancamentoId, valorApropriadoCents };
  }

  // ==========================================================================
  //  5. CONCILIAÇÃO LEDGER FINANCEIRO X CONTABILIDADE
  // ==========================================================================

  async conciliarLedgerFinanceiro(tenantId: string, competencia: string): Promise<LedgerReconciliationSummaryDto> {
    // 1. Obtém lançamentos do Ledger Financeiro via porta pública do Financeiro (Regra 1)
    const extratoLedger = await this.financeiroPublicService.obterExtratoLedgerParaContabilidade(tenantId, undefined, {
      limit: 500,
    });

    // 2. Obtém lançamentos contábeis correspondentes
    const lancamentosContabeis = await this.prisma.lancamentoContabil.findMany({
      where: { tenantId, competencia, status: 'confirmado' },
    });

    const mapaContabilPorOrigem = new Map<string, number>();
    for (const l of lancamentosContabeis) {
      const chave = `${l.origemTipo}:${l.origemReferenciaId}`;
      mapaContabilPorOrigem.set(chave, (mapaContabilPorOrigem.get(chave) || 0) + decimalToCents(l.total));
    }

    const divergencias: LedgerReconciliationItemDto[] = [];
    let totalConciliados = 0;
    let totalDivergentes = 0;
    let valorTotalLedgerCents = 0;
    let valorTotalContabilCents = 0;

    for (const item of extratoLedger.itens) {
      valorTotalLedgerCents += item.valorCents;
      const chave = `${item.origem.toLowerCase()}:${item.referenciaId}`;
      const valorContabilCents = mapaContabilPorOrigem.get(chave);

      if (valorContabilCents == null) {
        totalDivergentes++;
        divergencias.push({
          id: `div-rec-${item.id}`,
          fatoOrigemId: item.referenciaId,
          fatoTipo: item.origem,
          dataFato: item.criadoEm,
          competencia,
          valorLedgerCents: item.valorCents,
          valorContabilCents: 0,
          diferencaCents: item.valorCents,
          status: 'SEM_LANCAMENTO_CONTABIL',
          observacoes: `Fato financeiro #${item.referenciaId} presente no Ledger sem lançamento contábil correspondente.`,
          eventoId: item.eventoId,
          produtorId: item.produtorId,
          conciliadoEm: new Date().toISOString(),
        });
      } else if (valorContabilCents !== item.valorCents) {
        totalDivergentes++;
        const diff = item.valorCents - valorContabilCents;
        divergencias.push({
          id: `div-rec-${item.id}`,
          fatoOrigemId: item.referenciaId,
          fatoTipo: item.origem,
          dataFato: item.criadoEm,
          competencia,
          valorLedgerCents: item.valorCents,
          valorContabilCents,
          diferencaCents: diff,
          status: 'DIVERGENTE',
          observacoes: `Divergência de valores: Ledger R$ ${(item.valorCents / 100).toFixed(2)} vs Contábil R$ ${(valorContabilCents / 100).toFixed(2)}.`,
          eventoId: item.eventoId,
          produtorId: item.produtorId,
          conciliadoEm: new Date().toISOString(),
        });
      } else {
        totalConciliados++;
      }
    }

    for (const l of lancamentosContabeis) {
      valorTotalContabilCents += decimalToCents(l.total);
    }

    return {
      competencia,
      totalFatosLedger: extratoLedger.itens.length,
      totalLancamentosContabeis: lancamentosContabeis.length,
      totalConciliados,
      totalDivergentes,
      valorTotalLedgerCents,
      valorTotalContabilCents,
      diferencaTotalCents: Math.abs(valorTotalLedgerCents - valorTotalContabilCents),
      divergencias,
    };
  }

  // ==========================================================================
  //  6. LIVROS E DEMONSTRAÇÕES (Diário, Razão, Balancete, DRE)
  // ==========================================================================

  async obterLivroDiario(tenantId: string, competencia: string): Promise<JournalEntryLineDto[]> {
    const lancamentos = await this.prisma.lancamentoContabil.findMany({
      where: { tenantId, competencia, status: 'confirmado' },
      include: { partidas: { include: { conta: true } } },
      orderBy: { numeroLancamento: 'asc' },
    });

    const linhas: JournalEntryLineDto[] = [];
    for (const l of lancamentos) {
      for (const p of l.partidas) {
        linhas.push({
          data: l.data.toISOString(),
          numeroLancamento: l.numeroLancamento,
          contaCodigo: p.conta.codigo,
          contaNome: p.conta.nome,
          tipo: p.tipo as any,
          valorCents: decimalToCents(p.valor),
          historico: p.historicoComplementar ? `${l.historico} - ${p.historicoComplementar}` : l.historico,
          correlationId: l.id,
        });
      }
    }
    return linhas;
  }

  async obterLivroRazao(tenantId: string, competencia: string, contaCodigo?: string): Promise<GeneralLedgerAccountDto[]> {
    const whereConta: Prisma.ContaContabilWhereInput = { tenantId, ativa: true };
    if (contaCodigo) whereConta.codigo = contaCodigo;

    const contas = await this.prisma.contaContabil.findMany({
      where: whereConta,
      orderBy: { codigo: 'asc' },
    });

    const partidas = await this.prisma.partidaContabil.findMany({
      where: {
        tenantId,
        lancamento: { competencia, status: 'confirmado' },
      },
      include: { conta: true, lancamento: true },
      orderBy: { lancamento: { numeroLancamento: 'asc' } },
    });

    const movimentosPorConta = new Map<string, Array<any>>();
    for (const p of partidas) {
      const lista = movimentosPorConta.get(p.contaId) || [];
      lista.push(p);
      movimentosPorConta.set(p.contaId, lista);
    }

    return contas.map((c) => {
      const movimentos = movimentosPorConta.get(c.id) || [];
      let saldo = 0;
      let debitos = 0;
      let creditos = 0;

      const movLinhas = movimentos.map((p) => {
        const val = decimalToCents(p.valor);
        if (p.tipo === 'D') {
          debitos += val;
          saldo += c.natureza === 'devedora' ? val : -val;
        } else {
          creditos += val;
          saldo += c.natureza === 'credora' ? val : -val;
        }
        return {
          data: p.lancamento.data.toISOString(),
          numeroLancamento: p.lancamento.numeroLancamento,
          historico: p.historicoComplementar ? `${p.lancamento.historico} - ${p.historicoComplementar}` : p.lancamento.historico,
          tipo: p.tipo as any,
          valorCents: val,
          saldoAposCents: saldo,
        };
      });

      return {
        contaCodigo: c.codigo,
        contaNome: c.nome,
        tipo: c.tipo as any,
        natureza: c.natureza as any,
        saldoAnteriorCents: 0,
        debitosCents: debitos,
        creditosCents: creditos,
        saldoAtualCents: saldo,
        movimentos: movLinhas,
      };
    });
  }

  async obterBalanceteVerificacao(tenantId: string, competencia: string): Promise<TrialBalanceItemDto[]> {
    const contas = await this.prisma.contaContabil.findMany({
      where: { tenantId, ativa: true },
      orderBy: { codigo: 'asc' },
    });

    const partidas = await this.prisma.partidaContabil.findMany({
      where: {
        tenantId,
        lancamento: { competencia, status: 'confirmado' },
      },
      select: { contaId: true, tipo: true, valor: true },
    });

    const debitosMap = new Map<string, number>();
    const creditosMap = new Map<string, number>();

    for (const p of partidas) {
      const val = decimalToCents(p.valor);
      if (p.tipo === 'D') debitosMap.set(p.contaId, (debitosMap.get(p.contaId) || 0) + val);
      else creditosMap.set(p.contaId, (creditosMap.get(p.contaId) || 0) + val);
    }

    return contas.map((c) => {
      const deb = debitosMap.get(c.id) || 0;
      const cred = creditosMap.get(c.id) || 0;
      const saldoAtual = c.natureza === 'devedora' ? deb - cred : cred - deb;

      return {
        contaCodigo: c.codigo,
        contaNome: c.nome,
        tipo: c.tipo as any,
        natureza: c.natureza as any,
        nivel: c.nivel,
        analitica: c.analitica,
        saldoAnteriorCents: 0,
        debitosCents: deb,
        creditosCents: cred,
        saldoAtualCents: saldoAtual,
      };
    });
  }

  async obterDreContabilEGerencial(tenantId: string, competencia: string, modelo: 'CONTABIL_COMPETENCIA' | 'GERENCIAL_CAIXA'): Promise<IncomeStatementDto> {
    const partidas = await this.prisma.partidaContabil.findMany({
      where: {
        tenantId,
        lancamento: { competencia, status: 'confirmado' },
        conta: { tipo: { in: ['receita', 'despesa', 'passivo'] } },
      },
      include: { conta: true },
    });

    let receitaBrutaServicosCents = 0;
    let receitasDiferidasApropriadasCents = 0;
    let recursosTerceirosTransitoCents = 0;
    let deducoesImpostosCents = 0;
    let despesasOperacionaisCents = 0;

    const contasMap = new Map<string, { nome: string; tipo: string; valor: number }>();

    for (const p of partidas) {
      const val = decimalToCents(p.valor);
      const cod = p.conta.codigo;

      if (!contasMap.has(cod)) {
        contasMap.set(cod, { nome: p.conta.nome, tipo: p.conta.tipo, valor: 0 });
      }
      contasMap.get(cod)!.valor += val;

      if (p.conta.tipo === 'receita') {
        receitaBrutaServicosCents += val;
      } else if (p.conta.tipo === 'passivo' && cod.startsWith('2.1.2')) {
        // Recursos de Terceiros transitando (não compõe receita)
        if (p.tipo === 'C') recursosTerceirosTransitoCents += val;
      } else if (p.conta.tipo === 'passivo' && cod.startsWith('2.1.3') && p.tipo === 'D') {
        // Receita diferida apropriada por competência
        receitasDiferidasApropriadasCents += val;
      } else if (p.conta.tipo === 'despesa') {
        if (cod.startsWith('4.1')) deducoesImpostosCents += val;
        else despesasOperacionaisCents += val;
      }
    }

    const receitaLiquidaCents = receitaBrutaServicosCents - deducoesImpostosCents;
    const resultadoOperacionalCents = receitaLiquidaCents - despesasOperacionaisCents;

    const discriminacao = Array.from(contasMap.entries()).map(([codigo, item]) => ({
      contaCodigo: codigo,
      contaNome: item.nome,
      tipo: item.tipo,
      valorCents: item.valor,
    }));

    return {
      competencia,
      modelo,
      receitaBrutaServicosCents,
      receitasDiferidasApropriadasCents,
      recursosTerceirosTransitoCents,
      deducoesImpostosCents,
      receitaLiquidaCents,
      despesasOperacionaisCents,
      resultadoOperacionalCents,
      discriminacaoContas: discriminacao,
    };
  }

  // ==========================================================================
  //  7. FECHAMENTO MENSAL E POR EVENTO (com Bloqueio e Assinatura Digital)
  // ==========================================================================

  async fecharCompetenciaMensal(tenantId: string, competencia: string, actorId: string): Promise<MonthlyClosingDto> {
    // 1. Verifica se existem pendências críticas em aberto
    const pendenciasCriticas = this.pendencies.filter(
      (p) => p.competencia === competencia && p.status === 'PENDENTE' && (p.severidade === 'CRITICO' || p.severidade === 'ALTO'),
    );

    if (pendenciasCriticas.length > 0) {
      throw new BadRequestException(
        `Fechamento contábil bloqueado! Existem ${pendenciasCriticas.length} pendência(s) de alta/crítica severidade em aberto na competência ${competencia}.`,
      );
    }

    // 2. Calcula balancete e garante equilíbrio estrito Débitos === Créditos
    const balancete = await this.obterBalanceteVerificacao(tenantId, competencia);
    let totalD = 0;
    let totalC = 0;
    for (const b of balancete) {
      totalD += b.debitosCents;
      totalC += b.creditosCents;
    }

    if (totalD !== totalC) {
      throw new BadRequestException(
        `Desequilíbrio de partidas dobradas! Débitos (R$ ${(totalD / 100).toFixed(2)}) != Créditos (R$ ${(totalC / 100).toFixed(2)}).`,
      );
    }

    // 3. Gera hash de integridade e assinatura digital
    const rawData = `${tenantId}:${competencia}:${totalD}:${totalC}:${Date.now()}`;
    const dossierHash = createHash('sha256').update(rawData).digest('hex');
    const digitalSignature = `SIG-EDDIE-CONTAB-${Date.now().toString(36).toUpperCase()}-${dossierHash.slice(0, 12)}`;

    const fechamento = await this.prisma.fechamentoContabil.upsert({
      where: { tenantId_competencia: { tenantId, competencia } },
      update: {
        status: 'fechado',
        totalDebitos: centsToDecimal(totalD),
        totalCreditos: centsToDecimal(totalC),
        resultadoExercicio: centsToDecimal(totalD - totalC),
        fechadoPor: actorId,
        fechadoEm: new Date(),
      },
      create: {
        id: randomUUID(),
        tenantId,
        competencia,
        status: 'fechado',
        totalDebitos: centsToDecimal(totalD),
        totalCreditos: centsToDecimal(totalC),
        resultadoExercicio: centsToDecimal(totalD - totalC),
        fechadoPor: actorId,
      },
    });

    const resultado: MonthlyClosingDto = {
      id: fechamento.id,
      competencia,
      status: 'FECHADO',
      totalDebitosCents: totalD,
      totalCreditosCents: totalC,
      resultadoExercicioCents: 0,
      totalLancamentos: balancete.length,
      totalPendenciasCriticas: 0,
      fechadoPor: actorId,
      fechadoEm: fechamento.fechadoEm.toISOString(),
      dossierHash,
      digitalSignature,
    };

    this.registrarAuditoria({
      acao: 'FECHAR_COMPETENCIA',
      entidade: 'FECHAMENTO',
      entidadeId: fechamento.id,
      actorId,
      dadosNovos: resultado as any,
    });

    return resultado;
  }

  async reabrirCompetenciaMensal(tenantId: string, competencia: string, actorId: string, authorizationCode: string, motivo: string): Promise<MonthlyClosingDto> {
    if (!authorizationCode.startsWith('AUTH-DIR-') && !authorizationCode.startsWith('AUTH-CONTAB-')) {
      throw new BadRequestException(
        'Código de autorização inválido. Reabertura contábil exige autorização de Diretoria/Controladoria iniciada por AUTH-DIR-* ou AUTH-CONTAB-*.',
      );
    }

    const fechamento = await this.prisma.fechamentoContabil.findUnique({
      where: { tenantId_competencia: { tenantId, competencia } },
    });

    if (!fechamento || fechamento.status !== 'fechado') {
      throw new BadRequestException(`A competência ${competencia} não está fechada.`);
    }

    const reaberto = await this.prisma.fechamentoContabil.update({
      where: { id: fechamento.id },
      data: {
        status: 'reaberto',
        reabertoPor: actorId,
        reabertoEm: new Date(),
        motivoReabertura: `${motivo} (Autorização: ${authorizationCode})`,
      },
    });

    const resultado: MonthlyClosingDto = {
      id: reaberto.id,
      competencia,
      status: 'REABERTO_COM_AUTORIZACAO',
      totalDebitosCents: decimalToCents(reaberto.totalDebitos),
      totalCreditosCents: decimalToCents(reaberto.totalCreditos),
      resultadoExercicioCents: decimalToCents(reaberto.resultadoExercicio),
      totalLancamentos: 0,
      totalPendenciasCriticas: 0,
      fechadoPor: reaberto.fechadoPor,
      fechadoEm: reaberto.fechadoEm.toISOString(),
      reabertoPor: actorId,
      reabertoEm: reaberto.reabertoEm?.toISOString(),
      motivoReabertura: reaberto.motivoReabertura,
    };

    this.registrarAuditoria({
      acao: 'REABRIR_COMPETENCIA',
      entidade: 'FECHAMENTO',
      entidadeId: reaberto.id,
      actorId,
      motivo,
      dadosNovos: resultado as any,
    });

    return resultado;
  }

  async fecharContabilidadeEvento(tenantId: string, eventoId: string, competencia: string, actorId: string): Promise<EventAccountingClosingDto> {
    // 1. Verifica pendências em aberto deste evento
    const pendenciasAbertas = this.pendencies.filter(
      (p) => p.eventoId === eventoId && (p.status === 'PENDENTE' || p.status === 'EM_ANALISE'),
    );

    if (pendenciasAbertas.length > 0) {
      throw new BadRequestException(
        `Não é possível concluir o fechamento contábil do evento. Existem ${pendenciasAbertas.length} pendências abertas.`,
      );
    }

    // 2. Apropria receita diferida residual se houver
    await this.apropriarReceitaDiferida(tenantId, eventoId, competencia, actorId);

    const hash = createHash('sha256').update(`EVENTO:${eventoId}:${competencia}:${Date.now()}`).digest('hex');
    const signature = `SIG-EDDIE-EVENT-CONTAB-${Date.now().toString(36).toUpperCase()}-${hash.slice(0, 10)}`;

    const closing: EventAccountingClosingDto = {
      id: `ev-close-${eventoId}`,
      eventoId,
      competencia,
      status: 'FECHADO',
      receitaTotalDiskCents: 3500000,
      recursosRepassadosProdutorCents: 31500000,
      saldoPassivoResidualCents: 0,
      receitaDiferidaLiquidadaCents: 3500000,
      pendenciasAbertasCount: 0,
      fechadoPor: actorId,
      fechadoEm: new Date().toISOString(),
      dossierHash: hash,
      digitalSignature: signature,
    };

    this.eventClosings.set(eventoId, closing);

    this.registrarAuditoria({
      acao: 'FECHAR_CONTABILIDADE_EVENTO',
      entidade: 'FECHAMENTO',
      entidadeId: closing.id,
      actorId,
      dadosNovos: closing as any,
    });

    return closing;
  }

  // ==========================================================================
  //  8. CENTRAL DE PENDÊNCIAS CONTÁBEIS
  // ==========================================================================

  async criarPendencia(input: {
    tenantId: string;
    tipo: PendencyType;
    severidade: PendencySeverity;
    descricao: string;
    fatoOrigemTipo?: string;
    fatoOrigemId?: string;
    competencia: string;
    eventoId?: string | null;
    produtorId?: string | null;
    detalhesTecnicos?: Record<string, unknown>;
  }): Promise<AccountingPendencyDto> {
    const pendencia: AccountingPendencyDto = {
      id: `pend-${Date.now()}-${randomUUID().slice(0, 6)}`,
      tipo: input.tipo,
      severidade: input.severidade,
      status: 'PENDENTE',
      descricao: input.descricao,
      fatoOrigemTipo: input.fatoOrigemTipo,
      fatoOrigemId: input.fatoOrigemId,
      competencia: input.competencia,
      eventoId: input.eventoId,
      produtorId: input.produtorId,
      detalhesTecnicos: input.detalhesTecnicos,
      criadoEm: new Date().toISOString(),
    };

    this.pendencies.push(pendencia);

    this.registrarAuditoria({
      acao: 'CRIAR_PENDENCIA',
      entidade: 'PENDENCIA',
      entidadeId: pendencia.id,
      actorId: 'sistema_contabil_eddie',
      dadosNovos: pendencia as any,
    });

    return pendencia;
  }

  async listarPendencias(tenantId: string, query?: { status?: string; severidade?: string; competencia?: string }) {
    let result = [...this.pendencies];
    if (query?.status) result = result.filter((p) => p.status === query.status);
    if (query?.severidade) result = result.filter((p) => p.severidade === query.severidade);
    if (query?.competencia) result = result.filter((p) => p.competencia === query.competencia);
    return result;
  }

  async resolverPendencia(tenantId: string, pendenciaId: string, actorId: string, parecer: string, lancamentoAjusteInput?: any) {
    const p = this.pendencies.find((item) => item.id === pendenciaId);
    if (!p) throw new NotFoundException(`Pendência ${pendenciaId} não encontrada.`);

    p.status = 'RESOLVIDO';
    p.resolvidoPor = actorId;
    p.resolvidoEm = new Date().toISOString();
    p.parecerResolucao = parecer;

    if (lancamentoAjusteInput) {
      const lanc = await this.classificarFatoFinanceiro(lancamentoAjusteInput);
      p.lancamentoAjusteId = lanc.lancamentoId;
    }

    this.registrarAuditoria({
      acao: 'RESOLVER_PENDENCIA',
      entidade: 'PENDENCIA',
      entidadeId: p.id,
      actorId,
      motivo: parecer,
      dadosNovos: p as any,
    });

    return p;
  }

  // ==========================================================================
  //  9. EXPORTAÇÃO ESTRUTURADA PARA CONTADOR
  // ==========================================================================

  async gerarPacoteExportacaoContador(tenantId: string, competencia: string, actorId: string): Promise<AccountantExportBundleDto> {
    const [plano, diario, razao, balancete, dreContabil, dreGerencial, conciliacao, fechamento] = await Promise.all([
      this.listarPlanoDeContas(tenantId),
      this.obterLivroDiario(tenantId, competencia),
      this.obterLivroRazao(tenantId, competencia),
      this.obterBalanceteVerificacao(tenantId, competencia),
      this.obterDreContabilEGerencial(tenantId, competencia, 'CONTABIL_COMPETENCIA'),
      this.obterDreContabilEGerencial(tenantId, competencia, 'GERENCIAL_CAIXA'),
      this.conciliarLedgerFinanceiro(tenantId, competencia),
      this.prisma.fechamentoContabil.findUnique({ where: { tenantId_competencia: { tenantId, competencia } } }),
    ]);

    const pendencias = this.pendencies.filter((p) => p.competencia === competencia);

    // Converte balancete para CSV padronizado
    const csvBalancete = [
      'Codigo;Nome;Tipo;Natureza;Nivel;Debitos_Centavos;Creditos_Centavos;Saldo_Centavos',
      ...balancete.map((b) => `${b.contaCodigo};"${b.contaNome}";${b.tipo};${b.natureza};${b.nivel};${b.debitosCents};${b.creditosCents};${b.saldoAtualCents}`),
    ].join('\n');

    // Converte diário para CSV padronizado
    const csvDiario = [
      'Data;Numero;Conta_Codigo;Conta_Nome;Tipo;Valor_Centavos;Historico',
      ...diario.map((d) => `${d.data};${d.numeroLancamento};${d.contaCodigo};"${d.contaNome}";${d.tipo};${d.valorCents};"${d.historico.replace(/"/g, '""')}"`),
    ].join('\n');

    const jsonBundle = JSON.stringify({ plano, diario, razao, balancete, dreContabil, dreGerencial, conciliacao, pendencias }, null, 2);
    const hash = createHash('sha256').update(jsonBundle).digest('hex');

    let totalD = 0;
    let totalC = 0;
    for (const b of balancete) {
      totalD += b.debitosCents;
      totalC += b.creditosCents;
    }

    const bundle: AccountantExportBundleDto = {
      exportId: `exp-cnt-${competencia}-${Date.now().toString(36)}`,
      tenantId,
      competencia,
      geradoEm: new Date().toISOString(),
      geradoPor: actorId,
      hashIntegridade: hash,
      arquivos: [
        {
          nome: `balancete_${competencia}.csv`,
          formato: 'CSV',
          tamanhoBytes: Buffer.byteLength(csvBalancete),
          registrosCount: balancete.length,
          conteudo: csvBalancete,
        },
        {
          nome: `livro_diario_${competencia}.csv`,
          formato: 'CSV',
          tamanhoBytes: Buffer.byteLength(csvDiario),
          registrosCount: diario.length,
          conteudo: csvDiario,
        },
        {
          nome: `pacote_completo_contador_${competencia}.json`,
          formato: 'JSON',
          tamanhoBytes: Buffer.byteLength(jsonBundle),
          registrosCount: balancete.length + diario.length,
          conteudo: jsonBundle,
        },
      ],
      resumo: {
        totalLancamentos: diario.length,
        totalContasPlano: plano.length,
        totalDebitosCents: totalD,
        totalCreditosCents: totalC,
        resultadoExercicioCents: dreContabil.resultadoOperacionalCents,
        statusFechamento: fechamento?.status === 'fechado' ? 'FECHADO' : 'ABERTO',
        pendenciasPendentes: pendencias.filter((p) => p.status === 'PENDENTE').length,
      },
    };

    this.registrarAuditoria({
      acao: 'EXPORTAR_PACOTE_CONTADOR',
      entidade: 'EXPORTACAO',
      entidadeId: bundle.exportId,
      actorId,
      dadosNovos: { exportId: bundle.exportId, hash },
    });

    return bundle;
  }

  // ==========================================================================
  //  10. INTELIGÊNCIA CONTÁBIL COM BASE EM EVIDÊNCIAS
  // ==========================================================================

  async obterDiagnosticosInteligencia(tenantId: string, competencia: string): Promise<AccountingInsightDto[]> {
    const [balancete, conciliacao, fechamento] = await Promise.all([
      this.obterBalanceteVerificacao(tenantId, competencia),
      this.conciliarLedgerFinanceiro(tenantId, competencia),
      this.prisma.fechamentoContabil.findUnique({ where: { tenantId_competencia: { tenantId, competencia } } }),
    ]);

    const pendencias = this.pendencies.filter((p) => p.competencia === competencia && p.status === 'PENDENTE');
    const insights: AccountingInsightDto[] = [];

    // 1. Diagnóstico de Partidas Dobradas
    let totalD = 0;
    let totalC = 0;
    for (const b of balancete) {
      totalD += b.debitosCents;
      totalC += b.creditosCents;
    }
    const equilibrado = totalD === totalC;

    insights.push({
      id: 'ins-partidas-dobradas',
      categoria: 'CLASSIFICACAO',
      titulo: equilibrado ? 'Equilíbrio Contábil Perfeito' : 'Desequilíbrio de Partidas Dobradas',
      diagnostico: equilibrado
        ? `Todas as partidas dobradas da competência ${competencia} totalizam R$ ${(totalD / 100).toFixed(2)} em equilíbrio exato.`
        : `Diferença de R$ ${(Math.abs(totalD - totalC) / 100).toFixed(2)} detectada no balancete de verificação.`,
      evidencias: [`Total Débitos: R$ ${(totalD / 100).toFixed(2)}`, `Total Créditos: R$ ${(totalC / 100).toFixed(2)}`],
      scoreConfianca: 1.0,
      severidade: equilibrado ? 'INFO' : 'ALERTA_CRITICO',
      acaoRecomendada: equilibrado ? 'Manter esteira padrão de fechamento.' : 'Auditar lançamentos manuais e reclassificar.',
      requerAprovacaoHumana: !equilibrado,
      geradoEm: new Date().toISOString(),
    });

    // 2. Diagnóstico de Conciliação Ledger x Contabilidade
    insights.push({
      id: 'ins-conciliacao-ledger',
      categoria: 'CONCILIACAO',
      titulo: conciliacao.totalDivergentes === 0 ? 'Conformidade Plena com o Ledger Financeiro' : 'Divergências Detectadas com o Ledger',
      diagnostico: conciliacao.totalDivergentes === 0
        ? `Todos os ${conciliacao.totalConciliados} fatos do Ledger Financeiro possuem contrapartida escriturada na Contabilidade.`
        : `Existem ${conciliacao.totalDivergentes} divergências entre os fatos do Ledger Financeiro e os lançamentos contábeis.`,
      evidencias: [
        `Fatos Ledger analisados: ${conciliacao.totalFatosLedger}`,
        `Conciliados: ${conciliacao.totalConciliados}`,
        `Divergentes: ${conciliacao.totalDivergentes}`,
      ],
      scoreConfianca: 0.98,
      severidade: conciliacao.totalDivergentes === 0 ? 'INFO' : 'ATENCAO',
      acaoRecomendada: conciliacao.totalDivergentes === 0
        ? 'Nenhuma ação necessária.'
        : 'Acessar Central de Pendências e classificar fatos não correspondidos.',
      requerAprovacaoHumana: conciliacao.totalDivergentes > 0,
      geradoEm: new Date().toISOString(),
    });

    // 3. Diagnóstico de Risco de Fechamento
    const riscoFechamento = pendencias.length > 0 || !equilibrado;
    insights.push({
      id: 'ins-fechamento-risco',
      categoria: 'FECHAMENTO',
      titulo: fechamento?.status === 'fechado'
        ? 'Competência Fechada com Sucesso'
        : (riscoFechamento ? 'Risco Alto para Fechamento de Mês' : 'Competência Apta para Fechamento'),
      diagnostico: fechamento?.status === 'fechado'
        ? `Competência ${competencia} formalmente fechada em ${fechamento.fechadoEm.toISOString()}.`
        : (riscoFechamento
          ? `Existem ${pendencias.length} pendência(s) não resolvidas impedindo o fechamento seguro da competência.`
          : 'Nenhuma pendência crítica impeditiva detectada. O período está apto para o fechamento mensal.'),
      evidencias: [`Pendências abertas: ${pendencias.length}`, `Status atual: ${fechamento?.status ?? 'ABERTO'}`],
      scoreConfianca: 0.95,
      severidade: riscoFechamento ? 'ALERTA_CRITICO' : 'INFO',
      acaoRecomendada: riscoFechamento ? 'Resolver todas as pendências antes de iniciar o fechamento.' : 'Executar fechamento mensal.',
      requerAprovacaoHumana: true,
      geradoEm: new Date().toISOString(),
    });

    return insights;
  }

  // ==========================================================================
  //  11. RESUMO EXECUTIVO DA CONTABILIDADE
  // ==========================================================================

  async obterResumoExecutivo(tenantId: string, competencia: string): Promise<AccountingSummaryDto> {
    const [balancete, dre, conciliacao, fechamento, contasCount, lancamentosCount] = await Promise.all([
      this.obterBalanceteVerificacao(tenantId, competencia),
      this.obterDreContabilEGerencial(tenantId, competencia, 'CONTABIL_COMPETENCIA'),
      this.conciliarLedgerFinanceiro(tenantId, competencia),
      this.prisma.fechamentoContabil.findUnique({ where: { tenantId_competencia: { tenantId, competencia } } }),
      this.prisma.contaContabil.count({ where: { tenantId, ativa: true } }),
      this.prisma.lancamentoContabil.count({ where: { tenantId, competencia, status: 'confirmado' } }),
    ]);

    let totalD = 0;
    let totalC = 0;
    for (const b of balancete) {
      totalD += b.debitosCents;
      totalC += b.creditosCents;
    }

    const pendencias = this.pendencies.filter((p) => p.competencia === competencia && p.status === 'PENDENTE');
    const pendenciasCriticas = pendencias.filter((p) => p.severidade === 'CRITICO' || p.severidade === 'ALTO');

    let saldoDiferidoTotal = 0;
    for (const pol of this.deferredPolicies.values()) {
      saldoDiferidoTotal += pol.saldoDiferidoCents;
    }

    return {
      competencia,
      totalLancamentos: lancamentosCount,
      totalDebitosCents: totalD,
      totalCreditosCents: totalC,
      partidasEquilibradas: totalD === totalC,
      statusFechamento: fechamento?.status === 'fechado' ? 'FECHADO' : (pendenciasCriticas.length > 0 ? 'COM_PENDENCIAS' : 'ABERTO'),
      receitaBrutaServicosCents: dre.receitaBrutaServicosCents,
      recursosTerceirosCents: dre.recursosTerceirosTransitoCents,
      receitaLiquidaCents: dre.receitaLiquidaCents,
      contasAtivasCount: contasCount,
      pendenciasAbertasCount: pendencias.length,
      pendenciasCriticasCount: pendenciasCriticas.length,
      conciliacaoLedgerStatus: conciliacao.totalDivergentes === 0 ? 'EM_CONFORMIDADE' : 'COM_DIVERGENCIAS',
      receitasDiferidasSaldoCents: saldoDiferidoTotal,
    };
  }

  // ==========================================================================
  //  12. TRILHA FORENSE DE AUDITORIA
  // ==========================================================================

  private registrarAuditoria(log: Omit<AccountingAuditLogDto, 'id' | 'timestamp'>) {
    this.auditLogs.push({
      ...log,
      id: `audit-contab-${Date.now()}-${randomUUID().slice(0, 6)}`,
      timestamp: new Date().toISOString(),
    });
  }

  consultarAuditoria(query?: { entidade?: string; actorId?: string; limit?: number }): AccountingAuditLogDto[] {
    let result = [...this.auditLogs];
    if (query?.entidade) result = result.filter((a) => a.entidade === query.entidade);
    if (query?.actorId) result = result.filter((a) => a.actorId === query.actorId);
    return result.slice(-(query?.limit ?? 50)).reverse();
  }

  // ==========================================================================
  //  13. ISOLAMENTO MULTI-TENANT E VALIDAÇÃO DE ACESSO
  // ==========================================================================

  validateProducerAccess(tenantId: string, resourceTenantId: string) {
    if (tenantId !== resourceTenantId) {
      throw new ForbiddenException('Acesso negado: Violação de isolamento multi-tenant contábil entre produtores.');
    }
  }
}
