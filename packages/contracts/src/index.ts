export * from './shared/envelope.js';
export * from './shared/money.js';
export * from './events/index.js';
export * from './operacao-real/index.js';


import * as Eventos from './events/eventos.js';
import * as Pedidos from './events/pedidos.js';
import * as Estorno from './events/estorno.js';
import * as Sac from './events/sac.js';
import * as Acesso from './events/acesso.js';
import * as Financeiro from './events/financeiro.js';
import * as Marketing from './events/marketing.js';
import * as Comercial from './events/comercial.js';
import * as Contabilidade from './events/contabilidade.js';
import * as PosEvento from './events/pos-evento.js';
import * as Inteligencia from './events/inteligencia.js';
import * as Governanca from './events/governanca.js';
import * as Automacoes from './events/automacoes.js';

/**
 * Catálogo central. Toda vez que criar um evento novo, registre aqui.
 * O módulo Developer usa este catálogo para documentar o bus automaticamente.
 */
export const EventCatalog = {
  [Eventos.EventoPublicado.name]: Eventos.EventoPublicado,
  [Eventos.SessaoCriada.name]: Eventos.SessaoCriada,
  [Eventos.LoteAberto.name]: Eventos.LoteAberto,
  [Eventos.EventoCancelado.name]: Eventos.EventoCancelado,
  [Eventos.EventoAdiado.name]: Eventos.EventoAdiado,
  [Pedidos.ReservaCriada.name]: Pedidos.ReservaCriada,
  [Pedidos.ReservaExpirada.name]: Pedidos.ReservaExpirada,
  [Pedidos.PedidoCriado.name]: Pedidos.PedidoCriado,
  [Pedidos.PedidoPago.name]: Pedidos.PedidoPago,
  [Pedidos.PagamentoRecusado.name]: Pedidos.PagamentoRecusado,
  [Estorno.EstornoSolicitado.name]: Estorno.EstornoSolicitado,
  [Estorno.EstornoAprovado.name]: Estorno.EstornoAprovado,
  [Estorno.EstornoNegado.name]: Estorno.EstornoNegado,
  [Estorno.PagamentoEstornado.name]: Estorno.PagamentoEstornado,
  [Estorno.ChargebackRecebido.name]: Estorno.ChargebackRecebido,
  [Sac.ChamadoAberto.name]: Sac.ChamadoAberto,
  [Sac.SlaViolado.name]: Sac.SlaViolado,
  [Sac.ChamadoResolvido.name]: Sac.ChamadoResolvido,
  [Acesso.IngressoEmitido.name]: Acesso.IngressoEmitido,
  [Acesso.IngressoInvalidado.name]: Acesso.IngressoInvalidado,
  [Acesso.CheckinRealizado.name]: Acesso.CheckinRealizado,
  [Financeiro.LancamentoLedgerCriado.name]: Financeiro.LancamentoLedgerCriado,
  [Financeiro.TransferenciaInterEventoRealizada.name]: Financeiro.TransferenciaInterEventoRealizada,
  [Financeiro.RepasseSolicitado.name]: Financeiro.RepasseSolicitado,
  [Financeiro.RepasseLiquidado.name]: Financeiro.RepasseLiquidado,
  [Financeiro.AntecipacaoSolicitada.name]: Financeiro.AntecipacaoSolicitada,
  [Financeiro.AntecipacaoLiquidada.name]: Financeiro.AntecipacaoLiquidada,
  [Financeiro.DivergenciaDetectada.name]: Financeiro.DivergenciaDetectada,
  [Marketing.CampanhaCriada.name]: Marketing.CampanhaCriada,
  [Marketing.CampanhaStatusAlterado.name]: Marketing.CampanhaStatusAlterado,
  [Marketing.PixelConfigurado.name]: Marketing.PixelConfigurado,
  [Marketing.CupomCriado.name]: Marketing.CupomCriado,
  [Marketing.ConversaoAtribuida.name]: Marketing.ConversaoAtribuida,
  [Comercial.ProdutorB2BCadastrado.name]: Comercial.ProdutorB2BCadastrado,
  [Comercial.OportunidadeCriada.name]: Comercial.OportunidadeCriada,
  [Comercial.EtapaPipelineAlterada.name]: Comercial.EtapaPipelineAlterada,
  [Comercial.CondicaoComercialAprovada.name]: Comercial.CondicaoComercialAprovada,
  [Comercial.AtividadeComercialRegistrada.name]: Comercial.AtividadeComercialRegistrada,
  [Contabilidade.LancamentoContabilCriado.name]: Contabilidade.LancamentoContabilCriado,
  [Contabilidade.PeriodoContabilFechado.name]: Contabilidade.PeriodoContabilFechado,
  [Contabilidade.PeriodoContabilReaberto.name]: Contabilidade.PeriodoContabilReaberto,
  [Contabilidade.ConciliacaoContabilFinalizada.name]: Contabilidade.ConciliacaoContabilFinalizada,
  [PosEvento.PesquisaCriadaV1.name]: PosEvento.PesquisaCriadaV1,
  [PosEvento.CampanhaDisparadaV1.name]: PosEvento.CampanhaDisparadaV1,
  [PosEvento.PesquisaRespondidaV1.name]: PosEvento.PesquisaRespondidaV1,
  [PosEvento.ConsentimentoRegistradoV1.name]: PosEvento.ConsentimentoRegistradoV1,
  [PosEvento.BloqueioRegistradoV1.name]: PosEvento.BloqueioRegistradoV1,
  [PosEvento.SegmentoSalvoV1.name]: PosEvento.SegmentoSalvoV1,
  [Inteligencia.MetaDefinidaV1.name]: Inteligencia.MetaDefinidaV1,
  [Inteligencia.AlertaGeradoV1.name]: Inteligencia.AlertaGeradoV1,
  [Inteligencia.OportunidadeDetectadaV1.name]: Inteligencia.OportunidadeDetectadaV1,
  [Inteligencia.PrevisaoCalculadaV1.name]: Inteligencia.PrevisaoCalculadaV1,
  [Governanca.DivergenciaDetectadaV1.name]: Governanca.DivergenciaDetectadaV1,
  [Governanca.DivergenciaTratadaV1.name]: Governanca.DivergenciaTratadaV1,
  [Governanca.AuditoriaOperacaoRegistradaV1.name]: Governanca.AuditoriaOperacaoRegistradaV1,
  [Governanca.CatalogoTermoAtualizadoV1.name]: Governanca.CatalogoTermoAtualizadoV1,
  [Governanca.IntegracaoStatusAlteradoV1.name]: Governanca.IntegracaoStatusAlteradoV1,
  [Automacoes.RegraAutomacaoCriadaV1.name]: Automacoes.RegraAutomacaoCriadaV1,
  [Automacoes.RegraAutomacaoAlteradaV1.name]: Automacoes.RegraAutomacaoAlteradaV1,
  [Automacoes.RegraAutomacaoPausadaV1.name]: Automacoes.RegraAutomacaoPausadaV1,
  [Automacoes.AutomacaoExecutadaV1.name]: Automacoes.AutomacaoExecutadaV1,
  [Automacoes.AprovacaoSolicitadaV1.name]: Automacoes.AprovacaoSolicitadaV1,
  [Automacoes.AprovacaoDecididaV1.name]: Automacoes.AprovacaoDecididaV1,
  [Automacoes.DelegacaoAprovacaoRegistradaV1.name]: Automacoes.DelegacaoAprovacaoRegistradaV1,
  [Automacoes.NotificacaoCentralDisparadaV1.name]: Automacoes.NotificacaoCentralDisparadaV1,
} as const;

export type EventName = keyof typeof EventCatalog;
