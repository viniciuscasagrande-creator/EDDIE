import {
  Controller,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';

@Controller('documentos/portal-produtor')
export class PortalDocumentosController {
  constructor(private readonly prisma: PrismaService) {}

  private extractTenantId(headers: Record<string, string>): string {
    return headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000001';
  }

  private extractProdutorId(headers: Record<string, string>, query?: string): string {
    return query || headers['x-produtor-id'] || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  }

  @Get('resumo')
  async obterResumoAcoes(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    // Busca signatários pendentes do produtor
    const signatariosPendentes = await this.prisma.signatarioDocumento.findMany({
      where: {
        tenantId,
        papel: 'PRODUTOR',
        status: 'PENDENTE',
      },
    });

    const docIdsPendentes = signatariosPendentes.map((s: any) => s.documentoId);

    // Documentos aguardando assinatura do produtor
    const documentosParaAssinar = await this.prisma.documento.findMany({
      where: {
        tenantId,
        produtorId,
        situacao: { in: ['AGUARDANDO_ASSINATURA', 'PARCIALMENTE_ASSINADO'] },
        id: { in: docIdsPendentes },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Contratos vigentes
    const contratosVigentes = await this.prisma.contrato.count({
      where: { tenantId, produtorId, status: 'VIGENTE' },
    });

    // Checklist e pendências cadastrais
    const checklist = await this.prisma.checklistDocumental.findFirst({
      where: { tenantId, tipoEntidade: 'PRODUTOR', entidadeId: produtorId },
    });

    const itensChecklist = (checklist?.itens as any[]) || [];
    const pendenciasDocumentais = itensChecklist.filter(
      (item: any) => item.obrigatorio && (item.status === 'PENDENTE' || item.status === 'VENCIDO'),
    );

    return {
      precisaAcao: {
        totalAcoes: documentosParaAssinar.length + pendenciasDocumentais.length,
        documentosAguardandoAssinatura: documentosParaAssinar.length,
        documentosPrecisamAtualizacao: pendenciasDocumentais.length,
        itensParaAssinar: documentosParaAssinar.map((d: any) => ({
          documentoId: d.id,
          codigo: d.codigo,
          tipo: d.tipo,
          titulo: d.titulo,
          eventoNome: d.eventoNome,
          dataCriacao: d.createdAt,
        })),
        itensPendentesAtualizacao: pendenciasDocumentais.map((p: any) => ({
          tipo: p.tipoDocumento,
          nome: p.nome,
          status: p.status,
        })),
      },
      contratosVigentes,
      bloqueioOperacionalAtivo: checklist?.bloqueioAtivo || false,
      motivoBloqueio: checklist?.motivoBloqueio || null,
    };
  }

  @Get('meus-documentos')
  async listarMeusDocumentos(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
    @Query('tipo') tipo?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    const where: any = { tenantId, produtorId };
    if (tipo) where.tipo = tipo;

    const documentos = await this.prisma.documento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const docIds = documentos.map((d: any) => d.id);
    const signatarios = await this.prisma.signatarioDocumento.findMany({
      where: { tenantId, documentoId: { in: docIds } },
      orderBy: { ordem: 'asc' },
    });

    return documentos.map((doc: any) => ({
      ...doc,
      signatarios: signatarios.filter((s: any) => s.documentoId === doc.id),
    }));
  }

  @Get('para-assinar')
  async listarDocumentosParaAssinar(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    const signatariosPendentes = await this.prisma.signatarioDocumento.findMany({
      where: { tenantId, papel: 'PRODUTOR', status: 'PENDENTE' },
    });

    const docIds = signatariosPendentes.map((s: any) => s.documentoId);

    const documentos = await this.prisma.documento.findMany({
      where: {
        tenantId,
        produtorId,
        situacao: { in: ['AGUARDANDO_ASSINATURA', 'PARCIALMENTE_ASSINADO'] },
        id: { in: docIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documentos.map((doc: any) => ({
      ...doc,
      signatarios: signatariosPendentes.filter((s: any) => s.documentoId === doc.id),
    }));
  }

  @Get('borderos')
  async listarBorderos(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
    @Query('eventoId') eventoId?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    const where: any = { tenantId, produtorId, tipo: 'BORDERO' };
    if (eventoId) where.eventoId = eventoId;

    return await this.prisma.documento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('repasses')
  async listarRepasses(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
    @Query('eventoId') eventoId?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    const where: any = { tenantId, produtorId, tipo: 'SOLICITACAO_REPASSE' };
    if (eventoId) where.eventoId = eventoId;

    return await this.prisma.documento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('antecipacoes')
  async listarAntecipacoes(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
    @Query('eventoId') eventoId?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    const where: any = { tenantId, produtorId, tipo: 'ANTECIPACAO' };
    if (eventoId) where.eventoId = eventoId;

    return await this.prisma.documento.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('contratos')
  async listarContratos(
    @Headers() headers: Record<string, string>,
    @Query('produtorId') queryProdutorId?: string,
  ) {
    const tenantId = this.extractTenantId(headers);
    const produtorId = this.extractProdutorId(headers, queryProdutorId);

    return await this.prisma.contrato.findMany({
      where: { tenantId, produtorId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
