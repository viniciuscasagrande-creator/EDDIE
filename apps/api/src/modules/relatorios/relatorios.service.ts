import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async catalogo() {
    return [
      { id: 'executivo', nome: 'Relatório Executivo', modulo: 'Geral', endpoint: '/relatorios/executivo' },
      { id: 'eventos', nome: 'Relatório de Eventos', modulo: 'Eventos', endpoint: '/relatorios/eventos' },
      { id: 'financeiro', nome: 'Relatório Financeiro', modulo: 'Financeiro', endpoint: '/relatorios/financeiro' },
      { id: 'contabilidade', nome: 'Relatório Contábil', modulo: 'Contabilidade', endpoint: '/relatorios/contabilidade' },
      { id: 'comercial', nome: 'Relatório Comercial B2B', modulo: 'Comercial', endpoint: '/relatorios/comercial' },
      { id: 'marketing', nome: 'Relatório de Marketing', modulo: 'Marketing', endpoint: '/relatorios/marketing' },
      { id: 'sac', nome: 'Relatório de Atendimento SAC', modulo: 'SAC', endpoint: '/relatorios/sac' },
      { id: 'suporte', nome: 'Relatório de Suporte Operacional', modulo: 'Suporte', endpoint: '/relatorios/suporte' },
      { id: 'estornos', nome: 'Relatório de Estornos', modulo: 'Estornos', endpoint: '/relatorios/estornos' },
    ];
  }

  private tenant(tenantId?: string) { return tenantId || '00000000-0000-0000-0000-000000000001'; }

  async executivo(tenantId?: string, produtorId?: string, eventoId?: string) {
    const t = this.tenant(tenantId);
    const [eventos, lancamentos, oportunidades, campanhas, chamados, ocorrencias, estornos] = await Promise.all([
      this.prisma.evento.count({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { id: eventoId } : {}) } }),
      this.prisma.lancamentoLedger.count({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) } }),
      this.prisma.oportunidadeComercial.count({ where: { tenantId: t } }),
      this.prisma.campanhaMarketing.count({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) } }),
      this.prisma.chamadoSac.count({ where: { tenantId: t, ...(eventoId ? { eventoId } : {}) } }),
      this.prisma.ocorrenciaEvento.count({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) } }),
      this.prisma.solicitacaoEstorno.count({ where: { tenantId: t } }),
    ]);
    return { geradoEm: new Date().toISOString(), filtros: { produtorId, eventoId }, eventos, lancamentos, oportunidades, campanhas, chamados, ocorrencias, estornos };
  }

  async eventos(tenantId?: string, produtorId?: string) {
    const t = this.tenant(tenantId);
    return this.prisma.evento.findMany({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}) }, include: { sessoes: { include: { setores: true, lotes: true } } }, orderBy: { createdAt: 'desc' } });
  }
  async financeiro(tenantId?: string, produtorId?: string, eventoId?: string) {
    const t = this.tenant(tenantId);
    const where = { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) };
    const [ledger, contas, repasses, antecipacoes, divergencias] = await Promise.all([
      this.prisma.lancamentoLedger.findMany({ where, orderBy: { criadoEm: 'desc' }, take: 500 }),
      this.prisma.contaPagar.findMany({ where, orderBy: { vencimentoEm: 'desc' }, take: 500 }),
      this.prisma.solicitacaoRepasse.findMany({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) }, orderBy: { solicitadoEm: 'desc' }, take: 500 }),
      this.prisma.solicitacaoAntecipacao.findMany({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) }, orderBy: { solicitadoEm: 'desc' }, take: 500 }),
      this.prisma.divergenciaConciliacao.findMany({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}) }, orderBy: { detectadaEm: 'desc' }, take: 500 }),
    ]);
    return { geradoEm: new Date().toISOString(), ledger, contas, repasses, antecipacoes, divergencias };
  }
  async contabilidade(tenantId?: string, produtorId?: string, eventoId?: string) {
    const t = this.tenant(tenantId);
    const [contas, lancamentos, fechamentos, conciliacoes] = await Promise.all([
      this.prisma.contaContabil.findMany({ where: { tenantId: t }, orderBy: { codigo: 'asc' } }),
      this.prisma.lancamentoContabil.findMany({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) }, include: { partidas: true }, orderBy: { data: 'desc' }, take: 500 }),
      this.prisma.fechamentoContabil.findMany({ where: { tenantId: t }, orderBy: { fechadoEm: 'desc' }, take: 100 }),
      this.prisma.conciliacaoContabil.findMany({ where: { tenantId: t }, orderBy: { conciliadoEm: 'desc' }, take: 500 }),
    ]);
    return { geradoEm: new Date().toISOString(), contas, lancamentos, fechamentos, conciliacoes };
  }
  async comercial(tenantId?: string) {
    const t = this.tenant(tenantId);
    const [produtores, oportunidades, atividades, metas] = await Promise.all([
      this.prisma.produtorB2B.findMany({ where: { tenantId: t }, orderBy: { createdAt: 'desc' }, take: 500 }),
      this.prisma.oportunidadeComercial.findMany({ where: { tenantId: t }, orderBy: { updatedAt: 'desc' }, take: 500 }),
      this.prisma.atividadeComercial.findMany({ where: { tenantId: t }, orderBy: { createdAt: 'desc' }, take: 500 }),
      this.prisma.metaComercial.findMany({ where: { tenantId: t }, orderBy: { createdAt: 'desc' }, take: 100 }),
    ]);
    return { geradoEm: new Date().toISOString(), produtores, oportunidades, atividades, metas };
  }
  async marketing(tenantId?: string, produtorId?: string, eventoId?: string) {
    const t = this.tenant(tenantId); const where = { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) };
    const [campanhas, pixels, utms, cupons, conversoes, alertas] = await Promise.all([
      this.prisma.campanhaMarketing.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 }),
      this.prisma.pixelTracking.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 }),
      this.prisma.utmLink.findMany({ where: { tenantId: t, ...(produtorId ? { produtorId } : {}), ...(eventoId ? { eventoId } : {}) }, orderBy: { createdAt: 'desc' }, take: 500 }),
      this.prisma.cupomMarketing.findMany({ where: { tenantId: t, ...(eventoId ? { eventoId } : {}) }, orderBy: { createdAt: 'desc' }, take: 500 }),
      this.prisma.conversaoMarketing.findMany({ where: { tenantId: t, ...(eventoId ? { eventoId } : {}) }, orderBy: { atribuidaEm: 'desc' }, take: 500 }),
      this.prisma.alertaMarketing.findMany({ where: { tenantId: t, ...(eventoId ? { eventoId } : {}) }, orderBy: { createdAt: 'desc' }, take: 500 }),
    ]); return { geradoEm: new Date().toISOString(), campanhas, pixels, utms, cupons, conversoes, alertas };
  }
  async sac(tenantId?: string, eventoId?: string) { const t=this.tenant(tenantId); return { geradoEm:new Date().toISOString(), chamados: await this.prisma.chamadoSac.findMany({ where:{tenantId:t,...(eventoId?{eventoId}:{})}, include:{mensagens:true}, orderBy:{createdAt:'desc'}, take:500 }) }; }
  async suporte(tenantId?: string, produtorId?: string, eventoId?: string) { const t=this.tenant(tenantId); return { geradoEm:new Date().toISOString(), ocorrencias: await this.prisma.ocorrenciaEvento.findMany({ where:{tenantId:t,...(produtorId?{produtorId}:{}),...(eventoId?{eventoId}:{})}, orderBy:{createdAt:'desc'}, take:500 }) }; }
  async estornos(tenantId?: string) { const t=this.tenant(tenantId); return { geradoEm:new Date().toISOString(), estornos: await this.prisma.solicitacaoEstorno.findMany({ where:{tenantId:t}, include:{transicoes:true}, orderBy:{solicitadoEm:'desc'}, take:500 }) }; }
}
