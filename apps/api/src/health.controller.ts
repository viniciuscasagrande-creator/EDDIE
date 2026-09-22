import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './shared/prisma.module';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async health() {
    const startedAt = Date.now();
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 1500)),
      ]);
      return {
        status: 'ok',
        service: 'eddie-api',
        database: 'online',
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'degraded',
        service: 'eddie-api',
        database: 'offline',
        latencyMs: Date.now() - startedAt,
        reason: error instanceof Error ? error.message : 'DATABASE_UNAVAILABLE',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('live')
  live() {
    return { status: 'ok', service: 'eddie-api', timestamp: new Date().toISOString() };
  }
}
