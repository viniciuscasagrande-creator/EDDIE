import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { ComercialEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import type {
  CadastrarProdutorB2BInput,
  CriarOportunidadeInput,
  AlterarEtapaOportunidadeInput,
  NegociarCondicaoComercialInput,
  AprovarCondicaoComercialInput,
  RegistrarAtividadeComercialInput,
  DefinirMetaComercialInput,
  ResumoPipelineDto,
} from './comercial.dto';

const SOURCE = 'comercial';

const centsToDecimal = (cents: number): number => Number((cents / 100).toFixed(2));
const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class ComercialService {
  private readonly logger = new Logger(ComercialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  // ==========================================================================
  //  CARTEIRA DE PRODUTORES B2B
  // ==========================================================================

  async cadastrarProdutor(tenantId: string, input: CadastrarProdutorB2BInput) {
    return this.prisma.$transaction(async (tx) => {
      const produtorId = randomUUID();

      const produtor = await tx.produtorB2B.create({
        data: {
          id: produtorId,
          tenantId,
          razaoSocial: input.razaoSocial,
          nomeFantasia: input.nomeFantasia,
          documento: input.documento,
          email: input.email,
          telefone: input.telefone ?? null,
          executivoResponsavelId: input.executivoResponsavelId,
          observacoes: input.observacoes ?? null,
          status: 'prospeccao',
        },
      });

      await this.outbox.emit(tx, {
        eventName: ComercialEvents.ProdutorB2BCadastrado.name,
        source: SOURCE,
        tenantId,
        payload: {
          produtorId: produtor.id,
          razaoSocial: produtor.razaoSocial,
          nomeFantasia: produtor.nomeFantasia,
          documento: produtor.documento,
          executivoResponsavelId: produtor.executivoResponsavelId,
          cadastradoEm: produtor.createdAt.toISOString(),
        },
      });

      this.logger.log(`Produtor B2B cadastrado: ${produtor.nomeFantasia} (${produtor.id})`);
      return produtor;
    });
  }

  async listarProdutores(tenantId: string, executivoId?: string) {
    const where: Prisma.ProdutorB2BWhereInput = { tenantId };
    if (executivoId) where.executivoResponsavelId = executivoId;

    return this.prisma.produtorB2B.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { oportunidades: true, condicoes: true } },
      },
    });
  }

  // ==========================================================================
  //  PIPELINE DE OPORTUNIDADES
  // ==========================================================================

  async criarOportunidade(tenantId: string, input: CriarOportunidadeInput) {
    return this.prisma.$transaction(async (tx) => {
      const produtor = await tx.produtorB2B.findFirst({
        where: { id: input.produtorId, tenantId },
      });
      if (!produtor) {
        throw new NotFoundException(`Produtor B2B ${input.produtorId} não encontrado no tenant.`);
      }

      const oportunidadeId = randomUUID();
      const valorDecimal = centsToDecimal(input.valorEstimadoCents);

      const oportunidade = await tx.oportunidadeComercial.create({
        data: {
          id: oportunidadeId,
          tenantId,
          produtorId: input.produtorId,
          titulo: input.titulo,
          valorEstimado: valorDecimal,
          etapa: input.etapa,
          probabilidadePercentual: input.probabilidadePercentual,
          dataFechamentoPrevista: input.dataFechamentoPrevista
            ? new Date(input.dataFechamentoPrevista)
            : null,
          executivoId: input.executivoId,
        },
      });

      // Registra histórico da primeira etapa
      await tx.historicoEtapaPipeline.create({
        data: {
          tenantId,
          oportunidadeId,
          etapaAnterior: 'nenhuma',
          etapaNova: input.etapa,
          motivo: 'Criação da oportunidade',
          alteradoPor: input.executivoId,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ComercialEvents.OportunidadeCriada.name,
        source: SOURCE,
        tenantId,
        payload: {
          oportunidadeId,
          produtorId: input.produtorId,
          titulo: input.titulo,
          valorEstimadoCents: input.valorEstimadoCents,
          etapa: input.etapa,
          executivoId: input.executivoId,
          criadoEm: oportunidade.createdAt.toISOString(),
        },
      });

      this.logger.log(`Oportunidade criada: ${oportunidade.titulo} (R$ ${valorDecimal})`);
      return oportunidade;
    });
  }

  async alterarEtapaOportunidade(
    tenantId: string,
    oportunidadeId: string,
    input: AlterarEtapaOportunidadeInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const oportunidade = await tx.oportunidadeComercial.findUnique({
        where: { id: oportunidadeId },
      });

      if (!oportunidade || oportunidade.tenantId !== tenantId) {
        throw new NotFoundException(`Oportunidade ${oportunidadeId} não encontrada.`);
      }

      const etapaAnterior = oportunidade.etapa;
      const etapaNova = input.etapaNova;

      const atualizada = await tx.oportunidadeComercial.update({
        where: { id: oportunidadeId },
        data: {
          etapa: etapaNova,
          motivoPerda: etapaNova === 'perdido' ? input.motivo ?? null : null,
        },
      });

      await tx.historicoEtapaPipeline.create({
        data: {
          tenantId,
          oportunidadeId,
          etapaAnterior,
          etapaNova,
          motivo: input.motivo ?? null,
          alteradoPor: input.alteradoPor,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ComercialEvents.EtapaPipelineAlterada.name,
        source: SOURCE,
        tenantId,
        payload: {
          oportunidadeId,
          produtorId: oportunidade.produtorId,
          etapaAnterior: etapaAnterior as any,
          etapaNova: etapaNova as any,
          motivo: input.motivo ?? null,
          alteradoPor: input.alteradoPor,
          alteradoEm: new Date().toISOString(),
        },
      });

      return atualizada;
    });
  }

  // ==========================================================================
  //  CONDIÇÕES COMERCIAIS (Taxas, Repasse, Prazos)
  // ==========================================================================

  async proporCondicao(tenantId: string, input: NegociarCondicaoComercialInput) {
    return this.prisma.$transaction(async (tx) => {
      const condicaoId = randomUUID();

      const condicao = await tx.condicaoComercial.create({
        data: {
          id: condicaoId,
          tenantId,
          produtorId: input.produtorId,
          eventoId: input.eventoId ?? null,
          taxaServicoPercentual: input.taxaServicoPercentual,
          taxaProcessamentoPercentual: input.taxaProcessamentoPercentual,
          prazoRepasseDias: input.prazoRepasseDias,
          vigenciaInicio: new Date(input.vigenciaInicio),
          vigenciaFim: input.vigenciaFim ? new Date(input.vigenciaFim) : null,
          status: 'em_aprovacao',
        },
      });

      return condicao;
    });
  }

  async aprovarCondicao(
    tenantId: string,
    condicaoId: string,
    input: AprovarCondicaoComercialInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const condicao = await tx.condicaoComercial.findUnique({
        where: { id: condicaoId },
      });

      if (!condicao || condicao.tenantId !== tenantId) {
        throw new NotFoundException(`Condição comercial ${condicaoId} não encontrada.`);
      }

      const agora = new Date();
      const aprovada = await tx.condicaoComercial.update({
        where: { id: condicaoId },
        data: {
          status: 'aprovada',
          aprovadoPor: input.aprovadoPor,
          aprovadoEm: agora,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ComercialEvents.CondicaoComercialAprovada.name,
        source: SOURCE,
        tenantId,
        payload: {
          condicaoId: aprovada.id,
          produtorId: aprovada.produtorId,
          eventoId: aprovada.eventoId,
          taxaServicoPercentual: Number(aprovada.taxaServicoPercentual),
          taxaProcessamentoPercentual: Number(aprovada.taxaProcessamentoPercentual),
          prazoRepasseDias: aprovada.prazoRepasseDias,
          vigenciaInicio: aprovada.vigenciaInicio.toISOString(),
          vigenciaFim: aprovada.vigenciaFim?.toISOString() ?? null,
          aprovadoPor: input.aprovadoPor,
          aprovadoEm: agora.toISOString(),
        },
      });

      this.logger.log(`Condição comercial aprovada: ${condicaoId} para produtor ${condicao.produtorId}`);
      return aprovada;
    });
  }

  // ==========================================================================
  //  ATIVIDADES & FOLLOW-UPS
  // ==========================================================================

  async registrarAtividade(tenantId: string, input: RegistrarAtividadeComercialInput) {
    return this.prisma.$transaction(async (tx) => {
      const atividadeId = randomUUID();

      const atividade = await tx.atividadeComercial.create({
        data: {
          id: atividadeId,
          tenantId,
          produtorId: input.produtorId,
          oportunidadeId: input.oportunidadeId ?? null,
          tipo: input.tipo,
          descricao: input.descricao,
          dataAgendada: new Date(input.dataAgendada),
          executadoPor: input.executadoPor,
        },
      });

      await this.outbox.emit(tx, {
        eventName: ComercialEvents.AtividadeComercialRegistrada.name,
        source: SOURCE,
        tenantId,
        payload: {
          atividadeId,
          produtorId: input.produtorId,
          oportunidadeId: input.oportunidadeId ?? null,
          tipo: input.tipo,
          descricao: input.descricao,
          executadoPor: input.executadoPor,
          registradoEm: atividade.createdAt.toISOString(),
        },
      });

      return atividade;
    });
  }

  // ==========================================================================
  //  PIPELINE SUMMARY & ANALYTICS
  // ==========================================================================

  async obterResumoPipeline(tenantId: string, executivoId?: string): Promise<ResumoPipelineDto> {
    const where: Prisma.OportunidadeComercialWhereInput = { tenantId };
    if (executivoId) where.executivoId = executivoId;

    const oportunidades = await this.prisma.oportunidadeComercial.findMany({
      where,
      select: { etapa: true, valorEstimado: true },
    });

    const porEtapa: Record<string, { quantidade: number; valorTotalCents: number }> = {};
    let valorTotalEstimadoCents = 0;

    for (const op of oportunidades) {
      const cents = decimalToCents(op.valorEstimado);
      valorTotalEstimadoCents += cents;

      if (!porEtapa[op.etapa]) {
        porEtapa[op.etapa] = { quantidade: 0, valorTotalCents: 0 };
      }
      porEtapa[op.etapa]!.quantidade += 1;
      porEtapa[op.etapa]!.valorTotalCents += cents;
    }

    return {
      totalOportunidades: oportunidades.length,
      valorTotalEstimadoCents,
      porEtapa,
    };
  }

  // ==========================================================================
  //  LISTAGENS OPERACIONAIS COMERCIAL B2B
  // ==========================================================================

  async listarOportunidades(
    tenantId: string,
    query?: { etapa?: string | undefined; produtorId?: string | undefined; executivoId?: string | undefined },
  ) {
    const where: Prisma.OportunidadeComercialWhereInput = { tenantId };
    if (query?.etapa) where.etapa = query.etapa;
    if (query?.produtorId) where.produtorId = query.produtorId;
    if (query?.executivoId) where.executivoId = query.executivoId;

    const oportunidades = await this.prisma.oportunidadeComercial.findMany({
      where,
      include: {
        produtor: true,
        historicoEtapas: { orderBy: { alteradoEm: 'desc' }, take: 3 },
      },
      orderBy: { updatedAt: 'desc' },
    });


    return oportunidades.map((o) => ({
      id: o.id,
      produtorId: o.produtorId,
      produtorNome: o.produtor.nomeFantasia || o.produtor.razaoSocial,
      titulo: o.titulo,
      valorEstimadoCents: decimalToCents(o.valorEstimado),
      etapa: o.etapa,
      probabilidadePercentual: o.probabilidadePercentual,
      dataFechamentoPrevista: o.dataFechamentoPrevista?.toISOString() ?? null,
      executivoId: o.executivoId,
      motivoPerda: o.motivoPerda,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  async listarAtividades(
    tenantId: string,
    query?: { produtorId?: string | undefined; executivoId?: string | undefined; realizada?: boolean | undefined },
  ) {
    const where: Prisma.AtividadeComercialWhereInput = { tenantId };
    if (query?.produtorId) where.produtorId = query.produtorId;
    if (query?.executivoId) where.executadoPor = query.executivoId;
    if (query?.realizada !== undefined) where.realizada = query.realizada;

    const atividades = await this.prisma.atividadeComercial.findMany({
      where,
      include: { produtor: true, oportunidade: true },
      orderBy: { dataAgendada: 'asc' },
    });


    return atividades.map((a) => ({
      id: a.id,
      produtorId: a.produtorId,
      produtorNome: a.produtor.nomeFantasia || a.produtor.razaoSocial,
      oportunidadeId: a.oportunidadeId,
      tipo: a.tipo,
      descricao: a.descricao,
      dataAgendada: a.dataAgendada.toISOString(),
      realizada: a.realizada,
      realizadaEm: a.realizadaEm?.toISOString() ?? null,
      executadoPor: a.executadoPor,
    }));
  }

  async concluirAtividade(tenantId: string, atividadeId: string) {
    const atividade = await this.prisma.atividadeComercial.findUnique({
      where: { id: atividadeId },
    });
    if (!atividade || atividade.tenantId !== tenantId) {
      throw new NotFoundException('Atividade comercial não encontrada.');
    }

    return this.prisma.atividadeComercial.update({
      where: { id: atividadeId },
      data: { realizada: true, realizadaEm: new Date() },
    });
  }

  async listarCondicoes(tenantId: string, query?: { produtorId?: string | undefined; status?: string | undefined }) {
    const where: Prisma.CondicaoComercialWhereInput = { tenantId };
    if (query?.produtorId) where.produtorId = query.produtorId;
    if (query?.status) where.status = query.status;

    const condicoes = await this.prisma.condicaoComercial.findMany({
      where,
      include: { produtor: true },
      orderBy: { createdAt: 'desc' },
    });


    return condicoes.map((c) => ({
      id: c.id,
      produtorId: c.produtorId,
      produtorNome: c.produtor.nomeFantasia || c.produtor.razaoSocial,
      eventoId: c.eventoId,
      taxaServicoPercentual: Number(c.taxaServicoPercentual),
      taxaProcessamentoPercentual: Number(c.taxaProcessamentoPercentual),
      prazoRepasseDias: c.prazoRepasseDias,
      status: c.status,
      vigenciaInicio: c.vigenciaInicio.toISOString(),
      vigenciaFim: c.vigenciaFim?.toISOString() ?? null,
      aprovadoPor: c.aprovadoPor,
      aprovadoEm: c.aprovadoEm?.toISOString() ?? null,
    }));
  }
}
