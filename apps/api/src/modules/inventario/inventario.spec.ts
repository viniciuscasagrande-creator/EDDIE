import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioPublicService } from './inventario.public-service';

describe('InventarioModule & InventarioService (EDDIE 11.29.2 Core)', () => {
  let service: InventarioService;
  let publicService: InventarioPublicService;

  beforeEach(() => {
    service = new InventarioService();
    publicService = new InventarioPublicService(service);
  });

  it('deve inicializar um pool com capacidade total e assentos', async () => {
    const pool = await service.initPool({
      eventoId: '00000000-0000-0000-0000-000000000010',
      sessaoId: '00000000-0000-0000-0000-000000000020',
      setorId: '00000000-0000-0000-0000-000000000099',
      loteId: '00000000-0000-0000-0000-000000000088',
      capacidadeTotal: 300,
      assentos: ['B-1', 'B-2', 'B-3'],
    });

    expect(pool.capacidadeTotal).toBe(300);
    expect(pool.capacidadeDisponivel).toBe(300);
    expect(pool.capacidadeReservada).toBe(0);
    expect(pool.capacidadeVendida).toBe(0);
  });

  it('deve criar um hold com TTL de 10 minutos (600s) e debitar capacidade disponível', async () => {
    const antes = await service.getPoolAvailability(
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000031',
    );
    expect(antes.capacidadeDisponivel).toBe(500);

    const hold = await service.createHold({
      clienteId: '00000000-0000-0000-0000-000000000555',
      itens: [
        {
          loteId: '00000000-0000-0000-0000-000000000041',
          setorId: '00000000-0000-0000-0000-000000000031',
          quantidade: 4,
          precoFace: 12000,
          taxaConveniencia: 1800,
        },
      ],
    });

    expect(hold.status).toBe('ATIVA');
    expect(hold.itens).toHaveLength(1);
    expect(hold.tempoRestanteSegundos).toBeGreaterThan(580);
    expect(hold.tempoRestanteSegundos).toBeLessThanOrEqual(600);

    const depois = await service.getPoolAvailability(
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000031',
    );
    expect(depois.capacidadeDisponivel).toBe(496);
    expect(depois.capacidadeReservada).toBe(4);
  });

  it('deve rejeitar hold quando a quantidade solicitada exceder a capacidade disponível (anti-overselling)', async () => {
    await expect(
      service.createHold({
        itens: [
          {
            loteId: '00000000-0000-0000-0000-000000000041',
            setorId: '00000000-0000-0000-0000-000000000031',
            quantidade: 99999, // Excede em muito a capacidade
            precoFace: 10000,
            taxaConveniencia: 1500,
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve reservar assento numerado e impedir colisão por concorrência', async () => {
    const hold1 = await service.createHold({
      itens: [
        {
          loteId: '00000000-0000-0000-0000-000000000040',
          setorId: '00000000-0000-0000-0000-000000000030',
          assento: 'A-10',
          quantidade: 1,
          precoFace: 15000,
          taxaConveniencia: 2250,
        },
      ],
    });
    expect(hold1.status).toBe('ATIVA');

    // Tentativa concorrente de reservar o mesmo assento
    await expect(
      service.createHold({
        itens: [
          {
            loteId: '00000000-0000-0000-0000-000000000040',
            setorId: '00000000-0000-0000-0000-000000000030',
            assento: 'A-10',
            quantidade: 1,
            precoFace: 15000,
            taxaConveniencia: 2250,
          },
        ],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve confirmar hold quando o pedido é pago, convertendo reservado em vendido', async () => {
    const hold = await service.createHold({
      itens: [
        {
          loteId: '00000000-0000-0000-0000-000000000041',
          setorId: '00000000-0000-0000-0000-000000000031',
          quantidade: 2,
          precoFace: 10000,
          taxaConveniencia: 1500,
        },
      ],
    });

    const confirmado = await service.confirmHold(hold.id, {
      pedidoId: '00000000-0000-0000-0000-000000000999',
    });

    expect(confirmado.status).toBe('CONVERTIDA_EM_PEDIDO');
    expect(confirmado.pedidoId).toBe('00000000-0000-0000-0000-000000000999');

    const pool = await service.getPoolAvailability(
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000031',
    );
    expect(pool.capacidadeVendida).toBe(2);
    expect(pool.capacidadeReservada).toBe(0);
  });

  it('deve liberar hold manualmente e restaurar capacidade ao pool', async () => {
    const hold = await service.createHold({
      itens: [
        {
          loteId: '00000000-0000-0000-0000-000000000041',
          setorId: '00000000-0000-0000-0000-000000000031',
          quantidade: 5,
          precoFace: 10000,
          taxaConveniencia: 1500,
        },
      ],
    });

    const liberado = await service.releaseHold(hold.id, { motivo: 'Desistência no carrinho' });
    expect(liberado.status).toBe('LIBERADA_MANUALMENTE');

    const pool = await service.getPoolAvailability(
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000031',
    );
    expect(pool.capacidadeDisponivel).toBe(500);
    expect(pool.capacidadeReservada).toBe(0);
  });

  it('deve expirar holds vencidos pelo TTL de 10 min e restaurar disponibilidade', async () => {
    const holdExpirando = await service.createHold({
      ttlSegundos: -5, // Forçar criação já vencida
      itens: [
        {
          loteId: '00000000-0000-0000-0000-000000000041',
          setorId: '00000000-0000-0000-0000-000000000031',
          quantidade: 10,
          precoFace: 10000,
          taxaConveniencia: 1500,
        },
      ],
    });

    const res = await service.expireHolds();
    expect(res.expiradas).toBeGreaterThanOrEqual(1);
    expect(res.detalhes).toContain(holdExpirando.id);

    const holdConsultado = await service.getHold(holdExpirando.id);
    expect(holdConsultado.status).toBe('EXPIRADA');

    const pool = await service.getPoolAvailability(
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000031',
    );
    expect(pool.capacidadeDisponivel).toBe(500);
    expect(pool.capacidadeReservada).toBe(0);
  });

  it('deve delegar chamadas corretamente via InventarioPublicService', async () => {
    const hold = await publicService.criarHold({
      itens: [
        {
          loteId: '00000000-0000-0000-0000-000000000041',
          setorId: '00000000-0000-0000-0000-000000000031',
          quantidade: 3,
          precoFace: 8000,
          taxaConveniencia: 1200,
        },
      ],
    });

    expect(hold.status).toBe('ATIVA');

    const consultado = await publicService.consultarHold(hold.id);
    expect(consultado.id).toBe(hold.id);

    const pool = await publicService.consultarDisponibilidade(
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000031',
    );
    expect(pool.capacidadeReservada).toBe(3);
  });
});
