import { Module } from '@nestjs/common';
import { TesourariaService } from './tesouraria.service';
import { TesourariaController } from './tesouraria.controller';
import { PrismaModule } from '../../shared/prisma.module';
import { OutboxModule } from '../../shared/outbox/outbox.module';
import { DocumentosModule } from '../documentos/documentos.module';

@Module({
  imports: [PrismaModule, OutboxModule, DocumentosModule],
  controllers: [TesourariaController],
  providers: [TesourariaService],
  exports: [TesourariaService],
})
export class TesourariaModule {}
