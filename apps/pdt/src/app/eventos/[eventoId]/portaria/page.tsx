'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCcw,
  Smartphone,
  Users,
  Radio,
  Clock,
  ShieldAlert,
  Plus,
  Ban,
  Activity,
  QrCode,
  TrendingUp,
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';
import { ModuleNavigation } from '../../../../components/navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../../../../components/navigation/CompactOperationalAlert';

type TabView = 'monitor' | 'simulador' | 'checkins' | 'dispositivos';

export default function PortariaPage({ params }: { params: Promise<{ eventoId: string }> }) {
  const [eventoId, setEventoId] = useState('');
  const { api } = useProducerEvent();

  const [tab, setTab] = useState<TabView>('monitor');
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [dispositivos, setDispositivos] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Simulador de leitor / scanner
  const [qrInput, setQrInput] = useState('');
  const [validando, setValidando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<any>(null);

  // Novo leitor
  const [novoDispositivoNome, setNovoDispositivoNome] = useState('');
  const [novaPortaria, setNovaPortaria] = useState('Portaria Principal');
  const [salvandoDispositivo, setSalvandoDispositivo] = useState(false);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarDados = useCallback(async () => {
    if (!api || !eventoId) return;
    try {
      const [rResumo, rCheckins, rDispositivos] = await Promise.all([
        fetch(`${api}/eventos/${eventoId}/portaria/resumo`),
        fetch(`${api}/eventos/${eventoId}/portaria/checkins?limit=25`),
        fetch(`${api}/eventos/${eventoId}/portaria/dispositivos`),
      ]);

      if (rResumo.ok) {
        const d = await rResumo.json();
        setResumo(d && typeof d === 'object' ? d : null);
      }
      if (rCheckins.ok) {
        const d = await rCheckins.json();
        setCheckins(Array.isArray(d) ? d : (d?.items || d?.checkins || []));
      }
      if (rDispositivos.ok) {
        const d = await rDispositivos.json();
        setDispositivos(Array.isArray(d) ? d : (d?.items || d?.dispositivos || []));
      }
    } catch {
      setFeedback({
        tipo: 'error',
        texto: 'API de Portaria Offline (503). O serviço operacional está temporariamente sem resposta.',
      });
    } finally {
      setLoading(false);
    }
  }, [api, eventoId]);

  useEffect(() => {
    carregarDados();
    // Polling em tempo real a cada 6 segundos
    const timer = setInterval(() => {
      carregarDados();
    }, 6000);
    return () => clearInterval(timer);
  }, [carregarDados]);

  const handleValidarLeitura = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!qrInput.trim() || !api) return;

    setValidando(true);
    setUltimoResultado(null);
    try {
      const res = await fetch(`${api}/checkin/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId,
          qrToken: qrInput.trim(),
          operadorId: 'operador-central',
          portaria: novaPortaria,
        }),
      });

      const data = await res.json();
      setUltimoResultado(data);
      setQrInput('');
      void carregarDados();
    } catch (err: any) {
      setUltimoResultado({
        resultado: 'ERRO_CONEXAO',
        mensagem: 'Falha de comunicação com o serviço de check-in.',
      });
    } finally {
      setValidando(false);
    }
  };

  const handleCadastrarDispositivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDispositivoNome.trim() || !api) return;

    setSalvandoDispositivo(true);
    try {
      const res = await fetch(`${api}/eventos/${eventoId}/portaria/dispositivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoDispositivoNome.trim(),
          portaria: novaPortaria,
        }),
      });
      if (res.ok) {
        setNovoDispositivoNome('');
        setFeedback({ tipo: 'success', texto: 'Dispositivo cadastrado e autorizado com sucesso!' });
        void carregarDados();
      }
    } catch {
      setFeedback({ tipo: 'error', texto: 'Erro ao cadastrar dispositivo.' });
    } finally {
      setSalvandoDispositivo(false);
    }
  };

  const handleRevogarDispositivo = async (id: string) => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/portaria/dispositivos/${id}/revogar`, {
        method: 'POST',
      });
      if (res.ok) {
        setFeedback({ tipo: 'success', texto: 'Dispositivo revogado com sucesso.' });
        void carregarDados();
      }
    } catch {
      setFeedback({ tipo: 'error', texto: 'Erro ao revogar dispositivo.' });
    }
  };

  const checkinList = Array.isArray(checkins) ? checkins : [];
  const dispositivoList = Array.isArray(dispositivos) ? dispositivos : [];

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Radio size={15} className="animate-pulse" /> Portaria & Check-in em Tempo Real
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Central de Controle de Portaria</h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitoramento ao vivo de catracas, validação atômica de QR Code e fluxo de público.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Operação Ao Vivo
          </span>
          <button
            onClick={() => void carregarDados()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Atualizar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* KPIs Superiores */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Emitidos</div>
          <div className="text-2xl font-black text-white mt-1">{resumo?.totalIngressos ?? '—'}</div>
          <div className="text-[10px] text-slate-500 mt-1">Vendas confirmadas</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
            <CheckCircle2 size={13} /> Entradas Válidas
          </div>
          <div className="text-2xl font-black text-white mt-1">{resumo?.checkinsValidos ?? '—'}</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp size={11} /> {resumo?.ritmoPorMinuto ?? 0} leituras/min
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-amber-400 uppercase flex items-center gap-1.5">
            <AlertTriangle size={13} /> Já Utilizados
          </div>
          <div className="text-2xl font-black text-white mt-1">{resumo?.jaUtilizados ?? '—'}</div>
          <div className="text-[10px] text-slate-500 mt-1">Consumo registrado</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-rose-400 uppercase flex items-center gap-1.5">
            <XCircle size={13} /> Recusados
          </div>
          <div className="text-2xl font-black text-white mt-1">{resumo?.checkinsRecusados ?? '—'}</div>
          <div className="text-[10px] text-rose-400 mt-1">Barrados na catraca</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-sky-400 uppercase flex items-center gap-1.5">
            <Users size={13} /> Ocupação
          </div>
          <div className="text-2xl font-black text-white mt-1">{resumo?.ocupacaoPercentual ?? 0}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{resumo?.restantes ?? '—'} restantes</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-purple-400 uppercase flex items-center gap-1.5">
            <Smartphone size={13} /> Scanners
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {resumo?.scannersOnline ?? 0}/{resumo?.scannersTotal ?? 0}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Conectados à rede</div>
        </div>
      </div>

      {/* Navegação Fixa e Responsiva (Sem scroll horizontal) */}
      <ModuleNavigation
        items={[
          { id: 'monitor', label: 'Monitor ao Vivo', icon: <Activity size={15} /> },
          { id: 'simulador', label: 'Validar QR Code', icon: <QrCode size={15} /> },
          { id: 'checkins', label: 'Histórico de Leituras', icon: <Clock size={15} />, badge: checkinList.length },
          { id: 'dispositivos', label: 'Catracas & Scanners', icon: <Smartphone size={15} />, badge: dispositivoList.length },
        ]}
        activeItem={tab}
        onSelect={(id) => setTab(id as TabView)}
        ariaLabel="Navegação da Portaria"
      />

      {/* Alerta Operacional Compacto */}
      {feedback && (
        feedback.texto.includes('503') || feedback.texto.includes('Offline') ? (
          <div className="flex items-center justify-between py-1">
            <CompactOperationalAlert
              status="offline"
              title="Portaria Offline (503)"
              detail={feedback.texto}
              onOpen={() => alert(feedback.texto)}
            />
            <button onClick={() => setFeedback(null)} className="text-xs text-slate-500 hover:text-white">
              Dispensar
            </button>
          </div>
        ) : (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              feedback.tipo === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{feedback.texto}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )
      )}

      {/* TAB: MONITOR AO VIVO */}
      {tab === 'monitor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-sky-400" /> Fluxo de Acesso em Tempo Real
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Últimas leituras registradas em todas as portarias e catracas ativas.
              </p>

              <div className="mt-4 divide-y divide-slate-800">
                {checkinList.slice(0, 8).map((chk) => {
                  const isValido = chk.resultado === 'VALIDO';
                  return (
                    <div key={chk.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isValido
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {isValido ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white font-mono">{chk.numeroIngresso}</div>
                          <div className="text-xs text-slate-400">
                            {chk.portaria} • Operador: {chk.operadorId}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isValido
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {chk.resultado}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(chk.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {checkinList.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Nenhuma leitura de check-in registrada no momento.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lateral: Alertas & Portarias */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" /> Alertas da Portaria
              </h3>
              <p className="text-xs text-slate-400 mt-1">Sinais detectados de duplicidade ou desvio.</p>

              <div className="mt-4 space-y-3">
                {resumo?.alertasAbertos ? (
                  <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    <div>
                      <strong>{resumo.alertasAbertos} ocorrência(s) antifraude em aberto</strong>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Tentativas de QR duplicado ou leitura fora da janela.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Nenhuma anomalia crítica na portaria.</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Recusa Geral</span>
                    <strong className="text-white">
                      {resumo?.totalIngressos
                        ? Math.round(((resumo.checkinsRecusados || 0) / (resumo.totalIngressos || 1)) * 100)
                        : 0}
                      %
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Janela de Acesso</span>
                    <strong className="text-emerald-400">Liberada (Operação Normal)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SIMULADOR DE VALIDAÇÃO DE QR */}
      {tab === 'simulador' && (
        <div className="max-w-2xl mx-auto rounded-xl border border-slate-700/80 bg-[#25272c] p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ScanLine size={20} className="text-sky-400" /> Validar Leitura de QR Code
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simule a leitura ótica de um ingresso para testar o consumo atômico e as regras de fraude.
            </p>
          </div>

          <form onSubmit={handleValidarLeitura} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Token / Código Hash do Ingresso
              </label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Ex.: ING-2026-XXXX ou token SHA256"
                className="w-full bg-[#181a1d] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Portaria</label>
                <input
                  type="text"
                  value={novaPortaria}
                  onChange={(e) => setNovaPortaria(e.target.value)}
                  className="w-full bg-[#181a1d] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Operador</label>
                <input
                  type="text"
                  defaultValue="operador-central"
                  disabled
                  className="w-full bg-[#181a1d]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={validando}
              className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              <ScanLine size={18} />
              {validando ? 'Validando atomicamente no banco...' : 'Registrar Leitura (Check-in)'}
            </button>
          </form>

          {ultimoResultado && (
            <div
              className={`p-5 rounded-xl border text-center space-y-2 ${
                ultimoResultado.resultado === 'VALIDO'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="text-3xl font-black uppercase tracking-wider">
                {ultimoResultado.resultado === 'VALIDO' ? '✅ ENTRADA AUTORIZADA' : '🚫 RECUSADO'}
              </div>
              <div className="text-sm font-semibold">{ultimoResultado.mensagem}</div>
              {ultimoResultado.numero && (
                <div className="text-xs font-mono text-slate-300">Ingresso: {ultimoResultado.numero}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: HISTÓRICO DE LEITURAS */}
      {tab === 'checkins' && (
        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Histórico Completo de Leituras</h3>
            <span className="text-xs text-slate-400">{checkinList.length} registros recentes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1c1e22] text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ingresso</th>
                  <th className="py-3 px-4">Portaria</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4">Resultado</th>
                  <th className="py-3 px-4">Motivo / Detalhe</th>
                  <th className="py-3 px-4 text-right">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {checkinList.map((c) => (
                  <tr key={c.id} className="hover:bg-[#202227] transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{c.numeroIngresso}</td>
                    <td className="py-3 px-4 text-slate-300">{c.portaria}</td>
                    <td className="py-3 px-4 text-slate-400">{c.operadorId}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.resultado === 'VALIDO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.resultado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.motivoRecusa || '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(c.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CATRACAS & SCANNERS */}
      {tab === 'dispositivos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-700/80 bg-[#25272c] overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">Dispositivos Autorizados</h3>
                  <span className="text-xs text-slate-400">{dispositivoList.length} configurados</span>
                </div>

                <div className="divide-y divide-slate-800">
                  {dispositivoList.map((d) => {
                    const isAtivo = d.status === 'ATIVO';
                    return (
                      <div key={d.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isAtivo
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{d.nome}</div>
                            <div className="text-xs text-slate-400">
                              {d.portaria} • ID: <span className="font-mono">{d.identificador}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right text-xs">
                            <div className="text-slate-300">
                              <span className="text-emerald-400 font-bold">{d.leiturasValidas}</span> válidas /{' '}
                              <span className="text-rose-400 font-bold">{d.leiturasRecusadas}</span> recusas
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Último sinal: {new Date(d.ultimoHeartbeat).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>

                          {isAtivo ? (
                            <button
                              onClick={() => handleRevogarDispositivo(d.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Ban size={12} /> Revogar
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold uppercase">Revogado</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cadastro de Novo Dispositivo */}
            <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-5 space-y-4 h-fit">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus size={16} className="text-sky-400" /> Autorizar Novo Leitor
              </h3>
              <form onSubmit={handleCadastrarDispositivo} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Leitor</label>
                  <input
                    type="text"
                    value={novoDispositivoNome}
                    onChange={(e) => setNovoDispositivoNome(e.target.value)}
                    placeholder="Ex.: Catraca VIP 01"
                    className="w-full bg-[#181a1d] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Portaria / Setor</label>
                  <input
                    type="text"
                    value={novaPortaria}
                    onChange={(e) => setNovaPortaria(e.target.value)}
                    className="w-full bg-[#181a1d] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={salvandoDispositivo}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                >
                  {salvandoDispositivo ? 'Autorizando...' : 'Autorizar Dispositivo'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
