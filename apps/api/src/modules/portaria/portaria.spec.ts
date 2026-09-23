import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'crypto';
import { PortariaService } from './portaria.service';

describe('PortariaService — Operação Real & Antifraude (EDDIE 11.9)', () => {
  let service: PortariaService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      dispositivoPortaria: {
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn().mockResolvedValue(4),
      },
      ingressoVenda: {
        findFirst: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn().mockResolvedValue(100),
      },
      checkinRegistro: {
        create: vi.fn().mockResolvedValue({ id: 'chk-1' }),
        count: vi.fn().mockResolvedValue(25),
        findMany: vi.fn().mockResolvedValue([]),
      },
      alertaAntifraude: {
        create: vi.fn().mockResolvedValue({ id: 'alert-1' }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(1),
        update: vi.fn(),
      },
    };
    service = new PortariaService(mockPrisma);
  });

  it('permite entrada válida e realiza consumo atômico', async () => {
    const rawQr = 'ING-2026-VAL-001';
    const hash = createHash('sha256').update(rawQr).digest('hex');

    mockPrisma.ingressoVenda.findFirst.mockResolvedValue({
      id: 'ing-uuid-1',
      numero: rawQr,
      eventoId: 'ev-1',
      status: 'VALIDO',
      utilizadoEm: null,
      qrTokenHash: hash,
    });
    mockPrisma.ingressoVenda.updateMany.mockResolvedValue({ count: 1 });

    const res = await service.validarCheckin('tenant-1', {
      eventoId: 'ev-1',
      qrToken: rawQr,
      operadorId: 'op-1',
      portaria: 'Portaria Leste',
    });

    expect(res.resultado).toBe('VALIDO');
    expect(res.ingressoId).toBe('ing-uuid-1');
    expect(mockPrisma.ingressoVenda.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ing-uuid-1', utilizadoEm: null, status: 'VALIDO' },
      }),
    );
    expect(mockPrisma.checkinRegistro.create).toHaveBeenCalled();
  });

  it('recusa ingresso já utilizado e dispara alerta antifraude', async () => {
    const rawQr = 'ING-2026-VAL-002';
    mockPrisma.ingressoVenda.findFirst.mockResolvedValue({
      id: 'ing-uuid-2',
      numero: rawQr,
      eventoId: 'ev-1',
      status: 'VALIDO',
      utilizadoEm: new Date(Date.now() - 3600000),
    });

    const res = await service.validarCheckin('tenant-1', {
      eventoId: 'ev-1',
      qrToken: rawQr,
      operadorId: 'op-1',
    });

    expect(res.resultado).toBe('JA_UTILIZADO');
    expect(mockPrisma.alertaAntifraude.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigoSinal: 'QR_JA_UTILIZADO',
          severidade: 'ALTA',
        }),
      }),
    );
  });

  it('detecta corrida concorrente de leitura simultânea no mesmo milissegundo', async () => {
    const rawQr = 'ING-2026-CORRIDA';
    mockPrisma.ingressoVenda.findFirst.mockResolvedValue({
      id: 'ing-uuid-3',
      numero: rawQr,
      eventoId: 'ev-1',
      status: 'VALIDO',
      utilizadoEm: null,
    });
    // Simula que outro leitor atualizou a linha primeiro na transação do banco (count = 0)
    mockPrisma.ingressoVenda.updateMany.mockResolvedValue({ count: 0 });

    const res = await service.validarCheckin('tenant-1', {
      eventoId: 'ev-1',
      qrToken: rawQr,
      operadorId: 'op-2',
    });

    expect(res.resultado).toBe('JA_UTILIZADO');
    expect(mockPrisma.alertaAntifraude.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigoSinal: 'CONCORRENCIA_LEITURA_SIMULTANEA',
          severidade: 'CRITICA',
        }),
      }),
    );
  });

  it('bloqueia leitura quando dispositivo foi revogado', async () => {
    mockPrisma.dispositivoPortaria.findFirst.mockResolvedValue({
      id: 'disp-revogado',
      status: 'REVOGADO',
      nome: 'Catraca 04',
    });

    await expect(
      service.validarCheckin('tenant-1', {
        eventoId: 'ev-1',
        qrToken: 'qualquer',
        operadorId: 'op-1',
        dispositivoId: 'disp-revogado',
      }),
    ).rejects.toThrow('Dispositivo de leitura revogado ou não autorizado.');
  });

  it('bloqueia ingresso estornado e registra sinal de fraude', async () => {
    mockPrisma.ingressoVenda.findFirst.mockResolvedValue({
      id: 'ing-estornado',
      numero: 'ING-ESTORNADO-01',
      eventoId: 'ev-1',
      status: 'ESTORNADO',
    });

    const res = await service.validarCheckin('tenant-1', {
      eventoId: 'ev-1',
      qrToken: 'ING-ESTORNADO-01',
      operadorId: 'op-1',
    });

    expect(res.resultado).toBe('ESTORNADO');
    expect(mockPrisma.alertaAntifraude.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codigoSinal: 'INGRESSO_ESTORNADO_APRESENTADO',
        }),
      }),
    );
  });
});
