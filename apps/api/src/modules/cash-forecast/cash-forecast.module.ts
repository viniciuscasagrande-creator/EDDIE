// apps/api/src/modules/cash-forecast/cash-forecast.module.ts
// EDDIE 11.26 — Cash Forecast, Liquidity & Working Capital OS Module

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma.module';
import { CashForecastController } from './cash-forecast.controller';
import { CashForecastService } from './cash-forecast.service';

@Module({
  imports: [PrismaModule],
  controllers: [CashForecastController],
  providers: [CashForecastService],
  exports: [CashForecastService],
})
export class CashForecastModule {}
