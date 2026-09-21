import { Module } from '@nestjs/common';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroPublicService } from './financeiro.public-service';
import { FinanceiroConsumer } from './financeiro.consumer';
import { EventosModule } from '../eventos/eventos.module';

@Module({
  imports: [EventosModule],
  controllers: [FinanceiroController],
  providers: [
    FinanceiroService,
    FinanceiroPublicService,
    FinanceiroConsumer,
  ],
  // Porta pública: outros módulos consomem exclusivamente FinanceiroPublicService
  exports: [FinanceiroPublicService],
})
export class FinanceiroModule {}
