import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Prisma, StatusEstorno } from '@prisma/client';
import { EstornoEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import { EstornoPolicy, type ContextoPolitica } from './estorno.policy';
import { assertTransicao } from './estorno.state-machine';

const SOURCE = 'estorno';
const toCents = (d: Prisma.Decimal) => Math.round(d.toNumber() * 100);
const fromCents = (c: number) => c / 100;

@Injectable()
export class EstornoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly policy: EstornoPolicy,
  ) {}

  async solicitar(
    tenantId: string,
    input: {
      pedidoId: string;
      clienteId: string;
      motivo: ContextoPolitica['motivo'];
      itensIds: string[];
      valorSolicitadoCents: number;
      chamadoId?: string;
      contexto: Omit<ContextoPolitica, 'motivo' | 'valorSolicitadoCents'>;
    },
    atorId: string,
  ) {
    const decisao = this.policy.avaliar({
      ...input.contexto,
      motivo: input.motivo,
      valorSolicitadoCents: input.valorSolicitadoCents,
    });

    return this.prisma.$transaction(async (tx) => {
      const estorno = await tx.solicitacaoEstorno.create({
        data: {
          tenantId,
          pedidoId: input.pedidoId,
          clienteId: input.clienteId,
          chamadoId: input.chamadoId ?? null,
          motivo: input.motivo,
          itensIds: input.itensIds,
          valorSolicitado: fromCents(input.valorSolicitadoCents),
          status: 'solicitado',
        },
      });

      await tx.transicaoEstorno.create({
        data: {
          estornoId: estorno.id, de: null, para: 'solicitado',
          atorId, observacao: decisao.justificativa,
        },
      });

      await this.outbox.emit(tx, {
        eventName: EstornoEvents.EstornoSolicitado.name,
        source: SOURCE,
        tenantId,
        actor: { type: 'user', id: atorId },
        payload: {
          estornoId: estorno.id,
          pedidoId: input.pedidoId,
          clienteId: input.clienteId,
          motivo: input.motivo,
          itensIds: input.itensIds,
          valorSolicitado: { amount: input.valorSolicitadoCents, currency: 'BRL' },
          chamadoId: input.chamadoId ?? null,
          solicitadoEm: estorno.solicitadoEm.toISOString(),
        },
      });

      return { estorno, decisao };
    });
  }

  async aprovar(
    tenantId: string,
    estornoId: string,
    input: { valorAprovadoCents: number; taxaRetidaCents: number; debitoProdutorCents: number },
    atorId: string,
  ) {
    const estorno = await this.buscar(tenantId, estornoId);
    assertTransicao(estorno.status, 'aprovado');

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.solicitacaoEstorno.update({
        where: { id: estornoId },
        data: {
          status: 'aprovado',
          valorAprovado: fromCents(input.valorAprovadoCents),
          taxaRetida: fromCents(input.taxaRetidaCents),
          debitoProdutor: fromCents(input.debitoProdutorCents),
          analisadoPor: atorId,
          decididoEm: new Date(),
        },
      });

      await this.registrarTransicao(tx, estornoId, estorno.status, 'aprovado', atorId);

      await this.outbox.emit(tx, {
        eventName: EstornoEvents.EstornoAprovado.name,
        source: SOURCE,
        tenantId,
        actor: { type: 'user', id: atorId },
        payload: {
          estornoId,
          pedidoId: estorno.pedidoId,
          valorAprovado: { amount: input.valorAprovadoCents, currency: 'BRL' },
          taxaRetida: { amount: input.taxaRetidaCents, currency: 'BRL' },
          debitoProdutor: { amount: input.debitoProdutorCents, currency: 'BRL' },
          aprovadoPor: atorId,
          aprovadoEm: new Date().toISOString(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId, module: SOURCE, entity: 'SolicitacaoEstorno', entityId: estornoId,
          action: 'aprovar', actorId: atorId,
          before: { status: estorno.status },
          after: { status: 'aprovado', valorAprovadoCents: input.valorAprovadoCents },
        },
      });

      return atualizado;
    });
  }

  async negar(tenantId: string, estornoId: string, motivoNegativa: string, atorId: string) {
    const estorno = await this.buscar(tenantId, estornoId);
    assertTransicao(estorno.status, 'negado');

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.solicitacaoEstorno.update({
        where: { id: estornoId },
        data: { status: 'negado', motivoNegativa, analisadoPor: atorId, decididoEm: new Date() },
      });
      await this.registrarTransicao(tx, estornoId, estorno.status, 'negado', atorId, motivoNegativa);

      await this.outbox.emit(tx, {
        eventName: EstornoEvents.EstornoNegado.name,
        source: SOURCE, tenantId, actor: { type: 'user', id: atorId },
        payload: { estornoId, pedidoId: estorno.pedidoId, motivoNegativa, negadoPor: atorId },
      });
      return atualizado;
    });
  }

  /**
   * Confirmação vinda da adquirente. Este é o evento que dispara a cascata:
   * reversão contábil, invalidação do QR, devolução de inventário, fechamento do SAC.
   */
  async confirmarProcessamento(
    tenantId: string,
    estornoId: string,
    input: { pagamentoId: string; produtorId: string; devolverInventario: boolean },
  ) {
    const estorno = await this.buscar(tenantId, estornoId);
    assertTransicao(estorno.status, 'concluido');
    if (!estorno.valorAprovado) throw new ForbiddenException('Estorno sem valor aprovado');

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.solicitacaoEstorno.update({
        where: { id: estornoId },
        data: { status: 'concluido', concluidoEm: new Date(), pagamentoId: input.pagamentoId },
      });
      await this.registrarTransicao(tx, estornoId, estorno.status, 'concluido', null);

      await this.outbox.emit(tx, {
        eventName: EstornoEvents.PagamentoEstornado.name,
        source: SOURCE, tenantId,
        payload: {
          estornoId,
          pedidoId: estorno.pedidoId,
          pagamentoId: input.pagamentoId,
          clienteId: estorno.clienteId,
          produtorId: input.produtorId,
          itensIds: estorno.itensIds,
          valorEstornado: { amount: toCents(estorno.valorAprovado), currency: 'BRL' },
          taxaRetida: { amount: estorno.taxaRetida ? toCents(estorno.taxaRetida) : 0, currency: 'BRL' },
          motivo: estorno.motivo,
          devolverInventario: input.devolverInventario,
          estornadoEm: new Date().toISOString(),
        },
      });

      return atualizado;
    });
  }

  private async registrarTransicao(
    tx: Prisma.TransactionClient,
    estornoId: string,
    de: StatusEstorno,
    para: StatusEstorno,
    atorId: string | null,
    observacao?: string,
  ) {
    await tx.transicaoEstorno.create({
      data: { estornoId, de, para, atorId, observacao: observacao ?? null },
    });
  }

  private async buscar(tenantId: string, id: string) {
    const e = await this.prisma.solicitacaoEstorno.findFirst({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Solicitação de estorno não encontrada');
    return e;
  }
}
