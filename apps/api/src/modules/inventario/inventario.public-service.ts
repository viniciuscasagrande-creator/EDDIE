import { Injectable } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import {
  ConfirmHoldDto,
  CreateHoldDto,
  HoldDetailDto,
  PoolStatusDto,
  ReleaseHoldDto,
} from './inventario.types';

@Injectable()
export class InventarioPublicService {
  constructor(private readonly service: InventarioService) {}

  /**
   * Cria uma reserva temporária (Hold) com TTL de 10 minutos.
   */
  async criarHold(dto: CreateHoldDto, tenantId?: string): Promise<HoldDetailDto> {
    return this.service.createHold(dto, tenantId);
  }

  /**
   * Confirma a reserva quando o pedido/pagamento é concluído.
   */
  async confirmarHold(holdId: string, dto: ConfirmHoldDto): Promise<HoldDetailDto> {
    return this.service.confirmHold(holdId, dto);
  }

  /**
   * Libera voluntariamente a reserva (abandono de checkout ou cancelamento).
   */
  async liberarHold(holdId: string, dto?: ReleaseHoldDto): Promise<HoldDetailDto> {
    return this.service.releaseHold(holdId, dto);
  }

  /**
   * Consulta disponibilidade de capacidade de um lote/setor em tempo real.
   */
  async consultarDisponibilidade(loteId: string, setorId?: string): Promise<PoolStatusDto> {
    return this.service.getPoolAvailability(loteId, setorId);
  }

  /**
   * Consulta os dados e tempo restante do Hold.
   */
  async consultarHold(holdId: string): Promise<HoldDetailDto> {
    return this.service.getHold(holdId);
  }

  /**
   * Processa expiração de holds vencidos (usado pelo scheduler/cron).
   */
  async expirarHoldsVencidos(tenantId?: string): Promise<{ expiradas: number; detalhes: string[] }> {
    return this.service.expireHolds(tenantId);
  }
}
