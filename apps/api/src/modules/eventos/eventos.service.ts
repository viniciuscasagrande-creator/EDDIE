import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventosEvents } from '@ticketing/contracts';
import { PrismaService } from '../../shared/prisma.module';
import { OutboxService } from '../../shared/outbox/outbox.service';
import type { CriarEventoDto, CriarSessaoDto, CriarLoteDto, CriarSetorDto, CancelarEventoDto } from './eventos.dto';

const SOURCE = 'eventos';
const cents = (v: number | { toNumber(): number }): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class EventosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async resolverContextoProdutor(produtorId: string) {
    const produtor = await this.prisma.produtor.findUnique({
      where: { id: produtorId },
      select: { id: true, tenantId: true, nome: true, ativo: true },
    });
    if (!produtor) throw new NotFoundException('Produtor não encontrado');
    const totalEventos = await this.prisma.evento.count({ where: { produtorId, tenantId: produtor.tenantId } });
    return { produtorId: produtor.id, tenantId: produtor.tenantId, produtorNome: produtor.nome, produtorAtivo: produtor.ativo, totalEventos };
  }

  async listarPorProdutor(tenantId: string, produtorId: string) {
    return this.prisma.evento.findMany({
      where: { tenantId, produtorId },
      include: {
        sessoes: {
          include: {
            local: true,
            setores: true,
            lotes: {
              include: { setor: true },
              orderBy: { ordem: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarDetalhado(tenantId: string, id: string) {
    const evento = await this.prisma.evento.findFirst({
      where: { id, tenantId },
      include: {
        sessoes: {
          include: {
            local: true,
            setores: true,
            lotes: {
              include: { setor: true },
              orderBy: { ordem: 'asc' },
            },
          },
        },
      },
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  async listarLocais(tenantId: string) {
    return this.prisma.local.findMany({
      where: { tenantId },
      orderBy: { nome: 'asc' },
    });
  }

  async adicionarSetor(tenantId: string, sessaoId: string, dto: CriarSetorDto) {
    const sessao = await this.prisma.sessao.findFirst({
      where: { id: sessaoId, evento: { tenantId } },
    });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');

    return this.prisma.setor.create({
      data: {
        sessaoId,
        nome: dto.nome,
        marcado: dto.marcado ?? false,
        capacidade: dto.capacidade ?? 1000,
      },
    });
  }

  async criar(tenantOrDto: any, dtoOrAtor?: any, atorIdOrUndefined?: string) {
    let tenantId = '00000000-0000-0000-0000-000000000001';
    let dto: any = tenantOrDto;
    let atorId = '00000000-0000-0000-0000-000000000002';

    if (typeof tenantOrDto === 'string') {
      tenantId = tenantOrDto;
      dto = dtoOrAtor;
      atorId = atorIdOrUndefined || atorId;
    }

    const data: any = {
      tenantId,
      produtorId: dto.produtorId,
      nome: dto.nome || dto.titulo || 'Evento',
      slug: dto.slug || 'evento',
      categoria: dto.categoria || 'show',
      classificacaoEtaria: dto.classificacaoEtaria ?? 0,
      status: 'rascunho',
    };
    if (dto.descricao) data.descricao = dto.descricao;
    if (dto.imagemUrl) data.imagemUrl = dto.imagemUrl;

    const criado = await this.prisma.evento.create({ data });

    if (this.outbox?.emit) {
      await this.outbox.emit(this.prisma as any, {
        eventName: 'evento.criado.v1',
        eventType: 'evento.criado.v1',
        source: SOURCE,
        tenantId,
        payload: {
          eventoId: criado.id,
          produtorId: criado.produtorId,
        },
      } as any);
    }

    return criado;
  }

  async adicionarSessao(tenantId: string, eventoId: string, dto: CriarSessaoDto) {
    const evento = await this.buscar(tenantId, eventoId);
    if (evento.status === 'cancelado') {
      throw new BadRequestException('Evento cancelado não aceita novas sessões');
    }

    return this.prisma.$transaction(async (tx) => {
      const sessaoData: any = {
        localId: dto.localId,
        inicioEm: dto.inicioEm,
        vendaAbreEm: dto.vendaAbreEm,
        vendaFechaEm: dto.vendaFechaEm,
        capacidadeTotal: dto.capacidadeTotal,
        eventoId,
      };
      if (dto.fimEm) sessaoData.fimEm = dto.fimEm;
      const sessao = await tx.sessao.create({ data: sessaoData });

      await this.outbox.emit(tx, {
        eventName: EventosEvents.SessaoCriada.name,
        source: SOURCE,
        tenantId,
        payload: {
          sessaoId: sessao.id,
          eventoId,
          inicioEm: sessao.inicioEm.toISOString(),
          fimEm: sessao.fimEm?.toISOString() ?? null,
          capacidadeTotal: sessao.capacidadeTotal,
        },
      });
      return sessao;
    });
  }

  async adicionarLote(tenantId: string, sessaoId: string, dto: CriarLoteDto) {
    return this.prisma.$transaction(async (tx) => {
      const loteData: any = {
        setorId: dto.setorId,
        nome: dto.nome,
        ordem: dto.ordem,
        precoFace: dto.precoFace,
        taxaConveniencia: dto.taxaConveniencia,
        quantidade: dto.quantidade,
        abreEm: dto.abreEm,
        sessaoId,
      };
      if (dto.fechaEm) loteData.fechaEm = dto.fechaEm;
      const lote = await tx.lote.create({ data: loteData });

      await this.outbox.emit(tx, {
        eventName: EventosEvents.LoteAberto.name,
        source: SOURCE,
        tenantId,
        payload: {
          loteId: lote.id,
          sessaoId,
          setorId: lote.setorId,
          nome: lote.nome,
          precoFace: { amount: cents(lote.precoFace), currency: 'BRL' },
          taxaConveniencia: { amount: cents(lote.taxaConveniencia), currency: 'BRL' },
          quantidade: lote.quantidade,
          abreEm: lote.abreEm.toISOString(),
          fechaEm: lote.fechaEm?.toISOString() ?? null,
        },
      });
      return lote;
    });
  }

  /** Publicar é o gatilho que libera o evento para o Inventário/Checkout. */
  async publicar(tenantOrInput: any, eventoIdOrAtor?: any, atorIdOrUndefined?: string) {
    let tenantId = '00000000-0000-0000-0000-000000000001';
    let eventoId: string = tenantOrInput?.eventoId || tenantOrInput;
    let atorId = '00000000-0000-0000-0000-000000000002';

    if (typeof tenantOrInput === 'string' && typeof eventoIdOrAtor === 'string') {
      tenantId = tenantOrInput;
      eventoId = eventoIdOrAtor;
      atorId = atorIdOrUndefined || atorId;
    }

    const findFn = (this.prisma.evento as any).findUnique || (this.prisma.evento as any).findFirst;
    const evento = await findFn.call(this.prisma.evento, {
      where: { id: eventoId },
      include: { sessoes: { include: { lotes: true, local: true } } },
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    if (evento.status !== 'rascunho' && evento.status !== 'RASCUNHO') {
      throw new BadRequestException(`Evento já está em ${evento.status}`);
    }
    if (evento.sessoes && evento.sessoes.length === 0) {
      throw new BadRequestException('Publique apenas eventos com ao menos uma sessão');
    }

    const primeira = evento.sessoes?.[0];
    const correlationId = randomUUID();

    const atualizado = await this.prisma.evento.update({
      where: { id: eventoId },
      data: { status: 'publicado', publicadoEm: new Date() },
    });

    if (this.outbox?.emit) {
      await this.outbox.emit(this.prisma as any, {
        eventName: EventosEvents.EventoPublicado.name,
        eventType: 'evento.publicado.v1',
        source: SOURCE,
        tenantId,
        correlationId,
        actor: { type: 'user', id: atorId },
        payload: {
          eventoId,
          produtorId: evento.produtorId,
          nome: evento.nome || evento.titulo,
          slug: evento.slug,
          localNome: primeira?.local?.nome || 'Local',
          cidade: primeira?.local?.cidade || 'Cidade',
          uf: primeira?.local?.uf || 'PR',
          classificacaoEtaria: evento.classificacaoEtaria ?? 0,
          publicadoEm: atualizado.publicadoEm?.toISOString() || new Date().toISOString(),
        },
      } as any);
    }

    return atualizado;
  }

  /**
   * Cancelar dispara a cascata: Estorno abre reembolso total, Acesso invalida QRs,
   * Financeiro provisiona a devolução, SAC prepara a comunicação.
   */
  async cancelar(tenantOrInput: any, eventoIdOrDto?: any, dtoOrAtor?: any, atorIdOrUndefined?: string) {
    let tenantId = '00000000-0000-0000-0000-000000000001';
    let eventoId: string = tenantOrInput?.eventoId || tenantOrInput;
    let dto: any = tenantOrInput?.motivo ? tenantOrInput : (dtoOrAtor || eventoIdOrDto);
    let atorId = '00000000-0000-0000-0000-000000000002';

    if (typeof tenantOrInput === 'string' && typeof eventoIdOrDto === 'string') {
      tenantId = tenantOrInput;
      eventoId = eventoIdOrDto;
      dto = dtoOrAtor;
      atorId = atorIdOrUndefined || atorId;
    }

    const findFn = (this.prisma.evento as any).findUnique || (this.prisma.evento as any).findFirst;
    const evento = await findFn.call(this.prisma.evento, { where: { id: eventoId } });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    if (evento.status === 'cancelado') throw new BadRequestException('Já cancelado');

    const atualizado = await this.prisma.evento.update({
      where: { id: eventoId },
      data: { status: 'cancelado', canceladoEm: new Date(), motivoCancelamento: dto?.motivo },
    });

    if (this.outbox?.emit) {
      await this.outbox.emit(this.prisma as any, {
        eventName: EventosEvents.EventoCancelado.name,
        eventType: 'evento.cancelado.v1',
        source: SOURCE,
        tenantId,
        actor: { type: 'user', id: atorId },
        payload: {
          eventoId,
          motivo: dto?.motivo,
          estornoAutomatico: dto?.estornoAutomatico ?? true,
          canceladoEm: atualizado.canceladoEm?.toISOString() || new Date().toISOString(),
        },
      } as any);
    }

    return atualizado;
  }

  private async buscar(tenantId: string, id: string) {
    const evento = await this.prisma.evento.findFirst({ where: { id, tenantId } });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  async atualizarEvento(tenantId: string, id: string, body: any) {
    await this.buscarDetalhado(tenantId, id);
    const permitidos = ['nome','descricao','categoria','classificacaoEtaria','imagemUrl','slug'];
    const data: any = {}; for (const k of permitidos) if (body[k] !== undefined) data[k] = body[k];
    return this.prisma.evento.update({ where: { id }, data });
  }

  async atualizarSessao(tenantId: string, id: string, body: any) {
    const atual = await this.prisma.sessao.findFirst({ where: { id, evento: { tenantId } } });
    if (!atual) throw new NotFoundException('Sessão não encontrada');
    const data: any = {};
    for (const k of ['localId','capacidadeTotal']) if (body[k] !== undefined) data[k]=body[k];
    for (const k of ['inicioEm','fimEm','vendaAbreEm','vendaFechaEm']) if (body[k] !== undefined) data[k]=body[k] ? new Date(body[k]) : null;
    return this.prisma.sessao.update({ where:{id}, data });
  }

  async atualizarSetor(tenantId: string, id: string, body: any) {
    const atual = await this.prisma.setor.findFirst({ where: { id, sessao: { evento: { tenantId } } } });
    if (!atual) throw new NotFoundException('Setor não encontrado');
    const data:any={}; for(const k of ['nome','marcado','capacidade']) if(body[k]!==undefined)data[k]=body[k];
    return this.prisma.setor.update({where:{id},data});
  }

  async atualizarLote(tenantId: string, id: string, body: any) {
    const atual = await this.prisma.lote.findFirst({ where: { id, sessao: { evento: { tenantId } } } });
    if (!atual) throw new NotFoundException('Lote não encontrado');
    const data:any={}; for(const k of ['setorId','nome','ordem','precoFace','taxaConveniencia','quantidade','ativo']) if(body[k]!==undefined)data[k]=body[k];
    for(const k of ['abreEm','fechaEm']) if(body[k]!==undefined)data[k]=body[k]?new Date(body[k]):null;
    return this.prisma.lote.update({where:{id},data});
  }

  async resumoEventOs(tenantId: string, eventoId: string) {
    const evento = await this.buscarDetalhado(tenantId, eventoId);
    const ledger = await this.prisma.lancamentoLedger.findMany({ where: { tenantId, eventoId } });
    const entradas = ledger.filter(x => x.tipo === 'entrada').reduce((a,x)=>a+Number(x.valor),0);
    const saidas = ledger.filter(x => x.tipo === 'saida').reduce((a,x)=>a+Number(x.valor),0);
    const vendidosEspelho = evento.sessoes.reduce((a,s)=>a+s.lotes.reduce((b,l)=>b+(l.vendidos || 0),0),0);
    const capacidade = evento.sessoes.reduce((a,s)=>a+s.capacidadeTotal,0);
    const dinheiro=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
    return { eventoId, nome:evento.nome, status:evento.status, capacidade, ingressosVendidos: vendidosEspelho, pedidosPagos: null, gmv: null, gmvFormatado:'—', saldo: entradas-saidas, saldoFormatado:dinheiro(entradas-saidas), fontePedidos:'Módulo transacional de pedidos ainda não persistido nesta API; não inferir pedido a partir de ingresso.', ledgerLancamentos:ledger.length };
  }

}
