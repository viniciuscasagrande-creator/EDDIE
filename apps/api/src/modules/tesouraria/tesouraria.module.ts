import { Module } from '@nestjs/common';
import { TesourariaService } from './tesouraria.service';
import { TesourariaController } from './tesouraria.controller';

@Module({
  controllers: [TesourariaController],
  providers: [TesourariaService],
  exports: [TesourariaService],
})
export class TesourariaModule {}
