import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../shared/prisma.module';
import { InventarioPublicService } from '../inventario/inventario.public-service';
import { PagamentosPublicService } from '../pagamentos/pagamentos.public-service';

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly inventario?: InventarioPublicService,
    @Optional() private readonly pagamentos?: PagamentosPublicService,
  ) {}
  private db() { return this.prisma as any; }
  private numero(prefix:string){ return `${prefix}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${randomUUID().slice(0,8).toUpperCase()}`; }

  async criarReserva(tenantId:string, produtorId:string, input:any){
    const lote=await this.db().lote.findUnique({where:{id:input.loteId},include:{sessao:{include:{evento:true}}}});
    if(!lote || lote.sessao.evento.tenantId!==tenantId) throw new NotFoundException('Lote não encontrado');
    if(lote.sessao.eventoId!==input.eventoId || lote.sessao.evento.produtorId!==produtorId) throw new BadRequestException('Lote não pertence ao evento/produtor');
    if(input.quantidade<1) throw new BadRequestException('Quantidade inválida');
    const expiraEm=new Date(Date.now()+10*60*1000);
    return this.db().reservaVenda.create({data:{tenantId,produtorId,eventoId:input.eventoId,loteId:input.loteId,quantidade:input.quantidade,expiraEm}});
  }

  async criarPedido(tenantId:string, produtorId:string, input:any){
    const reserva=await this.db().reservaVenda.findFirst({where:{id:input.reservaId,tenantId,produtorId,status:'ATIVA'}});
    if(!reserva || new Date(reserva.expiraEm)<new Date()) throw new BadRequestException('Reserva inválida ou expirada');
    const lote=await this.db().lote.findUnique({where:{id:reserva.loteId}});
    if(!lote) throw new NotFoundException('Lote não encontrado');
    const cond=await this.db().condicaoComercial.findFirst({where:{tenantId,produtorId,eventoId:reserva.eventoId,status:'aprovada'},orderBy:{vigenciaInicio:'desc'}});
    if(!cond) throw new BadRequestException('Evento sem condição comercial aprovada');
    const unit=Number(lote.precoFace ?? 0), subtotal=unit*reserva.quantidade;
    const perc=Number(cond.taxaServicoPercentual||0), fixa=Number(cond.taxaServicoFixa||0);
    const taxa=cond.modeloTaxa==='fixa'?fixa*reserva.quantidade:cond.modeloTaxa==='hibrida'?(subtotal*perc/100)+(fixa*reserva.quantidade):subtotal*perc/100;
    const total=subtotal+taxa;
    return this.db().$transaction(async(tx:any)=>{
      const pedido=await tx.pedidoVenda.create({data:{numero:this.numero('PED'),tenantId,produtorId,eventoId:reserva.eventoId,reservaId:reserva.id,compradorNome:input.comprador.nome,compradorDocumento:input.comprador.documento,compradorEmail:input.comprador.email,compradorTelefone:input.comprador.telefone,subtotal,taxaDisk:taxa,total,repasseProdutor:subtotal,modeloTaxaSnapshot:cond.modeloTaxa,taxaPercentualSnapshot:cond.taxaServicoPercentual,taxaFixaSnapshot:cond.taxaServicoFixa,spreadSnapshot:cond.spreadPercentual,advancedSnapshot:cond.advancedHabilitado,prazoRepasseSnapshot:cond.prazoRepasseDias}});
      await tx.itemPedidoVenda.create({data:{pedidoId:pedido.id,loteId:lote.id,quantidade:reserva.quantidade,valorUnitario:unit,subtotal}});
      await tx.pagamentoVenda.create({data:{pedidoId:pedido.id,tenantId,status:'PENDENTE',metodo:input.metodoPagamento||'pix',valor:total}});
      await tx.reservaVenda.update({where:{id:reserva.id},data:{status:'CONSUMIDA'}});

      if (this.pagamentos) {
        this.pagamentos.criarIntencao({
          tenantId,
          pedidoId: pedido.id,
          eventoId: reserva.eventoId,
          produtorId,
          idempotencyKey: `idemp-ped-${pedido.id}`,
          metodo: input.metodoPagamento === 'cartao' ? 'CARTAO_CREDITO' : 'PIX',
          valorTotal: total,
          valorIngressos: subtotal,
          taxaServico: taxa,
          splitProdutor: subtotal,
          splitPlataforma: taxa,
          compradorNome: input.comprador.nome,
          compradorDocumento: input.comprador.documento,
          compradorEmail: input.comprador.email,
          compradorTelefone: input.comprador.telefone,
        }).catch(() => {});
      }

      return pedido;
    });
  }

  async confirmarPagamento(tenantId:string,pedidoId:string,input:any){
    const pedido=await this.db().pedidoVenda.findFirst({where:{id:pedidoId,tenantId}}); if(!pedido) throw new NotFoundException('Pedido não encontrado');
    if(pedido.status==='PAGO') return pedido;
    const itens=await this.db().itemPedidoVenda.findMany({where:{pedidoId}});
    return this.db().$transaction(async(tx:any)=>{
      const pagamento=await tx.pagamentoVenda.findFirst({where:{pedidoId,tenantId}});
      if (pagamento) {
        await tx.pagamentoVenda.update({where:{id:pagamento.id},data:{status:'PAGO',adquirente:input.adquirente,transacaoId:input.transacaoId,nsu:input.nsu,pagoEm:new Date()}});
      }
      const ingressosCriados: any[] = [];
      for(const item of itens) for(let i=0;i<item.quantidade;i++){
        const token=randomUUID();
        const ing = await tx.ingressoVenda.create({data:{numero:this.numero('ING'),pedidoId,eventoId:pedido.eventoId,loteId:item.loteId,qrTokenHash:createHash('sha256').update(token).digest('hex')}});
        ingressosCriados.push(ing);
      }
      if (this.inventario && pedido.reservaId) {
        this.inventario.confirmarHold(pedido.reservaId, { pedidoId }).catch(() => {});
      }

      // Publica pedido.pago.v1 no Outbox para acionar Ledger, Contabilidade e Marketing
      if (tx.outboxMessage) {
        await tx.outboxMessage.create({
          data: {
            eventName: 'pedido.pago.v1',
            source: 'pedidos',
            tenantId,
            payload: {
              pedidoId: pedido.id,
              compradorId: tenantId,
              compradorEmail: pedido.compradorEmail,
              compradorNome: pedido.compradorNome,
              metodoPagamento: input.adquirente ? 'CREDIT_CARD' : 'PIX',
              transacaoId: input.transacaoId || 'TRX-DEFAULT',
              valorTotalCents: Math.round(Number(pedido.total) * 100),
              valorIngressosCents: Math.round(Number(pedido.subtotal) * 100),
              valorTaxasCents: Math.round(Number(pedido.taxaDisk) * 100),
              splitProdutorCents: Math.round(Number(pedido.repasseProdutor) * 100),
              splitPlataformaCents: Math.round(Number(pedido.taxaDisk) * 100),
              itens: ingressosCriados.map((ing) => ({
                ingressoId: ing.id,
                loteId: ing.loteId,
                sessaoId: randomUUID(),
                eventoId: ing.eventoId,
                precoCents: Math.round((Number(pedido.subtotal) / (ingressosCriados.length || 1)) * 100),
                taxaConvenienciaCents: Math.round((Number(pedido.taxaDisk) / (ingressosCriados.length || 1)) * 100),
              })),
              pagoEm: new Date().toISOString(),
            },
          },
        }).catch(() => {});
      }

      return tx.pedidoVenda.update({where:{id:pedidoId},data:{status:'PAGO',paidAt:new Date()}});
    });
  }

  async consultarEvento(tenantId:string,eventoId:string,q=''){
    const where:any={tenantId,eventoId}; if(q) where.OR=[{numero:{contains:q,mode:'insensitive'}},{compradorNome:{contains:q,mode:'insensitive'}},{compradorDocumento:{contains:q,mode:'insensitive'}},{compradorTelefone:{contains:q,mode:'insensitive'}}];
    const pedidos=await this.db().pedidoVenda.findMany({where,orderBy:{createdAt:'desc'},take:100});
    return Promise.all(pedidos.map(async(p:any)=>({...p,pagamentos:await this.db().pagamentoVenda.findMany({where:{pedidoId:p.id}}),ingressos:await this.db().ingressoVenda.findMany({where:{pedidoId:p.id}})})));
  }
}
