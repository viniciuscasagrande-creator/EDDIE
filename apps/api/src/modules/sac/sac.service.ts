import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

@Injectable()
export class SacService {
  constructor(private readonly prisma: PrismaService) {}

  listar(tenantId: string, status?: string) {
    return this.prisma.chamadoSac.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  criar(tenantId: string, b: any) {
    return this.prisma.chamadoSac.create({
      data: {
        tenantId,
        protocolo: `SAC-${Date.now()}`,
        clienteNome: b.clienteNome,
        cpf: b.cpf || null,
        telefone: b.telefone || null,
        email: b.email || null,
        pedidoId: b.pedidoId || null,
        eventoId: b.eventoId || null,
        assunto: b.assunto,
        descricao: b.descricao,
        canal: b.canal || 'painel',
        prioridade: b.prioridade || 'normal',
        status: 'aberto',
        slaVenceEm: b.slaVenceEm ? new Date(b.slaVenceEm) : null,
      },
    });
  }

  async atualizar(tenantId: string, id: string, b: any) {
    const atual = await this.prisma.chamadoSac.findFirst({ where: { id, tenantId } });
    if (!atual) throw new NotFoundException('Chamado não encontrado para este tenant.');
    return this.prisma.chamadoSac.update({
      where: { id },
      data: {
        ...(b.status !== undefined ? { status: b.status } : {}),
        ...(b.responsavelId !== undefined ? { responsavelId: b.responsavelId } : {}),
        ...(b.status === 'resolvido' ? { resolvidoEm: new Date() } : {}),
      },
    });
  }

  buscar(tenantId: string, q: string) {
    return this.prisma.chamadoSac.findMany({
      where: {
        tenantId,
        OR: [
          { cpf: { contains: q } },
          { telefone: { contains: q } },
          { pedidoId: { contains: q } },
          { clienteNome: { contains: q, mode: 'insensitive' } },
          { protocolo: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
