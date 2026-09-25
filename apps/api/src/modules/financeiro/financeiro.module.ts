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
import { ControlTowerController } from './control-tower.controller';
import { ControlTowerService } from './control-tower.service';

@Module({
  imports: [EventosModule],
  controllers: [
    FinanceiroController,
    ConciliacaoController,
    FinancialEngineEventController,
    FinancialEngineProducerController,
    ControlTowerController,
  ],
  providers: [
    FinanceiroService,
    FinanceiroPublicService,
    FinanceiroConsumer,
    FinancialEngineService,
    ControlTowerService,
  ],
  // Porta pública: outros módulos consomem exclusivamente FinanceiroPublicService e FinancialEngineService
  exports: [FinanceiroPublicService, FinancialEngineService, ControlTowerService],
})
export class FinanceiroModule {}

