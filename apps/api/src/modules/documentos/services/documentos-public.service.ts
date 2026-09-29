import { Injectable, BadRequestException } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DossieService } from './dossie.service';
import { ChecklistService } from './checklist.service';
import { PrismaService } from '../../../shared/prisma.module';

export interface DadosGeracaoRepasseDoc {
  repasseId: string;
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valorCentavos: number;
  chavePixOuConta: string;
  dataPrevista: string;
  signatarioProdutorNome: string;
  signatarioProdutorEmail: string;
  signatarioProdutorDocumento: string;
  signatarioFinanceiroNome: string;
  signatarioFinanceiroEmail: string;
  signatarioFinanceiroDocumento: string;
}

export interface DadosGeracaoBorderoDoc {
  eventoId: string;
  eventoNome: string;
  produtorId: string;
  produtorNome: string;
  fechamentoId: string;
  tipoBordero: 'RESUMIDO' | 'COMPLETO';
  vendasLiquidasCentavos: number;
  totalTaxasCentavos: number;
  totalEstornosCentavos: number;
  totalRepassesCentavos: number;
  saldoCentavos: number;
  detalhesItens?: Array<{
    setor: string;
    lote: string;
    canal: string;
    quantidade: number;
    receitaBrutaCentavos: number;
  }>;
  signatarioProdutorNome: string;
  signatarioProdutorEmail: string;
  signatarioProdutorDocumento: string;
  signatarioFinanceiroNome: string;
  signatarioFinanceiroEmail: string;
  signatarioFinanceiroDocumento: string;
}

