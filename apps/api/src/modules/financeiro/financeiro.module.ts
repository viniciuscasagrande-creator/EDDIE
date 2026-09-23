import { Module } from '@nestjs/common';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroPublicService } from './financeiro.public-service';
import { FinanceiroConsumer } from './financeiro.consumer';
import { EventosModule } from '../eventos/eventos.module';

import { ConciliacaoController } from './conciliacao.controller';

@Module({
  imports: [EventosModule],
  controllers: [FinanceiroController, ConciliacaoController],
  providers: [
    FinanceiroService,
    FinanceiroPublicService,
    FinanceiroConsumer,
  ],
  // Porta pública: outros módulos consomem exclusivamente FinanceiroPublicService
  exports: [FinanceiroPublicService],
})
export class FinanceiroModule {}
