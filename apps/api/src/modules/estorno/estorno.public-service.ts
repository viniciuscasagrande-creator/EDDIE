import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import { EstornoPublicDto } from './estorno.dto';

@Injectable()
export class EstornoPublicService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Consulta pública de status do estorno para o módulo SAC ou Checkout.
   */
  async obterEstorno(estornoId: string): Promise<EstornoPublicDto> {
    const estorno = await this.prisma.solicitacaoEstorno.findUnique({
      where: { id: estornoId },
      select: {
        id: true,
        pedidoId: true,
        status: true,
        motivo: true,
        valorSolicitado: true,
        solicitadoEm: true,
        decididoEm: true,
      },
    });

    if (!estorno) {
      throw new NotFoundException(`Estorno ${estornoId} não encontrado.`);
    }

    return {
      id: estorno.id,
      pedidoId: estorno.pedidoId,
      status: estorno.status,
      motivo: estorno.motivo,
      valorTotalCents: Math.round(estorno.valorSolicitado.toNumber() * 100),
      solicitadoEm: estorno.solicitadoEm,
      concluidoEm: estorno.decididoEm,
    };
  }
}
