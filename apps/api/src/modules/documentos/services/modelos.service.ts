import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';
import { DocumentosService } from './documentos.service';
import {
  CriarModeloDocumentoDto,
  GerarDocumentoAPartirDeModeloDto,
} from '../dtos/modelo.dto';

@Injectable()
export class ModelosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentosService: DocumentosService,
  ) {}

  async criarModelo(tenantId: string, dto: CriarModeloDocumentoDto) {
    const existente = await this.prisma.modeloDocumento.findFirst({
      where: { codigo: dto.codigo, tenantId },
    });
    if (existente) {
      throw new BadRequestException(`Modelo com código ${dto.codigo} já existe.`);
    }

    return await this.prisma.modeloDocumento.create({
      data: {
        tenantId,
        codigo: dto.codigo,
        nome: dto.nome,
        tipo: dto.tipo,
        conteudoTemplate: dto.conteudoTemplate,
        camposObrigatorios: dto.camposObrigatorios,
      },
    });
  }

  async listarModelos(tenantId: string, tipo?: string) {
    const where: any = { tenantId, ativo: true };
    if (tipo) where.tipo = tipo;

    return await this.prisma.modeloDocumento.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
  }

  async obterModeloPorCodigo(tenantId: string, codigo: string) {
    const modelo = await this.prisma.modeloDocumento.findFirst({
      where: { codigo, tenantId },
    });
    if (!modelo) throw new NotFoundException(`Modelo ${codigo} não encontrado.`);
    return modelo;
  }

  /**
   * Interpolação segura de variáveis dinâmicas com validação de dados computacionais do Core.
   * REGRA ARQUITETURAL: Não permite edição solta de dados do Core.
   */
  async gerarDocumento(
    tenantId: string,
    criadoPor: string,
    dto: GerarDocumentoAPartirDeModeloDto,
  ) {
    const modelo = await this.obterModeloPorCodigo(tenantId, dto.modeloCodigo);

    // Validação estrita de campos obrigatórios
    const camposFaltantes: string[] = [];
    const camposObrigatorios = (modelo.camposObrigatorios as string[]) || [];

    for (const campo of camposObrigatorios) {
      if (dto.dadosCore[campo] === undefined || dto.dadosCore[campo] === null) {
        camposFaltantes.push(campo);
      }
    }

    if (camposFaltantes.length > 0) {
      throw new BadRequestException(
        `Campos obrigatórios do Core ausentes para geração documental: ${camposFaltantes.join(', ')}. Corrija os dados na origem antes de gerar.`,
      );
    }

    // Interpolação segura de tags {{campo}}
    let conteudoFinal = modelo.conteudoTemplate;
    for (const [chave, valor] of Object.entries(dto.dadosCore)) {
      const regex = new RegExp(`\\{\\{${chave}\\}\\}`, 'g');
      conteudoFinal = conteudoFinal.replace(regex, String(valor));
    }

    // Cria o documento formal com os metadados computacionais protegidos
    const doc = await this.documentosService.criarDocumento(tenantId, criadoPor, {
      tipo: modelo.tipo as any,
      titulo: dto.titulo,
      produtorId: dto.produtorId,
      eventoId: dto.eventoId,
      origemDescricao: dto.origemDescricao,
      conteudoTexto: conteudoFinal,
      metadados: {
        modeloCodigo: modelo.codigo,
        modeloVersao: modelo.versao,
        dadosCoreOriginais: dto.dadosCore,
        geradoAutomaticamente: true,
      },
    });

    return {
      documento: doc,
      conteudoPreVisualizacao: conteudoFinal,
    };
  }
}
