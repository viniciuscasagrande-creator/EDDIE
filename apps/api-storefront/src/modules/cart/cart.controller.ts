import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import {
  CriarReservaInput,
  AplicarCupomInput,
  ReservaCriadaDto,
} from './cart.dto';

@Controller('cart')
export class CartController {
  @Post('reserve')
  async criarReservaTemporaria(
    @Body() input: CriarReservaInput,
  ): Promise<ReservaCriadaDto> {
    // Chama porta pública do Inventário (InventarioPublicService.criarReservaComTtl)
    // NUNCA trava concorrência com SQL direto — a verdade do TTL vive no Redis
    return {} as ReservaCriadaDto;
  }

  @Delete('reserve/:reservaId')
  async liberarReserva(
    @Param('reservaId') reservaId: string,
  ): Promise<{ liberada: boolean }> {
    // Chama porta pública do Inventário para liberação antecipada no Redis
    return { liberada: true };
  }

  @Post('apply-coupon')
  async aplicarCupom(
    @Body() input: AplicarCupomInput,
  ): Promise<ReservaCriadaDto> {
    // Validação de cupom e recálculo da reserva
    return {} as ReservaCriadaDto;
  }
}
