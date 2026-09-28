import {
  Controller,
  Get,
  HttpStatus,
  HttpException,
  Headers,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './shared/prisma.module';
import { randomUUID } from 'node:crypto';

@ApiTags('health')
@Controller()
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get(['health', 'api/health'])
  @ApiOperation({ summary: 'Verifica saúde geral do serviço e dependências' })
  async health(@Headers('x-correlation-id') correlationIdHeader?: string) {
    const correlationId = correlationIdHeader || randomUUID();
    const probeStart = Date.now();

    let dbStatus: 'online' | 'offline' = 'online';
    let dbLatencyMs = 0;
    let dbError: string | null = null;

    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 2000),
        ),
      ]);
      dbLatencyMs = Date.now() - probeStart;
    } catch (err) {
      dbStatus = 'offline';
      dbLatencyMs = Date.now() - probeStart;
      dbError = err instanceof Error ? err.message : 'DATABASE_UNAVAILABLE';
    }

    const isHealthy = dbStatus === 'online';
    const responsePayload = {
      status: isHealthy ? 'ok' : 'degraded',
      code: isHealthy ? undefined : 'DATABASE_UNAVAILABLE',
      service: 'eddie-api',
      version: '1.0',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };

    if (!isHealthy) {
      throw new HttpException(responsePayload, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return responsePayload;
  }

  @Get(['ready', 'api/ready', 'health/ready'])
  @ApiOperation({ summary: 'Readiness probe para Kubernetes/Load Balancer (retorna 503 se DB offline)' })
  async ready(@Headers('x-correlation-id') correlationIdHeader?: string) {
    const correlationId = correlationIdHeader || randomUUID();
    const probeStart = Date.now();

    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 2000),
        ),
      ]);
      const latencyMs = Date.now() - probeStart;

      return {
        status: 'ready',
        service: 'eddie-api',
        database: 'online',
        latencyMs,
        correlationId,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const latencyMs = Date.now() - probeStart;
      throw new HttpException(
        {
          status: 'unhealthy',
          code: 'DATABASE_UNAVAILABLE',
          service: 'eddie-api',
          database: 'offline',
          latencyMs,
          message: 'Banco de dados inacessível ou tempo limite esgotado.',
          error: err instanceof Error ? err.message : 'DATABASE_UNAVAILABLE',
          correlationId,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(['live', 'api/live', 'health/live'])
  @ApiOperation({ summary: 'Liveness probe rápida sem checagem de I/O' })
  live(@Headers('x-correlation-id') correlationIdHeader?: string) {
    return {
      status: 'ok',
      service: 'eddie-api',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      correlationId: correlationIdHeader || randomUUID(),
      timestamp: new Date().toISOString(),
    };
  }
}
