// apps/api/src/modules/dashboard/dashboard.module.ts
// EDDIE — Super Dashboard & Centro de Comando 360º Module

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
