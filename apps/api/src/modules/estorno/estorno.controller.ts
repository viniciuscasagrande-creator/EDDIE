import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UsePipes,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { EstornoService } from './estorno.service';
import { EstornoPublicService } from './estorno.public-service';
import {
  SolicitarEstornoSchema,
  DecidirEstornoSchema,
  SolicitarEstornoInput,
  DecidirEstornoInput,
} from './estorno.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados de entrada de estorno',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_ATOR_ID = '00000000-0000-0000-0000-000000000002';

@Controller('estornos')
export class EstornoController {
  constructor(
    private readonly estornoService: EstornoService,
    private readonly estornoPublicService: EstornoPublicService,
  ) {}

  @Get()
  async listar(@Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.estornoService.listar(tenantId);
  }

  @Post('solicitar')
  @UsePipes(new ZodValidationPipe(SolicitarEstornoSchema))
  async solicitar(
    @Body() input: SolicitarEstornoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const atorId = userIdHeader || DEFAULT_ATOR_ID;

    // Normalizar motivo para a política de estorno
    let motivoPolitica: any = 'outro';
    if (input.motivo === 'ARREPENDIMENTO_CDC_7_DIAS') motivoPolitica = 'arrependimento_cdc';
    else if (input.motivo === 'EVENTO_CANCELADO') motivoPolitica = 'evento_cancelado';
    else if (input.motivo === 'CHARGEBACK') motivoPolitica = 'chargeback';

    const taxa = input.retemTaxaConveniencia ? Math.round(input.valorTotalCents * 0.1) : 0;

    return this.estornoService.solicitar(
      tenantId,
      {
        pedidoId: input.pedidoId,
        clienteId: input.compradorId,
        motivo: motivoPolitica,
        itensIds: input.ingressosIds,
        valorSolicitadoCents: input.valorTotalCents,
        contexto: {
          compradoEm: new Date(input.dataCompra),
          eventoEm: new Date(input.dataInicioEvento),
          houveCheckin: false,
          taxaConvenienciaCents: taxa,
        },
      },
      atorId,
    );
  }

  @Post('decidir')
  @UsePipes(new ZodValidationPipe(DecidirEstornoSchema))
  async decidir(
    @Body() input: DecidirEstornoInput,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const atorId = userIdHeader || DEFAULT_ATOR_ID;

    if (input.acao === 'APROVAR') {
      const estorno = await this.estornoService.buscar(tenantId, input.estornoId);
      const valorCents = Math.round(estorno.valorSolicitado.toNumber() * 100);
      const taxaCents = estorno.taxaRetida ? Math.round(estorno.taxaRetida.toNumber() * 100) : 0;
      return this.estornoService.aprovar(
        tenantId,
        input.estornoId,
        {
          valorAprovadoCents: valorCents - taxaCents,
          taxaRetidaCents: taxaCents,
          debitoProdutorCents: valorCents - taxaCents,
        },
        atorId,
      );
    } else {
      return this.estornoService.negar(
        tenantId,
        input.estornoId,
        input.justificativa || 'Solicitação recusada pelo operador',
        atorId,
      );
    }
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string) {
    return this.estornoPublicService.obterEstorno(id);
  }
}
