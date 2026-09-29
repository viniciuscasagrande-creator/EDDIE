import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { ContratosService } from '../services/contratos.service';
import {
  CriarContratoDto,
  CriarAditivoDto,
  ValidarDivergenciaDto,
} from '../dtos/contrato.dto';

@Controller('documentos/contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  private extractTenantId(headers: Record<string, string>): string {
    return headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';
  }

  private extractUser(headers: Record<string, string>): string {
    return headers['x-user-id'] || 'comercial.diskingressos';
  }

  @Post()
  async criar(
    @Headers() headers: Record<string, string>,
    @Body() dto: CriarContratoDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    const usuario = this.extractUser(headers);
    return await this.contratosService.criarContrato(tenantId, usuario, dto);
  }

  @Get()
  async listar(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') produtorId?: string,
    @Query('status') status?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.contratosService.listarContratos(tenantId, { produtorId, status });
  }

  @Get(':id')
  async obterComHistorico(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.contratosService.obterContratoComHistorico(tenantId, id);
  }

  @Post(':id/aditivos')
  async criarAditivo(
    @Headers() headers: Record<string, string>,
    @Param('id') contratoId: string,
    @Body() dto: CriarAditivoDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    const usuario = this.extractUser(headers);
    return await this.contratosService.criarAditivo(tenantId, contratoId, usuario, dto);
  }

  @Post('validar-divergencia')
  async validarDivergencia(
    @Headers() headers: Record<string, string>,
    @Body() dto: ValidarDivergenciaDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.contratosService.validarDivergenciaComCore(tenantId, dto);
  }
}
