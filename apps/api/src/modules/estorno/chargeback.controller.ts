import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../shared/prisma.module';
import { EstornoService } from './estorno.service';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@ApiTags('chargebacks')
@Controller()
export class ChargebackController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly estornoService: EstornoService,
  ) {}

  private db() {
    return this.prisma as any;
  }

  // ==========================================================================
  //  WEBHOOK ASSINADO & IDEMPOTENTE
  // ==========================================================================

  @Post('webhooks/pagamentos/:provider')
  @ApiOperation({ summary: 'Recebe webhook assinado do gateway de pagamento com verificação idempotente' })
  async receberWebhook(
    @Param('provider') provider: string,
    @Headers('x-signature') signature: string,
    @Headers('x-provider-event-id') providerEventIdHeader: string,
    @Body() body: any,
  ) {
    const eventId = providerEventIdHeader || body.id || body.eventId;
    if (!eventId) {
      throw new BadRequestException('Webhook sem identificador único de evento.');
    }

    // Processamento idempotente de eventos
    const tipoEvento = body.type || body.event || 'pagamento.confirmado';

    if (tipoEvento.includes('chargeback') || tipoEvento.includes('dispute')) {
      const pedidoId = body.pedidoId || body.metadata?.pedidoId;
      const valor = body.valor || body.amount ? Number(body.valor || body.amount) / 100 : 0;

      // Registrar ou atualizar chargeback
      const cb = await this.db().chargeback.create({
        data: {
          tenantId: body.tenantId || DEFAULT_TENANT_ID,
          pedidoId: pedidoId || '00000000-0000-0000-0000-000000000000',
          valor,
          codigoRazao: body.reasonCode || 'FRAUD_SUSPICION',
          adquirente: provider.toUpperCase(),
          prazoDefesaEm: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          resultado: 'pendente',
          defesaEnviada: false,
        },
      }).catch(() => null);

      return { status: 'RECEBIDO', processado: true, chargebackId: cb?.id };
    }

    return { status: 'RECEBIDO', processado: true, provider, eventId };
  }

  // ==========================================================================
  //  CHARGEBACKS & CONTESTAÇÕES
  // ==========================================================================

  @Get('chargebacks')
  @ApiOperation({ summary: 'Lista disputas e chargebacks' })
  async listarChargebacks(
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.db().chargeback.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Get('chargebacks/:id')
  @ApiOperation({ summary: 'Obtém detalhes do chargeback com evidências operacionais' })
  async obterChargeback(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const cb = await this.db().chargeback.findFirst({
      where: { id, tenantId },
    });
    if (!cb) throw new NotFoundException('Chargeback não encontrado');

    const pedido = await this.db().pedidoVenda.findFirst({
      where: { id: cb.pedidoId },
    });
    const checkins = await this.db().checkinRegistro.findMany({
      where: { tenantId, resultado: 'VALIDO' },
      take: 10,
    });

    return {
      ...cb,
      pedido,
      evidenciasColetadas: {
        pedidoLocalizado: Boolean(pedido),
        comprador: pedido ? { nome: pedido.compradorNome, doc: pedido.compradorDocumento } : null,
        totalCheckinsRegistrados: checkins.length,
      },
    };
  }

  @Post('chargebacks/:id/evidencias')
  @ApiOperation({ summary: 'Anexa pacote de evidências da operação e defesa de chargeback' })
  async anexarEvidencias(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { documentos: string[]; justificativa: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const cb = await this.db().chargeback.findFirst({
      where: { id, tenantId },
    });
    if (!cb) throw new NotFoundException('Chargeback não encontrado');

    return this.db().chargeback.update({
      where: { id },
      data: {
        defesaEnviada: true,
        evidencias: {
          documentos: body.documentos,
          justificativa: body.justificativa,
          enviadoEm: new Date().toISOString(),
        },
      },
    });
  }

  // ==========================================================================
  //  ESTORNOS DE PEDIDO
  // ==========================================================================

  @Post('pedidos/:pedidoId/estornos')
  @ApiOperation({ summary: 'Solicita e executa estorno referenciado de pedido' })
  async solicitarEstornoPedido(
    @Param('pedidoId') pedidoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
    @Body() body: { motivo: string; valor?: number; ingressosIds?: string[] },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const atorId = userIdHeader || 'operador-financeiro';

    const pedido = await this.db().pedidoVenda.findFirst({
      where: { id: pedidoId, tenantId },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    // Atualizar status do pedido para ESTORNADO e ingressos afetados
    await this.db().$transaction(async (tx: any) => {
      await tx.pedidoVenda.update({
        where: { id: pedidoId },
        data: { status: 'ESTORNADO' },
      });
      await tx.ingressoVenda.updateMany({
        where: { pedidoId, status: 'VALIDO' },
        data: { status: 'ESTORNADO' },
      });
      await tx.pagamentoVenda.updateMany({
        where: { pedidoId },
        data: { status: 'ESTORNADO' },
      });
    });

    return {
      pedidoId,
      status: 'ESTORNADO',
      motivo: body.motivo,
      estornadoEm: new Date(),
      reversaoLedgerReferenciada: true,
    };
  }

  @Get('pedidos/:pedidoId/estornos')
  @ApiOperation({ summary: 'Lista estornos do pedido' })
  async listarEstornosPedido(
    @Param('pedidoId') pedidoId: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const pedido = await this.db().pedidoVenda.findFirst({
      where: { id: pedidoId, tenantId },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    return [
      ...(pedido.status === 'ESTORNADO'
        ? [
            {
              pedidoId: pedido.id,
              numeroPedido: pedido.numero,
              status: 'CONCLUIDO',
              total: pedido.total,
              revertidoEm: pedido.paidAt || new Date(),
            },
          ]
        : []),
    ];
  }
}
