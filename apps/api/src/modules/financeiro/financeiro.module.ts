import { Module } from '@nestjs/common';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroPublicService } from './financeiro.public-service';
import { FinanceiroConsumer } from './financeiro.consumer';
import { EventosModule } from '../eventos/eventos.module';
import { ConciliacaoController } from './conciliacao.controller';
import {
  FinancialEngineEventController,
  FinancialEngineProducerController,
} from './financial-engine.controller';
import { FinancialEngineService } from './financial-engine.service';

@Module({
  imports: [EventosModule],
  controllers: [
    FinanceiroController,
    ConciliacaoController,
    FinancialEngineEventController,
    FinancialEngineProducerController,
  ],
  providers: [
    FinanceiroService,
    FinanceiroPublicService,
    FinanceiroConsumer,
    FinancialEngineService,
  ],
  // Porta pública: outros módulos consomem exclusivamente FinanceiroPublicService e FinancialEngineService
  exports: [FinanceiroPublicService, FinancialEngineService],
})
export class FinanceiroModule {}

