export * from './shared/envelope.js';
export * from './shared/money.js';
export * from './events/index.js';

import * as Eventos from './events/eventos.js';
import * as Pedidos from './events/pedidos.js';
import * as Estorno from './events/estorno.js';
import * as Sac from './events/sac.js';
import * as Acesso from './events/acesso.js';
import * as Financeiro from './events/financeiro.js';

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
} as const;

export type EventName = keyof typeof EventCatalog;
