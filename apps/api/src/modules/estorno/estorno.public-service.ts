import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { EstornoPublicDto } from './estorno.dto';

@Injectable()
export class EstornoPublicService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Consulta pública de status do estorno para o módulo SAC ou Checkout.
   */
  async obterEstorno(estornoId: string): Promise<EstornoPublicDto> {
    const estorno = await this.prisma.estorno.findUnique({
      where: { id: estornoId },
      select: {
        id: true,
        pedidoId: true,
        status: true,
        motivo: true,
        valorTotalCents: true,
        solicitadoEm: true,
        concluidoEm: true,
      },
    });

    if (!estorno) {
      throw new NotFoundException(`Estorno ${estornoId} não encontrado.`);
    }

    return estorno;
  }
}
