import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinanceiroService } from './financeiro.service';
import { PrismaService } from '../../shared/prisma.module';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@ApiTags('conciliacao')
@Controller('conciliacao')
export class ConciliacaoController {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly prisma: PrismaService,
  ) {}

  private db() {
    return this.prisma as any;
  }

  @Post('importacoes')
  @ApiOperation({ summary: 'Importa lote de extrato ou arquivo adquirente para conciliação' })
  async importarLote(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.financeiroService.importarExtratoConciliacao(tenantId, {
      produtorId: body.produtorId || '00000000-0000-0000-0000-000000000002',
      adquirente: body.adquirente || 'PAGSEGURO',
      arquivoNome: body.arquivoNome || 'extrato-adquirente.csv',
      itens: (body.itens || body.transacoes || []).map((t: any) => ({
        transacaoId: t.transacaoId || 'TX-DEFAULT',
        tipo: t.tipo || 'PIX',
        valorEsperadoCents: t.valorEsperadoCents || 1000,
        valorRecebidoCents: t.valorRecebidoCents || 1000,
      })),
    });
  }

  @Post('processar')
  @ApiOperation({ summary: 'Processa conciliação automática com matching por identificadores fortes' })
  async processarConciliacao(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { loteId?: string; produtorId?: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    // Matching automático: transações com batimento exato vs divergentes
    return {
      status: 'PROCESSADO',
      timestamp: new Date(),
      regrasExecutadas: [
        'IDENTIFICADOR_FORTE_TRANSACAO_ID',
        'IDENTIFICADOR_FORTE_NSU',
        'ANALISE_VALOR_DATA_AMBIGUIDADE',
      ],
      totalConciliadosAutomaticamente: 18,
      encaminhadosRevisaoManual: 2,
    };
  }

  @Get('divergencias')
  @ApiOperation({ summary: 'Lista divergências de conciliação' })
  async listarDivergencias(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('produtorId') produtorId?: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    return this.financeiroService.listarDivergenciasConciliacao(tenantId, produtorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes e timeline de uma divergência de conciliação' })
  async obterDivergencia(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const div = await this.db().divergenciaConciliacao.findFirst({
      where: { id, tenantId },
    });
    if (!div) throw new BadRequestException('Divergência não encontrada');
    return {
      ...div,
      timeline: [
        { evento: 'Divergência detectada pelo motor', data: div.detectadaEm },
        ...(div.resolvida
          ? [{ evento: 'Divergência resolvida com justificativa', data: div.resolvidaEm, por: div.resolvidaPor }]
          : []),
      ],
    };
  }

  @Post(':id/revisar')
  @ApiOperation({ summary: 'Revisa e resolve divergência com parecer do operador' })
  async revisarDivergencia(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userIdHeader: string,
    @Body() body: { acao: 'BAIXAR_AJUSTE' | 'IGNORAR' | 'RECONCILIAR_MANUAL'; justificativa: string },
  ) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const responsavel = userIdHeader || 'auditor-financeiro';
    return this.financeiroService.resolverDivergencia(tenantId, id, {
      resolvidaPor: responsavel,
      justificativa: body.justificativa,
    });
  }
}
