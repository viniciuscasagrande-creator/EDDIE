import { Module } from '@nestjs/common';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosPublicService } from './pagamentos.public-service';
import { PagamentosService } from './pagamentos.service';

@Module({
  controllers: [PagamentosController],
  providers: [PagamentosService, PagamentosPublicService],
  exports: [PagamentosService, PagamentosPublicService],
})
export class PagamentosModule {}
