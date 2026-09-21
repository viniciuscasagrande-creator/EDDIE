import { Controller, Get, Headers } from '@nestjs/common';
import { IngressoCompradorDto } from './tickets.dto';

@Controller('my-tickets')
export class TicketsController {
  @Get()
  async listarMeusIngressos(
    @Headers('authorization') authHeader?: string,
  ): Promise<IngressoCompradorDto[]> {
    // Valida token de comprador e busca ingressos via AcessoPublicService
    return [];
  }
}
