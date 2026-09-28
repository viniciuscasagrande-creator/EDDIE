// apps/api/src/modules/financial-risk/financial-risk.module.ts
// EDDIE 11.27 — Financial Risk, Controls & Exposure OS Module

import { Module } from '@nestjs/common';
import { FinancialRiskController } from './financial-risk.controller';
import { FinancialRiskService } from './financial-risk.service';
import { PrismaModule } from '../../shared/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialRiskController],
  providers: [FinancialRiskService],
  exports: [FinancialRiskService],
})
export class FinancialRiskModule {}
