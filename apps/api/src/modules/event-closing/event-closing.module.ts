// apps/api/src/modules/event-closing/event-closing.module.ts
// EDDIE 11.24 — Event Closing & Producer Settlement Module

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma.module';
import { EventClosingController } from './event-closing.controller';
import { EventClosingService } from './event-closing.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventClosingController],
  providers: [EventClosingService],
  exports: [EventClosingService],
})
export class EventClosingModule {}
