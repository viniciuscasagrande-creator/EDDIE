export type InventoryItemStatus = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'BLOQUEADO' | 'CORTESIA';

export type HoldStatus = 'ATIVA' | 'EXPIRADA' | 'CONVERTIDA_EM_PEDIDO' | 'LIBERADA_MANUALMENTE';

export interface HoldItemInputDto {
  loteId: string;
  setorId: string;
  assento?: string | null;
  quantidade: number;
  precoFace: number;
  taxaConveniencia: number;
}

export interface CreateHoldDto {
  clienteId?: string | null;
  sessaoCarrinhoId?: string | null;
  itens: HoldItemInputDto[];
  ttlSegundos?: number; // Padrão: 600 segundos (10 minutos)
}

export interface ConfirmHoldDto {
  pedidoId: string;
}

export interface ReleaseHoldDto {
  motivo?: string;
}

export interface InitPoolDto {
  eventoId: string;
  sessaoId: string;
  setorId: string;
  loteId: string;
  capacidadeTotal: number;
  assentos?: string[];
}

export interface PoolStatusDto {
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

export interface HoldItemDetailDto {
  id: string;
  poolId: string;
  loteId: string;
  setorId: string;
  assento?: string | null;
  quantidade: number;
  precoFace: number;
  taxaConveniencia: number;
}

export interface HoldDetailDto {
  id: string;
  clienteId?: string | null;
  sessaoCarrinhoId?: string | null;
  status: HoldStatus;
  criadoEm: string;
  expiraEm: string;
  tempoRestanteSegundos: number;
  itens: HoldItemDetailDto[];
  pedidoId?: string | null;
}
