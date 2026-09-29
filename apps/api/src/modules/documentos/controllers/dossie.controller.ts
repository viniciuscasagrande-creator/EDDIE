import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { DossieService } from '../services/dossie.service';
import {
  CriarDossieDto,
  AdicionarItemDossieDto,
  FecharDossieDto,
  ReabrirDossieDto,
} from '../dtos/dossie.dto';

@Controller('documentos/dossies')
export class DossieController {
  constructor(private readonly dossieService: DossieService) {}

  private extractTenantId(headers: Record<string, string>): string {
    return headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';
  }

  private extractUser(headers: Record<string, string>): string {
    return headers['x-user-id'] || 'fechamento.diskingressos';
  }

  @Post()
  async obterOuCriar(
    @Headers() headers: Record<string, string>,
    @Body() dto: CriarDossieDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.dossieService.obterOuCriarDossie(tenantId, dto);
  }

  @Get(':id')
  async obterCompleto(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.dossieService.obterDossieCompleto(tenantId, id);
  }

  @Post(':id/itens')
  async adicionarItem(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: AdicionarItemDossieDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.dossieService.adicionarItem(tenantId, id, dto);
  }

  @Post(':id/fechar')
  async fecharDossie(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: FecharDossieDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.dossieService.fecharDossie(tenantId, id, dto);
  }

  @Post(':id/reabrir')
  async reabrirDossie(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: ReabrirDossieDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    const reabertoPor = this.extractUser(headers);
    return await this.dossieService.reabrirDossie(tenantId, id, reabertoPor, dto);
  }

  @Get(':id/manifesto')
  async obterManifesto(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.dossieService.gerarManifestoPacote(tenantId, id);
  }
}
