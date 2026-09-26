import { Module } from '@nestjs/common';
import { RevenueAssuranceController } from './revenue-assurance.controller';
import { RevenueAssuranceService } from './revenue-assurance.service';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { EventosModule } from '../eventos/eventos.module';

@Module({
  imports: [FinanceiroModule, EventosModule],
  controllers: [RevenueAssuranceController],
  providers: [RevenueAssuranceService],
  exports: [RevenueAssuranceService],
})
export class RevenueAssuranceModule {}
