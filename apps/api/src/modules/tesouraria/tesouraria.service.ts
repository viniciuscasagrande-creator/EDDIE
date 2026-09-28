import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma.module';
import {
  ContaBancaria,
  LoteRemessaCnab,
  ItemRemessaCnab,
  PixPayout,
  PosicaoConsolidadaTesouraria,
  GerarRemessaDto,
  ProcessarRetornoDto,
  ExecutarPixDto,
} from './tesouraria.types';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_CONTAS_SEED = [
  {
    id: '00000000-0000-0000-0000-000000000341',
    bancoCodigo: '341' as const,
    bancoNome: 'Itaú Unibanco S.A.',
    agencia: '0450',
    conta: '88410',
    digito: '3',
    tipo: 'CORRENTE' as const,
    titular: 'DiskIngressos Entretenimento S.A.',
    cnpj: '08.123.456/0001-78',
    saldoReal: 545000000, // R$ 5.450.000,00
    saldoConciliado: 545000000,
    saldoBloqueado: 45000000, // R$ 450.000,00 (Reserva de Chargeback)
    saldoDisponivel: 500000000, // R$ 5.000.000,00
    saldoEmLiquidacao: 65000000, // R$ 650.000,00
    ultimaSincronizacao: new Date().toISOString(),
    status: 'ATIVA' as const,
  },
  {
    id: '00000000-0000-0000-0000-000000000237',
    bancoCodigo: '237' as const,
    bancoNome: 'Banco Bradesco S.A.',
    agencia: '1205',
    conta: '45020',
    digito: '1',
    tipo: 'CORRENTE' as const,
    titular: 'DiskIngressos Entretenimento S.A.',
    cnpj: '08.123.456/0001-78',
    saldoReal: 280000000, // R$ 2.800.000,00
    saldoConciliado: 280000000,
    saldoBloqueado: 0,
    saldoDisponivel: 280000000,
    saldoEmLiquidacao: 25000000,
    ultimaSincronizacao: new Date().toISOString(),
    status: 'ATIVA' as const,
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    bancoCodigo: '001' as const,
    bancoNome: 'Banco do Brasil S.A.',
    agencia: '0018',
    conta: '99200',
    digito: '8',
    tipo: 'APLICACAO' as const,
    titular: 'DiskIngressos Entretenimento S.A.',
    cnpj: '08.123.456/0001-78',
    saldoReal: 1000000000, // R$ 10.000.000,00 (CDB Liquidez Diária)
    saldoConciliado: 1000000000,
    saldoBloqueado: 0,
    saldoDisponivel: 1000000000,
    saldoEmLiquidacao: 0,
    ultimaSincronizacao: new Date().toISOString(),
    status: 'ATIVA' as const,
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

  constructor(@Optional() private readonly prisma?: PrismaService) {
    this.seedMockData();
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
        contaDestino: '11223-4',
        chavePix: 'financeiro@livenation.com.br',
        tipoChavePix: 'EMAIL',
        valorCentavos: 125000000, // R$ 1.250.000,00
        referenciaEventoId: 'ev-fest-2026',
        produtorId: 'prod-live-nation',
        status: 'LIQUIDADO',
        codigoOcorrenciaRetorno: '00',
        mensagemRetorno: 'Crédito Efetivado com Sucesso',
        liquidadoEm: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'item-rem-2',
        favorecidoNome: 'Opus Entretenimento e Eventos S.A.',
        favorecidoCpfCnpj: '98.765.432/0001-10',
        bancoDestino: '237',
        agenciaDestino: '0100',
        contaDestino: '99881-2',
        chavePix: '98765432000110',
        tipoChavePix: 'CNPJ',
        valorCentavos: 45000000, // R$ 450.000,00
        referenciaEventoId: 'ev-rock-2026',
        produtorId: 'prod-opus',
        status: 'LIQUIDADO',
        codigoOcorrenciaRetorno: '00',
        mensagemRetorno: 'Crédito Efetivado com Sucesso',
        liquidadoEm: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const hash = createHash('sha256').update(JSON.stringify(itens)).digest('hex');

    this.lotesRemessa.push({
      id: loteId,
      bancoCodigo: '341',
      layout: 'CNAB_240',
      sequencialArquivo: 1001,
      totalItens: itens.length,
      valorTotalCentavos: 170000000,
      status: 'PROCESSADA_TOTAL',
      sha256Hash: hash,
      conteudoArquivoMock: `000000001REMESSA...`,
      itens,
      criadoPor: 'sistema-liquidacao',
      criadoEm: new Date(Date.now() - 3600000 * 4).toISOString(),
      processadoEm: new Date(Date.now() - 3600000).toISOString(),
    });

    this.pixPayouts.push({
      id: 'pix-pay-1',
      e2eId: 'E3410000020260928120001882947118',
      produtorId: 'prod-live-nation',
      produtorNome: 'Live Nation Brasil',
      eventoId: 'ev-fest-2026',
      eventoNome: 'Festival DiskIngressos Live 2026',
      valorCentavos: 8500000, // R$ 85.000,00
      chavePix: 'financeiro@livenation.com.br',
      tipoChave: 'EMAIL',
      status: 'LIQUIDADO',
      idempotencyKey: 'idemp-pix-live-nation-85k',
      tarifaPixCentavos: 0,
      comprovanteAutenticacao: 'AUTH-SPI-9941829-BACEN-OK',
      criadoEm: new Date(Date.now() - 1800000).toISOString(),
      liquidadoEm: new Date(Date.now() - 1795000).toISOString(),
    });
  }

  private async syncPrismaContasIfEmpty(): Promise<void> {
    if (!this.prisma) return;
    try {
      const count = await this.prisma.contaBancaria.count();
      if (count === 0) {
        for (const c of DEFAULT_CONTAS_SEED) {
          await this.prisma.contaBancaria.create({
            data: {
              id: c.id,
              tenantId: DEFAULT_TENANT_ID,
              bancoCodigo: c.bancoCodigo,
              bancoNome: c.bancoNome,
              agencia: c.agencia,
              conta: c.conta,
              digito: c.digito,
              tipo: c.tipo,
              titular: c.titular,
              cnpj: c.cnpj,
              saldoRealCents: BigInt(c.saldoReal),
              saldoConciliadoCents: BigInt(c.saldoConciliado),
              saldoBloqueadoCents: BigInt(c.saldoBloqueado),
              saldoDisponivelCents: BigInt(c.saldoDisponivel),
              saldoEmLiquidacaoCents: BigInt(c.saldoEmLiquidacao),
              status: c.status,
            },
          });
        }
      }
    } catch (err) {
      this.logger.debug(`[Tesouraria] Sincronização inicial do banco não executada: ${err}`);
    }
  }

  async getPosicaoConsolidada(): Promise<PosicaoConsolidadaTesouraria> {
    await this.syncPrismaContasIfEmpty();
    const contas = await this.listarContas();

    const totalSaldoBancarioRealCentavos = contas.reduce((acc, c) => acc + c.saldoReal, 0);
    const totalSaldoDisponivelCentavos = contas.reduce((acc, c) => acc + c.saldoDisponivel, 0);
    const totalSaldoBloqueadoCentavos = contas.reduce((acc, c) => acc + c.saldoBloqueado, 0);
    const totalEmLiquidacaoCentavos = contas.reduce((acc, c) => acc + c.saldoEmLiquidacao, 0);
    const totalAplicacoesLiquidezDiariaCentavos = contas
      .filter((c) => c.tipo === 'APLICACAO')
      .reduce((acc, c) => acc + c.saldoReal, 0);

    const totalRepassesPendentesCentavos = this.lotesRemessa
      .filter((l) => l.status === 'GERADA' || l.status === 'ENVIADA')
      .reduce((acc, l) => acc + l.valorTotalCentavos, 0);

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
      contas,
    };
  }

  async listarContas(): Promise<ContaBancaria[]> {
    if (this.prisma) {
      try {
        const dbContas = await this.prisma.contaBancaria.findMany({
          orderBy: { bancoCodigo: 'asc' },
        });
        if (dbContas.length > 0) {
          this.contas = dbContas.map((c) => ({
            id: c.id,
            bancoCodigo: c.bancoCodigo as any,
            bancoNome: c.bancoNome,
            agencia: c.agencia,
            conta: c.conta,
            digito: c.digito,
            tipo: c.tipo as any,
            titular: c.titular,
            cnpj: c.cnpj,
            saldoReal: Number(c.saldoRealCents),
            saldoConciliado: Number(c.saldoConciliadoCents),
            saldoBloqueado: Number(c.saldoBloqueadoCents),
            saldoDisponivel: Number(c.saldoDisponivelCents),
            saldoEmLiquidacao: Number(c.saldoEmLiquidacaoCents),
            ultimaSincronizacao: c.ultimaSincronizacao.toISOString(),
            status: c.status as any,
          }));
        }
      } catch (err) {
        this.logger.debug(`[Tesouraria] Leitura do banco offline, usando cache local: ${err}`);
      }
    }
    return this.contas;
  }

  async gerarRemessaCnab(dados: GerarRemessaDto): Promise<LoteRemessaCnab> {
    if (!dados.itens || dados.itens.length === 0) {
      throw new BadRequestException('A remessa CNAB requer ao menos um item de pagamento.');
    }

    const sequencial = this.sequencialLote++;
    const loteId = `rem-${dados.bancoCodigo}-${sequencial}`;

    const itens: ItemRemessaCnab[] = dados.itens.map((item, idx) => ({
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

    const valorTotalCentavos = itens.reduce((acc, it) => acc + it.valorCentavos, 0);
    const hashPayload = JSON.stringify({ loteId, sequencial, valorTotalCentavos, itens });
    const sha256Hash = createHash('sha256').update(hashPayload).digest('hex');

    const lote: LoteRemessaCnab = {
      id: loteId,
      bancoCodigo: dados.bancoCodigo,
      layout: dados.layout,
      sequencialArquivo: sequencial,
      totalItens: itens.length,
      valorTotalCentavos,
      status: 'GERADA',
      sha256Hash,
      conteudoArquivoMock: `HEADER_ARQUIVO_${dados.layout}_BANCO_${dados.bancoCodigo}_NSR_${sequencial}\n${itens.map((i) => `SEG_A_${i.id}_${i.valorCentavos}`).join('\n')}\nTRAILLER_ARQUIVO`,
      itens,
      criadoPor: dados.criadoPor,
      criadoEm: new Date().toISOString(),
      processadoEm: null,
    };

    this.lotesRemessa.unshift(lote);

    if (this.prisma) {
      try {
        const conta = await this.prisma.contaBancaria.findFirst({
          where: { bancoCodigo: dados.bancoCodigo },
        });
        if (conta) {
          await this.prisma.loteRemessaCnab.create({
            data: {
              tenantId: conta.tenantId,
              contaBancariaId: conta.id,
              codigoLote: lote.id,
              layout: lote.layout,
              tipo: 'PAGAMENTO_FORNECEDORES',
              quantidadeItens: lote.totalItens,
              valorTotalCents: BigInt(lote.valorTotalCentavos),
              status: lote.status,
              arquivoHash: lote.sha256Hash,
              geradoPor: lote.criadoPor,
              itens: {
                create: itens.map((it) => ({
                  favorecidoNome: it.favorecidoNome,
                  favorecidoCpfCnpj: it.favorecidoCpfCnpj,
                  bancoDestino: it.bancoDestino,
                  agenciaDestino: it.agenciaDestino,
                  contaDestino: it.contaDestino,
                  metodo: it.chavePix ? 'PIX' : 'TED',
                  chavePix: it.chavePix,
                  valorCents: BigInt(it.valorCentavos),
                  finalidade: 'REPASSE_EVENTO',
                  eventoIdRef: it.referenciaEventoId,
                  produtorIdRef: it.produtorId,
                  status: it.status,
                })),
              },
            },
          });
        }
      } catch (err) {
        this.logger.debug(`[Tesouraria] Persistência do lote CNAB offline: ${err}`);
      }
    }

    this.logger.log(`[Tesouraria] Remessa CNAB ${lote.id} gerada com ${lote.totalItens} itens (R$ ${(valorTotalCentavos / 100).toFixed(2)})`);
    return lote;
  }

  async processarArquivoRetornoCnab(dados: ProcessarRetornoDto): Promise<LoteRemessaCnab> {
    const lote = this.lotesRemessa.find((l) => l.id === dados.loteRemessaId);
    if (!lote) {
      throw new NotFoundException(`Lote de remessa ${dados.loteRemessaId} não localizado.`);
    }

    let liquidados = 0;
    let rejeitados = 0;

    lote.itens.forEach((item) => {
      // Simulação estrita de leitura de retorno: rejeita se agência for 9999
      if (item.agenciaDestino === '9999') {
        item.status = 'REJEITADO';
        item.codigoOcorrenciaRetorno = '03';
        item.mensagemRetorno = 'Agência ou Conta de Destino Inválida';
        rejeitados++;
      } else {
        item.status = 'LIQUIDADO';
        item.codigoOcorrenciaRetorno = '00';
        item.mensagemRetorno = 'Crédito Liquidado em Conta';
        item.liquidadoEm = new Date().toISOString();
        liquidados++;
      }
    });

    lote.status = rejeitados === 0 ? 'PROCESSADA_TOTAL' : 'PROCESSADA_PARCIAL';
    lote.processadoEm = new Date().toISOString();

    // Debita o saldo real da conta do banco correspondente
    const valorLiquidado = lote.itens
      .filter((i) => i.status === 'LIQUIDADO')
      .reduce((acc, i) => acc + i.valorCentavos, 0);

    const conta = this.contas.find((c) => c.bancoCodigo === lote.bancoCodigo);
    if (conta) {
      conta.saldoReal -= valorLiquidado;
      conta.saldoDisponivel -= valorLiquidado;
      conta.saldoConciliado -= valorLiquidado;
      conta.ultimaSincronizacao = new Date().toISOString();
    }

    if (this.prisma) {
      try {
        const dbConta = await this.prisma.contaBancaria.findFirst({
          where: { bancoCodigo: lote.bancoCodigo },
        });
        if (dbConta) {
          const novoReal = dbConta.saldoRealCents - BigInt(valorLiquidado);
          const novoDisp = dbConta.saldoDisponivelCents - BigInt(valorLiquidado);
          const novoConc = dbConta.saldoConciliadoCents - BigInt(valorLiquidado);

          await this.prisma.contaBancaria.update({
            where: { id: dbConta.id },
            data: {
              saldoRealCents: novoReal,
              saldoDisponivelCents: novoDisp,
              saldoConciliadoCents: novoConc,
              ultimaSincronizacao: new Date(),
            },
          });

          await this.prisma.retornoCnabProcessado.create({
            data: {
              tenantId: dbConta.tenantId,
              nomeArquivo: `RET_${lote.id}_${Date.now()}.ret`,
              bancoCodigo: lote.bancoCodigo,
              layout: lote.layout,
              totalLinhas: dados.linhasRetorno?.length || lote.totalItens,
              totalSucessos: liquidados,
              totalFalhas: rejeitados,
              valorLiquidadoCents: BigInt(valorLiquidado),
              arquivoHash: createHash('sha256').update(JSON.stringify(dados)).digest('hex'),
              processadoPor: dados.processadoPor,
            },
          });
        }
      } catch (err) {
        this.logger.debug(`[Tesouraria] Atualização do retorno no banco offline: ${err}`);
      }
    }

    this.logger.log(
      `[Tesouraria] Retorno CNAB processado para lote ${lote.id}: ${liquidados} liquidados, ${rejeitados} rejeitados. Total: R$ ${(valorLiquidado / 100).toFixed(2)}`,
    );

    return lote;
  }

  async executarPixPayout(dados: ExecutarPixDto): Promise<PixPayout> {
    // Idempotência estrita
    const existing = this.pixPayouts.find((p) => p.idempotencyKey === dados.idempotencyKey);
    if (existing) {
      this.logger.warn(`[Tesouraria] IdempotencyKey ${dados.idempotencyKey} já processada. Retornando payout existente.`);
      return existing;
    }

    const contaOrigem = this.contas.find((c) => c.tipo === 'CORRENTE');
    if (!contaOrigem || contaOrigem.saldoDisponivel < dados.valorCentavos) {
      throw new BadRequestException('Saldo disponível insuficiente para liquidar repasse PIX.');
    }

    const e2eId = `E34100000${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}${Math.floor(100000 + Math.random() * 900000)}`;

    const payout: PixPayout = {
      id: `pix-pay-${randomUUID().slice(0, 8)}`,
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

    contaOrigem.saldoReal -= dados.valorCentavos;
    contaOrigem.saldoDisponivel -= dados.valorCentavos;
    contaOrigem.saldoConciliado -= dados.valorCentavos;
    contaOrigem.ultimaSincronizacao = new Date().toISOString();

    this.pixPayouts.unshift(payout);

    if (this.prisma) {
      try {
        const dbContaOrigem = await this.prisma.contaBancaria.findFirst({
          where: { tipo: 'CORRENTE' },
        });
        if (dbContaOrigem) {
          const novoReal = dbContaOrigem.saldoRealCents - BigInt(dados.valorCentavos);
          const novoDisp = dbContaOrigem.saldoDisponivelCents - BigInt(dados.valorCentavos);
          const novoConc = dbContaOrigem.saldoConciliadoCents - BigInt(dados.valorCentavos);

          await this.prisma.contaBancaria.update({
            where: { id: dbContaOrigem.id },
            data: {
              saldoRealCents: novoReal,
              saldoDisponivelCents: novoDisp,
              saldoConciliadoCents: novoConc,
              ultimaSincronizacao: new Date(),
            },
          });

          await this.prisma.pixPayoutExecutado.create({
            data: {
              tenantId: dbContaOrigem.tenantId,
              contaBancariaId: dbContaOrigem.id,
              favorecidoNome: dados.produtorNome,
              chavePix: dados.chavePix,
              tipoChave: dados.tipoChave,
              valorCents: BigInt(dados.valorCentavos),
              endToEndId: payout.e2eId,
              idempotencyKey: dados.idempotencyKey,
              solicitadoPor: dados.executadoPor,
              status: 'SUCESSO',
              detalhes: {
                produtorId: dados.produtorId,
                eventoId: dados.eventoId,
                eventoNome: dados.eventoNome,
              },
            },
          });
        }
      } catch (err) {
        this.logger.debug(`[Tesouraria] Persistência PIX Payout offline: ${err}`);
      }
    }

    this.logger.log(`[Tesouraria] PIX Payout ${payout.id} liquidado com sucesso para ${payout.produtorNome} (R$ ${(payout.valorCentavos / 100).toFixed(2)})`);
    return payout;
  }

  async listarLotesCnab(): Promise<LoteRemessaCnab[]> {
    return this.lotesRemessa;
  }

  async obterLotePorId(id: string): Promise<LoteRemessaCnab> {
    const lote = this.lotesRemessa.find((l) => l.id === id);
    if (!lote) throw new NotFoundException(`Lote CNAB ${id} não localizado.`);
    return lote;
  }

  async listarPixPayouts(): Promise<PixPayout[]> {
    return this.pixPayouts;
  }
}
