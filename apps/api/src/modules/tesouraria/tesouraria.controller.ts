import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TesourariaService } from './tesouraria.service';
import { GerarRemessaDto, ProcessarRetornoDto, ExecutarPixDto } from './tesouraria.types';

@Controller('tesouraria')
export class TesourariaController {
  constructor(private readonly tesourariaService: TesourariaService) {}

  @Get('posicao')
  async getPosicaoConsolidada() {
    return this.tesourariaService.getPosicaoConsolidada();
  }

  @Get('contas')
  async listarContas() {
    return this.tesourariaService.listarContas();
  }

  @Get('remessas')
  async listarLotesCnab() {
    return this.tesourariaService.listarLotesCnab();
  }

  @Get('remessas/:id')
  async obterLotePorId(@Param('id') id: string) {
    return this.tesourariaService.obterLotePorId(id);
  }

  @Post('remessas/gerar')
  async gerarRemessaCnab(@Body() dados: GerarRemessaDto) {
    return this.tesourariaService.gerarRemessaCnab(dados);
  }

  @Post('retornos/processar')
  async processarArquivoRetornoCnab(@Body() dados: ProcessarRetornoDto) {
    return this.tesourariaService.processarArquivoRetornoCnab(dados);
  }

  @Get('pix/payouts')
  async listarPixPayouts() {
    return this.tesourariaService.listarPixPayouts();
  }

  @Post('pix/executar')
  async executarPixPayout(@Body() dados: ExecutarPixDto) {
    return this.tesourariaService.executarPixPayout(dados);
  }
}