@Injectable()
export class DocumentosPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentosService: DocumentosService,
    private readonly dossieService: DossieService,
    private readonly checklistService: ChecklistService,
  ) {}

  /**
   * REGRA FUNDAMENTAL: A Tesouraria NÃO executa repasse ou antecipação sem que
   * o documento operacional esteja formalmente assinado e selado.
   */
  async verificarOperacaoPodeSerExecutada(
    tenantId: string,
    idOperacaoOrigem: string,
    tipoOperacao: 'REPASSE' | 'ANTECIPACAO' | 'BORDERO',
  ): Promise<{ autorizada: boolean; motivo?: string; documentoCodigo?: string }> {
    const doc = await this.prisma.documento.findFirst({
      where: {
        tenantId,
        idOperacaoOrigem,
        tipoOperacaoOrigem: tipoOperacao,
      },
    });

    if (!doc) {
      return {
        autorizada: false,
        motivo: `Nenhum documento operacional formalizado foi localizado para a operação ${idOperacaoOrigem}.`,
      };
    }

    if (doc.situacao !== 'ASSINADO' && doc.situacao !== 'VIGENTE') {
      return {
        autorizada: false,
        motivo: `O documento ${doc.codigo} ainda não está totalmente assinado (situação atual: ${doc.situacao}). Assinatura do Produtor e do Financeiro Disk são obrigatórias antes da liquidação.`,
        documentoCodigo: doc.codigo,
      };
    }

    return {
      autorizada: true,
      documentoCodigo: doc.codigo,
    };
  }

  async gerarDocumentoRepasse(
    tenantId: string,
    criadoPor: string,
    dados: DadosGeracaoRepasseDoc,
  ) {
    // 1. Valida se o produtor não tem bloqueio no checklist documental
    const bloqueio = await this.checklistService.verificarBloqueioOperacional(
      tenantId,
      dados.produtorId,
      'PRODUTOR',
      'Solicitação de Repasse',
    );
    if (bloqueio.bloqueado) {
      throw new BadRequestException(bloqueio.motivo);
    }

    const valorFormatado = (dados.valorCentavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    // 2. Cria documento de Solicitação de Repasse com regra rígida de Financeiro assinar por último
    const doc = await this.documentosService.criarDocumento(tenantId, criadoPor, {
      tipo: 'SOLICITACAO_REPASSE' as any,
      titulo: `Solicitação de Repasse ${valorFormatado} — ${dados.eventoNome}`,
      produtorId: dados.produtorId,
      produtorNome: dados.produtorNome,
      eventoId: dados.eventoId,
      eventoNome: dados.eventoNome,
      tipoOperacaoOrigem: 'REPASSE',
      idOperacaoOrigem: dados.repasseId,
      origemDescricao: `Operação de Repasse ID ${dados.repasseId} para ${dados.produtorNome}`,
      sensibilidade: 'FINANCEIRO' as any,
      regraFinanceiraUltimoAssinante: true,
      ordemAssinatura: 'SEQUENCIAL',
      metadados: {
        repasseId: dados.repasseId,
        valorCentavos: dados.valorCentavos,
        valorFormatado,
        chavePixOuConta: dados.chavePixOuConta,
        dataPrevista: dados.dataPrevista,
      },
      signatarios: [
        {
          ordem: 1,
          nome: dados.signatarioProdutorNome,
          email: dados.signatarioProdutorEmail,
          documentoIdentificacao: dados.signatarioProdutorDocumento,
          papel: 'PRODUTOR',
          metodoAutenticacao: 'INTERNA_SESSAO',
        },
        {
          ordem: 2,
          nome: dados.signatarioFinanceiroNome,
          email: dados.signatarioFinanceiroEmail,
          documentoIdentificacao: dados.signatarioFinanceiroDocumento,
          papel: 'FINANCEIRO_DISK',
          metodoAutenticacao: 'INTERNA_SESSAO',
        },
      ],
    });

    return doc;
  }

  async gerarDocumentoBordero(
    tenantId: string,
    criadoPor: string,
    dados: DadosGeracaoBorderoDoc,
  ) {
    const titulo = dados.tipoBordero === 'COMPLETO'
      ? `Borderô Analítico Completo — ${dados.eventoNome}`
      : `Borderô Sintético Resumido — ${dados.eventoNome}`;

    const doc = await this.documentosService.criarDocumento(tenantId, criadoPor, {
      tipo: 'BORDERO' as any,
      titulo,
      produtorId: dados.produtorId,
      produtorNome: dados.produtorNome,
      eventoId: dados.eventoId,
      eventoNome: dados.eventoNome,
      tipoOperacaoOrigem: 'FECHAMENTO_EVENTO',
      idOperacaoOrigem: dados.fechamentoId,
      origemDescricao: `Fechamento do Evento ${dados.eventoNome} (ID ${dados.fechamentoId})`,
      sensibilidade: 'FINANCEIRO' as any,
      regraFinanceiraUltimoAssinante: true,
      ordemAssinatura: 'SEQUENCIAL',
      metadados: {
        tipoBordero: dados.tipoBordero,
        vendasLiquidasCentavos: dados.vendasLiquidasCentavos,
        totalTaxasCentavos: dados.totalTaxasCentavos,
        totalEstornosCentavos: dados.totalEstornosCentavos,
        totalRepassesCentavos: dados.totalRepassesCentavos,
        saldoCentavos: dados.saldoCentavos,
        detalhesItens: dados.detalhesItens || [],
      },
      signatarios: [
        {
          ordem: 1,
          nome: dados.signatarioProdutorNome,
          email: dados.signatarioProdutorEmail,
          documentoIdentificacao: dados.signatarioProdutorDocumento,
          papel: 'PRODUTOR',
        },
        {
          ordem: 2,
          nome: dados.signatarioFinanceiroNome,
          email: dados.signatarioFinanceiroEmail,
          documentoIdentificacao: dados.signatarioFinanceiroDocumento,
          papel: 'FINANCEIRO_DISK',
        },
      ],
    });

    // Registra automaticamente na Seção 11 (Borderôs) do Dossiê do Evento
    const dossie = await this.dossieService.obterOuCriarDossie(tenantId, {
      tipo: 'EVENTO' as any,
      referenciaId: dados.eventoId,
      referenciaNome: dados.eventoNome,
    });

    await this.dossieService.adicionarItem(tenantId, dossie.id, {
      secao: 11,
      secaoNome: '11. Borderôs',
      titulo: doc.titulo,
      tipoDocumento: 'BORDERO',
      documentoId: doc.id,
      origemModulo: 'financeiro',
      referenciaId: dados.fechamentoId,
      hashArquivo: doc.hashOriginal,
      metadados: {
        tipoBordero: dados.tipoBordero,
        saldoCentavos: dados.saldoCentavos,
      },
    });

    return doc;
  }

  async registrarEvidenciaNoDossie(
    tenantId: string,
    eventoId: string,
    eventoNome: string,
    dados: {
      secao: number;
      secaoNome: string;
      titulo: string;
      tipoDocumento: string;
      documentoId?: string;
      origemModulo: string;
      referenciaId?: string;
      hashArquivo: string;
      arquivoUrl?: string;
      metadados?: Record<string, unknown>;
    },
  ) {
    const dossie = await this.dossieService.obterOuCriarDossie(tenantId, {
      tipo: 'EVENTO' as any,
      referenciaId: eventoId,
      referenciaNome: eventoNome,
    });

    return await this.dossieService.adicionarItem(tenantId, dossie.id, dados);
  }

  async verificarChecklist(
    tenantId: string,
    entidadeId: string,
    tipoEntidade: 'PRODUTOR' | 'PARCEIRO' | 'EVENTO',
    tipoOperacao: string,
  ) {
    return await this.checklistService.verificarBloqueioOperacional(
      tenantId,
      entidadeId,
      tipoEntidade,
      tipoOperacao,
    );
  }
}
