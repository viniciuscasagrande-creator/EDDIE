import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

/**
 * PORTA PÚBLICA do módulo Eventos.
 *
 * É a ÚNICA superfície que outros módulos podem consumir de forma síncrona.
 * Retorna DTOs achatados — nunca entidades do Prisma — para que o schema
 * interno possa mudar sem quebrar ninguém.
 *
 * Prefira sempre o evento de domínio. Use isto só quando precisar de leitura
 * consistente no momento da requisição (ex.: validar lote no checkout).
 */
@Injectable()
export class EventosPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async obterLoteParaVenda(tenantId: string, loteId: string): Promise<{
    loteId: string; sessaoId: string; setorId: string; eventoId: string;
    produtorId: string; precoFaceCents: number; taxaCents: number;
    quantidade: number; disponivelParaVenda: boolean;
  } | null> {
    const lote = await this.prisma.lote.findFirst({
      where: { id: loteId, sessao: { evento: { tenantId } } },
      include: { sessao: { include: { evento: true } } },
    });
    if (!lote) return null;

    const agora = new Date();
    const { sessao } = lote;
    return {
      loteId: lote.id,
      sessaoId: sessao.id,
      setorId: lote.setorId,
      eventoId: sessao.eventoId,
      produtorId: sessao.evento.produtorId,
      precoFaceCents: Math.round(lote.precoFace.toNumber() * 100),
      taxaCents: Math.round(lote.taxaConveniencia.toNumber() * 100),
      quantidade: lote.quantidade,
      disponivelParaVenda:
        lote.ativo &&
        sessao.evento.status === 'publicado' &&
        agora >= lote.abreEm &&
        (lote.fechaEm === null || agora <= lote.fechaEm) &&
        agora <= sessao.vendaFechaEm,
    };
  }

  async politicaEstornoDoEvento(tenantId: string, eventoId: string) {
    const evento = await this.prisma.evento.findFirst({
      where: { id: eventoId, tenantId },
      select: { politicaEstorno: true, status: true },
    });
    return evento ?? null;
  }
}
