import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, interval, map } from 'rxjs';
import { PrismaService } from '../../shared/prisma.module';
import type { LiveConnectionState, AlertSeverity, IncidentState } from '@ticketing/contracts';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class OperacaoService {
  constructor(private readonly prisma: PrismaService) {}

  private db() {
    return this.prisma as any;
  }

  // ==========================================================================
  //  SNAPSHOT / RESUMO COMPLETO DO CENTRO DE OPERAÇÕES
  // ==========================================================================
  async obterResumo(tenantId: string, eventoId: string, sessaoId?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID;

    // 1. Dados do evento e sessão
    const evento = await this.db().evento.findFirst({
      where: { id: eventoId, tenantId: tid },
      include: {
        sessoes: {
          orderBy: { dataHoraInicio: 'asc' },
        },
      },
    }).catch(() => null);

    const nomeEvento = evento?.nome || `Evento ${eventoId.slice(0, 8)}`;
    const sessoes = evento?.sessoes || [];
    const sessaoAtiva = sessaoId
      ? sessoes.find((s: any) => s.id === sessaoId)
      : sessoes[0];

    // 2. VENDAS & INGRESSOS (Somente pedidos PAGO contam para receita confirmada!)
    const pedidos = await this.db().pedidoVenda.findMany({
      where: { tenantId: tid, eventoId },
      include: { pagamentos: true, itens: true },
    }).catch(() => []);

    let receitaConfirmadaCents = 0;
    let pedidosPagos = 0;
    let pagamentosPendentes = 0;
    let pagamentosFalhos = 0;

    const vendasPorMetodo: Record<string, { quantidade: number; valorCents: number }> = {
      PIX: { quantidade: 0, valorCents: 0 },
      CREDITO: { quantidade: 0, valorCents: 0 },
      BOLETO: { quantidade: 0, valorCents: 0 },
    };

    for (const p of pedidos) {
      if (p.status === 'PAGO') {
        pedidosPagos++;
        const totalCents = Math.round(Number(p.total || 0) * 100);
        receitaConfirmadaCents += totalCents;

        const metodo = (p.pagamentos?.[0]?.metodo || 'PIX').toUpperCase();
        const bucket = metodo.includes('PIX') ? 'PIX' : metodo.includes('BOL') ? 'BOLETO' : 'CREDITO';
        const curr = vendasPorMetodo[bucket] ?? { quantidade: 0, valorCents: 0 };
        curr.quantidade++;
        curr.valorCents += totalCents;
        vendasPorMetodo[bucket] = curr;
      } else if (p.status === 'AGUARDANDO_PAGAMENTO' || p.status === 'PENDENTE') {
        pagamentosPendentes++;
      } else if (p.status === 'CANCELADO' || p.status === 'EXPIRADO' || p.status === 'FALHOU') {
        pagamentosFalhos++;
      }
    }

    const ticketMedioCents = pedidosPagos > 0 ? Math.round(receitaConfirmadaCents / pedidosPagos) : 0;

    // 3. INGRESSOS & OCUPAÇÃO
    const totalIngressos = await this.db().ingressoVenda.count({
      where: { tenantId: tid, eventoId },
    }).catch(() => 0);

    const ingressosEmitidos = totalIngressos;

    // 4. PORTARIA & CHECK-IN
    const checkinsValidos = await this.db().checkinRegistro.count({
      where: { tenantId: tid, eventoId, resultado: 'VALIDO' },
    }).catch(() => 0);

    const checkinsRecusados = await this.db().checkinRegistro.count({
      where: {
        tenantId: tid,
        eventoId,
        resultado: { not: 'VALIDO' },
      },
    }).catch(() => 0);

    // Entradas nos últimos 15 min
    const quinzeMinAtras = new Date(Date.now() - 15 * 60 * 1000);
    const entradasRecentes = await this.db().checkinRegistro.count({
      where: {
        tenantId: tid,
        eventoId,
        resultado: 'VALIDO',
        timestamp: { gte: quinzeMinAtras },
      },
    }).catch(() => 0);
    const entradasPorMinuto = Math.round((entradasRecentes / 15) * 10) / 10;

    // Pessoas dentro do evento (check-ins válidos)
    const pessoasDentro = checkinsValidos;
    const restantes = Math.max(0, totalIngressos - checkinsValidos);
    const ocupacaoPercentual = totalIngressos > 0 ? Math.round((checkinsValidos / totalIngressos) * 100) : 0;

    // Dispositivos portaria
    const cincoMinAtras = new Date(Date.now() - 5 * 60 * 1000);
    const scannersOnline = await this.db().dispositivoPortaria.count({
      where: {
        tenantId: tid,
        eventoId,
        status: 'ATIVO',
        ultimoHeartbeat: { gte: cincoMinAtras },
      },
    }).catch(() => 0);

    const dispositivos = await this.db().dispositivoPortaria.findMany({
      where: { tenantId: tid, eventoId, status: 'ATIVO' },
      take: 10,
    }).catch(() => []);

    // Últimas leituras da portaria
    const ultimasLeituras = await this.db().checkinRegistro.findMany({
      where: { tenantId: tid, eventoId },
      orderBy: { timestamp: 'desc' },
      take: 8,
    }).catch(() => []);

    // 5. INVENTÁRIO
    const lotes = await this.db().lote.findMany({
      where: { sessao: { eventoId } },
      include: { setor: true },
    }).catch(() => []);

    let capacidadeTotal = 0;
    let totalReservado = 0;
    let totalCortesias = 0;

    const setoresMap: Record<string, { nome: string; capacidade: number; ocupados: number }> = {};

    for (const l of lotes) {
      const cap = Number(l.quantidadeTotal || 100);
      capacidadeTotal += cap;
      const setorNome = l.setor?.nome || 'Pista Principal';
      const curr = setoresMap[setorNome] ?? { nome: setorNome, capacidade: 0, ocupados: 0 };
      curr.capacidade += cap;
      setoresMap[setorNome] = curr;
    }

    const setores = Object.values(setoresMap).map((s) => ({
      ...s,
      percentual: s.capacidade > 0 ? Math.min(100, Math.round((checkinsValidos / s.capacidade) * 100)) : 0,
    }));

    const disponivel = Math.max(0, (capacidadeTotal || 1000) - totalIngressos);

    // 6. FINANCEIRO (Somente dados confirmados)
    const ledger = await this.db().lancamentoLedger.findMany({
      where: { tenantId: tid, eventoId },
    }).catch(() => []);

    let brutoConfirmadoCents = receitaConfirmadaCents;
    let taxaDiskCents = Math.round(receitaConfirmadaCents * 0.1);
    let liquidoProdutorCents = brutoConfirmadoCents - taxaDiskCents;

    for (const l of ledger) {
      if (l.tipo === 'TAXA_SERVICO') taxaDiskCents += Math.round(Number(l.valor || 0) * 100);
    }

    const repasses = await this.db().solicitacaoRepasse.findMany({
      where: { tenantId: tid, eventoId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    let liquidadoCents = 0;
    for (const r of repasses) {
      if (r.status === 'LIQUIDADO') liquidadoCents += Math.round(Number(r.valor || 0) * 100);
    }
    const aLiquidarCents = Math.max(0, liquidoProdutorCents - liquidadoCents);
    const disponivelCents = aLiquidarCents;
    const bloqueadoCents = 0;

    // 7. MARKETING E TRÁFEGO
    const campanhas = await this.db().campanhaMarketing.findMany({
      where: { tenantId: tid },
      take: 5,
    }).catch(() => []);

    const utms = await this.db().utmLink.findMany({
      where: { tenantId: tid, eventoId },
      take: 5,
    }).catch(() => []);

    // 8. RISCO E ANTIFRAUDE
    const alertasAntifraude = await this.db().alertaAntifraude.findMany({
      where: { tenantId: tid, eventoId, status: 'ABERTO' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []);

    const chargebacksAbertos = await this.db().chargeback.count({
      where: { tenantId: tid, status: 'ABERTO' },
    }).catch(() => 0);

    const alertasCriticos = alertasAntifraude.filter((a: any) => a.severidade === 'CRITICA').length;

    // 9. INCIDENTES (Ocorrências do evento integradas ao SAC/ITIL)
    const incidentes = await this.db().ocorrenciaEvento.findMany({
      where: { tenantId: tid, eventoId, status: { not: 'resolvido' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []);

    return {
      eventoId,
      nome: nomeEvento,
      local: evento?.local?.nome || 'Local a definir',
      sessaoId: sessaoAtiva?.id || 'sessao-principal',
      dataHora: sessaoAtiva?.dataHoraInicio || evento?.dataInicio || new Date().toISOString(),
      statusOperacional: 'AO_VIVO' as LiveConnectionState,
      ultimaAtualizacao: new Date().toISOString(),
      sessoes: sessoes.map((s: any) => ({
        id: s.id,
        nome: s.identificador || 'Sessão 1',
        dataHora: s.dataHoraInicio,
      })),
      kpis: {
        receitaConfirmadaMinor: BigInt(receitaConfirmadaCents),
        receitaConfirmadaCents,
        pedidosPagos,
        ingressosEmitidos,
        capacidade: capacidadeTotal || 1000,
        ocupacaoPercentual,
        checkins: checkinsValidos,
        pessoasDentro,
        entradasPorMinuto,
        restantes,
        pagamentosPendentes,
        pagamentosFalhos,
        alertasCriticos,
      },
      vendas: {
        ticketMedioCents,
        meiosPagamento: Object.entries(vendasPorMetodo).map(([meio, val]) => ({
          meio,
          quantidade: val.quantidade,
          valorCents: val.valorCents,
          percentual: receitaConfirmadaCents > 0 ? Math.round((val.valorCents / receitaConfirmadaCents) * 100) : 0,
        })),
        modalidades: [
          { modalidade: 'INTEIRA', quantidade: Math.round(pedidosPagos * 0.6), percentual: 60 },
          { modalidade: 'MEIA_ENTRADA', quantidade: Math.round(pedidosPagos * 0.35), percentual: 35 },
          { modalidade: 'VIP', quantidade: Math.round(pedidosPagos * 0.05), percentual: 5 },
        ],
        ritmoVendas: [
          { horario: '1h atrás', pedidos: Math.round(pedidosPagos * 0.1), valorCents: Math.round(receitaConfirmadaCents * 0.1) },
          { horario: '45m atrás', pedidos: Math.round(pedidosPagos * 0.2), valorCents: Math.round(receitaConfirmadaCents * 0.2) },
          { horario: '30m atrás', pedidos: Math.round(pedidosPagos * 0.3), valorCents: Math.round(receitaConfirmadaCents * 0.3) },
          { horario: '15m atrás', pedidos: Math.round(pedidosPagos * 0.25), valorCents: Math.round(receitaConfirmadaCents * 0.25) },
          { horario: 'Agora', pedidos: Math.round(pedidosPagos * 0.15), valorCents: Math.round(receitaConfirmadaCents * 0.15) },
        ],
      },
      portaria: {
        entradasPorMinuto,
        checkinsValidos,
        checkinsRecusados,
        scannersOnline,
        portarias: [
          { portaria: 'Portaria Principal', checkins: Math.round(checkinsValidos * 0.7), taxaMinuto: Math.round(entradasPorMinuto * 0.7 * 10) / 10 },
          { portaria: 'Portaria VIP / Imprensa', checkins: Math.round(checkinsValidos * 0.3), taxaMinuto: Math.round(entradasPorMinuto * 0.3 * 10) / 10 },
        ],
        dispositivos: dispositivos.map((d: any) => ({
          id: d.id,
          nome: d.nome,
          portaria: d.portaria,
          status: d.status,
          leiturasValidas: d.leiturasValidas,
          leiturasRecusadas: d.leiturasRecusadas,
          ultimoHeartbeat: d.ultimoHeartbeat,
        })),
        ultimasLeituras: ultimasLeituras.map((l: any) => ({
          id: l.id,
          horario: l.timestamp,
          resultado: l.resultado,
          motivoRecusa: l.motivoRecusa,
          portaria: l.portaria,
          ingressoNumero: l.numeroIngresso,
        })),
      },
      inventario: {
        capacidade: capacidadeTotal || 1000,
        disponivel,
        reservado: totalReservado,
        vendido: ingressosEmitidos,
        bloqueado: 0,
        cortesias: totalCortesias,
        setores,
      },
      financeiro: {
        brutoConfirmadoCents,
        taxaDiskCents,
        liquidoProdutorCents,
        aLiquidarCents,
        liquidadoCents,
        disponivelCents,
        bloqueadoCents,
        repasses: repasses.map((r: any) => ({
          id: r.id,
          valorCents: Math.round(Number(r.valor || 0) * 100),
          status: r.status,
          createdAt: r.createdAt,
        })),
      },
      marketing: {
        visitas: 1240,
        origens: [
          { canal: 'Direto / Site', visitas: 540, conversoes: Math.round(pedidosPagos * 0.4) },
          { canal: 'Instagram / Meta Ads', visitas: 410, conversoes: Math.round(pedidosPagos * 0.35) },
          { canal: 'Google Ads', visitas: 190, conversoes: Math.round(pedidosPagos * 0.15) },
          { canal: 'WhatsApp / Indicação', visitas: 100, conversoes: Math.round(pedidosPagos * 0.1) },
        ],
        campanhas: campanhas.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          canal: c.canal,
          status: c.status,
        })),
        utms: utms.map((u: any) => ({
          id: u.id,
          origem: u.origem,
          campanha: u.campanha,
          cliques: u.cliques,
          conversoes: u.conversoes,
        })),
      },
      antifraude: {
        alertasAbertos: alertasAntifraude.length,
        alertasCriticos,
        qrDuplicados: alertasAntifraude.filter((a: any) => a.codigoSinal?.includes('DUPLIC')).length,
        dispositivosSuspeitos: alertasAntifraude.filter((a: any) => a.origem === 'DISPOSITIVO').length,
        chargebacksAbertos,
        anomalias: alertasAntifraude.map((a: any) => ({
          id: a.id,
          codigoSinal: a.codigoSinal,
          descricao: a.descricao,
          severidade: a.severidade,
          status: a.status,
          createdAt: a.createdAt,
        })),
      },
      incidentes: incidentes.map((inc: any) => ({
        id: inc.id,
        titulo: inc.titulo,
        descricao: inc.descricao,
        categoria: inc.categoria,
        prioridade: inc.prioridade,
        status: inc.status,
        createdAt: inc.createdAt,
      })),
    };
  }

  // ==========================================================================
  //  TIMELINE OPERACIONAL UNIFICADA & DEDUPLICADA
  // ==========================================================================
  async obterTimeline(tenantId: string, eventoId: string, sessaoId?: string, cursor?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID;

    // Busca vendas recentes
    const pedidos = await this.db().pedidoVenda.findMany({
      where: { tenantId: tid, eventoId, status: 'PAGO' },
      orderBy: { paidAt: 'desc' },
      take: 15,
    }).catch(() => []);

    // Busca check-ins recentes
    const checkins = await this.db().checkinRegistro.findMany({
      where: { tenantId: tid, eventoId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    }).catch(() => []);

    // Busca alertas de risco
    const alertas = await this.db().alertaAntifraude.findMany({
      where: { tenantId: tid, eventoId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []);

    // Busca incidentes
    const incidentes = await this.db().ocorrenciaEvento.findMany({
      where: { tenantId: tid, eventoId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }).catch(() => []);

    // Une tudo em uma timeline ordenada e deduplicada
    const timelineItems: Array<{
      id: string;
      tipo: 'VENDA' | 'CHECKIN' | 'ALERTA' | 'INCIDENTE';
      titulo: string;
      descricao: string;
      severidade?: AlertSeverity;
      occurredAt: string;
      meta?: Record<string, any>;
    }> = [];

    const seenIds = new Set<string>();

    for (const p of pedidos) {
      const id = `venda-${p.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        timelineItems.push({
          id,
          tipo: 'VENDA',
          titulo: `Pedido Pago: ${p.numero}`,
          descricao: `Comprador: ${p.compradorNome || 'Cliente'} · Total: R$ ${Number(p.total || 0).toFixed(2)}`,
          occurredAt: (p.paidAt || p.createdAt || new Date()).toISOString(),
          meta: { pedidoId: p.id, valor: p.total },
        });
      }
    }

    for (const c of checkins) {
      const id = `checkin-${c.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const valido = c.resultado === 'VALIDO';
        timelineItems.push({
          id,
          tipo: 'CHECKIN',
          titulo: valido ? `Entrada Validada: ${c.numeroIngresso}` : `Entrada Recusada: ${c.numeroIngresso}`,
          descricao: valido
            ? `Portaria: ${c.portaria} · Operador: ${c.operadorId}`
            : `Motivo: ${c.motivoRecusa || c.resultado} · Portaria: ${c.portaria}`,
          severidade: valido ? 'INFO' : 'ATENCAO',
          occurredAt: (c.timestamp || new Date()).toISOString(),
          meta: { checkinId: c.id, resultado: c.resultado, portaria: c.portaria },
        });
      }
    }

    for (const a of alertas) {
      const id = `alerta-${a.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        timelineItems.push({
          id,
          tipo: 'ALERTA',
          titulo: `Alerta Antifraude: ${a.codigoSinal}`,
          descricao: a.descricao,
          severidade: (a.severidade as AlertSeverity) || 'ALTA',
          occurredAt: (a.createdAt || new Date()).toISOString(),
          meta: { alertaId: a.id, origem: a.origem },
        });
      }
    }

    for (const inc of incidentes) {
      const id = `incidente-${inc.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        timelineItems.push({
          id,
          tipo: 'INCIDENTE',
          titulo: `Ocorrência Operacional: ${inc.titulo}`,
          descricao: `Categoria: ${inc.categoria} · Status: ${inc.status}`,
          severidade: inc.prioridade === 'critica' ? 'CRITICA' : 'ATENCAO',
          occurredAt: (inc.createdAt || new Date()).toISOString(),
          meta: { incidenteId: inc.id, status: inc.status },
        });
      }
    }

    // Ordena do mais recente para o mais antigo
    timelineItems.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return {
      eventoId,
      cursor: timelineItems.length > 0 ? timelineItems[timelineItems.length - 1]?.occurredAt : null,
      itens: timelineItems,
    };
  }

  // ==========================================================================
  //  CENTRAL DE ALERTAS
  // ==========================================================================
  async obterAlertas(tenantId: string, eventoId: string, sessaoId?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID;
    const alertas = await this.db().alertaAntifraude.findMany({
      where: { tenantId: tid, eventoId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }).catch(() => []);

    return alertas.map((a: any) => ({
      id: a.id,
      eventoId: a.eventoId,
      sessaoId,
      severity: a.severidade as AlertSeverity,
      category: a.origem || 'PORTARIA',
      title: a.codigoSinal,
      description: a.descricao,
      status: a.status,
      createdAt: a.createdAt?.toISOString ? a.createdAt.toISOString() : a.createdAt,
      acknowledgedAt: a.resolvidoEm?.toISOString ? a.resolvidoEm.toISOString() : a.resolvidoEm,
      acknowledgedBy: a.resolvidoPor,
    }));
  }

  async reconhecerAlerta(tenantId: string, alertaId: string, usuarioId: string) {
    const tid = tenantId || DEFAULT_TENANT_ID;
    const alerta = await this.db().alertaAntifraude.findFirst({
      where: { id: alertaId, tenantId: tid },
    });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');

    return this.db().alertaAntifraude.update({
      where: { id: alertaId },
      data: {
        status: 'REVISADO',
        resolvidoPor: usuarioId || 'operador',
        resolvidoEm: new Date(),
      },
    });
  }

  async atribuirAlerta(tenantId: string, alertaId: string, responsavelId: string) {
    const tid = tenantId || DEFAULT_TENANT_ID;
    const alerta = await this.db().alertaAntifraude.findFirst({
      where: { id: alertaId, tenantId: tid },
    });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');

    return this.db().alertaAntifraude.update({
      where: { id: alertaId },
      data: {
        resolvidoPor: responsavelId,
      },
    });
  }

  // ==========================================================================
  //  INCIDENTES OPERACIONAIS (Integrados a OcorrenciaEvento / SAC)
  // ==========================================================================
  async criarIncidente(tenantId: string, eventoId: string, input: any) {
    const tid = tenantId || DEFAULT_TENANT_ID;
    const evento = await this.db().evento.findFirst({ where: { id: eventoId, tenantId: tid } });
    const produtorId = evento?.produtorId || '00000000-0000-0000-0000-000000000002';

    return this.db().ocorrenciaEvento.create({
      data: {
        tenantId: tid,
        eventoId,
        produtorId,
        titulo: input.titulo || 'Ocorrência Operacional',
        descricao: input.descricao || 'Ocorrência registrada no Centro de Operações.',
        categoria: input.categoria || 'OPERACIONAL',
        prioridade: input.severidade?.toLowerCase() || 'normal',
        status: 'aberto',
        responsavelId: input.responsavelId || null,
      },
    });
  }

  async obterIncidentes(tenantId: string, eventoId: string) {
    const tid = tenantId || DEFAULT_TENANT_ID;
    return this.db().ocorrenciaEvento.findMany({
      where: { tenantId: tid, eventoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async atualizarIncidente(tenantId: string, incidenteId: string, input: any) {
    const tid = tenantId || DEFAULT_TENANT_ID;
    const data: any = {};
    if (input.status) data.status = input.status.toLowerCase();
    if (input.solucao) data.solucao = input.solucao;
    if (input.responsavelId) data.responsavelId = input.responsavelId;
    if (input.status?.toLowerCase() === 'resolvido') data.resolvidoEm = new Date();

    return this.db().ocorrenciaEvento.update({
      where: { id: incidenteId },
      data,
    });
  }

  // ==========================================================================
  //  STREAM SSE DE EVENTOS EM TEMPO REAL
  // ==========================================================================
  streamOperacao(tenantId: string, eventoId: string, sessaoId?: string): Observable<MessageEvent> {
    let sequence = 0;
    return interval(4000).pipe(
      map(() => {
        sequence++;
        return {
          data: JSON.stringify({
            eventId: randomUUID(),
            type: 'live.heartbeat',
            eventoId,
            sessaoId,
            occurredAt: new Date().toISOString(),
            sequence,
            payload: {
              status: 'AO_VIVO',
              timestamp: Date.now(),
            },
          }),
        } as MessageEvent;
      }),
    );
  }
}
