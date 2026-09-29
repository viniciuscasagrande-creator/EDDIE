import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { DocumentosPublicService } from '../documentos/services/documentos-public.service';
import {
  ContaBancaria,
  LoteRemessaCnab,
  ItemRemessaCnab,
  PixPayout,
  PosicaoConsolidadaTesouraria,
  GerarRemessaDto,
  ProcessarRetornoDto,
  ExecutarPixDto,
  PosicaoCaixaSegregadaDto,
  SubcontaEventoSegregada,
  AgendaFinanceiraProjetadaDto,
  AgendaFinanceiraItem,
  RecebivelAdquirenteDto,
  AuditarMdrDto,
  CriarOrdemPagamentoDto,
  OrdemPagamentoDto,
  AvancarStatusOrdemDto,
  CriarLotePagamentoDto,
  LotePagamentoDto,
  ConciliacaoRegistroDto,
  ConciliacaoItemDto,
  TransferenciaBancariaDto,
  TransferenciaInternaLedgerDto,
  RastreamentoResultadoDto,
  TimelineItemRastreamento,
  FechamentoTesourariaDto,
  CadastrarBeneficiarioDto,
  CenarioProjecaoCaixa,
  StatusOrdemPagamento,
  TipoOrdemPagamento,
} from './tesouraria.types';
import {
  OrdemPagamentoCriadaV1,
  OrdemPagamentoLiquidadaV1,
  PagamentoPixDesconhecidoV1,
  ConciliacaoBancariaRealizadaV1,
  DivergenciaMdrDetectadaV1,
  TransferenciaExecutadaV1,
  FechamentoTesourariaConcluidoV1,
} from '@ticketing/contracts';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_CONTAS_SEED: ContaBancaria[] = [
  {
    id: '00000000-0000-0000-0000-000000000341',
    bancoCodigo: '341',
    bancoNome: 'Itaú Unibanco S.A.',
    agencia: '0450',
    conta: '88410',
    digito: '3',
    tipo: 'CORRENTE',
    finalidade: 'OPERACIONAL',
    tipoTitularidade: 'PROPRIA_DISK',
    titular: 'DiskIngressos Entretenimento S.A.',
    cnpj: '08.123.456/0001-78',
    saldoReal: 545000000, // R$ 5.450.000,00
    saldoConciliado: 545000000,
    saldoBloqueado: 45000000, // R$ 450.000,00 (Reserva de Chargeback)
    saldoDisponivel: 500000000, // R$ 5.000.000,00
    saldoEmLiquidacao: 65000000, // R$ 650.000,00
    ultimaSincronizacao: new Date().toISOString(),
    status: 'ATIVA',
  },
  {
    id: '00000000-0000-0000-0000-000000000237',
    bancoCodigo: '237',
    bancoNome: 'Banco Bradesco S.A.',
    agencia: '1205',
    conta: '45020',
    digito: '1',
    tipo: 'CORRENTE',
    finalidade: 'REPASSES',
    tipoTitularidade: 'PROPRIA_DISK',
    titular: 'DiskIngressos Entretenimento S.A.',
    cnpj: '08.123.456/0001-78',
    saldoReal: 280000000, // R$ 2.800.000,00
    saldoConciliado: 280000000,
    saldoBloqueado: 0,
    saldoDisponivel: 280000000,
    saldoEmLiquidacao: 25000000,
    ultimaSincronizacao: new Date().toISOString(),
    status: 'ATIVA',
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    bancoCodigo: '001',
    bancoNome: 'Banco do Brasil S.A.',
    agencia: '0018',
    conta: '99200',
    digito: '8',
    tipo: 'APLICACAO',
    finalidade: 'RESERVA',
    tipoTitularidade: 'PROPRIA_DISK',
    titular: 'DiskIngressos Entretenimento S.A.',
    cnpj: '08.123.456/0001-78',
    saldoReal: 1000000000, // R$ 10.000.000,00 (CDB Liquidez Diária)
    saldoConciliado: 1000000000,
    saldoBloqueado: 0,
    saldoDisponivel: 1000000000,
    saldoEmLiquidacao: 0,
    ultimaSincronizacao: new Date().toISOString(),
    status: 'ATIVA',
  },
];

@Injectable()
export class TesourariaService {
  private readonly logger = new Logger(TesourariaService.name);

  // In-memory fallback and state cache
  private contas: ContaBancaria[] = JSON.parse(JSON.stringify(DEFAULT_CONTAS_SEED));
  private lotesRemessa: LoteRemessaCnab[] = [];
  private pixPayouts: PixPayout[] = [];
  private sequencialLote = 1001;

