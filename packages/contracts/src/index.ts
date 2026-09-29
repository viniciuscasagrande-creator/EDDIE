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
import * as Operacao from './events/operacao.js';
import * as Seguranca from './events/seguranca.js';
import * as Documentos from './events/documentos.js';
import * as Tesouraria from './events/tesouraria.js';
import * as Fiscal from './events/fiscal.js';

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
  [Contabilidade.RegraContabilPublicadaV1.name]: Contabilidade.RegraContabilPublicadaV1,
  [Contabilidade.AjusteContabilRealizadoV1.name]: Contabilidade.AjusteContabilRealizadoV1,
  [Contabilidade.FechamentoEventoContabilConcluidoV1.name]: Contabilidade.FechamentoEventoContabilConcluidoV1,
  [Contabilidade.DivergenciaSubsistemaDetectadaV1.name]: Contabilidade.DivergenciaSubsistemaDetectadaV1,
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
  [Operacao.SinalOperacionalEmitidoV1.name]: Operacao.SinalOperacionalEmitidoV1,
  [Operacao.AlertaOperacionalDisparadoV1.name]: Operacao.AlertaOperacionalDisparadoV1,
  [Operacao.AlertaOperacionalReconhecidoV1.name]: Operacao.AlertaOperacionalReconhecidoV1,
  [Operacao.IncidenteOperacionalAbertoV1.name]: Operacao.IncidenteOperacionalAbertoV1,
  [Operacao.IncidenteOperacionalAtualizadoV1.name]: Operacao.IncidenteOperacionalAtualizadoV1,
  [Operacao.IncidenteOperacionalEncerradoV1.name]: Operacao.IncidenteOperacionalEncerradoV1,
  [Operacao.ProcedimentoOperacionalExecutadoV1.name]: Operacao.ProcedimentoOperacionalExecutadoV1,
  [Operacao.PosIncidenteConcluidoV1.name]: Operacao.PosIncidenteConcluidoV1,
  [Operacao.ProblemaOperacionalRegistradoV1.name]: Operacao.ProblemaOperacionalRegistradoV1,
  [Seguranca.SessaoSuspeitaDetectadaV1.name]: Seguranca.SessaoSuspeitaDetectadaV1,
  [Seguranca.OperacaoSensivelRequeridaV1.name]: Seguranca.OperacaoSensivelRequeridaV1,
  [Seguranca.ReautenticacaoRealizadaV1.name]: Seguranca.ReautenticacaoRealizadaV1,
  [Seguranca.RiscoTransacaoAvaliadoV1.name]: Seguranca.RiscoTransacaoAvaliadoV1,
  [Seguranca.TentativaDuplicadaIngressoV1.name]: Seguranca.TentativaDuplicadaIngressoV1,
  [Seguranca.BloqueioSegurancaAplicadoV1.name]: Seguranca.BloqueioSegurancaAplicadoV1,
  [Seguranca.InvestigacaoSegurancaAbertaV1.name]: Seguranca.InvestigacaoSegurancaAbertaV1,
  [Seguranca.PoliticaSegurancaVioladaV1.name]: Seguranca.PoliticaSegurancaVioladaV1,
  [Documentos.DocumentoCriadoV1.name]: Documentos.DocumentoCriadoV1,
  [Documentos.DocumentoAprovadoV1.name]: Documentos.DocumentoAprovadoV1,
  [Documentos.DocumentoRejeitadoV1.name]: Documentos.DocumentoRejeitadoV1,
  [Documentos.SolicitacaoAssinaturaEmitidaV1.name]: Documentos.SolicitacaoAssinaturaEmitidaV1,
  [Documentos.AssinaturaRealizadaV1.name]: Documentos.AssinaturaRealizadaV1,
  [Documentos.DocumentoConcluidoV1.name]: Documentos.DocumentoConcluidoV1,
  [Documentos.DocumentoContestadoV1.name]: Documentos.DocumentoContestadoV1,
  [Documentos.DivergenciaContratualDetectadaV1.name]: Documentos.DivergenciaContratualDetectadaV1,
  [Documentos.DossieSnapshotGeradoV1.name]: Documentos.DossieSnapshotGeradoV1,
  [Documentos.DossieReabertoV1.name]: Documentos.DossieReabertoV1,
  [Tesouraria.OrdemPagamentoCriadaV1.name]: Tesouraria.OrdemPagamentoCriadaV1,
  [Tesouraria.OrdemPagamentoLiquidadaV1.name]: Tesouraria.OrdemPagamentoLiquidadaV1,
  [Tesouraria.PagamentoPixDesconhecidoV1.name]: Tesouraria.PagamentoPixDesconhecidoV1,
  [Tesouraria.ConciliacaoBancariaRealizadaV1.name]: Tesouraria.ConciliacaoBancariaRealizadaV1,
  [Tesouraria.DivergenciaMdrDetectadaV1.name]: Tesouraria.DivergenciaMdrDetectadaV1,
  [Tesouraria.TransferenciaExecutadaV1.name]: Tesouraria.TransferenciaExecutadaV1,
  [Tesouraria.FechamentoTesourariaConcluidoV1.name]: Tesouraria.FechamentoTesourariaConcluidoV1,
  [Fiscal.DocumentoFiscalEmitidoV1.name]: Fiscal.DocumentoFiscalEmitidoV1,
  [Fiscal.DocumentoFiscalAutorizadoV1.name]: Fiscal.DocumentoFiscalAutorizadoV1,
  [Fiscal.DocumentoFiscalRejeitadoV1.name]: Fiscal.DocumentoFiscalRejeitadoV1,
  [Fiscal.DocumentoFiscalCanceladoV1.name]: Fiscal.DocumentoFiscalCanceladoV1,
  [Fiscal.RegraTributariaPublicadaV1.name]: Fiscal.RegraTributariaPublicadaV1,
  [Fiscal.ApuracaoTributariaConcluidaV1.name]: Fiscal.ApuracaoTributariaConcluidaV1,
  [Fiscal.ObrigacaoFiscalCumpridaV1.name]: Fiscal.ObrigacaoFiscalCumpridaV1,
  [Fiscal.RetencaoTributariaRegistradaV1.name]: Fiscal.RetencaoTributariaRegistradaV1,
  [Fiscal.DivergenciaFiscalDetectadaV1.name]: Fiscal.DivergenciaFiscalDetectadaV1,
} as const;

export type EventName = keyof typeof EventCatalog;
