import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import {
  ConfirmHoldDto,
  CreateHoldDto,
  HoldDetailDto,
  HoldItemDetailDto,
  HoldStatus,
  InitPoolDto,
  InventoryItemStatus,
  PoolStatusDto,
  ReleaseHoldDto,
} from './inventario.types';

export interface InternalPool {
  id: string;
  eventoId: string;
  sessaoId: string;
  setorId: string;
  loteId: string;
  capacidadeTotal: number;
  capacidadeDisponivel: number;
  capacidadeReservada: number;
  capacidadeVendida: number;
  capacidadeBloqueada: number;
  versaoLock: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface InternalHoldItem {
  id: string;
  holdId: string;
  poolId: string;
  loteId: string;
  setorId: string;
  assento?: string | null;
  quantidade: number;
  precoFace: number;
  taxaConveniencia: number;
}

export interface InternalHold {
  id: string;
  clienteId?: string | null;
  sessaoCarrinhoId?: string | null;
  status: HoldStatus;
  criadoEm: string;
  expiraEm: string;
  pedidoId?: string | null;
  itens: InternalHoldItem[];
}

export interface InternalItem {
  id: string;
  poolId: string;
  eventoId: string;
  sessaoId: string;
  setorId: string;
  loteId: string;
  assento?: string | null;
  status: InventoryItemStatus;
  holdId?: string | null;
  versaoLock: number;
  criadoEm: string;
  atualizadoEm: string;
}

const DEFAULT_POOLS_SEED: InternalPool[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    eventoId: '00000000-0000-0000-0000-000000000010',
    sessaoId: '00000000-0000-0000-0000-000000000020',
    setorId: '00000000-0000-0000-0000-000000000030',
    loteId: '00000000-0000-0000-0000-000000000040',
    capacidadeTotal: 1000,
    capacidadeDisponivel: 850,
    capacidadeReservada: 50,
    capacidadeVendida: 100,
    capacidadeBloqueada: 0,
    versaoLock: 1,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    eventoId: '00000000-0000-0000-0000-000000000010',
    sessaoId: '00000000-0000-0000-0000-000000000020',
    setorId: '00000000-0000-0000-0000-000000000031',
    loteId: '00000000-0000-0000-0000-000000000041',
    capacidadeTotal: 500,
    capacidadeDisponivel: 500,
    capacidadeReservada: 0,
    capacidadeVendida: 0,
    capacidadeBloqueada: 0,
    versaoLock: 0,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];

@Injectable()
export class InventarioService {
  private readonly logger = new Logger(InventarioService.name);

  private pools: InternalPool[] = [];
  private holds: InternalHold[] = [];
  private items: InternalItem[] = [];

  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly outbox?: OutboxService,
  ) {
    this.pools = DEFAULT_POOLS_SEED.map((p) => ({ ...p }));
    // Seed seated items for sector 30
    for (let i = 1; i <= 20; i++) {
      this.items.push({
        id: randomUUID(),
        poolId: '00000000-0000-0000-0000-000000000101',
        eventoId: '00000000-0000-0000-0000-000000000010',
        sessaoId: '00000000-0000-0000-0000-000000000020',
        setorId: '00000000-0000-0000-0000-000000000030',
        loteId: '00000000-0000-0000-0000-000000000040',
        assento: `A-${i}`,
        status: i <= 2 ? 'VENDIDO' : 'DISPONIVEL',
        holdId: null,
        versaoLock: 0,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });
    }
  }

  private db(): any {
    return this.prisma as any;
  }

