import { Module } from '@nestjs/common';
import { TesourariaService } from './tesouraria.service';
import { TesourariaController } from './tesouraria.controller';
import { PrismaModule } from '../../shared/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TesourariaController],
  providers: [TesourariaService],
  exports: [TesourariaService],
})
export class TesourariaModule {}