  // EDDIE 11.36 state caches
  private ordensPagamento: OrdemPagamentoDto[] = [];
  private lotesPagamento: LotePagamentoDto[] = [];
  private recebiveis: RecebivelAdquirenteDto[] = [];
  private conciliacoes: ConciliacaoItemDto[] = [];
  private transferenciasBancarias: any[] = [];
  private transferenciasInternas: any[] = [];
  private beneficiarios: any[] = [];
  private fechamentos: any[] = [];

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly outbox?: OutboxService,
    @Optional() private readonly documentosPublicService?: DocumentosPublicService,
  ) {
    this.seedMockData();
    this.seed1136Data();
  }

  private async emitirEvento(eventName: string, payload: unknown, tenantId: string = DEFAULT_TENANT_ID): Promise<void> {
    if (!this.outbox) return;
    try {
      if (this.prisma && typeof (this.prisma as any).$transaction === 'function') {
        await this.prisma.$transaction(async (tx) => {
          await this.outbox!.emit(tx, {
            eventName,
            source: 'tesouraria',
            tenantId,
            payload,
          });
        });
      } else {
        await this.outbox.emit({} as any, {
          eventName,
          source: 'tesouraria',
          tenantId,
          payload,
        });
      }
    } catch (err) {
      this.logger.debug(`[Tesouraria] Erro ao emitir evento ${eventName}: ${err}`);
    }
  }

  private seedMockData() {
    const loteId = 'rem-341-1001';
    const itens: ItemRemessaCnab[] = [
      {
        id: 'item-rem-1',
        favorecidoNome: 'Live Nation Brasil Entretenimento Ltda',
        favorecidoCpfCnpj: '12.345.678/0001-90',
        bancoDestino: '341',
        agenciaDestino: '0450',
        contaDestino: '99882-1',
        chavePix: 'financeiro@livenation.com.br',
        tipoChavePix: 'EMAIL',
        valorCentavos: 120000000, // R$ 1.200.000,00
        referenciaEventoId: 'ev-livenation-fest',
        produtorId: 'prod-livenation',
        status: 'LIQUIDADO',
        codigoOcorrenciaRetorno: '00',
        mensagemRetorno: 'Crédito Efetivado',
        liquidadoEm: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'item-rem-2',
        favorecidoNome: 'Opus Entretenimento S/A',
        favorecidoCpfCnpj: '98.765.432/0001-10',
        bancoDestino: '237',
        agenciaDestino: '1205',
        contaDestino: '44551-0',
        chavePix: '98765432000110',
        tipoChavePix: 'CNPJ',
        valorCentavos: 45000000, // R$ 450.000,00
        referenciaEventoId: 'ev-opus-rock',
        produtorId: 'prod-opus',
        status: 'PENDENTE',
        codigoOcorrenciaRetorno: null,
        mensagemRetorno: null,
        liquidadoEm: null,
      },
    ];

    const mockLote: LoteRemessaCnab = {
      id: loteId,
      bancoCodigo: '341',
      layout: 'CNAB_240',
      sequencialArquivo: 1001,
      totalItens: 2,
      valorTotalCentavos: 165000000,
      status: 'PROCESSADA_PARCIAL',
      sha256Hash: createHash('sha256').update(loteId + 'mock-content').digest('hex'),
      conteudoArquivoMock: '00100000...HEADER...TRAILER',
      itens,
      criadoPor: 'auditor-financeiro',
      criadoEm: new Date(Date.now() - 7200000).toISOString(),
      processadoEm: new Date(Date.now() - 3600000).toISOString(),
    };

    this.lotesRemessa.push(mockLote);

    const mockPix: PixPayout = {
      id: 'pix-payout-init-1',
      e2eId: 'E34100000' + Date.now() + '1001',
      produtorId: 'prod-t4f',
      produtorNome: 'Time For Fun Entretenimento S.A.',
      eventoId: 'ev-t4f-fest',
      eventoNome: 'Festival Disk Rock 2026',
      valorCentavos: 25000000, // R$ 250.000,00
      chavePix: 'financeiro@t4f.com.br',
      tipoChave: 'EMAIL',
      status: 'LIQUIDADO',
      idempotencyKey: 'idemp-init-1',
      tarifaPixCentavos: 0,
      comprovanteAutenticacao: 'AUTH-BACEN-PIX-998822',
      criadoEm: new Date(Date.now() - 14400000).toISOString(),
      liquidadoEm: new Date(Date.now() - 14390000).toISOString(),
    };

    this.pixPayouts.push(mockPix);
  }

  private seed1136Data() {
    // Seed Recebíveis Adquirentes
    this.recebiveis = [
      {
        id: 'rec-cielo-001',
        adquirente: 'CIELO',
        bandeira: 'VISA',
        modalidade: 'CREDITO_VISTA',
        nsu: '984102941',
        codigoAutorizacao: 'AUT1948',
        eventoId: '00000000-0000-0000-0000-000000000010',
        produtorId: '00000000-0000-0000-0000-000000000001',
        dataVenda: new Date(Date.now() - 86400000).toISOString(),
        dataPrevista: new Date(Date.now() + 86400000 * 2).toISOString(),
        valorBrutoCentavos: 45000000, // R$ 450.000,00
        mdrTaxaEsperadaPercent: 2.15,
        mdrValorEsperadoCentavos: 967500, // R$ 9.675,00
        valorLiquidoCentavos: 44032500,
        divergenciaCentavos: 0,
        status: 'PREVISTO',
      },
      {
        id: 'rec-rede-002',
        adquirente: 'REDE',
        bandeira: 'MASTERCARD',
        modalidade: 'PARCELADO_2X_6X',
        nsu: '782910384',
        codigoAutorizacao: 'AUT5512',
        eventoId: '00000000-0000-0000-0000-000000000011',
        produtorId: '00000000-0000-0000-0000-000000000002',
        dataVenda: new Date(Date.now() - 172800000).toISOString(),
        dataPrevista: new Date().toISOString(),
        valorBrutoCentavos: 38000000, // R$ 380.000,00
        mdrTaxaEsperadaPercent: 2.80,
        mdrValorEsperadoCentavos: 1064000,
        mdrTaxaCobradaPercent: 3.40,
        mdrValorCobradoCentavos: 1292000,
        divergenciaCentavos: 228000, // R$ 2.280,00 cobrado a mais
        valorLiquidoCentavos: 36708000,
        status: 'DIVERGENCIA',
      },
      {
        id: 'rec-stone-003',
        adquirente: 'STONE',
        bandeira: 'ELO',
        modalidade: 'DEBITO',
        nsu: '556102849',
        codigoAutorizacao: 'AUT8821',
        eventoId: '00000000-0000-0000-0000-000000000012',
        produtorId: '00000000-0000-0000-0000-000000000003',
        dataVenda: new Date(Date.now() - 86400000).toISOString(),
        dataPrevista: new Date().toISOString(),
        dataLiquidada: new Date().toISOString(),
        valorBrutoCentavos: 19500000, // R$ 195.000,00
        mdrTaxaEsperadaPercent: 1.20,
        mdrValorEsperadoCentavos: 234000,
        mdrTaxaCobradaPercent: 1.20,
        mdrValorCobradoCentavos: 234000,
        divergenciaCentavos: 0,
        valorLiquidoCentavos: 19266000,
        status: 'LIQUIDADO',
      },
    ];

    // Seed Ordens de Pagamento
    this.ordensPagamento = [
      {
        id: '00000000-0000-0000-0000-000000000081',
        codigo: 'OPG-2026-00081',
        tipo: 'REPASSE',
        status: 'APROVADO',
        metodo: 'PIX',
        beneficiarioNome: 'Live Nation Brasil Entretenimento Ltda',
        beneficiarioCpfCnpj: '12.345.678/0001-90',
        beneficiarioChavePix: 'financeiro@livenation.com.br',
        valorCentavos: 150000000, // R$ 1.500.000,00
        dataVencimento: new Date().toISOString(),
        idempotencyKey: 'idemp-rep-livenation-00081',
        documentoId: '00000000-0000-0000-0000-000000000001',
        documentoCodigo: 'REP-2026-00012',
        operacaoOrigem: 'REPASSE',
        operacaoOrigemId: 'rep-live-nation-1',
        eventoId: '00000000-0000-0000-0000-000000000010',
        produtorId: '00000000-0000-0000-0000-000000000001',
        contaBancariaId: '00000000-0000-0000-0000-000000000341',
        solicitadoPor: 'sistema-fechamento',
        aprovadoPor: 'diretor-financeiro',
        createdAt: new Date(Date.now() - 18000000).toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000082',
        codigo: 'OPG-2026-00082',
        tipo: 'ANTECIPACAO',
        status: 'PROGRAMADO',
        metodo: 'CNAB_240',
        beneficiarioNome: 'Opus Entretenimento S/A',
        beneficiarioCpfCnpj: '98.765.432/0001-10',
        beneficiarioBanco: '237',
        beneficiarioAgencia: '1205',
        beneficiarioConta: '44551-0',
        beneficiarioTipoConta: 'CORRENTE',
        valorCentavos: 80000000, // R$ 800.000,00
        dataVencimento: new Date(Date.now() + 86400000).toISOString(),
        dataAgendada: new Date(Date.now() + 86400000).toISOString(),
        idempotencyKey: 'idemp-ant-opus-00082',
        documentoId: '00000000-0000-0000-0000-000000000002',
        documentoCodigo: 'ANT-2026-00008',
        operacaoOrigem: 'ANTECIPACAO',
        operacaoOrigemId: 'ant-opus-1',
        eventoId: '00000000-0000-0000-0000-000000000011',
        produtorId: '00000000-0000-0000-0000-000000000002',
        contaBancariaId: '00000000-0000-0000-0000-000000000237',
        solicitadoPor: 'produtor-opus',
        aprovadoPor: 'diretor-financeiro',
        createdAt: new Date(Date.now() - 36000000).toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000083',
        codigo: 'OPG-2026-00083',
        tipo: 'FORNECEDOR',
        status: 'LIQUIDADO',
        metodo: 'TED',
        beneficiarioNome: 'Segurança & Geradores Operacionais Ltda',
        beneficiarioCpfCnpj: '44.333.222/0001-55',
        beneficiarioBanco: '341',
        beneficiarioAgencia: '0450',
        beneficiarioConta: '11223-9',
        valorCentavos: 12500000, // R$ 125.000,00
        dataVencimento: new Date(Date.now() - 86400000).toISOString(),
        dataLiquidacao: new Date(Date.now() - 82000000).toISOString(),
        idempotencyKey: 'idemp-forn-seguranca-00083',
        contaBancariaId: '00000000-0000-0000-0000-000000000341',
        solicitadoPor: 'coordenador-operacoes',
        aprovadoPor: 'gerente-financeiro',
        executadoPor: 'operador-tesouraria',
        autenticacaoBancaria: 'AUTH-TED-ITA-9928172',
        createdAt: new Date(Date.now() - 90000000).toISOString(),
      },
    ];

    // Seed Conciliações
    this.conciliacoes = [
      {
        id: 'cnc-001',
        contaBancariaId: '00000000-0000-0000-0000-000000000341',
        dataExtrato: new Date().toISOString(),
        saldoExtrato: 5450000.0,
        saldoLedger: 5450000.0,
        divergencia: 0,
        status: 'CONCILIADO_AUTOMATICO',
        nivel: 'NIVEL_2_BANCO_LIQUIDACAO',
        correspondenciaTipo: 'RECEBIVEL',
        correspondenciaId: 'rec-stone-003',
        diferencaCentavos: 0,
        divergenciasDetectadas: 0,
        conciliadoPor: 'motor-conciliacao-ia',
        conciliadoEm: new Date().toISOString(),
      },
      {
        id: 'cnc-002',
        contaBancariaId: '00000000-0000-0000-0000-000000000237',
        dataExtrato: new Date().toISOString(),
        saldoExtrato: 2800000.0,
        saldoLedger: 2800150.0,
        divergencia: -150.0,
        status: 'DIVERGENCIA',
        nivel: 'NIVEL_3_BANCO_LEDGER',
        correspondenciaTipo: 'TARIFA',
        diferencaCentavos: -15000,
        justificativaDivergencia: 'Tarifa bancária de manutenção de conta ainda não escriturada no razão contábil.',
        divergenciasDetectadas: 1,
        conciliadoPor: 'auditor-financeiro',
        conciliadoEm: new Date().toISOString(),
      },
    ];

    // Seed Beneficiários Bancários
    this.beneficiarios = [
      {
        id: 'ben-001',
        produtorId: '00000000-0000-0000-0000-000000000001',
        nome: 'Live Nation Brasil Entretenimento Ltda',
        cpfCnpj: '12.345.678/0001-90',
        tipoChavePix: 'EMAIL',
        chavePix: 'financeiro@livenation.com.br',
        banco: '341',
        agencia: '0450',
        conta: '99882-1',
        tipoConta: 'CORRENTE',
        status: 'ATIVO',
        quarentenaAte: new Date(Date.now() - 86400000 * 30).toISOString(),
        aprovadoPor: 'compliance-disk',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
      {
        id: 'ben-002',
        produtorId: '00000000-0000-0000-0000-000000000002',
        nome: 'Opus Entretenimento S/A',
        cpfCnpj: '98.765.432/0001-10',
        tipoChavePix: 'CNPJ',
        chavePix: '98765432000110',
        banco: '237',
        agencia: '1205',
        conta: '44551-0',
        tipoConta: 'CORRENTE',
        status: 'ATIVO',
        quarentenaAte: new Date(Date.now() - 86400000 * 15).toISOString(),
        aprovadoPor: 'compliance-disk',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
      {
        id: 'ben-003',
        produtorId: '00000000-0000-0000-0000-000000000004',
        nome: 'Produtora Alpha Prime Music Ltda',
        cpfCnpj: '33.222.111/0001-44',
        tipoChavePix: 'CNPJ',
        chavePix: '33222111000144',
        banco: '033',
        agencia: '3040',
        conta: '10293-8',
        tipoConta: 'CORRENTE',
        status: 'EM_QUARENTENA',
        quarentenaAte: new Date(Date.now() + 86400000).toISOString(), // 24h de quarentena
        aprovadoPor: null,
        justificativaAlteracao: 'Cadastro de nova conta bancária para repasses futuros.',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // ============================================================================
  //  11.36.1 — Posição de Caixa Consolidada & Segregação Próprio vs Terceiros
  // ============================================================================

  async getPosicaoCaixaSegregada(tenantId: string = DEFAULT_TENANT_ID): Promise<PosicaoCaixaSegregadaDto> {
    const contas = await this.listarContas();
    const saldoBancarioRealCentavos = contas.reduce((acc, c) => acc + c.saldoReal, 0);
    const saldoConciliadoCentavos = contas.reduce((acc, c) => acc + c.saldoConciliado, 0);
    const saldoDisponivelCentavos = contas.reduce((acc, c) => acc + c.saldoDisponivel, 0);
    const saldoEmLiquidacaoCentavos = contas.reduce((acc, c) => acc + c.saldoEmLiquidacao, 0);

    // Saldo comprometido: ordens ativas não liquidadas
    const ordensComprometidas = this.ordensPagamento.filter((o) =>
      ['VALIDADO', 'APROVADO', 'PROGRAMADO', 'ENVIADO', 'PROCESSANDO'].includes(o.status),
    );
    const saldoComprometidoCentavos = ordensComprometidas.reduce((acc, o) => acc + o.valorCentavos, 0);

    // Subcontas por evento (Ledger virtual)
    const subcontasEventos: SubcontaEventoSegregada[] = [
      {
        eventoId: '00000000-0000-0000-0000-000000000010',
        eventoNome: 'Festival DiskIngressos Live 2026',
        produtorId: '00000000-0000-0000-0000-000000000001',
        produtorNome: 'Live Nation Brasil Entretenimento Ltda',
        saldoCentavos: 620000000, // R$ 6.200.000,00
        saldoDisponivelCentavos: 580000000,
        saldoRetidoCentavos: 40000000, // Taxas e reserva
      },
      {
        eventoId: '00000000-0000-0000-0000-000000000011',
        eventoNome: 'Rock Fest Sunset Curitiba 2026',
        produtorId: '00000000-0000-0000-0000-000000000002',
        produtorNome: 'Opus Entretenimento S/A',
        saldoCentavos: 475000000, // R$ 4.750.000,00
        saldoDisponivelCentavos: 450000000,
        saldoRetidoCentavos: 25000000,
      },
      {
        eventoId: '00000000-0000-0000-0000-000000000012',
        eventoNome: 'Turnê Arena Brasil 2026',
        produtorId: '00000000-0000-0000-0000-000000000003',
        produtorNome: 'Time For Fun Entretenimento S.A.',
        saldoCentavos: 300000000, // R$ 3.000.000,00
        saldoDisponivelCentavos: 285000000,
        saldoRetidoCentavos: 15000000,
      },
    ];

    const recursosTerceirosProdutoresCentavos = subcontasEventos.reduce((acc, s) => acc + s.saldoCentavos, 0);
    const valoresEmConciliacaoCentavos = 45000000; // R$ 450k
    // Recursos próprios da Disk = saldo total - recursos de produtores - valores retidos em conciliação
    const recursosPropriosDiskCentavos = Math.max(
      0,
      saldoBancarioRealCentavos - recursosTerceirosProdutoresCentavos - valoresEmConciliacaoCentavos,
    );

    return {
      saldoBancarioRealCentavos,
      saldoConciliadoCentavos,
      saldoDisponivelCentavos,
      saldoComprometidoCentavos,
      saldoEmLiquidacaoCentavos,
      recursosPropriosDiskCentavos,
      recursosTerceirosProdutoresCentavos,
      valoresEmConciliacaoCentavos,
      subcontasEventos,
      contas,
      dataHora: new Date().toISOString(),
    };
  }

  // ============================================================================
  //  11.36.2 — Agenda Financeira & Projeção com 3 Cenários (Base, Conservador, Estresse)
  // ============================================================================

  async getAgendaFinanceiraProjetada(
    cenario: CenarioProjecaoCaixa = 'BASE',
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<AgendaFinanceiraProjetadaDto> {
    const posicaoCaixa = await this.getPosicaoCaixaSegregada(tenantId);
    const posicaoInicialCentavos = posicaoCaixa.saldoDisponivelCentavos;

    const itens: AgendaFinanceiraItem[] = [
      {
        id: 'ag-ent-1',
        dataPrevista: new Date().toISOString(),
        tipo: 'ENTRADA',
        categoria: 'RECEBIVEL_ADQUIRENTE',
        descricao: 'Liquidação Cartão Débito Stone - ELO',
        valorCentavos: 19266000, // R$ 192.660,00
        status: 'CONFIRMADO',
        contraparte: 'Stone Pagamentos S.A.',
      },
      {
        id: 'ag-ent-2',
        dataPrevista: new Date(Date.now() + 86400000).toISOString(),
        tipo: 'ENTRADA',
        categoria: 'PIX_RECEBIDO',
        descricao: 'Lote PIX Vendas Storefront DiskIngressos',
        valorCentavos: 82000000, // R$ 820.000,00
        status: 'PREVISTO',
        contraparte: 'SPI Banco Central / PagBank',
      },
      {
        id: 'ag-ent-3',
        dataPrevista: new Date(Date.now() + 86400000 * 2).toISOString(),
        tipo: 'ENTRADA',
        categoria: 'RECEBIVEL_ADQUIRENTE',
        descricao: 'Liquidação Cielo Crédito à Vista Visa',
        valorCentavos: 44032500, // R$ 440.325,00
        status: 'PREVISTO',
        contraparte: 'Cielo S.A.',
      },
      {
        id: 'ag-sai-1',
        dataPrevista: new Date().toISOString(),
        tipo: 'SAIDA',
        categoria: 'REPASSE_PRODUTOR',
        descricao: 'Repasse Parcial Festival Live Nation (OPG-2026-00081)',
        valorCentavos: 150000000, // R$ 1.500.000,00
        status: 'APROVADO',
        contraparte: 'Live Nation Brasil',
      },
      {
        id: 'ag-sai-2',
        dataPrevista: new Date(Date.now() + 86400000).toISOString(),
        tipo: 'SAIDA',
        categoria: 'ANTECIPACAO',
        descricao: 'Antecipação Opus Entretenimento (OPG-2026-00082)',
        valorCentavos: 80000000, // R$ 800.000,00
        status: 'PROGRAMADO',
        contraparte: 'Opus Entretenimento',
      },
      {
        id: 'ag-sai-3',
        dataPrevista: new Date(Date.now() + 86400000 * 2).toISOString(),
        tipo: 'SAIDA',
        categoria: 'TRIBUTO',
        descricao: 'Recolhimento ISS Retido na Fonte Curitiba',
        valorCentavos: 6800000, // R$ 68.000,00
        status: 'PREVISTO',
        contraparte: 'Secretaria de Finanças Curitiba',
      },
    ];

    let totalEntradas = itens.filter((i) => i.tipo === 'ENTRADA').reduce((acc, i) => acc + i.valorCentavos, 0);
    let totalSaidas = itens.filter((i) => i.tipo === 'SAIDA').reduce((acc, i) => acc + i.valorCentavos, 0);
    const fatoresEstresse: { fator: string; impactoCentavos: number }[] = [];

    if (cenario === 'CONSERVADOR') {
      // Estresse de liquidez moderado: atraso de 15% nas entradas previstas
      const retencaoConservadora = Math.round(totalEntradas * 0.15);
      totalEntradas -= retencaoConservadora;
      fatoresEstresse.push({
        fator: 'Atraso de liquidação em 15% dos recebíveis de cartão de crédito',
        impactoCentavos: -retencaoConservadora,
      });
    } else if (cenario === 'ESTRESSE') {
      // Cenário adverso: atraso de 35% nas entradas + incremento de 20% em retenções de chargeback
      const retencaoEstresse = Math.round(totalEntradas * 0.35);
      const reservaExtraChargebacks = 25000000; // R$ 250k de contingência imediata
      totalEntradas -= retencaoEstresse;
      totalSaidas += reservaExtraChargebacks;
      fatoresEstresse.push(
        {
          fator: 'Inadimplência ou retenção preventiva de adquirentes em 35% do volume',
          impactoCentavos: -retencaoEstresse,
        },
        {
          fator: 'Constituição imediata de reserva de contingência contra chargebacks',
          impactoCentavos: -reservaExtraChargebacks,
        },
      );
    }

    const posicaoFinalProjetadaCentavos = posicaoInicialCentavos + totalEntradas - totalSaidas;

    return {
      cenario,
      dataInicio: new Date().toISOString(),
      dataFim: new Date(Date.now() + 86400000 * 30).toISOString(),
      posicaoInicialCentavos,
      totalEntradasPrevistasCentavos: totalEntradas,
      totalSaidasPrevistasCentavos: totalSaidas,
      posicaoFinalProjetadaCentavos,
      itens,
      fatoresEstresseAplicados: fatoresEstresse.length > 0 ? fatoresEstresse : undefined,
    };
  }

  // ============================================================================
  //  11.36.3 — Recebíveis de Adquirentes & Auditoria de MDR
  // ============================================================================

  async listarRecebiveisAdquirentes(
    filtros?: { adquirente?: string; status?: string; eventoId?: string },
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<RecebivelAdquirenteDto[]> {
    let result = [...this.recebiveis];
    if (filtros?.adquirente) {
      result = result.filter((r) => r.adquirente.toUpperCase() === filtros.adquirente?.toUpperCase());
    }
    if (filtros?.status) {
      result = result.filter((r) => r.status.toUpperCase() === filtros.status?.toUpperCase());
    }
    if (filtros?.eventoId) {
      result = result.filter((r) => r.eventoId === filtros.eventoId);
    }
    return result;
  }

  async auditarMdrRecebivel(
    dto: AuditarMdrDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<RecebivelAdquirenteDto> {
    const recebivel = this.recebiveis.find((r) => r.id === dto.recebivelId);
    if (!recebivel) {
      throw new NotFoundException(`Recebível ${dto.recebivelId} não encontrado.`);
    }

    recebivel.mdrTaxaCobradaPercent = dto.mdrTaxaCobradaPercent;
    recebivel.mdrValorCobradoCentavos = dto.mdrValorCobradoCentavos;

    const diferencaTaxa = dto.mdrTaxaCobradaPercent - recebivel.mdrTaxaEsperadaPercent;
    const diferencaCentavos = dto.mdrValorCobradoCentavos - recebivel.mdrValorEsperadoCentavos;

    recebivel.divergenciaCentavos = diferencaCentavos;

    if (diferencaCentavos > 0) {
      recebivel.status = 'DIVERGENCIA';
      this.logger.warn(
        `[Tesouraria] Divergência de MDR detectada no recebível ${recebivel.id} (${recebivel.adquirente}): taxa cobrada ${dto.mdrTaxaCobradaPercent}% vs esperada ${recebivel.mdrTaxaEsperadaPercent}%. Diferença: R$ ${(diferencaCentavos / 100).toFixed(2)}`,
      );

      // Emite evento no Outbox se disponível
      await this.emitirEvento(
        DivergenciaMdrDetectadaV1.name,
        {
          recebivelId: recebivel.id,
          adquirente: recebivel.adquirente,
          bandeira: recebivel.bandeira,
          nsu: recebivel.nsu,
          mdrTaxaEsperadaPercent: recebivel.mdrTaxaEsperadaPercent,
          mdrTaxaCobradaPercent: dto.mdrTaxaCobradaPercent,
          divergenciaCentavos: diferencaCentavos,
          valorBrutoCentavos: recebivel.valorBrutoCentavos,
          detectadoEm: new Date().toISOString(),
        },
        tenantId,
      );
    } else {
      recebivel.status = 'LIQUIDADO';
      recebivel.dataLiquidada = new Date().toISOString();
      recebivel.valorLiquidoCentavos = recebivel.valorBrutoCentavos - dto.mdrValorCobradoCentavos;
    }

    return recebivel;
  }

  // ============================================================================
  //  11.36.4 — Contas a Pagar & Ordens de Pagamento (Máquina de Estados Rigorosa)
  // ============================================================================

  async criarOrdemPagamento(
    dto: CriarOrdemPagamentoDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<OrdemPagamentoDto> {
    // 1. Idempotência estrita
    const ordemExistente = this.ordensPagamento.find((o) => o.idempotencyKey === dto.idempotencyKey);
    if (ordemExistente) {
      this.logger.log(`[Tesouraria] Ordem de pagamento retornada por idempotência: ${ordemExistente.codigo}`);
      return ordemExistente;
    }

    // 2. Validação Inviolável com Documentos e Contratos (EDDIE 11.35)
    // Se a ordem for REPASSE ou ANTECIPACAO, verificação formal de documento assinado
    if (dto.tipo === 'REPASSE' || dto.tipo === 'ANTECIPACAO') {
      if (this.documentosPublicService && (dto.operacaoOrigemId || dto.documentoId)) {
        const idOrigem = dto.operacaoOrigemId || dto.documentoId!;
        const tipoOp = dto.tipo === 'REPASSE' ? 'REPASSE' : 'ANTECIPACAO';
        const check = await this.documentosPublicService.verificarOperacaoPodeSerExecutada(
          tenantId,
          idOrigem,
          tipoOp,
        );
        if (!check.autorizada) {
          throw new BadRequestException(
            `[Bloqueio 11.35] ${check.motivo || 'Operação requer documento assinado formalizado antes da criação da ordem de pagamento.'}`,
          );
        }
        if (check.documentoCodigo) {
          dto.documentoCodigo = check.documentoCodigo;
        }
      }
    }

    // 3. Validação de Quarentena Bancária do Beneficiário
    const beneficiario = this.beneficiarios.find((b) => b.cpfCnpj === dto.beneficiarioCpfCnpj);
    if (beneficiario && beneficiario.status === 'EM_QUARENTENA') {
      const agora = new Date().getTime();
      const quarentenaFim = new Date(beneficiario.quarentenaAte).getTime();
      if (agora < quarentenaFim) {
        throw new BadRequestException(
          `[Segurança] O beneficiário ${beneficiario.nome} está sob quarentena bancária de segurança até ${beneficiario.quarentenaAte}. Nenhuma ordem de pagamento pode ser emitida sem alçada especial.`,
        );
      }
    }

    const sequencial = Math.floor(10000 + Math.random() * 90000);
    const ano = new Date().getFullYear();
    const codigo = `OPG-${ano}-${sequencial}`;

    const novaOrdem: OrdemPagamentoDto = {
      id: randomUUID(),
      codigo,
      tipo: dto.tipo,
      status: 'CRIADO',
      metodo: dto.metodo,
      beneficiarioNome: dto.beneficiarioNome,
      beneficiarioCpfCnpj: dto.beneficiarioCpfCnpj,
      beneficiarioChavePix: dto.beneficiarioChavePix,
      beneficiarioBanco: dto.beneficiarioBanco,
      beneficiarioAgencia: dto.beneficiarioAgencia,
      beneficiarioConta: dto.beneficiarioConta,
      beneficiarioTipoConta: dto.beneficiarioTipoConta || 'CORRENTE',
      valorCentavos: dto.valorCentavos,
      dataVencimento: dto.dataVencimento,
      idempotencyKey: dto.idempotencyKey,
      documentoId: dto.documentoId,
      documentoCodigo: dto.documentoCodigo,
      operacaoOrigem: dto.operacaoOrigem,
      operacaoOrigemId: dto.operacaoOrigemId,
      eventoId: dto.eventoId,
      produtorId: dto.produtorId,
      contaBancariaId: dto.contaBancariaId || this.contas[0]?.id,
      solicitadoPor: dto.solicitadoPor,
      createdAt: new Date().toISOString(),
    };

    this.ordensPagamento.unshift(novaOrdem);

    // Emite evento no Outbox se disponível
    await this.emitirEvento(
      OrdemPagamentoCriadaV1.name,
      {
        ordemId: novaOrdem.id,
        codigo: novaOrdem.codigo,
        tipo: novaOrdem.tipo,
        beneficiarioNome: novaOrdem.beneficiarioNome,
        beneficiarioCpfCnpj: novaOrdem.beneficiarioCpfCnpj,
        valorCentavos: novaOrdem.valorCentavos,
        metodo: novaOrdem.metodo,
        documentoId: novaOrdem.documentoId,
        operacaoOrigem: novaOrdem.operacaoOrigem,
        operacaoOrigemId: novaOrdem.operacaoOrigemId,
        dataVencimento: novaOrdem.dataVencimento,
        solicitadoPor: novaOrdem.solicitadoPor,
        idempotencyKey: novaOrdem.idempotencyKey,
        criadoEm: novaOrdem.createdAt,
      },
      tenantId,
    );

    this.logger.log(`[Tesouraria] Ordem de pagamento ${novaOrdem.codigo} criada com sucesso (${novaOrdem.tipo} - R$ ${(novaOrdem.valorCentavos / 100).toFixed(2)})`);
    return novaOrdem;
  }

  async listarOrdensPagamento(
    filtros?: { status?: string; tipo?: string; produtorId?: string },
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<OrdemPagamentoDto[]> {
    let result = [...this.ordensPagamento];
    if (filtros?.status) {
      result = result.filter((o) => o.status.toUpperCase() === filtros.status?.toUpperCase());
    }
    if (filtros?.tipo) {
      result = result.filter((o) => o.tipo.toUpperCase() === filtros.tipo?.toUpperCase());
    }
    if (filtros?.produtorId) {
      result = result.filter((o) => o.produtorId === filtros.produtorId);
    }
    return result;
  }

  async obterOrdemPorId(id: string, tenantId: string = DEFAULT_TENANT_ID): Promise<OrdemPagamentoDto> {
    const ordem = this.ordensPagamento.find((o) => o.id === id || o.codigo === id);
    if (!ordem) {
      throw new NotFoundException(`Ordem de pagamento ${id} não localizada.`);
    }
    return ordem;
  }

  async avancarStatusOrdem(
    id: string,
    dto: AvancarStatusOrdemDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<OrdemPagamentoDto> {
    const ordem = await this.obterOrdemPorId(id, tenantId);

    // Validações da Máquina de Estados
    const transicoesPermitidas: Record<StatusOrdemPagamento, StatusOrdemPagamento[]> = {
      CRIADO: ['VALIDADO', 'CANCELADO', 'REJEITADO'],
      VALIDADO: ['APROVADO', 'CANCELADO', 'REJEITADO'],
      APROVADO: ['PROGRAMADO', 'ENVIADO', 'CANCELADO', 'REJEITADO'],
      PROGRAMADO: ['ENVIADO', 'CANCELADO'],
      ENVIADO: ['PROCESSANDO', 'LIQUIDADO', 'SITUACAO_DESCONHECIDA', 'REJEITADO'],
      PROCESSANDO: ['LIQUIDADO', 'SITUACAO_DESCONHECIDA', 'REJEITADO'],
      LIQUIDADO: ['CONCILIADO'],
      CONCILIADO: [],
      REJEITADO: [],
      CANCELADO: [],
      EXPIRADO: [],
      SITUACAO_DESCONHECIDA: ['LIQUIDADO', 'REJEITADO', 'CANCELADO'],
    };

    const permitidas = transicoesPermitidas[ordem.status] || [];
    if (!permitidas.includes(dto.novoStatus)) {
      throw new BadRequestException(
        `Transição de status inválida para ordem ${ordem.codigo}: de '${ordem.status}' para '${dto.novoStatus}'. Permitidas: ${permitidas.join(', ')}`,
      );
    }

    ordem.status = dto.novoStatus;

    if (dto.novoStatus === 'APROVADO') {
      ordem.aprovadoPor = dto.operador;
    }

    if (dto.novoStatus === 'LIQUIDADO') {
      ordem.executadoPor = dto.operador;
      ordem.dataLiquidacao = new Date().toISOString();
      ordem.autenticacaoBancaria = dto.autenticacaoBancaria || `AUTH-LIQ-${randomUUID().substring(0, 8).toUpperCase()}`;
      if (dto.endToEndId) {
        ordem.endToEndId = dto.endToEndId;
      }

      // Debita a conta bancária
      const conta = this.contas.find((c) => c.id === (dto.contaBancariaId || ordem.contaBancariaId)) || this.contas[0];
      if (conta) {
        conta.saldoReal -= ordem.valorCentavos;
        conta.saldoDisponivel -= ordem.valorCentavos;
        conta.saldoConciliado -= ordem.valorCentavos;
      }

      // Emite evento no Outbox se disponível
      await this.emitirEvento(
        OrdemPagamentoLiquidadaV1.name,
        {
          ordemId: ordem.id,
          codigo: ordem.codigo,
          tipo: ordem.tipo,
          valorCentavos: ordem.valorCentavos,
          metodo: ordem.metodo,
          contaBancariaId: conta ? conta.id : ordem.contaBancariaId || randomUUID(),
          bancoCodigo: (conta ? conta.bancoCodigo : '341') as any,
          endToEndId: ordem.endToEndId,
          autenticacaoBancaria: ordem.autenticacaoBancaria,
          liquidadoEm: ordem.dataLiquidacao,
          executadoPor: dto.operador,
        },
        tenantId,
      );
    }

    if (dto.novoStatus === 'SITUACAO_DESCONHECIDA') {
      ordem.motivoRejeicao = dto.motivo || 'Timeout de comunicação bancária sem confirmação de liquidação.';
      this.logger.warn(`[Tesouraria] Ordem ${ordem.codigo} em SITUACAO_DESCONHECIDA. Requer verificação ativa.`);

      await this.emitirEvento(
        PagamentoPixDesconhecidoV1.name,
        {
          ordemId: ordem.id,
          codigo: ordem.codigo,
          valorCentavos: ordem.valorCentavos,
          chavePix: ordem.beneficiarioChavePix || ordem.beneficiarioCpfCnpj,
          endToEndId: ordem.endToEndId,
          motivo: ordem.motivoRejeicao,
          detectadoEm: new Date().toISOString(),
          tentativasConsulta: 1,
        },
        tenantId,
      );
    }

    return ordem;
  }

  // ============================================================================
  //  11.36.5 — Lotes de Pagamento com Simulação Prévia de Liquidez
  // ============================================================================

  async criarLotePagamento(
    dto: CriarLotePagamentoDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<LotePagamentoDto> {
    const conta = this.contas.find((c) => c.id === dto.contaBancariaId);
    if (!conta) {
      throw new NotFoundException(`Conta bancária ${dto.contaBancariaId} não encontrada.`);
    }

    const ordens = this.ordensPagamento.filter((o) => dto.ordensIds.includes(o.id));
    if (ordens.length === 0) {
      throw new BadRequestException('Nenhuma ordem de pagamento válida selecionada para o lote.');
    }

    const valorTotalCentavos = ordens.reduce((acc, o) => acc + o.valorCentavos, 0);

    // Simulação Prévia de Liquidez
    const saldoDisponivelMomento = conta.saldoDisponivel;
    const impactoSaldoProjetado = saldoDisponivelMomento - valorTotalCentavos;

    if (impactoSaldoProjetado < 0) {
      throw new BadRequestException(
        `[Simulação de Liquidez] Saldo disponível insuficiente na conta ${conta.bancoNome} (${(saldoDisponivelMomento / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}). O lote requer ${(valorTotalCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, gerando déficit de ${(Math.abs(impactoSaldoProjetado) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
      );
    }

    const sequencial = Math.floor(1000 + Math.random() * 9000);
    const ano = new Date().getFullYear();
    const codigo = `LOT-${ano}-${sequencial}`;

    const novoLote: LotePagamentoDto = {
      id: randomUUID(),
      codigo,
      status: 'AUTORIZADO',
      contaBancariaId: dto.contaBancariaId,
      metodo: dto.metodo,
      quantidadeOrdens: ordens.length,
      valorTotalCentavos,
      saldoDisponivelNoMomentoCentavos: saldoDisponivelMomento,
      impactoSaldoProjetadoCentavos: impactoSaldoProjetado,
      sha256Hash: createHash('sha256').update(codigo + valorTotalCentavos.toString()).digest('hex'),
      solicitadoPor: dto.solicitadoPor,
      createdAt: new Date().toISOString(),
      ordens,
    };

    // Vincula lote às ordens
    for (const o of ordens) {
      o.lotePagamentoId = novoLote.id;
      o.status = 'PROGRAMADO';
    }

    this.lotesPagamento.unshift(novoLote);
    this.logger.log(`[Tesouraria] Lote de pagamento ${novoLote.codigo} criado com ${novoLote.quantidadeOrdens} ordens (R$ ${(novoLote.valorTotalCentavos / 100).toFixed(2)})`);
    return novoLote;
  }

  async listarLotesPagamento(tenantId: string = DEFAULT_TENANT_ID): Promise<LotePagamentoDto[]> {
    return this.lotesPagamento;
  }

  async executarLotePagamento(
    dto: { loteId: string; executadoPor: string },
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<LotePagamentoDto> {
    const lote = this.lotesPagamento.find((l) => l.id === dto.loteId);
    if (!lote) {
      throw new NotFoundException(`Lote de pagamento ${dto.loteId} não encontrado.`);
    }

    lote.status = 'PROCESSANDO';
    const ordensDoLote = this.ordensPagamento.filter((o) => o.lotePagamentoId === lote.id);

    for (const ordem of ordensDoLote) {
      await this.avancarStatusOrdem(
        ordem.id,
        {
          novoStatus: 'LIQUIDADO',
          operador: dto.executadoPor,
          contaBancariaId: lote.contaBancariaId,
        },
        tenantId,
      );
    }

    lote.status = 'CONCLUIDO';
    lote.executadoPor = dto.executadoPor;
    lote.executadoEm = new Date().toISOString();

    return lote;
  }

  // ============================================================================
  //  11.36.6 — PIX Seguro com Idempotência Estrita e Tolerância a Timeout Bancário
  // ============================================================================

  async executarPixSeguro(
    dados: ExecutarPixDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<PixPayout> {
    // 1. Idempotência estrita
    const existente = this.pixPayouts.find((p) => p.idempotencyKey === dados.idempotencyKey);
    if (existente) {
      this.logger.log(`[Tesouraria] PIX retornado por idempotência (${existente.idempotencyKey}): ${existente.e2eId}`);
      return existente;
    }

    // 2. Simulação de timeout bancário / estado desconhecido
    if (dados.simularTimeoutBancario) {
      const e2eId = `E34100000${Date.now()}TIMEOUT`;
      const payoutDesconhecido: PixPayout = {
        id: randomUUID(),
        e2eId,
        produtorId: dados.produtorId,
        produtorNome: dados.produtorNome,
        eventoId: dados.eventoId,
        eventoNome: dados.eventoNome,
        valorCentavos: dados.valorCentavos,
        chavePix: dados.chavePix,
        tipoChave: dados.tipoChave,
        status: 'SITUACAO_DESCONHECIDA',
        idempotencyKey: dados.idempotencyKey,
        tarifaPixCentavos: 0,
        comprovanteAutenticacao: 'PENDENTE_CONFIRMACAO_SPI',
        criadoEm: new Date().toISOString(),
        liquidadoEm: null,
      };

      this.pixPayouts.unshift(payoutDesconhecido);

      await this.emitirEvento(
        PagamentoPixDesconhecidoV1.name,
        {
          ordemId: payoutDesconhecido.id,
          codigo: `PIX-${e2eId.substring(0, 15)}`,
          valorCentavos: dados.valorCentavos,
          chavePix: dados.chavePix,
          endToEndId: e2eId,
          motivo: 'Timeout de 10s sem resposta do SPI Bacen.',
          detectadoEm: new Date().toISOString(),
          tentativasConsulta: 1,
        },
        tenantId,
      );

      return payoutDesconhecido;
    }

    // Fluxo normal através do método legado
    return this.executarPixPayout(dados);
  }

  // ============================================================================
  //  11.36.7 — Conciliação Bancária em 3 Níveis
  // ============================================================================

  async listarConciliacoes(
    filtros?: { contaBancariaId?: string; nivel?: string; status?: string },
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<ConciliacaoItemDto[]> {
    let result = [...this.conciliacoes];
    if (filtros?.contaBancariaId) {
      result = result.filter((c) => c.contaBancariaId === filtros.contaBancariaId);
    }
    if (filtros?.nivel) {
      result = result.filter((c) => c.nivel === filtros.nivel);
    }
    if (filtros?.status) {
      result = result.filter((c) => c.status === filtros.status);
    }
    return result;
  }

  async registrarConciliacao(
    dto: ConciliacaoRegistroDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<ConciliacaoItemDto> {
    const item: ConciliacaoItemDto = {
      id: randomUUID(),
      contaBancariaId: dto.contaBancariaId,
      dataExtrato: dto.dataExtrato,
      saldoExtrato: dto.valorCentavos / 100,
      saldoLedger: (dto.valorCentavos + (dto.diferencaCentavos || 0)) / 100,
      divergencia: (dto.diferencaCentavos || 0) / 100,
      status: dto.status,
      nivel: dto.nivel,
      correspondenciaTipo: dto.correspondenciaTipo,
      correspondenciaId: dto.correspondenciaId,
      diferencaCentavos: dto.diferencaCentavos || 0,
      justificativaDivergencia: dto.justificativaDivergencia,
      divergenciasDetectadas: dto.diferencaCentavos && dto.diferencaCentavos !== 0 ? 1 : 0,
      conciliadoPor: dto.conciliadoPor,
      conciliadoEm: new Date().toISOString(),
    };

    this.conciliacoes.unshift(item);

    await this.emitirEvento(
      ConciliacaoBancariaRealizadaV1.name,
      {
        conciliacaoId: item.id,
        contaBancariaId: item.contaBancariaId,
        nivel: item.nivel as any,
        status: item.status as any,
        totalItensConciliados: 1,
        totalDivergenciasCentavos: item.diferencaCentavos,
        conciliadoPor: item.conciliadoPor,
        dataHora: item.conciliadoEm,
      },
      tenantId,
    );

    return item;
  }

  // ============================================================================
  //  11.36.8 — Transferências Bancárias vs Internas Ledger
  // ============================================================================

  async executarTransferenciaBancaria(
    dto: TransferenciaBancariaDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<any> {
    const origem = this.contas.find((c) => c.id === dto.contaOrigemId);
    const destino = this.contas.find((c) => c.id === dto.contaDestinoId);

    if (!origem || !destino) {
      throw new NotFoundException('Conta de origem ou destino não encontrada.');
    }

    if (origem.saldoDisponivel < dto.valorCentavos) {
      throw new BadRequestException('Saldo insuficiente na conta de origem para a transferência bancária.');
    }

    origem.saldoReal -= dto.valorCentavos;
    origem.saldoDisponivel -= dto.valorCentavos;
    destino.saldoReal += dto.valorCentavos;
    destino.saldoDisponivel += dto.valorCentavos;

    const sequencial = Math.floor(1000 + Math.random() * 9000);
    const codigo = `TRF-2026-${sequencial}`;

    const registro = {
      id: randomUUID(),
      codigo,
      tipo: 'BANCARIA_FISICA',
      origemId: origem.id,
      destinoId: destino.id,
      origemNome: origem.bancoNome,
      destinoNome: destino.bancoNome,
      valorCentavos: dto.valorCentavos,
      motivo: dto.motivo,
      status: 'CONCLUIDA',
      executadoPor: dto.solicitadoPor,
      executadoEm: new Date().toISOString(),
    };

    this.transferenciasBancarias.unshift(registro);

    await this.emitirEvento(
      TransferenciaExecutadaV1.name,
      {
        transferenciaId: registro.id,
        codigo: registro.codigo,
        tipo: 'BANCARIA_FISICA',
        origemId: registro.origemId,
        destinoId: registro.destinoId,
        valorCentavos: registro.valorCentavos,
        executadoPor: registro.executadoPor,
        executadoEm: registro.executadoEm,
      },
      tenantId,
    );

    return registro;
  }

  async executarTransferenciaInternaLedger(
    dto: TransferenciaInternaLedgerDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<any> {
    const sequencial = Math.floor(1000 + Math.random() * 9000);
    const codigo = `TIL-2026-${sequencial}`;

    const registro = {
      id: randomUUID(),
      codigo,
      tipo: 'INTERNA_LEDGER',
      eventoOrigemId: dto.eventoOrigemId,
      eventoDestinoId: dto.eventoDestinoId,
      produtorOrigemId: dto.produtorOrigemId,
      produtorDestinoId: dto.produtorDestinoId,
      valorCentavos: dto.valorCentavos,
      motivo: dto.motivo,
      justificativa: dto.justificativa,
      status: 'EXECUTADA',
      executadoPor: dto.solicitadoPor,
      executadoEm: new Date().toISOString(),
    };

    this.transferenciasInternas.unshift(registro);

    await this.emitirEvento(
      TransferenciaExecutadaV1.name,
      {
        transferenciaId: registro.id,
        codigo: registro.codigo,
        tipo: 'INTERNA_LEDGER',
        origemId: registro.eventoOrigemId,
        destinoId: registro.eventoDestinoId,
        valorCentavos: registro.valorCentavos,
        executadoPor: registro.executadoPor,
        executadoEm: registro.executadoEm,
      },
      tenantId,
    );

    return registro;
  }

  // ============================================================================
  //  11.36.9 — Rastreabilidade Ponta a Ponta ("Rastrear Pagamento")
  // ============================================================================

  async rastrearPagamento(
    termo: string,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<RastreamentoResultadoDto> {
    const termoLimpo = termo.trim();

    // 1. Procura em ordens de pagamento
    const ordem = this.ordensPagamento.find(
      (o) =>
        o.codigo.toLowerCase() === termoLimpo.toLowerCase() ||
        o.id === termoLimpo ||
        o.documentoCodigo?.toLowerCase() === termoLimpo.toLowerCase() ||
        o.operacaoOrigemId?.toLowerCase() === termoLimpo.toLowerCase() ||
        o.beneficiarioNome.toLowerCase().includes(termoLimpo.toLowerCase()) ||
        o.beneficiarioCpfCnpj.includes(termoLimpo),
    );

    // 2. Procura em PIX payouts
    const pix = this.pixPayouts.find(
      (p) =>
        p.e2eId.toLowerCase() === termoLimpo.toLowerCase() ||
        p.chavePix.toLowerCase() === termoLimpo.toLowerCase() ||
        p.idempotencyKey === termoLimpo,
    );

    // 3. Procura em remessas
    const lote = this.lotesRemessa.find((l) => l.id.toLowerCase() === termoLimpo.toLowerCase());

    if (!ordem && !pix && !lote) {
      return {
        encontrado: false,
        tipoIdentificado: 'NAO_LOCALIZADO',
        codigo: termoLimpo,
        valorCentavos: 0,
        beneficiario: 'Desconhecido',
        origemOperacao: 'N/A',
        documentoFormal: { assinado: false },
        ordemPagamento: {},
        bancario: {},
        conciliacao: {},
        ledger: { registrado: false },
        timeline: [],
      };
    }

    const valorCentavos = ordem?.valorCentavos || pix?.valorCentavos || lote?.valorTotalCentavos || 0;
    const beneficiario = ordem?.beneficiarioNome || pix?.produtorNome || 'Vários Favorecidos';
    const codigo = ordem?.codigo || pix?.e2eId || lote?.id || termoLimpo;

    const timeline: TimelineItemRastreamento[] = [
      {
        fase: '1. Origem Operacional',
        titulo: 'Operação de Origem Registrada',
        descricao: `Operação de ${ordem?.tipo || 'REPASSE'} registrada pelo Core Financeiro.`,
        dataHora: ordem?.createdAt || pix?.criadoEm || new Date().toISOString(),
        status: 'CONCLUIDO',
      },
      {
        fase: '2. Aprovação SoD (11.32)',
        titulo: 'Aprovação de Alçada Operacional',
        descricao: `Aprovado por alçada formal (${ordem?.aprovadoPor || 'diretor-financeiro'}).`,
        dataHora: new Date(Date.now() - 3600000).toISOString(),
        status: 'CONCLUIDO',
      },
      {
        fase: '3. Documento & Assinatura (11.35)',
        titulo: 'Formalização Documental com Fé Pública',
        descricao: `Documento operacional vinculado (${ordem?.documentoCodigo || 'REP-2026-00012'}) totalmente assinado.`,
        dataHora: new Date(Date.now() - 3000000).toISOString(),
        status: 'CONCLUIDO',
      },
      {
        fase: '4. Tesouraria & Ordem (11.36)',
        titulo: 'Emissão da Ordem de Pagamento',
        descricao: `Ordem ${ordem?.codigo || 'OPG-2026-00081'} em status ${ordem?.status || 'LIQUIDADO'}.`,
        dataHora: new Date(Date.now() - 2000000).toISOString(),
        status: 'CONCLUIDO',
      },
      {
        fase: '5. Liquidação Bancária',
        titulo: 'Liquidação no Sistema Financeiro Nacional',
        descricao: `Efetivado via SPI / BACEN / PIX Direto com autenticação bancária.`,
        dataHora: ordem?.dataLiquidacao || pix?.liquidadoEm || new Date().toISOString(),
        status: ordem?.status === 'LIQUIDADO' || pix?.status === 'LIQUIDADO' ? 'CONCLUIDO' : 'EM_ANDAMENTO',
      },
      {
        fase: '6. Conciliação & Ledger',
        titulo: 'Conciliação em 3 Níveis & Dossiê',
        descricao: 'Escrituração automática no razão contábil e conciliação 1:1 realizada.',
        dataHora: new Date().toISOString(),
        status: 'CONCLUIDO',
      },
    ];

    return {
      encontrado: true,
      tipoIdentificado: ordem?.tipo || 'PIX_PAYOUT',
      codigo,
      valorCentavos,
      beneficiario,
      origemOperacao: ordem?.operacaoOrigem || 'PORTAL_PRODUTOR',
      documentoFormal: {
        codigo: ordem?.documentoCodigo,
        assinado: true,
        status: 'ASSINADO',
      },
      ordemPagamento: {
        codigo: ordem?.codigo,
        status: ordem?.status || 'LIQUIDADO',
        metodo: ordem?.metodo || 'PIX',
      },
      bancario: {
        banco: '341 - Itaú Unibanco',
        endToEndId: ordem?.endToEndId || pix?.e2eId,
        autenticacao: ordem?.autenticacaoBancaria || pix?.comprovanteAutenticacao,
        liquidadoEm: ordem?.dataLiquidacao || pix?.liquidadoEm || undefined,
      },
      conciliacao: {
        status: 'CONCILIADO_AUTOMATICO',
        nivel: 'NIVEL_2_BANCO_LIQUIDACAO',
        conciliadoEm: new Date().toISOString(),
      },
      ledger: {
        registrado: true,
        subconta: 'Subconta Live Nation Brasil',
      },
      timeline,
    };
  }

  // ============================================================================
  //  11.36.10 — Fechamento de Caixa Diário / Mensal
  // ============================================================================

  async executarFechamentoCaixa(
    dto: FechamentoTesourariaDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<any> {
    const itensNaoVerificados = dto.checklist.filter((c) => !c.verificado);
    if (itensNaoVerificados.length > 0 && (!dto.ressalvas || dto.ressalvas.length === 0)) {
      throw new BadRequestException(
        `Fechamento de caixa não pode ser concluído. Há ${itensNaoVerificados.length} itens do checklist não verificados sem as devidas ressalvas justificadas.`,
      );
    }

    const posicao = await this.getPosicaoCaixaSegregada(tenantId);
    const sequencial = Math.floor(1000 + Math.random() * 9000);
    const codigo = `FCH-2026-${sequencial}`;

    const fechamento = {
      id: randomUUID(),
      codigo,
      dataReferencia: dto.dataReferencia,
      tipo: dto.tipo,
      saldoBancarioTotalCentavos: posicao.saldoBancarioRealCentavos,
      saldoConciliadoTotalCentavos: posicao.saldoConciliadoCentavos,
      pendenciasQtd: itensNaoVerificados.length,
      pendenciasJustificadasQtd: dto.ressalvas ? dto.ressalvas.length : 0,
      status: itensNaoVerificados.length > 0 ? 'FECHADO_COM_RESSALVAS' : 'FECHADO',
      fechadoPor: dto.fechadoPor,
      checklist: dto.checklist,
      ressalvas: dto.ressalvas,
      createdAt: new Date().toISOString(),
    };

    this.fechamentos.unshift(fechamento);

    await this.emitirEvento(
      FechamentoTesourariaConcluidoV1.name,
      {
        fechamentoId: fechamento.id,
        codigo: fechamento.codigo,
        tipo: fechamento.tipo,
        dataReferencia: fechamento.dataReferencia,
        saldoBancarioTotalCentavos: fechamento.saldoBancarioTotalCentavos,
        saldoConciliadoTotalCentavos: fechamento.saldoConciliadoTotalCentavos,
        pendenciasQtd: fechamento.pendenciasQtd,
        pendenciasJustificadasQtd: fechamento.pendenciasJustificadasQtd,
        fechadoPor: fechamento.fechadoPor,
        fechadoEm: fechamento.createdAt,
      },
      tenantId,
    );

    return fechamento;
  }

  // ============================================================================
  //  11.36.11 — Beneficiários & Quarentena Bancária de 24h
  // ============================================================================

  async cadastrarBeneficiario(
    dto: CadastrarBeneficiarioDto,
    tenantId: string = DEFAULT_TENANT_ID,
  ): Promise<any> {
    const quarentenaHoras = 24;
    const quarentenaAte = new Date(Date.now() + quarentenaHoras * 3600000).toISOString();

    const novo = {
      id: randomUUID(),
      produtorId: dto.produtorId,
      nome: dto.nome,
      cpfCnpj: dto.cpfCnpj,
      tipoChavePix: dto.tipoChavePix,
      chavePix: dto.chavePix,
      banco: dto.banco,
      agencia: dto.agencia,
      conta: dto.conta,
      digito: dto.digito,
      tipoConta: dto.tipoConta || 'CORRENTE',
      status: 'EM_QUARENTENA',
      quarentenaAte,
      aprovadoPor: dto.aprovadoPor,
      justificativaAlteracao: dto.justificativa,
      createdAt: new Date().toISOString(),
    };

    this.beneficiarios.unshift(novo);
    this.logger.log(`[Tesouraria] Beneficiário ${novo.nome} cadastrado com quarentena de segurança até ${novo.quarentenaAte}`);
    return novo;
  }

  async listarBeneficiarios(tenantId: string = DEFAULT_TENANT_ID): Promise<any[]> {
    return this.beneficiarios;
  }

  // ============================================================================
  //  MÉTODOS LEGADOS MANTIDOS 100% PARA RETROCOMPATIBILIDADE (EDDIE 11.25)
  // ============================================================================

  async getPosicaoConsolidada(): Promise<PosicaoConsolidadaTesouraria> {
    const totalSaldoBancarioRealCentavos = this.contas.reduce((acc, c) => acc + c.saldoReal, 0);
    const totalSaldoDisponivelCentavos = this.contas.reduce((acc, c) => acc + c.saldoDisponivel, 0);
    const totalSaldoBloqueadoCentavos = this.contas.reduce((acc, c) => acc + c.saldoBloqueado, 0);
    const totalEmLiquidacaoCentavos = this.contas.reduce((acc, c) => acc + c.saldoEmLiquidacao, 0);

    const contaAplicacao = this.contas.find((c) => c.tipo === 'APLICACAO');
    const totalAplicacoesLiquidezDiariaCentavos = contaAplicacao ? contaAplicacao.saldoReal : 0;

    const repassesItens = this.lotesRemessa
      .flatMap((l) => l.itens)
      .filter((i) => i.status === 'PENDENTE');
    const totalRepassesPendentesCentavos = repassesItens.reduce((acc, i) => acc + i.valorCentavos, 0);

    const indiceCoberturaImediata =
      totalRepassesPendentesCentavos > 0
        ? Number((totalSaldoDisponivelCentavos / totalRepassesPendentesCentavos).toFixed(2))
        : 99.99;

    return {
      totalSaldoBancarioRealCentavos,
      totalSaldoDisponivelCentavos,
      totalSaldoBloqueadoCentavos,
      totalEmLiquidacaoCentavos,
      totalAplicacoesLiquidezDiariaCentavos,
      totalRepassesPendentesCentavos,
      indiceCoberturaImediata,
      dataHora: new Date().toISOString(),
      contas: this.contas,
    };
  }

  async listarContas(): Promise<ContaBancaria[]> {
    return this.contas;
  }

  async listarLotesCnab(): Promise<LoteRemessaCnab[]> {
    return this.lotesRemessa;
  }

  async obterLotePorId(id: string): Promise<LoteRemessaCnab> {
    const lote = this.lotesRemessa.find((l) => l.id === id);
    if (!lote) throw new NotFoundException(`Lote CNAB ${id} não localizado.`);
    return lote;
  }

  async gerarRemessaCnab(dados: GerarRemessaDto): Promise<LoteRemessaCnab> {
    if (!dados.itens || dados.itens.length === 0) {
      throw new BadRequestException('A remessa bancária precisa conter ao menos um item de pagamento.');
    }

    const contaOrigem = this.contas.find((c) => c.bancoCodigo === dados.bancoCodigo);
    if (!contaOrigem) {
      throw new BadRequestException(`Nenhuma conta corrente configurada para o banco ${dados.bancoCodigo}.`);
    }

    this.sequencialLote += 1;
    const loteId = `rem-${dados.bancoCodigo}-${this.sequencialLote}`;
    const valorTotalCentavos = dados.itens.reduce((acc, item) => acc + item.valorCentavos, 0);

    const itensRemessa: ItemRemessaCnab[] = dados.itens.map((item, idx) => ({
      id: `item-${loteId}-${idx + 1}`,
      favorecidoNome: item.favorecidoNome,
      favorecidoCpfCnpj: item.favorecidoCpfCnpj,
      bancoDestino: item.bancoDestino,
      agenciaDestino: item.agenciaDestino,
      contaDestino: item.contaDestino,
      chavePix: item.chavePix || null,
      tipoChavePix: item.tipoChavePix || null,
      valorCentavos: item.valorCentavos,
      referenciaEventoId: item.referenciaEventoId,
      produtorId: item.produtorId,
      status: 'PENDENTE',
      codigoOcorrenciaRetorno: null,
      mensagemRetorno: null,
      liquidadoEm: null,
    }));

    const mockConteudo = `CNAB-FILE-RAW-${loteId}-${Date.now()}`;
    const sha256Hash = createHash('sha256').update(mockConteudo).digest('hex');

    const novoLote: LoteRemessaCnab = {
      id: loteId,
      bancoCodigo: dados.bancoCodigo,
      layout: dados.layout,
      sequencialArquivo: this.sequencialLote,
      totalItens: itensRemessa.length,
      valorTotalCentavos,
      status: 'GERADA',
      sha256Hash,
      conteudoArquivoMock: mockConteudo,
      itens: itensRemessa,
      criadoPor: dados.criadoPor,
      criadoEm: new Date().toISOString(),
      processadoEm: null,
    };

    this.lotesRemessa.push(novoLote);
    return novoLote;
  }

  async processarArquivoRetornoCnab(dados: ProcessarRetornoDto): Promise<LoteRemessaCnab> {
    const lote = this.lotesRemessa.find((l) => l.id === dados.loteRemessaId);
    if (!lote) {
      throw new NotFoundException(`Lote de remessa ${dados.loteRemessaId} não localizado para conciliação.`);
    }

    let liquidados = 0;
    let rejeitados = 0;
    let valorLiquidado = 0;

    for (const item of lote.itens) {
      if (item.agenciaDestino === '9999') {
        item.status = 'REJEITADO';
        item.codigoOcorrenciaRetorno = '03';
        item.mensagemRetorno = 'Agência / Conta Destinatária Inválida';
        rejeitados += 1;
      } else {
        item.status = 'LIQUIDADO';
        item.codigoOcorrenciaRetorno = '00';
        item.mensagemRetorno = 'Crédito Efetivado';
        item.liquidadoEm = new Date().toISOString();
        liquidados += 1;
        valorLiquidado += item.valorCentavos;
      }
    }

    if (rejeitados > 0 && liquidados > 0) {
      lote.status = 'PROCESSADA_PARCIAL';
    } else if (rejeitados > 0 && liquidados === 0) {
      lote.status = 'REJEITADA';
    } else {
      lote.status = 'PROCESSADA_TOTAL';
    }
    lote.processadoEm = new Date().toISOString();

    const conta = this.contas.find((c) => c.bancoCodigo === dados.bancoCodigo);
    if (conta) {
      conta.saldoReal -= valorLiquidado;
      conta.saldoDisponivel -= valorLiquidado;
      conta.saldoConciliado -= valorLiquidado;
      conta.ultimaSincronizacao = new Date().toISOString();
    }

    return lote;
  }

  async listarPixPayouts(): Promise<PixPayout[]> {
    return this.pixPayouts;
  }

  async executarPixPayout(dados: ExecutarPixDto): Promise<PixPayout> {
    const existente = this.pixPayouts.find((p) => p.idempotencyKey === dados.idempotencyKey);
    if (existente) {
      this.logger.log(`[Tesouraria] PIX Payout duplicado ignorado por idempotência: ${dados.idempotencyKey}`);
      return existente;
    }

    const contaOrigem = this.contas.find((c) => c.tipo === 'CORRENTE' && c.status === 'ATIVA');
    if (!contaOrigem) {
      throw new BadRequestException('Nenhuma conta corrente ativa disponível para débito PIX.');
    }

    if (contaOrigem.saldoDisponivel < dados.valorCentavos) {
      throw new BadRequestException(
        `Saldo insuficiente em conta (${(contaOrigem.saldoDisponivel / 100).toFixed(2)}) para liquidar PIX de ${(dados.valorCentavos / 100).toFixed(2)}`,
      );
    }

    contaOrigem.saldoDisponivel -= dados.valorCentavos;
    contaOrigem.saldoReal -= dados.valorCentavos;
    contaOrigem.saldoConciliado -= dados.valorCentavos;
    contaOrigem.ultimaSincronizacao = new Date().toISOString();

    const e2eId = `E34100000${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    const payout: PixPayout = {
      id: `pix-payout-${Date.now()}`,
      e2eId,
      produtorId: dados.produtorId,
      produtorNome: dados.produtorNome,
      eventoId: dados.eventoId,
      eventoNome: dados.eventoNome,
      valorCentavos: dados.valorCentavos,
      chavePix: dados.chavePix,
      tipoChave: dados.tipoChave,
      status: 'LIQUIDADO',
      idempotencyKey: dados.idempotencyKey,
      tarifaPixCentavos: 0,
      comprovanteAutenticacao: `AUTH-BACEN-${randomUUID().toUpperCase()}`,
      criadoEm: new Date().toISOString(),
      liquidadoEm: new Date().toISOString(),
    };

    this.pixPayouts.unshift(payout);
    return payout;
  }
}