  async initPool(dto: InitPoolDto): Promise<PoolStatusDto> {
    let pool = this.pools.find(
      (p) => p.loteId === dto.loteId && p.setorId === dto.setorId,
    );

    if (pool) {
      pool.capacidadeTotal = dto.capacidadeTotal;
      pool.capacidadeDisponivel =
        dto.capacidadeTotal -
        pool.capacidadeReservada -
        pool.capacidadeVendida -
        pool.capacidadeBloqueada;
      pool.versaoLock += 1;
      pool.atualizadoEm = new Date().toISOString();
    } else {
      pool = {
        id: randomUUID(),
        eventoId: dto.eventoId,
        sessaoId: dto.sessaoId,
        setorId: dto.setorId,
        loteId: dto.loteId,
        capacidadeTotal: dto.capacidadeTotal,
        capacidadeDisponivel: dto.capacidadeTotal,
        capacidadeReservada: 0,
        capacidadeVendida: 0,
        capacidadeBloqueada: 0,
        versaoLock: 0,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      this.pools.push(pool);
    }

    if (dto.assentos && dto.assentos.length > 0) {
      for (const assento of dto.assentos) {
        const existingItem = this.items.find(
          (i) => i.poolId === pool?.id && i.assento === assento,
        );
        if (!existingItem) {
          this.items.push({
            id: randomUUID(),
            poolId: pool.id,
            eventoId: dto.eventoId,
            sessaoId: dto.sessaoId,
            setorId: dto.setorId,
            loteId: dto.loteId,
            assento,
            status: 'DISPONIVEL',
            holdId: null,
            versaoLock: 0,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          });
        }
      }
    }

    if (this.prisma) {
      try {
        await this.db().inventoryPool.upsert({
          where: {
            loteId_setorId: {
              loteId: dto.loteId,
              setorId: dto.setorId,
            },
          },
          update: {
            capacidadeTotal: pool.capacidadeTotal,
            capacidadeDisponivel: pool.capacidadeDisponivel,
            versaoLock: { increment: 1 },
          },
          create: {
            id: pool.id,
            eventoId: pool.eventoId,
            sessaoId: pool.sessaoId,
            setorId: pool.setorId,
            loteId: pool.loteId,
            capacidadeTotal: pool.capacidadeTotal,
            capacidadeDisponivel: pool.capacidadeDisponivel,
            capacidadeReservada: pool.capacidadeReservada,
            capacidadeVendida: pool.capacidadeVendida,
            capacidadeBloqueada: pool.capacidadeBloqueada,
            versaoLock: 0,
          },
        });
      } catch (err) {
        this.logger.debug(`[Inventario] Persistência do pool em segundo plano: ${err}`);
      }
    }

    return { ...pool };
  }

  async createHold(
    dto: CreateHoldDto,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<HoldDetailDto> {
    if (!dto.itens || dto.itens.length === 0) {
      throw new BadRequestException('A reserva precisa de pelo menos 1 item');
    }

    // 1. Validar capacidade e disponibilidade de assentos para todos os itens
    for (const item of dto.itens) {
      if (item.quantidade <= 0) {
        throw new BadRequestException('Quantidade do item deve ser positiva');
      }

      const pool = this.pools.find(
        (p) => p.loteId === item.loteId && p.setorId === item.setorId,
      );

      if (!pool) {
        throw new NotFoundException(
          `Pool de inventário não encontrado para lote ${item.loteId} e setor ${item.setorId}`,
        );
      }

      if (pool.capacidadeDisponivel < item.quantidade) {
        throw new BadRequestException(
          `Capacidade insuficiente no pool. Disponível: ${pool.capacidadeDisponivel}, Solicitado: ${item.quantidade}`,
        );
      }

      // Validação de assento se especificado
      if (item.assento) {
        const itemAssento = this.items.find(
          (i) => i.poolId === pool.id && i.assento === item.assento,
        );

        if (itemAssento && itemAssento.status !== 'DISPONIVEL') {
          throw new ConflictException(
            `O assento '${item.assento}' não está disponível (Status: ${itemAssento.status})`,
          );
        }
      }
    }

    // 2. Criar Hold com TTL de 10 minutos (padrão 600 segundos)
    const holdId = randomUUID();
    const ttlSegundos = dto.ttlSegundos ?? 600;
    const criadoEmDate = new Date();
    const expiraEmDate = new Date(criadoEmDate.getTime() + ttlSegundos * 1000);

    const holdItems: InternalHoldItem[] = [];

    // 3. Atualizar atomicamente pools e itens
    for (const item of dto.itens) {
      const pool = this.pools.find(
        (p) => p.loteId === item.loteId && p.setorId === item.setorId,
      )!;

      pool.capacidadeDisponivel -= item.quantidade;
      pool.capacidadeReservada += item.quantidade;
      pool.versaoLock += 1;
      pool.atualizadoEm = new Date().toISOString();

      const holdItemId = randomUUID();
      holdItems.push({
        id: holdItemId,
        holdId,
        poolId: pool.id,
        loteId: item.loteId,
        setorId: item.setorId,
        assento: item.assento ?? null,
        quantidade: item.quantidade,
        precoFace: item.precoFace,
        taxaConveniencia: item.taxaConveniencia,
      });

      // Se for assento específico, vincular item existente ou criar
      if (item.assento) {
        let seatItem = this.items.find(
          (i) => i.poolId === pool.id && i.assento === item.assento,
        );
        if (seatItem) {
          seatItem.status = 'RESERVADO';
          seatItem.holdId = holdId;
          seatItem.versaoLock += 1;
          seatItem.atualizadoEm = new Date().toISOString();
        } else {
          this.items.push({
            id: randomUUID(),
            poolId: pool.id,
            eventoId: pool.eventoId,
            sessaoId: pool.sessaoId,
            setorId: pool.setorId,
            loteId: pool.loteId,
            assento: item.assento,
            status: 'RESERVADO',
            holdId,
            versaoLock: 1,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          });
        }
      }
    }

    const hold: InternalHold = {
      id: holdId,
      clienteId: dto.clienteId ?? null,
      sessaoCarrinhoId: dto.sessaoCarrinhoId ?? null,
      status: 'ATIVA',
      criadoEm: criadoEmDate.toISOString(),
      expiraEm: expiraEmDate.toISOString(),
      pedidoId: null,
      itens: holdItems,
    };

    this.holds.push(hold);

    // 4. Gravar no Outbox o evento inventario.reserva_criada.v1
    const outboxPayload = {
      reservaId: holdId,
      clienteId: hold.clienteId,
      itens: hold.itens.map((i) => ({
        itemId: i.id,
        loteId: i.loteId,
        sessaoId: this.pools.find((p) => p.id === i.poolId)?.sessaoId ?? randomUUID(),
        setorId: i.setorId,
        assento: i.assento ?? null,
        tipo: 'inteira',
        precoFace: i.precoFace,
        taxaConveniencia: i.taxaConveniencia,
        desconto: 0,
      })),
      expiraEm: hold.expiraEm,
    };

    if (this.prisma) {
      try {
        await this.db().inventoryHold.create({
          data: {
            id: hold.id,
            clienteId: hold.clienteId,
            sessaoCarrinhoId: hold.sessaoCarrinhoId,
            status: hold.status,
            criadoEm: new Date(hold.criadoEm),
            expiraEm: new Date(hold.expiraEm),
            itens: {
              create: hold.itens.map((it) => ({
                id: it.id,
                poolId: it.poolId,
                loteId: it.loteId,
                setorId: it.setorId,
                assento: it.assento,
                quantidade: it.quantidade,
                precoFace: it.precoFace,
                taxaConveniencia: it.taxaConveniencia,
              })),
            },
          },
        });

        if (this.outbox) {
          await this.outbox.emit(this.db(), {
            eventName: 'inventario.reserva_criada.v1',
            source: 'inventario',
            tenantId,
            correlationId: holdId,
            payload: outboxPayload,
          });
        }
      } catch (err) {
        this.logger.debug(`[Inventario] Persistência do hold em segundo plano: ${err}`);
      }
    }

    this.logger.log(
      `[Inventario] Hold criado: ${holdId} com TTL de ${ttlSegundos}s (${hold.itens.length} itens)`,
    );

    return this.mapToHoldDetail(hold);
  }

  async confirmHold(holdId: string, dto: ConfirmHoldDto): Promise<HoldDetailDto> {
    const hold = this.holds.find((h) => h.id === holdId);
    if (!hold) {
      throw new NotFoundException(`Reserva/Hold ${holdId} não encontrado`);
    }

    if (hold.status !== 'ATIVA') {
      throw new BadRequestException(
        `Reserva não está ativa para confirmação (Status atual: ${hold.status})`,
      );
    }

    // Verificar se não expirou antes de confirmar
    if (new Date() > new Date(hold.expiraEm)) {
      await this.expireSingleHold(hold);
      throw new BadRequestException(
        'Reserva expirada pelo tempo limite de 10 minutos de retenção no carrinho',
      );
    }

    // Promover status para CONVERTIDA_EM_PEDIDO
    hold.status = 'CONVERTIDA_EM_PEDIDO';
    hold.pedidoId = dto.pedidoId;

    // Atualizar capacidades nos pools: de RESERVADA para VENDIDA
    for (const item of hold.itens) {
      const pool = this.pools.find((p) => p.id === item.poolId);
      if (pool) {
        pool.capacidadeReservada = Math.max(0, pool.capacidadeReservada - item.quantidade);
        pool.capacidadeVendida += item.quantidade;
        pool.versaoLock += 1;
        pool.atualizadoEm = new Date().toISOString();
      }

      // Se havia assento vinculado, marcar como VENDIDO
      const seatItem = this.items.find(
        (i) => i.holdId === holdId && i.assento === item.assento,
      );
      if (seatItem) {
        seatItem.status = 'VENDIDO';
        seatItem.versaoLock += 1;
        seatItem.atualizadoEm = new Date().toISOString();
      }
    }

    if (this.prisma) {
      try {
        await this.db().inventoryHold.update({
          where: { id: holdId },
          data: {
            status: hold.status,
            pedidoId: dto.pedidoId,
          },
        });
      } catch (err) {
        this.logger.debug(`[Inventario] Confirmação do hold em segundo plano: ${err}`);
      }
    }

    this.logger.log(`[Inventario] Hold ${holdId} convertido no pedido ${dto.pedidoId}`);
    return this.mapToHoldDetail(hold);
  }

  async releaseHold(holdId: string, dto?: ReleaseHoldDto): Promise<HoldDetailDto> {
    const hold = this.holds.find((h) => h.id === holdId);
    if (!hold) {
      throw new NotFoundException(`Reserva/Hold ${holdId} não encontrado`);
    }

    if (hold.status !== 'ATIVA') {
      return this.mapToHoldDetail(hold);
    }

    hold.status = 'LIBERADA_MANUALMENTE';

    // Reverter capacidade para disponível
    for (const item of hold.itens) {
      const pool = this.pools.find((p) => p.id === item.poolId);
      if (pool) {
        pool.capacidadeReservada = Math.max(0, pool.capacidadeReservada - item.quantidade);
        pool.capacidadeDisponivel += item.quantidade;
        pool.versaoLock += 1;
        pool.atualizadoEm = new Date().toISOString();
      }

      // Liberar assento vinculado
      const seatItem = this.items.find((i) => i.holdId === holdId);
      if (seatItem) {
        seatItem.status = 'DISPONIVEL';
        seatItem.holdId = null;
        seatItem.versaoLock += 1;
        seatItem.atualizadoEm = new Date().toISOString();
      }
    }

    if (this.prisma) {
      try {
        await this.db().inventoryHold.update({
          where: { id: holdId },
          data: { status: hold.status },
        });
      } catch (err) {
        this.logger.debug(`[Inventario] Liberação do hold em segundo plano: ${err}`);
      }
    }

    this.logger.log(
      `[Inventario] Hold ${holdId} liberado manualmente. Motivo: ${dto?.motivo ?? 'Cancelamento'}`,
    );

    return this.mapToHoldDetail(hold);
  }

  async expireHolds(tenantId = '00000000-0000-0000-0000-000000000001'): Promise<{
    expiradas: number;
    detalhes: string[];
  }> {
    const agora = new Date();
    const expiredHolds = this.holds.filter(
      (h) => h.status === 'ATIVA' && agora > new Date(h.expiraEm),
    );

    const detalhes: string[] = [];

    for (const hold of expiredHolds) {
      await this.expireSingleHold(hold, tenantId);
      detalhes.push(hold.id);
    }

    if (expiredHolds.length > 0) {
      this.logger.log(
        `[Inventario] Processamento de expiração de holds: ${expiredHolds.length} reservas liberadas`,
      );
    }

    return { expiradas: expiredHolds.length, detalhes };
  }

  private async expireSingleHold(
    hold: InternalHold,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<void> {
    hold.status = 'EXPIRADA';

    let valorTotalPerdido = 0;

    for (const item of hold.itens) {
      valorTotalPerdido += (item.precoFace + item.taxaConveniencia) * item.quantidade;

      const pool = this.pools.find((p) => p.id === item.poolId);
      if (pool) {
        pool.capacidadeReservada = Math.max(0, pool.capacidadeReservada - item.quantidade);
        pool.capacidadeDisponivel += item.quantidade;
        pool.versaoLock += 1;
        pool.atualizadoEm = new Date().toISOString();
      }

      const seatItem = this.items.find((i) => i.holdId === hold.id);
      if (seatItem) {
        seatItem.status = 'DISPONIVEL';
        seatItem.holdId = null;
        seatItem.versaoLock += 1;
        seatItem.atualizadoEm = new Date().toISOString();
      }
    }

    const outboxPayload = {
      reservaId: hold.id,
      clienteId: hold.clienteId,
      itens: hold.itens.map((i) => ({
        itemId: i.id,
        loteId: i.loteId,
        sessaoId: this.pools.find((p) => p.id === i.poolId)?.sessaoId ?? randomUUID(),
        setorId: i.setorId,
        assento: i.assento ?? null,
        tipo: 'inteira',
        precoFace: i.precoFace,
        taxaConveniencia: i.taxaConveniencia,
        desconto: 0,
      })),
      valorPerdido: valorTotalPerdido,
    };

    if (this.prisma) {
      try {
        await this.db().inventoryHold.update({
          where: { id: hold.id },
          data: { status: 'EXPIRADA' },
        });

        if (this.outbox) {
          await this.outbox.emit(this.db(), {
            eventName: 'inventario.reserva_expirada.v1',
            source: 'inventario',
            tenantId,
            correlationId: hold.id,
            payload: outboxPayload,
          });
        }
      } catch (err) {
        this.logger.debug(`[Inventario] Expiração de hold em segundo plano: ${err}`);
      }
    }
  }

  async getHold(holdId: string): Promise<HoldDetailDto> {
    const hold = this.holds.find((h) => h.id === holdId);
    if (!hold) {
      throw new NotFoundException(`Reserva/Hold ${holdId} não encontrado`);
    }

    // Se estiver ativa mas o tempo passou, expira imediatamente
    if (hold.status === 'ATIVA' && new Date() > new Date(hold.expiraEm)) {
      await this.expireSingleHold(hold);
    }

    return this.mapToHoldDetail(hold);
  }

  async getPoolAvailability(loteId: string, setorId?: string): Promise<PoolStatusDto> {
    const pool = this.pools.find(
      (p) => p.loteId === loteId && (!setorId || p.setorId === setorId),
    );

    if (!pool) {
      throw new NotFoundException(`Pool não encontrado para o lote ${loteId}`);
    }

    return { ...pool };
  }

  async listPools(eventoId?: string): Promise<PoolStatusDto[]> {
    if (eventoId) {
      return this.pools.filter((p) => p.eventoId === eventoId).map((p) => ({ ...p }));
    }
    return this.pools.map((p) => ({ ...p }));
  }

  private mapToHoldDetail(hold: InternalHold): HoldDetailDto {
    const agora = Date.now();
    const expira = new Date(hold.expiraEm).getTime();
    const restante = Math.max(0, Math.floor((expira - agora) / 1000));

    return {
      id: hold.id,
      clienteId: hold.clienteId,
      sessaoCarrinhoId: hold.sessaoCarrinhoId,
      status: hold.status,
      criadoEm: hold.criadoEm,
      expiraEm: hold.expiraEm,
      tempoRestanteSegundos: restante,
      itens: hold.itens.map((i) => ({
        id: i.id,
        poolId: i.poolId,
        loteId: i.loteId,
        setorId: i.setorId,
        assento: i.assento,
        quantidade: i.quantidade,
        precoFace: i.precoFace,
        taxaConveniencia: i.taxaConveniencia,
      })),
      pedidoId: hold.pedidoId,
    };
  }
}
