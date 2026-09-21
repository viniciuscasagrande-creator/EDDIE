import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Conecta de forma resiliente
    try {
      await this.$connect();
    } catch {
      // Defer connection if DB is offline during tests or build
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
