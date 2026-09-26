import { Module } from '@nestjs/common';
import { ProducerPortalController } from './producer-portal.controller';
import { ProducerPortalService } from './producer-portal.service';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { PrismaModule } from '../../shared/prisma.module';
import { OutboxModule } from '../../shared/outbox/outbox.module';

@Module({
  imports: [FinanceiroModule, PrismaModule, OutboxModule],
  controllers: [ProducerPortalController],
  providers: [ProducerPortalService],
  exports: [ProducerPortalService],
})
export class ProducerPortalModule {}
