import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class SuporteService {
  constructor(private readonly prisma: PrismaService) {}

  private mapOcorrencia(o: any) {
    return {
      id: o.id,
      eventoId: o.eventoId,
      produtorId: o.produtorId,
      titulo: o.titulo,
      descricao: o.descricao,
      tipo: o.categoria || 'outro',
      categoria: o.categoria || 'outro',
      status: o.status || 'aberta',
      severidade: o.prioridade || 'media',
      prioridade: o.prioridade || 'media',
      responsavel: o.responsavelId || 'Equipe de Campo',
      responsavelId: o.responsavelId || null,
      solucao: o.solucao || null,
      resolvidoEm: o.resolvidoEm ? new Date(o.resolvidoEm).toISOString() : null,
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  async listar(tenantIdHeader?: string, eventoId?: string, produtorId?: string) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const where: any = { tenantId };

    if (eventoId) {
      where.eventoId = eventoId;
    }
    if (produtorId) {
      where.produtorId = produtorId;
    }

    const ocorrencias = await this.prisma.ocorrenciaEvento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return ocorrencias.map((o) => this.mapOcorrencia(o));
  }

  async obterPorId(tenantIdHeader: string | undefined, id: string) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const o = await this.prisma.ocorrenciaEvento.findFirst({
      where: { id, tenantId },
    });

    if (!o) {
      throw new NotFoundException(`Ocorrência de suporte ${id} não encontrada.`);
    }

    return this.mapOcorrencia(o);
  }

  async criar(tenantIdHeader: string | undefined, b: any) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;

    const ocorrencia = await this.prisma.ocorrenciaEvento.create({
      data: {
        tenantId,
        eventoId: b.eventoId,
        produtorId: b.produtorId || '00000000-0000-0000-0000-000000000001',
        titulo: b.titulo,
        descricao: b.descricao,
        categoria: b.tipo || b.categoria || 'outro',
        prioridade: b.severidade || b.prioridade || 'media',
        status: b.status || 'aberta',
        responsavelId: b.responsavel || b.responsavelId || 'Equipe Técnica de Campo',
        solucao: b.solucao || null,
      },
    });

    return this.mapOcorrencia(ocorrencia);
  }

  async atualizar(tenantIdHeader: string | undefined, id: string, b: any) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const atual = await this.prisma.ocorrenciaEvento.findFirst({ where: { id, tenantId } });
    if (!atual) {
      throw new NotFoundException('Ocorrência não encontrada para este tenant.');
    }

    const data: any = {};
    if (b.status !== undefined) data.status = b.status;
    if (b.solucao !== undefined) data.solucao = b.solucao;
    if (b.responsavel !== undefined || b.responsavelId !== undefined) {
      data.responsavelId = b.responsavel || b.responsavelId;
    }
    if (b.severidade !== undefined || b.prioridade !== undefined) {
      data.prioridade = b.severidade || b.prioridade;
    }
    if (b.tipo !== undefined || b.categoria !== undefined) {
      data.categoria = b.tipo || b.categoria;
    }

    const isResolvida = b.status === 'resolvida' || b.status === 'resolvido';
    if (isResolvida) {
      data.resolvidoEm = new Date();
    }

    const atualizado = await this.prisma.ocorrenciaEvento.update({
      where: { id },
      data,
    });

    return this.mapOcorrencia(atualizado);
  }
}
