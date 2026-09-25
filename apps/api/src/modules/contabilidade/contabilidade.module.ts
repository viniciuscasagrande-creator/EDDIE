import { Module } from '@nestjs/common';
import { ContabilidadeController } from './contabilidade.controller';
import { ContabilidadeService } from './contabilidade.service';
import { ContabilidadePublicService } from './contabilidade.public-service';
import { ContabilidadeConsumer } from './contabilidade.consumer';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { FinanceiroModule } from '../financeiro/financeiro.module';

@Module({
  imports: [FinanceiroModule],
  controllers: [ContabilidadeController, AccountingController],
  providers: [
    ContabilidadeService,
    ContabilidadePublicService,
    ContabilidadeConsumer,
    AccountingService,
  ],
  // Porta pública: outros módulos consomem exclusivamente ContabilidadePublicService e AccountingService
  exports: [ContabilidadePublicService, AccountingService],
})
export class ContabilidadeModule {}
