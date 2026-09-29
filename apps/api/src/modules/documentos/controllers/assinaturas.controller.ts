import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
} from '@nestjs/common';
import { AssinaturasService } from '../services/assinaturas.service';
import {
  AdicionarSignatarioDto,
  RealizarAssinaturaDto,
  RecusarAssinaturaDto,
} from '../dtos/assinatura.dto';

@Controller('documentos')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  private extractTenantId(headers: Record<string, string>): string {
    return headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';
  }

  private extractUser(headers: Record<string, string>) {
    return {
      id: headers['x-user-id'] || 'usuario.diskingressos',
      nome: headers['x-user-name'] || 'Operador DiskIngressos',
      email: headers['x-user-email'] || 'operador@diskingressos.com.br',
      documento: headers['x-user-documento'] || '000.000.000-00',
      papel: headers['x-user-role'] || 'OPERADOR',
    };
  }

  @Post(':id/signatarios')
  async adicionarSignatario(
    @Headers() headers: Record<string, string>,
    @Param('id') documentoId: string,
    @Body() dto: AdicionarSignatarioDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.assinaturasService.adicionarSignatario(tenantId, documentoId, dto);
  }

  @Post(':id/assinar')
  async realizarAssinatura(
    @Headers() headers: Record<string, string>,
    @Param('id') documentoId: string,
    @Body() dto: RealizarAssinaturaDto,
    @Req() req: any,
  ) {
    const tenantId = this.extractTenantId(headers);
    const usuario = this.extractUser(headers);
    const ip = req?.ip || headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = headers['user-agent'] || 'EDDIE-Client';

    return await this.assinaturasService.realizarAssinatura(
      tenantId,
      documentoId,
      usuario,
      {
        ...dto,
        ipAssinatura: dto.ipAssinatura || ip,
        userAgent: dto.userAgent || userAgent,
      },
    );
  }

  @Post(':id/recusar')
  async recusarAssinatura(
    @Headers() headers: Record<string, string>,
    @Param('id') documentoId: string,
    @Body() dto: RecusarAssinaturaDto,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.assinaturasService.recusarAssinatura(tenantId, documentoId, dto);
  }

  @Get(':id/certificado')
  async obterCertificado(
    @Headers() headers: Record<string, string>,
    @Param('id') documentoId: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    return await this.assinaturasService.obterCertificadoConclusao(tenantId, documentoId);
  }
}
