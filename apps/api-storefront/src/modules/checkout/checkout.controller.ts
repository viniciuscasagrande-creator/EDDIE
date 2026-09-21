import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CriarPedidoCheckoutInput,
  PedidoCheckoutResponseDto,
  StatusPedidoPublicDto,
} from './checkout.dto';

@Controller('checkout')
export class CheckoutController {
  @Post('order')
  async criarPedidoEPagar(
    @Body() input: CriarPedidoCheckoutInput,
  ): Promise<PedidoCheckoutResponseDto> {
    // Encaminha para PagamentosPublicService.processarCheckout
    // O pedido nasce dentro de transação no módulo interno e emite pedido.criado.v1
    return {} as PedidoCheckoutResponseDto;
  }

  @Get('order/:orderId/status')
  async consultarStatusPagamento(
    @Param('orderId') orderId: string,
  ): Promise<StatusPedidoPublicDto> {
    // Polling do comprador para detecção de Pix pago em tempo real
    return {
      pedidoId: orderId,
      status: 'AGUARDANDO_PAGAMENTO',
    };
  }
}
