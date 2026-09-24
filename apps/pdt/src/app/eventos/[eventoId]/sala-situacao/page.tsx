'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Flame,
  MessageSquare,
  Phone,
  Radio,
  RefreshCcw,
  ScanLine,
  Send,
  Shield,
  ShieldAlert,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { EventOsShell } from '../../../../components/eventos/EventOsShell';
import { useProducerEvent } from '../../../../components/ProducerEventContext';

export default function SalaSituacaoPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensagemFeed, setMensagemFeed] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'INFO' | 'ACAO' | 'DECISAO'>('ACAO');
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Modais de ação rápida
  const [modalContingenciaPortaria, setModalContingenciaPortaria] = useState(false);
  const [executandoContingencia, setExecutandoContingencia] = useState(false);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarDados = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/eventos/${eventoId}/sala-situacao`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('Falha ao carregar Sala de Situação:', e);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    if (!eventoId) return;
    carregarDados();
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, [eventoId, carregarDados]);

  const postarMensagemFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagemFeed.trim()) return;
    setEnviandoMensagem(true);
    try {
      await fetch(`/api/eventos/${eventoId}/sala-situacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'REGISTRAR_NOTA_CRISE',
          mensagem: mensagemFeed,
          tipo: tipoMensagem,
        }),
      });
      setMensagemFeed('');
      carregarDados();
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const alternarContingenciaPortaria = async () => {
    setExecutandoContingencia(true);
    try {
      await fetch(`/api/eventos/${eventoId}/sala-situacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'TOGGLE_CONTINGENCIA_PORTARIA',
          estado: !data?.contingenciaPortariaAtiva,
        }),
      });
      setModalContingenciaPortaria(false);
      carregarDados();
    } catch (err) {
      console.error(err);
    } finally {
      setExecutandoContingencia(false);
    }
  };

  const isCrise = data?.statusGeral === 'CRISE_P1';

  return (
    <EventOsShell eventoId={eventoId || 'evento-operacao'}>
      <div className="space-y-6 text-slate-100 pb-12">
        {/* WAR ROOM TOP BANNER */}
        <div
          className={`rounded-2xl border p-5 md:p-6 transition shadow-xl ${
            isCrise
              ? 'border-rose-500/70 bg-gradient-to-r from-rose-950/60 via-[#191118] to-[#121620] shadow-rose-950/30'
              : 'border-slate-800 bg-[#121620]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
                <ShieldAlert size={18} className="animate-pulse" />
                <span>Sala de Situação & War Room do Evento</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                {data?.eventoNome || 'Festival DiskIngressos Live 2026'}
              </h1>
              <p className="text-slate-300 text-sm mt-0.5">
                Visão correlacionada em tempo real entre Portaria, Gateway de Pagamento, Vendas e Incidentes Críticos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estado Operacional</div>
                <div className="text-sm font-black text-rose-400 flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{data?.statusGeral || 'MONITORANDO'}</span>
                </div>
              </div>

              <button
                onClick={() => carregarDados()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* PAINÉIS CORRELACIONADOS: PORTARIA vs PAGAMENTOS vs VENDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* PAINEL 1: PORTARIA & CATRACAS */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ScanLine size={18} className="text-sky-400" />
                <span>Portaria & Acesso</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {data?.portaria?.scannersOnline || 0} / {data?.portaria?.scannersTotal || 0} Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Fluxo Passagem</div>
                <div className="text-xl font-black text-white mt-1">
                  {data?.portaria?.taxaLeiturasMin || 0} <span className="text-xs font-normal text-slate-400">/min</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Público Dentro</div>
                <div className="text-xl font-black text-white mt-1">
                  {data?.portaria?.totalEntradas?.toLocaleString('pt-BR') || 0}
                </div>
                <div className="text-[10px] text-slate-500">{data?.portaria?.ocupacaoPercentual}% ocupação</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Leitores com Falha:</span>
                <strong className={data?.portaria?.scannersOffline > 0 ? 'text-rose-400' : 'text-slate-400'}>
                  {data?.portaria?.scannersOffline || 0} terminal
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>QR Duplicados (1h):</span>
                <strong className="text-amber-400">{data?.portaria?.qrDuplicadosUltimaHora || 0} tentativas</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Modo Contingência:</span>
                <strong className={data?.contingenciaPortariaAtiva ? 'text-amber-400' : 'text-emerald-400'}>
                  {data?.contingenciaPortariaAtiva ? 'ATIVO (Offline)' : 'DESATIVADO (Normal)'}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setModalContingenciaPortaria(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-2.5 text-xs font-bold text-amber-300 transition"
            >
              <WifiOff size={14} />
              <span>{data?.contingenciaPortariaAtiva ? 'Desativar Contingência' : 'Chavear Portaria Offline'}</span>
            </button>
          </div>

          {/* PAINEL 2: GATEWAY & PAGAMENTOS */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CreditCard size={18} className="text-amber-400" />
                <span>Gateway & Pagamentos</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                data?.pagamentos?.gatewayPrincipalStatus === 'DEGRADADO'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}>
                {data?.pagamentos?.gatewayPrincipalStatus || 'ONLINE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Aprovação Pix</div>
                <div className="text-xl font-black text-rose-400 mt-1">
                  {data?.pagamentos?.taxaAprovacaoPix || 0}%
                </div>
                <div className="text-[10px] text-slate-500">Meta: &gt; 95%</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Aprovação Cartão</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {data?.pagamentos?.taxaAprovacaoCartao || 0}%
                </div>
                <div className="text-[10px] text-slate-500">Estável</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Latência Webhook:</span>
                <strong className="text-amber-400">{data?.pagamentos?.filaWebhookMs || 0} ms</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Erros (15 min):</span>
                <strong className="text-rose-400">{data?.pagamentos?.errosUltimos15Min || 0} recusas</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Adquirente Reserva:</span>
                <strong className="text-sky-400">{data?.pagamentos?.gatewaySecundarioStatus || 'STANDBY'}</strong>
              </div>
            </div>

            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-2.5 text-center text-xs text-sky-300 font-semibold">
              Split automático redirecionando 100% dos novos Pix para adquirente de contingência.
            </div>
          </div>

          {/* PAINEL 3: VENDAS & INVENTÁRIO */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Activity size={18} className="text-emerald-400" />
                <span>Vendas & Ritmo Atual</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {data?.vendas?.velocidadeVendasMin || 0} ingressos/min
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Total Vendido</div>
                <div className="text-xl font-black text-white mt-1">
                  {data?.vendas?.ingressosVendidosTotal?.toLocaleString('pt-BR') || 0}
                </div>
                <div className="text-[10px] text-slate-500">Ingressos emitidos</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400">Receita Bruta</div>
                <div className="text-xl font-black text-white mt-1">
                  R$ {((data?.vendas?.receitaTotalCentavos || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-500">Confirmada em banco</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Carrinhos em Espera:</span>
                <strong className="text-sky-300">{data?.vendas?.reservasAtivasCarrinho || 0} reservas ativas</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Conversão de Checkout:</span>
                <strong className="text-emerald-400">76.8%</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Alocação de Lotes:</span>
                <strong className="text-slate-300">Lote 2 Aberto</strong>
              </div>
            </div>

            <Link
              href={`/eventos/${eventoId}/operacao`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-200 transition"
            >
              <span>Ver Centro de Operações Completo</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* SEÇÃO INFERIOR: FEED DA CRISE + EQUIPE DE PRONTIDÃO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* FEED OPERACIONAL / TIMELINE DE DECISÕES */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <MessageSquare size={18} className="text-rose-400" />
                <span>Feed de Ações da War Room (Timeline de Crise)</span>
              </div>
              <span className="text-xs text-slate-500">Histórico de ações e decisões imutável</span>
            </div>

            {/* LISTA DE REGISTROS */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {(data?.feedCrise || []).map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{item.autor}</strong>
                      <span className="text-[10px] text-slate-400">({item.cargo})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.tipo === 'DECISAO'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.tipo === 'ACAO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {item.tipo}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed pt-0.5">{item.mensagem}</p>
                </div>
              ))}
            </div>

            {/* FORMULÁRIO DE NOVA NOTA */}
            <form onSubmit={postarMensagemFeed} className="flex gap-2 pt-2 border-t border-slate-800">
              <select
                value={tipoMensagem}
                onChange={(e) => setTipoMensagem(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="ACAO">Ação</option>
                <option value="DECISAO">Decisão</option>
                <option value="INFO">Informativo</option>
              </select>

              <input
                type="text"
                required
                placeholder="Registrar ação ou nota oficial no log da War Room..."
                value={mensagemFeed}
                onChange={(e) => setMensagemFeed(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />

              <button
                type="submit"
                disabled={enviandoMensagem || !mensagemFeed.trim()}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={13} />
                <span>Registrar</span>
              </button>
            </form>
          </div>

          {/* EQUIPE DE PRONTIDÃO / RESPONDERS */}
          <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Users size={18} className="text-sky-400" />
                <span>Responders de Prontidão</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                5 Operadores
              </span>
            </div>

            <div className="space-y-3">
              {(data?.equipeProntidao || []).map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{m.nome}</div>
                    <div className="text-[11px] text-slate-400">{m.papel}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{m.telefone}</div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      m.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Alerta de rádio / push disparado para toda a equipe de campo.')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 py-2.5 text-xs font-bold text-rose-300 transition"
              >
                <Radio size={14} className="animate-pulse" />
                <span>Disparar Push para Todos Responders</span>
              </button>
            </div>
          </div>
        </div>

        {/* MODAL CONFIRMAÇÃO CONTINGÊNCIA PORTARIA */}
        {modalContingenciaPortaria && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-amber-500/60 bg-[#121620] p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-white">Chavear Contingência de Portaria?</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Ao ativar o modo de contingência, os 30 scanners do evento alternam para{' '}
                <strong className="text-white">validação local de hash criptográfico assinado</strong>, permitindo fluxo de entrada contínuo mesmo com perda total de conectividade de rede externa.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalContingenciaPortaria(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={executandoContingencia}
                  onClick={alternarContingenciaPortaria}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {executandoContingencia ? 'Executando...' : 'Confirmar Chaveamento'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EventOsShell>
  );
}
