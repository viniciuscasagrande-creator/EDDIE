import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

@Injectable()
export class SuporteService {
  constructor(private readonly prisma: PrismaService) {}

  listar(tenantId: string, eventoId?: string) {
    return this.prisma.ocorrenciaEvento.findMany({
      where: { tenantId, ...(eventoId ? { eventoId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  criar(tenantId: string, b: any) {
    return this.prisma.ocorrenciaEvento.create({
      data: {
        tenantId,
        eventoId: b.eventoId,
        produtorId: b.produtorId,
        titulo: b.titulo,
        descricao: b.descricao,
        categoria: b.categoria || 'operacao',
        prioridade: b.prioridade || 'normal',
        status: 'aberto',
        responsavelId: b.responsavelId || null,
      },
    });
  }

  async atualizar(tenantId: string, id: string, b: any) {
    const atual = await this.prisma.ocorrenciaEvento.findFirst({ where: { id, tenantId } });
    if (!atual) throw new NotFoundException('Ocorrência não encontrada para este tenant.');
    return this.prisma.ocorrenciaEvento.update({
      where: { id },
      data: {
        ...(b.status !== undefined ? { status: b.status } : {}),
        ...(b.responsavelId !== undefined ? { responsavelId: b.responsavelId } : {}),
        ...(b.status === 'resolvido' ? { resolvidoEm: new Date() } : {}),
      },
    });
  }
}
