'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  Eye,
  Ban,
  Clock,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';
import { ModuleNavigation } from '../../../../components/navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../../../../components/navigation/CompactOperationalAlert';

type TabView = 'todos' | 'criticos' | 'revisados';

export default function AntifraudePage({ params }: { params: Promise<{ eventoId: string }> }) {
  const [eventoId, setEventoId] = useState('');
  const { api } = useProducerEvent();

  const [tab, setTab] = useState<TabView>('todos');
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [busca, setBusca] = useState('');

  // Modal de Detalhes / Revisão
  const [alertaSelecionado, setAlertaSelecionado] = useState<any>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarAlertas = useCallback(async () => {
    if (!api || !eventoId) return;
    try {
      const res = await fetch(`${api}/eventos/${eventoId}/antifraude/alertas`);
      if (res.ok) {
        const d = await res.json();
        setAlertas(Array.isArray(d) ? d : (d?.items || d?.alertas || []));
      }
    } catch {
      setFeedback({
        tipo: 'error',
        texto: 'API Antifraude Offline (503). Não foi possível carregar a matriz de risco.',
      });
    } finally {
      setLoading(false);
    }
  }, [api, eventoId]);

  useEffect(() => {
    carregarAlertas();
  }, [carregarAlertas]);

  const handleDecidirAlerta = async (id: string, status: 'REVISADO' | 'BLOQUEADO' | 'PERMITIDO') => {
    if (!api) return;
    setProcessandoAcao(true);
    try {
      const res = await fetch(`${api}/antifraude/alertas/${id}/revisar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFeedback({
          tipo: 'success',
          texto: `Alerta atualizado com decisão: ${status}`,
        });
        setAlertaSelecionado(null);
        void carregarAlertas();
      }
    } catch {
      setFeedback({ tipo: 'error', texto: 'Erro ao registrar decisão do alerta.' });
    } finally {
      setProcessandoAcao(false);
    }
  };

  const safeAlertas = Array.isArray(alertas) ? alertas : [];
  const alertasFiltrados = safeAlertas.filter((a) => {
    if (tab === 'criticos' && !['ALTA', 'CRITICA'].includes(a.severidade)) return false;
    if (tab === 'revisados' && a.status === 'ABERTO') return false;
    if (tab === 'todos' && a.status !== 'ABERTO') return true;
    if (busca) {
      const txt = `${a.codigoSinal || ''} ${a.descricao || ''} ${a.origem || ''}`.toLowerCase();
      if (!txt.includes(busca.toLowerCase())) return false;
    }
    return true;
  });

  const abertos = safeAlertas.filter((a) => a.status === 'ABERTO');
  const criticos = abertos.filter((a) => ['ALTA', 'CRITICA'].includes(a.severidade));
  const duplicidades = abertos.filter((a) => (a.codigoSinal || '').includes('JA_UTILIZADO') || (a.codigoSinal || '').includes('SIMULTANEA'));
  const dispositivosSuspeitos = safeAlertas.filter((a) => a.origem === 'DISPOSITIVO');

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={15} /> Proteção Antifraude Operacional
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Matriz de Sinais & Defesa Antifraude</h1>
          <p className="text-slate-400 text-xs mt-1">
            Detecção explicável de duplicidades de QR, tentativas simultâneas e anomalias de acesso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold">
            Motor Ativo
          </span>
          <button
            onClick={() => void carregarAlertas()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Atualizar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Cards de Métricas de Risco */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Alertas em Aberto</div>
          <div className="text-2xl font-black text-white mt-1">{abertos.length}</div>
          <div className="text-[10px] text-amber-400 mt-1">Aguardando decisão operacional</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-rose-400 uppercase flex items-center gap-1.5">
            <ShieldAlert size={13} /> Alta Prioridade / Críticos
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">{criticos.length}</div>
          <div className="text-[10px] text-rose-300/80 mt-1">Ação imediata necessária</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-amber-400 uppercase flex items-center gap-1.5">
            <AlertTriangle size={13} /> Duplicidades de QR
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{duplicidades.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Tentativas de segundo acesso</div>
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-[#25272c] p-4">
          <div className="text-[11px] font-semibold text-purple-400 uppercase flex items-center gap-1.5">
            <Radio size={13} /> Dispositivos Suspeitos
          </div>
          <div className="text-2xl font-black text-white mt-1">{dispositivosSuspeitos.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Scanners não autorizados</div>
        </div>
      </div>

      {/* Navegação Fixa e Responsiva (Sem scroll horizontal) */}
      <ModuleNavigation
        items={[
          { id: 'todos', label: 'Todos os Alertas', icon: <ShieldAlert size={15} />, badge: abertos.length },
          { id: 'criticos', label: 'Alta Prioridade', icon: <AlertTriangle size={15} />, badge: criticos.length },
          { id: 'revisados', label: 'Histórico Resolvido', icon: <ShieldCheck size={15} /> },
        ]}
        activeItem={tab}
        onSelect={(id) => setTab(id as TabView)}
        ariaLabel="Navegação Antifraude"
      />

      {/* Alerta Operacional Compacto */}
      {feedback && (
        feedback.texto.includes('503') || feedback.texto.includes('Offline') ? (
          <div className="flex items-center justify-between py-1">
            <CompactOperationalAlert
              status="offline"
              title="Antifraude Offline (503)"
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

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar sinal, regra ou código de alerta..."
          className="w-full bg-[#25272c] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-rose-500"
        />
      </div>

      {/* Tabela de Alertas */}
      <div className="rounded-xl border border-slate-700/80 bg-[#25272c] overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm">Ocorrências & Sinais de Risco</h3>
          <span className="text-xs text-slate-400">{alertasFiltrados.length} registro(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1c1e22] text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Severidade</th>
                <th className="py-3 px-4">Sinal / Regra</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alertasFiltrados.map((a) => {
                const isCritico = ['ALTA', 'CRITICA'].includes(a.severidade);
                return (
                  <tr key={a.id} className="hover:bg-[#202227] transition">
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCritico
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {a.severidade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{a.codigoSinal}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate">{a.descricao}</td>
                    <td className="py-3 px-4 text-slate-400">{a.origem}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.status === 'ABERTO'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(a.createdAt).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setAlertaSelecionado(a)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Eye size={12} /> Revisar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {alertasFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    Nenhum alerta antifraude encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Investigação / Revisão */}
      {alertaSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#202227] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {alertaSelecionado.severidade}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5 font-mono">
                  {alertaSelecionado.codigoSinal}
                </h3>
              </div>
              <button
                onClick={() => setAlertaSelecionado(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {alertaSelecionado.descricao}
            </p>

            {alertaSelecionado.detalhes && (
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-400 uppercase text-[10px]">
                  Evidências / Detalhes Operacionais
                </span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(alertaSelecionado.detalhes, null, 2)}
                </pre>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 flex gap-2 justify-end">
              <button
                onClick={() => handleDecidirAlerta(alertaSelecionado.id, 'PERMITIDO')}
                disabled={processandoAcao}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Permitir Acesso
              </button>

              <button
                onClick={() => handleDecidirAlerta(alertaSelecionado.id, 'BLOQUEADO')}
                disabled={processandoAcao}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Ban size={14} /> Bloquear Ingresso
              </button>

              <button
                onClick={() => handleDecidirAlerta(alertaSelecionado.id, 'REVISADO')}
                disabled={processandoAcao}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Marcar como Revisado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
