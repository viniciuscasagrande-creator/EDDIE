import { BadRequestException } from '@nestjs/common';
import { EstornoService } from './estorno.service';
import { EstornoPolicy } from './estorno.policy';
import { PrismaService } from '@core/database/prisma.service';
import { OutboxService } from '@core/outbox/outbox.service';

describe('Módulo Estorno', () => {
  describe('EstornoPolicy (Regras CDC Art. 49)', () => {
    it('deve aprovar elegibilidade CDC quando a compra foi feita há 3 dias e o evento é em 15 dias', () => {
      const agora = new Date();
      const dataCompra = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000);
      const dataInicioEvento = new Date(agora.getTime() + 15 * 24 * 60 * 60 * 1000);

      const resultado = EstornoPolicy.avaliarDireitoArrependimento({
        dataCompra,
        dataSolicitacao: agora,
        dataInicioEvento,
      });

      expect(resultado.elegivelCdc).toBe(true);
      expect(resultado.deveEstornarTaxaConveniencia).toBe(true);
    });

    it('deve recusar arrependimento se passaram mais de 7 dias da data da compra', () => {
      const agora = new Date();
      const dataCompra = new Date(agora.getTime() - 8 * 24 * 60 * 60 * 1000);
      const dataInicioEvento = new Date(agora.getTime() + 10 * 24 * 60 * 60 * 1000);

      const resultado = EstornoPolicy.avaliarDireitoArrependimento({
        dataCompra,
        dataSolicitacao: agora,
        dataInicioEvento,
      });

      expect(resultado.elegivelCdc).toBe(false);
      expect(resultado.motivo).toContain('Prazo de arrependimento expirado');
    });

    it('deve recusar arrependimento se faltarem menos de 48h para o evento, mesmo dentro dos 7 dias', () => {
      const agora = new Date();
      const dataCompra = new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000);
      const dataInicioEvento = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // Faltam 24h

      const resultado = EstornoPolicy.avaliarDireitoArrependimento({
        dataCompra,
        dataSolicitacao: agora,
        dataInicioEvento,
      });

      expect(resultado.elegivelCdc).toBe(false);
      expect(resultado.motivo).toContain('antecedência mínima é de 48h');
    });
  });

  describe('EstornoService (Máquina de Estados e Outbox)', () => {
    let service: EstornoService;
    let mockPrisma: any;
    let mockOutbox: any;

    beforeEach(() => {
      mockOutbox = {
        emit: jest.fn().mockResolvedValue(undefined),
      };

      mockPrisma = {
        $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrisma)),
        estorno: {
          create: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        estornoTransicao: {
          create: jest.fn(),
        },
      };

      service = new EstornoService(
        mockPrisma as unknown as PrismaService,
        mockOutbox as unknown as OutboxService,
      );
    });

    it('deve bloquear transição de estado proibida na máquina de estados', async () => {
      mockPrisma.estorno.findUnique.mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        status: 'CONCLUIDO', // Não pode mudar de concluído
      });

      await expect(
        service.decidir({
          estornoId: '11111111-1111-1111-1111-111111111111',
          acao: 'NEGAR',
          analisadoPor: 'supervisor@eddie.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve registrar transição e emitir estorno.aprovado.v1 quando aprovado', async () => {
      const estornoMock = {
        id: '11111111-1111-1111-1111-111111111111',
        pedidoId: '22222222-2222-2222-2222-222222222222',
        status: 'SOLICITADO',
        valorTotalCents: 15000,
      };

      mockPrisma.estorno.findUnique.mockResolvedValue(estornoMock);
      mockPrisma.estorno.update.mockResolvedValue({
        ...estornoMock,
        status: 'APROVADO',
      });

      await service.decidir({
        estornoId: estornoMock.id,
        acao: 'APROVAR',
        analisadoPor: 'supervisor@eddie.com',
        justificativa: 'Documentação do cliente conferida com sucesso',
      });

      expect(mockPrisma.estornoTransicao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          deStatus: 'SOLICITADO',
          paraStatus: 'APROVADO',
        }),
      });

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({
          eventType: 'estorno.aprovado.v1',
        }),
      );
    });
  });
});
