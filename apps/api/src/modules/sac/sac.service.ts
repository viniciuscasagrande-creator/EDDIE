import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class SacService {
  constructor(private readonly prisma: PrismaService) {}

  private mapChamado(c: any) {
    return {
      id: c.id,
      protocolo: c.protocolo,
      clienteNome: c.clienteNome,
      compradorNome: c.clienteNome,
      cpf: c.cpf,
      compradorCpf: c.cpf || 'Não informado',
      email: c.email,
      compradorEmail: c.email || 'Não informado',
      telefone: c.telefone,
      compradorTelefone: c.telefone || 'Não informado',
      pedidoId: c.pedidoId || null,
      eventoId: c.eventoId || null,
      assunto: c.assunto,
      descricao: c.descricao,
      categoria: c.categoria || 'duvida',
      canal: c.canal,
      prioridade: c.prioridade || 'media',
      status: c.status || 'aberto',
      agenteResponsavel: c.responsavelId || 'Atendente SAC',
      responsavelId: c.responsavelId || null,
      slaHoras: 24,
      slaLimiteEm: c.slaVenceEm ? c.slaVenceEm.toISOString() : new Date(new Date(c.createdAt).getTime() + 24 * 3600000).toISOString(),
      resolvidoEm: c.resolvidoEm ? c.resolvidoEm.toISOString() : null,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
      mensagens: Array.isArray(c.mensagens)
        ? c.mensagens.map((m: any) => ({
            id: m.id,
            chamadoId: m.chamadoId,
            autorTipo: m.autorTipo,
            autorNome: m.autorNome,
            conteudo: m.conteudo,
            createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
          }))
        : [],
    };
  }

  async listar(tenantIdHeader?: string, status?: string) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const where: any = { tenantId };
    if (status && status !== 'todos') {
      where.status = status;
    }

    const chamados = await this.prisma.chamadoSac.findMany({
      where,
      include: {
        mensagens: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return chamados.map((c) => this.mapChamado(c));
  }

  async obterPorId(tenantIdHeader: string | undefined, id: string) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const c = await this.prisma.chamadoSac.findFirst({
      where: { id, tenantId },
      include: {
        mensagens: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!c) {
      throw new NotFoundException(`Chamado SAC ${id} não encontrado.`);
    }

    return this.mapChamado(c);
  }

  async criar(tenantIdHeader: string | undefined, b: any) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const nome = b.compradorNome || b.clienteNome || 'Comprador Final';
    const desc = b.mensagemInicial || b.descricao || b.assunto || 'Atendimento iniciado';

    const chamado = await this.prisma.chamadoSac.create({
      data: {
        tenantId,
        protocolo: `SAC-${Date.now().toString().slice(-6)}`,
        clienteNome: nome,
        cpf: b.compradorCpf || b.cpf || null,
        telefone: b.compradorTelefone || b.telefone || null,
        email: b.compradorEmail || b.email || null,
        pedidoId: b.pedidoId || null,
        eventoId: b.eventoId || null,
        assunto: b.assunto || 'Solicitação de Suporte',
        descricao: desc,
        categoria: b.categoria || 'duvida',
        canal: b.canal || 'painel_pdt',
        prioridade: b.prioridade || 'media',
        status: 'aberto',
        slaVenceEm: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // Se informou mensagem inicial, adiciona na thread
    if (b.mensagemInicial) {
      await this.prisma.mensagemSac.create({
        data: {
          tenantId,
          chamadoId: chamado.id,
          autorTipo: 'cliente',
          autorNome: nome,
          conteudo: b.mensagemInicial,
        },
      });
    }

    return this.obterPorId(tenantId, chamado.id);
  }

  async adicionarMensagem(tenantIdHeader: string | undefined, chamadoId: string, b: any) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const chamado = await this.prisma.chamadoSac.findFirst({
      where: { id: chamadoId, tenantId },
    });

    if (!chamado) {
      throw new NotFoundException(`Chamado SAC ${chamadoId} não encontrado.`);
    }

    const mensagem = await this.prisma.mensagemSac.create({
      data: {
        tenantId,
        chamadoId,
        autorTipo: b.autorTipo || 'agente',
        autorNome: b.autorNome || 'Atendente SAC',
        conteudo: b.conteudo,
      },
    });

    // Se chamado estava aguardando, move para em_atendimento
    if (chamado.status === 'aberto') {
      await this.prisma.chamadoSac.update({
        where: { id: chamadoId },
        data: { status: 'em_atendimento' },
      });
    }

    return {
      id: mensagem.id,
      chamadoId: mensagem.chamadoId,
      autorTipo: mensagem.autorTipo,
      autorNome: mensagem.autorNome,
      conteudo: mensagem.conteudo,
      createdAt: mensagem.createdAt.toISOString(),
    };
  }

  async atualizar(tenantIdHeader: string | undefined, id: string, b: any) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const atual = await this.prisma.chamadoSac.findFirst({ where: { id, tenantId } });
    if (!atual) throw new NotFoundException('Chamado não encontrado para este tenant.');

    const statusFinal = b.status !== undefined ? b.status : atual.status;
    const responsavel = b.agenteResponsavel || b.responsavelId;

    const data: any = {};
    if (b.status !== undefined) data.status = b.status;
    if (responsavel !== undefined) data.responsavelId = responsavel;
    if (statusFinal === 'resolvido') {
      data.resolvidoEm = new Date();
    }

    await this.prisma.chamadoSac.update({
      where: { id },
      data,
    });

    if (b.solucao) {
      await this.prisma.mensagemSac.create({
        data: {
          tenantId,
          chamadoId: id,
          autorTipo: 'sistema',
          autorNome: 'Resolução Oficial',
          conteudo: `Resolução: ${b.solucao}`,
        },
      });
    }

    return this.obterPorId(tenantId, id);
  }

  async consultar(tenantIdHeader: string | undefined, q: string) {
    const tenantId = tenantIdHeader || DEFAULT_TENANT_ID;
    const termo = q.trim();
    if (!termo) {
      return { encontrado: false };
    }

    // Busca chamados correspondentes
    const chamados = await this.prisma.chamadoSac.findMany({
      where: {
        tenantId,
        OR: [
          { cpf: { contains: termo } },
          { telefone: { contains: termo } },
          { pedidoId: { contains: termo } },
          { clienteNome: { contains: termo, mode: 'insensitive' } },
          { protocolo: { contains: termo, mode: 'insensitive' } },
        ],
      },
      include: {
        mensagens: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Busca estornos vinculados caso seja pedidoId ou clienteId
    let estornos: any[] = [];
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(termo);
    if (isUuid) {
      try {
        estornos = await this.prisma.solicitacaoEstorno.findMany({
          where: {
            tenantId,
            OR: [
              { pedidoId: termo },
              { clienteId: termo },
            ],
          },
          take: 10,
        });
      } catch {
        // Ignora caso estorno não tenha registros
      }
    }

    if (chamados.length === 0 && estornos.length === 0) {
      return { encontrado: false };
    }

    const primeiro = chamados[0];
    const nome = primeiro ? primeiro.clienteNome : 'Cliente Encontrado';
    const cpf = primeiro ? (primeiro.cpf || 'Não informado') : 'Não informado';
    const email = primeiro ? (primeiro.email || 'Não informado') : 'Não informado';
    const telefone = primeiro ? (primeiro.telefone || 'Não informado') : 'Não informado';

    return {
      encontrado: true,
      comprador: {
        nome,
        cpf,
        email,
        telefone,
        totalChamados: chamados.length,
        chamadosAbertos: chamados.filter((c) => c.status !== 'resolvido' && c.status !== 'cancelado').length,
      },
      chamados: chamados.map((c) => this.mapChamado(c)),
      estornos: estornos.map((e) => ({
        id: e.id,
        pedidoId: e.pedidoId,
        motivo: e.motivo,
        status: e.status,
        valorTotalCents: Math.round(Number(e.valorSolicitado) * 100),
      })),
    };
  }

  // Compatibilidade com método buscar anterior
  buscar(tenantId: string, q: string) {
    return this.consultar(tenantId, q);
  }
}
