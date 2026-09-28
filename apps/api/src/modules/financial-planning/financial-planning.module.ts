// apps/api/src/modules/financial-planning/financial-planning.module.ts
// EDDIE 11.28 — FP&A, Budgeting & Multi-Year Financial Planning Module

import { Module } from '@nestjs/common';
import { FinancialPlanningController } from './financial-planning.controller';
import { FinancialPlanningService } from './financial-planning.service';
import { PrismaModule } from '../../shared/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialPlanningController],
  providers: [FinancialPlanningService],
  exports: [FinancialPlanningService],
})
export class FinancialPlanningModule {}
