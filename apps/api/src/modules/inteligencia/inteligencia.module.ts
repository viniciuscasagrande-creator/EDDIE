import { Module } from '@nestjs/common';
import { InteligenciaService } from './inteligencia.service';
import { InteligenciaPublicService } from './inteligencia.public-service';
import { InteligenciaController } from './inteligencia.controller';

@Module({
  controllers: [InteligenciaController],
  providers: [InteligenciaService, InteligenciaPublicService],
  exports: [InteligenciaService, InteligenciaPublicService],
})
export class InteligenciaModule {}
