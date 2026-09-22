import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventosEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import type { CriarEventoDto, CriarSessaoDto, CriarLoteDto, CancelarEventoDto } from './eventos.dto';

const SOURCE = 'eventos';
const cents = (v: number | { toNumber(): number }): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class EventosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async listarPorProdutor(tenantId: string, produtorId: string) {
    return this.prisma.evento.findMany({
      where: { tenantId, produtorId },
      select: { id: true, nome: true, slug: true, status: true, imagemUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async criar(tenantId: string, dto: CriarEventoDto, atorId: string) {
    return this.prisma.evento.create({
      data: { ...dto, tenantId, status: 'rascunho' },
    });
  }

  async adicionarSessao(tenantId: string, eventoId: string, dto: CriarSessaoDto) {
    const evento = await this.buscar(tenantId, eventoId);
    if (evento.status === 'cancelado') {
      throw new BadRequestException('Evento cancelado não aceita novas sessões');
    }

    return this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.create({ data: { ...dto, eventoId } });

      await this.outbox.emit(tx, {
        eventName: EventosEvents.SessaoCriada.name,
        source: SOURCE,
        tenantId,
        payload: {
          sessaoId: sessao.id,
          eventoId,
          inicioEm: sessao.inicioEm.toISOString(),
          fimEm: sessao.fimEm?.toISOString() ?? null,
          capacidadeTotal: sessao.capacidadeTotal,
        },
      });
      return sessao;
    });
  }

  async adicionarLote(tenantId: string, sessaoId: string, dto: CriarLoteDto) {
    return this.prisma.$transaction(async (tx) => {
      const lote = await tx.lote.create({ data: { ...dto, sessaoId } });

      await this.outbox.emit(tx, {
        eventName: EventosEvents.LoteAberto.name,
        source: SOURCE,
        tenantId,
        payload: {
          loteId: lote.id,
          sessaoId,
          setorId: lote.setorId,
          nome: lote.nome,
          precoFace: { amount: cents(lote.precoFace), currency: 'BRL' },
          taxaConveniencia: { amount: cents(lote.taxaConveniencia), currency: 'BRL' },
          quantidade: lote.quantidade,
          abreEm: lote.abreEm.toISOString(),
          fechaEm: lote.fechaEm?.toISOString() ?? null,
        },
      });
      return lote;
    });
  }

  /** Publicar é o gatilho que libera o evento para o Inventário/Checkout. */
  async publicar(tenantId: string, eventoId: string, atorId: string) {
    const evento = await this.prisma.evento.findFirst({
      where: { id: eventoId, tenantId },
      include: { sessoes: { include: { lotes: true, local: true } } },
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    if (evento.status !== 'rascunho') {
      throw new BadRequestException(`Evento já está em ${evento.status}`);
    }
    if (evento.sessoes.length === 0) {
      throw new BadRequestException('Publique apenas eventos com ao menos uma sessão');
    }
    if (!evento.sessoes.some((s) => s.lotes.some((l) => l.ativo))) {
      throw new BadRequestException('Nenhum lote ativo — não há o que vender');
    }

    const primeira = evento.sessoes[0]!;
    const correlationId = randomUUID();

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.evento.update({
        where: { id: eventoId },
        data: { status: 'publicado', publicadoEm: new Date() },
      });

      await this.outbox.emit(tx, {
        eventName: EventosEvents.EventoPublicado.name,
        source: SOURCE,
        tenantId,
        correlationId,
        actor: { type: 'user', id: atorId },
        payload: {
          eventoId,
          produtorId: evento.produtorId,
          nome: evento.nome,
          slug: evento.slug,
          localNome: primeira.local.nome,
          cidade: primeira.local.cidade,
          uf: primeira.local.uf,
          classificacaoEtaria: evento.classificacaoEtaria,
          publicadoEm: atualizado.publicadoEm!.toISOString(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId, module: SOURCE, entity: 'Evento', entityId: eventoId,
          action: 'publicar', actorId: atorId,
          before: { status: 'rascunho' }, after: { status: 'publicado' },
        },
      });

      return atualizado;
    });
  }

  /**
   * Cancelar dispara a cascata: Estorno abre reembolso total, Acesso invalida QRs,
   * Financeiro provisiona a devolução, SAC prepara a comunicação.
   */
  async cancelar(tenantId: string, eventoId: string, dto: CancelarEventoDto, atorId: string) {
    const evento = await this.buscar(tenantId, eventoId);
    if (evento.status === 'cancelado') throw new BadRequestException('Já cancelado');

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.evento.update({
        where: { id: eventoId },
        data: { status: 'cancelado', canceladoEm: new Date(), motivoCancelamento: dto.motivo },
      });

      await this.outbox.emit(tx, {
        eventName: EventosEvents.EventoCancelado.name,
        source: SOURCE,
        tenantId,
        actor: { type: 'user', id: atorId },
        payload: {
          eventoId,
          motivo: dto.motivo,
          estornoAutomatico: dto.estornoAutomatico,
          canceladoEm: atualizado.canceladoEm!.toISOString(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId, module: SOURCE, entity: 'Evento', entityId: eventoId,
          action: 'cancelar', actorId: atorId,
          before: { status: evento.status }, after: { status: 'cancelado', motivo: dto.motivo },
        },
      });

      return atualizado;
    });
  }

  private async buscar(tenantId: string, id: string) {
    const evento = await this.prisma.evento.findFirst({ where: { id, tenantId } });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }
}
