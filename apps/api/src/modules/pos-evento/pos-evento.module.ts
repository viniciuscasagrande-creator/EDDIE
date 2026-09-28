import { Module } from '@nestjs/common';
import { PosEventoService } from './pos-evento.service';
import { PosEventoPublicService } from './pos-evento.public-service';
import { PosEventoController } from './pos-evento.controller';

@Module({
  controllers: [PosEventoController],
  providers: [PosEventoService, PosEventoPublicService],
  exports: [PosEventoService, PosEventoPublicService],
})
export class PosEventoModule {}
