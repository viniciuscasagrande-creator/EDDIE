import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { PrismaService } from '@core/database/prisma.service';
import { OutboxService } from '@core/outbox/outbox.service';

describe('EventosService (Regras de Negócio)', () => {
  let service: EventosService;
  let mockPrisma: any;
  let mockOutbox: any;

  beforeEach(() => {
    mockOutbox = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
      evento: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new EventosService(
      mockPrisma as unknown as PrismaService,
      mockOutbox as unknown as OutboxService,
    );
  });

  describe('criar()', () => {
    it('deve criar um evento em RASCUNHO e emitir evento.criado.v1 no outbox', async () => {
      const eventoMock = {
        id: '11111111-1111-1111-1111-111111111111',
        produtorId: '22222222-2222-2222-2222-222222222222',
        titulo: 'Festival Eddie Rock',
        slug: 'eddie-rock-2026',
        categoria: 'Música',
        localNome: 'Allianz Parque',
        cidade: 'São Paulo',
        estado: 'SP',
        capacidadeTotal: 45000,
        status: 'RASCUNHO',
      };

      mockPrisma.evento.create.mockResolvedValue(eventoMock);

      const resultado = await service.criar({
        produtorId: eventoMock.produtorId,
        titulo: eventoMock.titulo,
        slug: eventoMock.slug,
        categoria: eventoMock.categoria,
        localNome: eventoMock.localNome,
        endereco: 'Av. Francisco Matarazzo, 1705',
        cidade: eventoMock.cidade,
        estado: eventoMock.estado,
        cep: '05001-200',
        capacidadeTotal: eventoMock.capacidadeTotal,
        dataInicioPrimeiraSessao: new Date().toISOString(),
      });

      expect(resultado.status).toBe('RASCUNHO');
      expect(mockPrisma.evento.create).toHaveBeenCalledTimes(1);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventType: 'evento.criado.v1',
          payload: expect.objectContaining({
            eventoId: eventoMock.id,
          }),
        }),
      );
    });
  });

  describe('publicar()', () => {
    it('deve lançar erro se o evento não tiver sessões cadastradas', async () => {
      mockPrisma.evento.findUnique.mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        status: 'RASCUNHO',
        sessoes: [],
      });

      await expect(
        service.publicar({ eventoId: '11111111-1111-1111-1111-111111111111' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve publicar evento e emitir evento.publicado.v1 quando houver sessões', async () => {
      const eventoMock = {
        id: '11111111-1111-1111-1111-111111111111',
        produtorId: '22222222-2222-2222-2222-222222222222',
        status: 'RASCUNHO',
        capacidadeTotal: 5000,
        sessoes: [{ id: 'sessao-1' }],
      };

      mockPrisma.evento.findUnique.mockResolvedValue(eventoMock);
      mockPrisma.evento.update.mockResolvedValue({
        ...eventoMock,
        status: 'PUBLICADO',
      });

      const resultado = await service.publicar({ eventoId: eventoMock.id });

      expect(resultado.status).toBe('PUBLICADO');
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventType: 'evento.publicado.v1',
        }),
      );
    });
  });

  describe('cancelar()', () => {
    it('deve lançar NotFoundException se o evento não existir', async () => {
      mockPrisma.evento.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelar({
          eventoId: '00000000-0000-0000-0000-000000000000',
          motivo: 'Chuva forte e alagamento',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
