import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';
import { OutboxService } from '../../../shared/outbox/outbox.service';
import type { Prisma } from '@prisma/client';
import { DocumentosService } from './documentos.service';
import * as crypto from 'node:crypto';
import {
  CriarContratoDto,
  CriarAditivoDto,
  ValidarDivergenciaDto,
} from '../dtos/contrato.dto';
import { DivergenciaContratualDetectadaV1 } from '@ticketing/contracts';

@Injectable()
export class ContratosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly documentosService: DocumentosService,
  ) {}

  private gerarCodigoContrato(): string {
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(100000 + Math.random() * 900000);
    return `CTR-${ano}-${sequencial}`;
  }

  private gerarCodigoAditivo(): string {
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(100000 + Math.random() * 900000);
    return `ADT-${ano}-${sequencial}`;
  }

  async criarContrato(tenantId: string, criadoPor: string, dto: CriarContratoDto) {
    const codigo = this.gerarCodigoContrato();

    // 1. Gera o documento formal no módulo de documentos
    const documento = await this.documentosService.criarDocumento(tenantId, criadoPor, {
      tipo: 'CONTRATO' as any,
      titulo: `Contrato de Prestação de Serviços — ${dto.produtorNome}`,
      produtorId: dto.produtorId,
      produtorNome: dto.produtorNome,
      origemDescricao: `Contrato Comercial formalizado para ${dto.produtorNome}`,
      sensibilidade: 'CONTRATUAL' as any,
      vigenciaInicio: dto.vigenciaInicio,
      vigenciaFim: dto.vigenciaFim,
      metadados: {
        taxaDiskPercentual: dto.taxaDiskPercentual,
        prazoRepasseDias: dto.prazoRepasseDias,
        antecipacaoPermitida: dto.antecipacaoPermitida,
        taxaAntecipacaoPercentual: dto.taxaAntecipacaoPercentual,
        taxaServicoFixa: dto.taxaServicoFixa || 0,
        eventosAutorizados: dto.eventosAutorizados || [],
        responsabilidades: dto.responsabilidades || '',
      },
    });

    // 2. Registra as condições comerciais estruturadas
    const contrato = await this.prisma.contrato.create({
      data: {
        tenantId,
        codigo,
        produtorId: dto.produtorId,
        produtorNome: dto.produtorNome,
        empresaContratante: dto.empresaContratante || 'DiskIngressos Entretenimento Ltda',
        documentoId: documento.id,
        vigenciaInicio: new Date(dto.vigenciaInicio),
        vigenciaFim: new Date(dto.vigenciaFim),
        taxaDiskPercentual: dto.taxaDiskPercentual,
        prazoRepasseDias: dto.prazoRepasseDias,
        antecipacaoPermitida: dto.antecipacaoPermitida,
        taxaAntecipacaoPercentual: dto.taxaAntecipacaoPercentual,
        taxaServicoFixa: dto.taxaServicoFixa || 0,
        eventosAutorizados: dto.eventosAutorizados || [],
        responsabilidades: dto.responsabilidades,
        status: 'VIGENTE',
        criadoPor,
      },
    });

    return { contrato, documento };
  }

  async criarAditivo(
    tenantId: string,
    contratoId: string,
    criadoPor: string,
    dto: CriarAditivoDto,
  ) {
    const contrato = await this.prisma.contrato.findFirst({
      where: { id: contratoId, tenantId },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado.');

    const aditivosExistentes = await this.prisma.aditivoContrato.findMany({
      where: { contratoId, tenantId },
      orderBy: { numeroSequencial: 'desc' },
    });

    const proximoSequencial = (aditivosExistentes[0]?.numeroSequencial || 0) + 1;
    const codigo = this.gerarCodigoAditivo();

    // 1. Gera documento suporte do aditivo
    const documento = await this.documentosService.criarDocumento(tenantId, criadoPor, {
      tipo: 'ADITIVO' as any,
      titulo: `Termo Aditivo ${proximoSequencial} ao Contrato ${contrato.codigo} — ${contrato.produtorNome}`,
      produtorId: contrato.produtorId,
      produtorNome: contrato.produtorNome,
      tipoOperacaoOrigem: 'ADITIVO',
      idOperacaoOrigem: contrato.id,
      origemDescricao: `Aditivo contratual nº ${proximoSequencial} para ajuste de taxa/prazo.`,
      sensibilidade: 'CONTRATUAL' as any,
      vigenciaInicio: dto.dataVigencia,
      metadados: {
        contratoPaiCodigo: contrato.codigo,
        numeroSequencial: proximoSequencial,
        taxaAnterior: Number(contrato.taxaDiskPercentual),
        taxaNova: dto.taxaDiskPercentualNova,
        prazoAnterior: contrato.prazoRepasseDias,
        prazoNovo: dto.prazoRepasseDiasNovo,
        justificativa: dto.justificativa,
      },
    });

    // 2. Salva o aditivo
    const aditivo = await this.prisma.aditivoContrato.create({
      data: {
        tenantId,
        contratoId: contrato.id,
        codigo,
        numeroSequencial: proximoSequencial,
        documentoId: documento.id,
        dataVigencia: new Date(dto.dataVigencia),
        taxaDiskPercentualAnterior: contrato.taxaDiskPercentual,
        taxaDiskPercentualNova: dto.taxaDiskPercentualNova,
        prazoRepasseDiasAnterior: contrato.prazoRepasseDias,
        prazoRepasseDiasNovo: dto.prazoRepasseDiasNovo,
        justificativa: dto.justificativa,
        status: 'RASCUNHO',
      },
    });

    return { aditivo, documento };
  }

  async obterContratoComHistorico(tenantId: string, contratoId: string) {
    const contrato = await this.prisma.contrato.findFirst({
      where: { id: contratoId, tenantId },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado.');

    const aditivos = await this.prisma.aditivoContrato.findMany({
      where: { contratoId: contrato.id, tenantId },
      orderBy: { numeroSequencial: 'asc' },
    });

    // Identifica a condição comercial vigente atual (se houver aditivos vigentes)
    const aditivosVigentes = aditivos.filter((a: any) => a.status === 'VIGENTE');
    const ultimoAditivo = aditivosVigentes[aditivosVigentes.length - 1];

    const condicaoVigente = {
      taxaDiskPercentual: ultimoAditivo
        ? Number(ultimoAditivo.taxaDiskPercentualNova)
        : Number(contrato.taxaDiskPercentual),
      prazoRepasseDias: ultimoAditivo
        ? ultimoAditivo.prazoRepasseDiasNovo
        : contrato.prazoRepasseDias,
      origem: ultimoAditivo ? `Aditivo ${ultimoAditivo.numeroSequencial} (${ultimoAditivo.codigo})` : 'Contrato Original',
      dataVigencia: ultimoAditivo ? ultimoAditivo.dataVigencia : contrato.vigenciaInicio,
    };

    return {
      contrato,
      aditivos,
      condicaoVigente,
    };
  }

  async listarContratos(tenantId: string, filtros?: { produtorId?: string; status?: string }) {
    const where: any = { tenantId };
    if (filtros?.produtorId) where.produtorId = filtros.produtorId;
    if (filtros?.status) where.status = filtros.status;

    return await this.prisma.contrato.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async validarDivergenciaComCore(tenantId: string, dto: ValidarDivergenciaDto) {
    const contrato = await this.prisma.contrato.findFirst({
      where: { produtorId: dto.produtorId, tenantId, status: 'VIGENTE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!contrato) {
      return {
        possuiContratoVigente: false,
        divergencias: [],
        mensagem: 'Nenhum contrato formal vigente encontrado para este produtor.',
      };
    }

    const { condicaoVigente } = await this.obterContratoComHistorico(tenantId, contrato.id);
    const divergencias: Array<{
      campo: string;
      valorContratual: number;
      valorOperacional: number;
      severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
      descricao: string;
    }> = [];

    // Compara Taxa
    if (Math.abs(condicaoVigente.taxaDiskPercentual - dto.taxaOperacionalConfigurada) > 0.001) {
      divergencias.push({
        campo: 'taxaDiskPercentual',
        valorContratual: condicaoVigente.taxaDiskPercentual,
        valorOperacional: dto.taxaOperacionalConfigurada,
        severidade: 'CRITICA',
        descricao: `Taxa contratual (${condicaoVigente.taxaDiskPercentual}%) difere da taxa operacional configurada (${dto.taxaOperacionalConfigurada}%).`,
      });
    }

    // Compara Prazo de Repasse
    if (condicaoVigente.prazoRepasseDias !== dto.prazoRepasseOperacionalConfigurado) {
      divergencias.push({
        campo: 'prazoRepasseDias',
        valorContratual: condicaoVigente.prazoRepasseDias,
        valorOperacional: dto.prazoRepasseOperacionalConfigurado,
        severidade: 'ALTA',
        descricao: `Prazo contratual de repasse (D+${condicaoVigente.prazoRepasseDias}) difere do prazo operacional (D+${dto.prazoRepasseOperacionalConfigurado}).`,
      });
    }

    // Se houver divergências, publica no Outbox para integração com Governança (11.31)
    if (divergencias.length > 0) {
      for (const div of divergencias) {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await this.outbox.emit(tx, {
            eventName: DivergenciaContratualDetectadaV1.name,
            source: 'contratos',
            tenantId,
            payload: {
              contratoCodigo: contrato.codigo,
              produtorId: dto.produtorId,
              eventoId: dto.eventoId,
              campo: div.campo,
              valorContratual: div.valorContratual,
              valorOperacional: div.valorOperacional,
              severidade: div.severidade,
              detectadoEm: new Date().toISOString(),
            },
          });
        });
      }
    }

    return {
      possuiContratoVigente: true,
      contratoCodigo: contrato.codigo,
      condicaoVigente,
      divergencias,
      conforme: divergencias.length === 0,
    };
  }
}
