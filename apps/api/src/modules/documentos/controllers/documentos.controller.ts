import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { DocumentosService } from '../services/documentos.service';
import {
  CriarDocumentoDto,
  DecidirAprovacaoDocumentoDto,
  ContestarDocumentoDto,
  VisualizarDocumentoQueryDto,
} from '../dtos/documento.dto';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  private extractTenantId(headers: Record<string, string>): string {
    return headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';
  }

  private extractUser(headers: Record<string, string>): string {
    return headers['x-user-id'] || 'operador.diskingressos';
  }

  @Post()
  async criar(
    @Headers() headers: Record<string, string>,
    @Body() dto: CriarDocumentoDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    const usuario = this.extractUser(headers);
    return await this.documentosService.criarDocumento(tenantId, usuario, dto);
  }

  @Get()
  async listar(
    @Headers() headers: Record<string, string>,
    @Query('tipo') tipo?: string,
    @Query('situacao') situacao?: string,
    @Query('produtorId') produtorId?: string,
    @Query('eventoId') eventoId?: string,
    @Query('sensibilidade') sensibilidade?: string,
    @Query('busca') busca?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.documentosService.listar(tenantId, {
      tipo,
      situacao,
      produtorId,
      eventoId,
      sensibilidade,
      busca,
    });
  }

  @Get('pendencias')
  async obterPendencias(@Headers() headers: Record<string, string>) {
    const tenantId = this.extractTenantId(headers);
    return await this.documentosService.obterPendenciasGerais(tenantId);
  }

  @Get(':id')
  async obterPorId(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.documentosService.obterPorId(tenantId, id);
  }

  @Get('codigo/:codigo')
  async obterPorCodigo(
    @Headers() headers: Record<string, string>,
    @Param('codigo') codigo: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.documentosService.obterPorCodigo(tenantId, codigo);
  }

  @Post(':id/submeter-aprovacao')
  async submeterParaAprovacao(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const usuario = this.extractUser(headers);
    return await this.documentosService.submeterParaAprovacao(tenantId, id, usuario);
  }

  @Post(':id/decidir-aprovacao')
  async decidirAprovacao(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: DecidirAprovacaoDocumentoDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    const usuario = this.extractUser(headers);
    return await this.documentosService.decidirAprovacao(tenantId, id, usuario, dto);
  }

  @Post(':id/contestar')
  async contestar(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: ContestarDocumentoDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    const solicitanteId = this.extractUser(headers);
    return await this.documentosService.contestarDocumento(tenantId, id, solicitanteId, dto);
  }

  @Get(':id/visualizar')
  async visualizarComMarcaDagua(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Query() query: VisualizarDocumentoQueryDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.documentosService.obterVisualizacaoComMarcaDagua(tenantId, id, query);
  }
}
