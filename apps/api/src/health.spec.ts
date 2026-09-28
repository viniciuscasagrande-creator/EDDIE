import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from './health.controller';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { PrismaService } from './shared/prisma.module';

describe('HealthController (/health & /ready probes) - Production Truth', () => {
  let controller: HealthController;
  let mockPrisma: {
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    controller = new HealthController(mockPrisma as unknown as PrismaService);
  });

  describe('Liveness Probe (/live)', () => {
    it('deve responder status ok imediatamente com correlationId', () => {
      const res = controller.live('trace-live-123');
      expect(res.status).toBe('ok');
      expect(res.service).toBe('eddie-api');
      expect(res.correlationId).toBe('trace-live-123');
      expect(typeof res.uptimeSeconds).toBe('number');
    });
  });

  describe('Health Check (/health)', () => {
    it('deve responder status ok e database online quando banco está operacional', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const res = await controller.health('trace-health-001');
      expect(res.status).toBe('ok');
      expect(res.database.status).toBe('online');
      expect(res.database.latencyMs).toBeGreaterThanOrEqual(0);
      expect(res.correlationId).toBe('trace-health-001');

      // Garantia de ausência de segredos vazados
      const jsonStr = JSON.stringify(res);
      expect(jsonStr).not.toContain('password');
      expect(jsonStr).not.toContain('postgresql://');
    });

    it('deve lançar HttpException 503 DATABASE_UNAVAILABLE se o banco de dados falhar', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused at 5432'));

      try {
        await controller.health('trace-health-fail');
        expect.unreachable('Deveria ter lançado HttpException 503');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        const httpErr = err as HttpException;
        expect(httpErr.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);

        const responseBody = httpErr.getResponse() as Record<string, unknown>;
        expect(responseBody['status']).toBe('degraded');
        expect(responseBody['code']).toBe('DATABASE_UNAVAILABLE');
        expect(responseBody['correlationId']).toBe('trace-health-fail');
      }
    });
  });

  describe('Readiness Probe (/ready)', () => {
    it('deve retornar status ready (HTTP 200) quando banco responde prontamente', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const res = await controller.ready('trace-ready-001');
      expect(res.status).toBe('ready');
      expect(res.database).toBe('online');
      expect(res.correlationId).toBe('trace-ready-001');
    });

    it('deve retornar HTTP 503 (DATABASE_UNAVAILABLE) quando banco está inacessível', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('PrismaClientInitializationError: Can\'t reach database server'));

      try {
        await controller.ready('trace-ready-fail');
        expect.unreachable('Deveria ter lançado HttpException 503');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        const httpErr = err as HttpException;
        expect(httpErr.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);

        const body = httpErr.getResponse() as Record<string, unknown>;
        expect(body['status']).toBe('unhealthy');
        expect(body['code']).toBe('DATABASE_UNAVAILABLE');
        expect(body['database']).toBe('offline');
        expect(body['correlationId']).toBe('trace-ready-fail');
      }
    });
  });
});
