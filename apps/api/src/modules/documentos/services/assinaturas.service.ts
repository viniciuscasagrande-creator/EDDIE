import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';
import { OutboxService } from '../../../shared/outbox/outbox.service';
import type { Prisma } from '@prisma/client';
import * as crypto from 'node:crypto';
import {
  AdicionarSignatarioDto,
  RealizarAssinaturaDto,
  RecusarAssinaturaDto,
} from '../dtos/assinatura.dto';
import {
  DOCUMENT_SIGNATURE_PROVIDER,
  DocumentSignatureProvider,
} from '../providers/signature-provider.interface';
import {
  SolicitacaoAssinaturaEmitidaV1,
  AssinaturaRealizadaV1,
  DocumentoConcluidoV1,
  PapelSignatario,
  MetodoAssinatura,
} from '@ticketing/contracts';

@Injectable()
export class AssinaturasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    @Inject(DOCUMENT_SIGNATURE_PROVIDER)
    private readonly signatureProvider: DocumentSignatureProvider,
  ) {}

  async adicionarSignatario(
    tenantId: string,
    documentoId: string,
    dto: AdicionarSignatarioDto,
  ) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');
    if (doc.situacao === 'ASSINADO' || doc.situacao === 'VIGENTE' || doc.situacao === 'CANCELADO') {
      throw new BadRequestException('Não é possível adicionar signatários a documento já concluído ou cancelado.');
    }

    const signatariosAtuais = await this.prisma.signatarioDocumento.findMany({
      where: { documentoId, tenantId },
      orderBy: { ordem: 'asc' },
    });

    const novaOrdem = dto.ordem || signatariosAtuais.length + 1;

    // Se o documento tiver regra rígida de Financeiro ser o último:
    if (doc.regraFinanceiraUltimoAssinante) {
      if (dto.papel === 'PRODUTOR' && signatariosAtuais.some((s: any) => s.papel === 'FINANCEIRO_DISK' && s.ordem <= novaOrdem)) {
        throw new BadRequestException('Em operações financeiras, o Produtor deve assinar antes do Financeiro Disk.');
      }
    }

    const signatario = await this.prisma.signatarioDocumento.create({
      data: {
        tenantId,
        documentoId,
        ordem: novaOrdem,
        nome: dto.nome,
        email: dto.email,
        documentoIdentificacao: dto.documentoIdentificacao,
        papel: dto.papel,
        status: 'PENDENTE',
        metodoAutenticacao: dto.metodoAutenticacao || 'INTERNA_SESSAO',
      },
    });

    // Se o documento já estiver aprovado e aguardando assinatura, emite a solicitação
    if (doc.situacao === 'AGUARDANDO_ASSINATURA' || doc.situacao === 'PARCIALMENTE_ASSINADO') {
      await this.emitirSolicitacaoParaSignatario(tenantId, doc, signatario);
    }

    return signatario;
  }

  async emitirSolicitacaoParaSignatario(tenantId: string, doc: any, signatario: any) {
    const resultado = await this.signatureProvider.emitirSolicitacao(
      {
        signatarioId: signatario.id,
        nome: signatario.nome,
        email: signatario.email,
        documentoIdentificacao: signatario.documentoIdentificacao,
        papel: signatario.papel,
        ordem: signatario.ordem,
      },
      {
        id: doc.id,
        codigo: doc.codigo,
        titulo: doc.titulo,
        hashOriginal: doc.hashOriginal,
      },
    );

    await this.prisma.signatarioDocumento.update({
      where: { id: signatario.id },
      data: {
        tokenAcessoExterno: resultado.tokenAcesso,
        tokenExpiraEm: resultado.expiraEm,
        transactionIdProvedor: resultado.transactionId,
      },
    });

    // Emite evento de domínio via Outbox
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.outbox.emit(tx, {
        eventName: SolicitacaoAssinaturaEmitidaV1.name,
        source: 'documentos',
        tenantId,
        payload: {
          documentoId: doc.id,
          codigo: doc.codigo,
          signatarioId: signatario.id,
          signatarioNome: signatario.nome,
          signatarioEmail: signatario.email,
          ordem: signatario.ordem,
          tipoAutenticacao: signatario.metodoAutenticacao as MetodoAssinatura,
          expiraEm: resultado.expiraEm.toISOString(),
        },
      });
    });

    return resultado;
  }

  async realizarAssinatura(
    tenantId: string,
    documentoId: string,
    _usuarioSessao: { id: string; nome: string; email: string; documento?: string; papel?: string },
    dto: RealizarAssinaturaDto,
  ) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');

    if (doc.situacao !== 'AGUARDANDO_ASSINATURA' && doc.situacao !== 'PARCIALMENTE_ASSINADO') {
      throw new BadRequestException(`Documento não está disponível para assinatura (situação: ${doc.situacao}).`);
    }

    const todosSignatarios = await this.prisma.signatarioDocumento.findMany({
      where: { documentoId, tenantId },
      orderBy: { ordem: 'asc' },
    });

    const signatarioAlvo = todosSignatarios.find((s: any) => s.id === dto.signatarioId);
    if (!signatarioAlvo) {
      throw new NotFoundException('Signatário não encontrado neste documento.');
    }

    if (signatarioAlvo.status === 'ASSINADO') {
      throw new BadRequestException('Este signatário já realizou a assinatura.');
    }

    // REGRA DE OURO FINANCEIRA DO EDDIE:
    // Se o documento tiver regraFinanceiraUltimoAssinante === true:
    // Financeiro Disk ASSINA POR ÚLTIMO.
    if (doc.regraFinanceiraUltimoAssinante) {
      if (signatarioAlvo.papel === 'FINANCEIRO_DISK') {
        const produtorPendente = todosSignatarios.some(
          (s: any) => s.papel === 'PRODUTOR' && s.status !== 'ASSINADO',
        );
        if (produtorPendente) {
          throw new BadRequestException(
            'Regra Financeira Inviolável: Financeiro Disk deve ser o último assinante e requer assinatura prévia do Produtor.',
          );
        }
      }
    }

    // Ordem Sequencial: signatários com ordem menor devem ter assinado
    if (doc.ordemAssinatura === 'SEQUENCIAL') {
      const anterioresPendentes = todosSignatarios.filter(
        (s: any) => s.ordem < signatarioAlvo.ordem && s.status !== 'ASSINADO',
      );
      if (anterioresPendentes.length > 0) {
        throw new BadRequestException(
          `Ordem de assinatura sequencial violada: signatário de ordem ${anterioresPendentes[0]?.ordem} (${anterioresPendentes[0]?.nome}) ainda não assinou.`,
        );
      }
    }

    // Coleta a assinatura criptográfica via Provider
    const evidencia = await this.signatureProvider.coletarAssinatura({
      documentoId: doc.id,
      codigoDocumento: doc.codigo,
      signatarioId: signatarioAlvo.id,
      nome: signatarioAlvo.nome,
      documentoIdentificacao: signatarioAlvo.documentoIdentificacao,
      email: signatarioAlvo.email,
      papel: signatarioAlvo.papel,
      metodoAutenticacao: signatarioAlvo.metodoAutenticacao,
      hashConteudoOriginal: doc.hashOriginal,
      ipAssinatura: dto.ipAssinatura || '127.0.0.1',
      userAgent: dto.userAgent || 'EDDIE-Client/11.35',
    });

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Atualiza status do signatário
      await tx.signatarioDocumento.update({
        where: { id: signatarioAlvo.id },
        data: {
          status: 'ASSINADO',
          assinadoEm: evidencia.carimboDoTempo,
          ipAssinatura: dto.ipAssinatura || '127.0.0.1',
          userAgent: dto.userAgent || 'EDDIE-Client/11.35',
        },
      });

      // 2. Grava a evidência imutável
      await tx.evidenciaAssinatura.create({
        data: {
          tenantId,
          documentoId: doc.id,
          signatarioId: signatarioAlvo.id,
          hashEvidencia: evidencia.hashEvidencia,
          certificadoDigitalInfo: (evidencia.certificadoInfo as any) || {},
          dadosAuditoria: (evidencia.dadosAuditoria as any) || {},
          carimboDoTempo: evidencia.carimboDoTempo,
        },
      });

      // Verifica se todos assinaram
      const signatariosRestantes = todosSignatarios.filter(
        (s: any) => s.id !== signatarioAlvo.id && s.status !== 'ASSINADO',
      );
      const eUltimoAssinante = signatariosRestantes.length === 0;

      // Publica evento de assinatura realizada
      await this.outbox.emit(tx, {
        eventName: AssinaturaRealizadaV1.name,
        source: 'documentos',
        tenantId,
        payload: {
          documentoId: doc.id,
          codigo: doc.codigo,
          signatarioId: signatarioAlvo.id,
          signatarioNome: signatarioAlvo.nome,
          papel: signatarioAlvo.papel as PapelSignatario,
          metodo: signatarioAlvo.metodoAutenticacao as MetodoAssinatura,
          hashEvidencia: evidencia.hashEvidencia,
          timestamp: evidencia.carimboDoTempo.toISOString(),
          eUltimoAssinante,
        },
      });

      // Se todos assinaram, sela o documento e emite certificado de conclusão
      if (eUltimoAssinante) {
        const hashFinal = crypto
          .createHash('sha256')
          .update(doc.hashOriginal + evidencia.hashEvidencia + 'SEALED_CONCLUDED')
          .digest('hex');

        const situacaoFinal = doc.tipo === 'CONTRATO' || doc.tipo === 'ADITIVO' ? 'VIGENTE' : 'ASSINADO';

        await tx.documento.update({
          where: { id: doc.id },
          data: {
            situacao: situacaoFinal,
            hashFinal,
          },
        });

        // Se for contrato ou aditivo, atualiza o status do contrato correspondente
        if (doc.tipo === 'CONTRATO') {
          await tx.contrato.updateMany({
            where: { documentoId: doc.id, tenantId },
            data: { status: 'VIGENTE' },
          });
        } else if (doc.tipo === 'ADITIVO') {
          await tx.aditivoContrato.updateMany({
            where: { documentoId: doc.id, tenantId },
            data: { status: 'VIGENTE' },
          });
        }

        // Publica evento de Documento Concluído no Outbox
        await this.outbox.emit(tx, {
          eventName: DocumentoConcluidoV1.name,
          source: 'documentos',
          tenantId,
          payload: {
            documentoId: doc.id,
            codigo: doc.codigo,
            tipo: doc.tipo as any,
            hashFinal,
            totalSignatarios: todosSignatarios.length,
            concluidoEm: new Date().toISOString(),
          },
        });
      } else {
        // Se ainda faltam assinaturas, marca como PARCIALMENTE_ASSINADO
        await tx.documento.update({
          where: { id: doc.id },
          data: { situacao: 'PARCIALMENTE_ASSINADO' },
        });
      }

      return {
        sucesso: true,
        documentoConcluido: eUltimoAssinante,
        hashEvidencia: evidencia.hashEvidencia,
        assinadoEm: evidencia.carimboDoTempo,
      };
    });
  }

  async recusarAssinatura(
    tenantId: string,
    documentoId: string,
    dto: RecusarAssinaturaDto,
  ) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.signatarioDocumento.update({
        where: { id: dto.signatarioId },
        data: {
          status: 'RECUSADO',
          recusadoEm: new Date(),
          motivoRecusa: dto.motivo,
        },
      });

      // Se um signatário recusar, o documento é marcado como CANCELADO
      await tx.documento.update({
        where: { id: doc.id },
        data: {
          situacao: 'CANCELADO',
          motivoCancelamento: `Assinatura recusada pelo signatário. Motivo: ${dto.motivo}`,
        },
      });

      return { cancelado: true, motivo: dto.motivo };
    });
  }

  async obterCertificadoConclusao(tenantId: string, documentoId: string) {
    const doc = await this.prisma.documento.findFirst({
      where: { id: documentoId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado.');
    if (doc.situacao !== 'ASSINADO' && doc.situacao !== 'VIGENTE') {
      throw new BadRequestException('Certificado de conclusão só está disponível para documentos totalmente assinados.');
    }

    const [signatarios, evidencias] = await Promise.all([
      this.prisma.signatarioDocumento.findMany({
        where: { documentoId: doc.id, tenantId },
        orderBy: { ordem: 'asc' },
      }),
      this.prisma.evidenciaAssinatura.findMany({
        where: { documentoId: doc.id, tenantId },
      }),
    ]);

    const signatariosCertificado = signatarios.map((s: any) => {
      const evid = evidencias.find((e: any) => e.signatarioId === s.id);
      return {
        nome: s.nome,
        email: s.email,
        documentoIdentificacao: s.documentoIdentificacao,
        papel: s.papel,
        metodo: s.metodoAutenticacao,
        assinadoEm: s.assinadoEm || s.createdAt,
        ip: s.ipAssinatura || undefined,
        hashEvidencia: evid?.hashEvidencia || 'HASH_PENDENTE',
      };
    });

    return await this.signatureProvider.gerarCertificadoConclusao({
      codigoDocumento: doc.codigo,
      tituloDocumento: doc.titulo,
      tipoDocumento: doc.tipo,
      hashOriginal: doc.hashOriginal,
      hashFinal: doc.hashFinal || doc.hashOriginal,
      totalSignatarios: signatarios.length,
      concluidoEm: doc.updatedAt,
      signatarios: signatariosCertificado,
    });
  }
}
