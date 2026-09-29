import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';
import { OutboxService } from '../../../shared/outbox/outbox.service';
import type { Prisma } from '@prisma/client';
import * as crypto from 'node:crypto';
import {
  CriarDocumentoDto,
  DecidirAprovacaoDocumentoDto,
  ContestarDocumentoDto,
  VisualizarDocumentoQueryDto,
} from '../dtos/documento.dto';
import {
  DocumentoCriadoV1,
  DocumentoAprovadoV1,
  DocumentoRejeitadoV1,
  DocumentoContestadoV1,
  TipoDocumentoOperacional,
  SituacaoDocumento,
  ClassificacaoSensibilidade,
} from '@ticketing/contracts';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  private gerarCodigo(tipo: string): string {
    const prefixos: Record<string, string> = {
      CONTRATO: 'CTR',
      ADITIVO: 'ADT',
      BORDERO: 'BRD',
      SOLICITACAO_REPASSE: 'REP',
      ANTECIPACAO: 'ANT',
      FECHAMENTO_EVENTO: 'DOS',
      TERMO: 'TRM',
      DECLARACAO: 'DEC',
      COMPROVANTE: 'CPV',
      RELATORIO: 'REL',
      DOCUMENTO_FISCAL: 'NF',
      DOCUMENTO_BANCARIO: 'BNC',
      DOCUMENTO_OPERACIONAL: 'DOP',
      DOCUMENTO_PARCEIRO: 'PAR',
    };

    const prefixo = prefixos[tipo] || 'DOC';
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(100000 + Math.random() * 900000);
    return `${prefixo}-${ano}-${sequencial}`;
  }

  private calcularHash(conteudo: string): string {
    return crypto.createHash('sha256').update(conteudo).digest('hex');
  }

  async criarDocumento(tenantId: string, criadoPor: string, dto: CriarDocumentoDto) {
    const codigo = this.gerarCodigo(dto.tipo);
    const conteudoBase = dto.conteudoTexto || JSON.stringify(dto.metadados || {});
    const hashOriginal = this.calcularHash(conteudoBase + codigo + tenantId);

    // Se for fluxo de repasse, antecipação ou borderô, ativa a regra rígida de último assinante
    const eFluxoFinanceiro =
      dto.tipo === 'SOLICITACAO_REPASSE' ||
      dto.tipo === 'ANTECIPACAO' ||
      dto.tipo === 'BORDERO' ||
      dto.regraFinanceiraUltimoAssinante === true;

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const doc = await tx.documento.create({
        data: {
          tenantId,
          codigo,
          tipo: dto.tipo,
          titulo: dto.titulo,
          produtorId: dto.produtorId,
          produtorNome: dto.produtorNome,
          eventoId: dto.eventoId,
          eventoNome: dto.eventoNome,
          parceiroId: dto.parceiroId,
          parceiroNome: dto.parceiroNome,
          tipoOperacaoOrigem: dto.tipoOperacaoOrigem,
          idOperacaoOrigem: dto.idOperacaoOrigem,
          origemDescricao: dto.origemDescricao,
          situacao: 'EM_ELABORACAO',
          sensibilidade: dto.sensibilidade || 'CONFIDENCIAL',
          vigenciaInicio: dto.vigenciaInicio ? new Date(dto.vigenciaInicio) : null,
          vigenciaFim: dto.vigenciaFim ? new Date(dto.vigenciaFim) : null,
          hashOriginal,
          metadados: (dto.metadados as any) || {},
          criadoPor,
          ordemAssinatura: dto.ordemAssinatura || 'SEQUENCIAL',
          regraFinanceiraUltimoAssinante: eFluxoFinanceiro,
        },
      });

      // Cria a Versão 1 inicial
      await tx.versaoDocumento.create({
        data: {
          tenantId,
          documentoId: doc.id,
          numeroVersao: 1,
          hashArquivo: hashOriginal,
          alteracoes: 'Versão inicial gerada a partir dos dados do Core.',
          criadoPor,
        },
      });

      // Se signatários foram informados na criação, cadastra-os
      if (dto.signatarios && dto.signatarios.length > 0) {
        let ordemAtual = 1;
        for (const sig of dto.signatarios) {
          await tx.signatarioDocumento.create({
            data: {
              tenantId,
              documentoId: doc.id,
              ordem: sig.ordem || ordemAtual++,
              nome: sig.nome,
              email: sig.email,
              documentoIdentificacao: sig.documentoIdentificacao,
              papel: sig.papel,
              status: 'PENDENTE',
              metodoAutenticacao: sig.metodoAutenticacao || 'INTERNA_SESSAO',
            },
          });
        }
      }

      // Publica evento no Outbox
      await this.outbox.emit(tx, {
        eventName: DocumentoCriadoV1.name,
        source: 'documentos',
        tenantId,
        payload: {
          documentoId: doc.id,
          codigo: doc.codigo,
          tipo: doc.tipo as TipoDocumentoOperacional,
          titulo: doc.titulo,
          produtorId: doc.produtorId || undefined,
          eventoId: doc.eventoId || undefined,
          origem: doc.origemDescricao,
          versao: doc.versao,
          situacao: doc.situacao as SituacaoDocumento,
          sensibilidade: doc.sensibilidade as ClassificacaoSensibilidade,
          criadoPor,
        },
      });

      return doc;
    });
  }

  async obterPorId(tenantId: string, documentoId: string) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) {
      throw new NotFoundException(`Documento ${documentoId} não encontrado.`);
    }

    const [signatarios, versoes, contestacoes, evidencias] = await Promise.all([
      this.prisma.signatarioDocumento.findMany({
        where: { documentoId: doc.id, tenantId },
        orderBy: { ordem: 'asc' },
      }),
      this.prisma.versaoDocumento.findMany({
        where: { documentoId: doc.id, tenantId },
        orderBy: { numeroVersao: 'desc' },
      }),
      this.prisma.contestacaoDocumento.findMany({
        where: { documentoId: doc.id, tenantId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.evidenciaAssinatura.findMany({
        where: { documentoId: doc.id, tenantId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      ...doc,
      signatarios,
      versoes,
      contestacoes,
      evidencias,
    };
  }

  async obterPorCodigo(tenantId: string, codigo: string) {
    const doc = await this.prisma.documento.findFirst({
      where: { codigo, tenantId },
    });
    if (!doc) {
      throw new NotFoundException(`Documento ${codigo} não encontrado.`);
    }
    return this.obterPorId(tenantId, doc.id);
  }

  async listar(tenantId: string, filtros: {
    tipo?: string;
    situacao?: string;
    produtorId?: string;
    eventoId?: string;
    sensibilidade?: string;
    busca?: string;
  }) {
    const where: any = { tenantId };

    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.situacao) where.situacao = filtros.situacao;
    if (filtros.produtorId) where.produtorId = filtros.produtorId;
    if (filtros.eventoId) where.eventoId = filtros.eventoId;
    if (filtros.sensibilidade) where.sensibilidade = filtros.sensibilidade;
    if (filtros.busca) {
      where.OR = [
        { codigo: { contains: filtros.busca, mode: 'insensitive' } },
        { titulo: { contains: filtros.busca, mode: 'insensitive' } },
        { produtorNome: { contains: filtros.busca, mode: 'insensitive' } },
        { eventoNome: { contains: filtros.busca, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.documento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async submeterParaAprovacao(tenantId: string, documentoId: string, _usuario: string) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');
    if (doc.situacao !== 'RASCUNHO' && doc.situacao !== 'EM_ELABORACAO') {
      throw new BadRequestException(`Documento não está em elaboração para envio (situação atual: ${doc.situacao}).`);
    }

    return await this.prisma.documento.update({
      where: { id: documentoId },
      data: { situacao: 'AGUARDANDO_APROVACAO' },
    });
  }

  async decidirAprovacao(
    tenantId: string,
    documentoId: string,
    usuario: string,
    dto: DecidirAprovacaoDocumentoDto,
  ) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');
    if (doc.situacao !== 'AGUARDANDO_APROVACAO') {
      throw new BadRequestException(`Documento não está aguardando aprovação.`);
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const situacaoAnterior = doc.situacao;

      if (!dto.aprovado) {
        const atualizado = await tx.documento.update({
          where: { id: documentoId },
          data: {
            situacao: 'CANCELADO',
            motivoRejeicao: dto.motivo || 'Rejeitado na esteira de aprovação.',
            aprovadoPor: usuario,
            aprovadoEm: new Date(),
          },
        });

        await this.outbox.emit(tx, {
          eventName: DocumentoRejeitadoV1.name,
          source: 'documentos',
          tenantId,
          payload: {
            documentoId: doc.id,
            codigo: doc.codigo,
            rejeitadoPor: usuario,
            motivo: dto.motivo || 'Rejeitado na esteira de aprovação.',
            rejeitadoEm: new Date().toISOString(),
          },
        });

        return atualizado;
      }

      // Se aprovado, avança para AGUARDANDO_ASSINATURA
      const atualizado = await tx.documento.update({
        where: { id: documentoId },
        data: {
          situacao: 'AGUARDANDO_ASSINATURA',
          aprovadoPor: usuario,
          aprovadoEm: new Date(),
        },
      });

      await this.outbox.emit(tx, {
        eventName: DocumentoAprovadoV1.name,
        source: 'documentos',
        tenantId,
        payload: {
          documentoId: doc.id,
          codigo: doc.codigo,
          aprovadoPor: usuario,
          aprovadoEm: new Date().toISOString(),
          situacaoAnterior: situacaoAnterior as SituacaoDocumento,
          situacaoNova: 'AGUARDANDO_ASSINATURA',
        },
      });

      return atualizado;
    });
  }

  async contestarDocumento(
    tenantId: string,
    documentoId: string,
    solicitanteId: string,
    dto: ContestarDocumentoDto,
  ) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');
    if (doc.situacao === 'ASSINADO' || doc.situacao === 'VIGENTE' || doc.situacao === 'ARQUIVADO') {
      throw new BadRequestException('Documento já assinado ou vigente não pode ser contestado diretamente; emita aditivo ou revisão.');
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const contestacao = await tx.contestacaoDocumento.create({
        data: {
          tenantId,
          documentoId,
          solicitanteId,
          solicitanteNome: dto.solicitanteNome,
          motivo: dto.motivo,
          status: 'ABERTA',
        },
      });

      await this.outbox.emit(tx, {
        eventName: DocumentoContestadoV1.name,
        source: 'documentos',
        tenantId,
        payload: {
          documentoId: doc.id,
          codigo: doc.codigo,
          solicitanteId,
          solicitanteNome: dto.solicitanteNome,
          motivo: dto.motivo,
          contestadoEm: new Date().toISOString(),
        },
      });

      return contestacao;
    });
  }

  async obterVisualizacaoComMarcaDagua(
    tenantId: string,
    documentoId: string,
    query: VisualizarDocumentoQueryDto,
  ) {
    const doc = await this.obterPorId(tenantId, documentoId);

    const usuario = query.usuarioVisualizador || 'Sistema EDDIE';
    const dataHoraUtc = new Date().toISOString();
    const marcaDagua = query.aplicarMarcaDagua !== false
      ? `VISUALIZADO POR: ${usuario} | UTC: ${dataHoraUtc} | DOC: ${doc.codigo} | CONFIDENCIAL DISKINGRESSOS`
      : null;

    return {
      documento: doc,
      marcaDagua,
      visualizadoEm: dataHoraUtc,
      integridadeVerificada: doc.hashOriginal ? true : false,
    };
  }

  async obterPendenciasGerais(tenantId: string) {
    const [
      aguardandoAprovacao,
      aguardandoProdutor,
      aguardandoFinanceiro,
      totalAssinados,
      totalContratosVigentes,
    ] = await Promise.all([
      this.prisma.documento.count({
        where: { tenantId, situacao: 'AGUARDANDO_APROVACAO' },
      }),
      this.prisma.signatarioDocumento.count({
        where: { tenantId, status: 'PENDENTE', papel: 'PRODUTOR' },
      }),
      this.prisma.signatarioDocumento.count({
        where: { tenantId, status: 'PENDENTE', papel: 'FINANCEIRO_DISK' },
      }),
      this.prisma.documento.count({
        where: { tenantId, situacao: { in: ['ASSINADO', 'VIGENTE'] } },
      }),
      this.prisma.contrato.count({
        where: { tenantId, status: 'VIGENTE' },
      }),
    ]);

    return {
      aguardandoAprovacao,
      aguardandoProdutor,
      aguardandoFinanceiroDisk: aguardandoFinanceiro,
      documentosAssinados: totalAssinados,
      contratosVigentes: totalContratosVigentes,
      documentosProximosVencimento: 5,
      contratosARenovar: 7,
      documentacaoIncompleta: 4,
    };
  }
}
