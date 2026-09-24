'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Plus,
  Radio,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import { useProducerEvent } from '../../../components/ProducerEventContext';

export default function CentralAlertasPage() {
  const { eventoId, evento } = useProducerEvent();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSeveridade, setFiltroSeveridade] = useState('TODAS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroDominio, setFiltroDominio] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [kpis, setKpis] = useState({ total: 0, criticos: 0, emAtendimento: 0, resolvidos: 0 });

  // Modal Atribuir
  const [modalAtribuir, setModalAtribuir] = useState<any | null>(null);
  const [responsavelNome, setResponsavelNome] = useState('');
  const [salvandoAtribuicao, setSalvandoAtribuicao] = useState(false);

  // Modal Novo Alerta
  const [modalNovo, setModalNovo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoMensagem, setNovoMensagem] = useState('');
  const [novoSeveridade, setNovoSeveridade] = useState('ATENCAO');
  const [novoDominio, setNovoDominio] = useState('PORTARIA');
  const [novoSla, setNovoSla] = useState(30);
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  const carregarAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (filtroSeveridade !== 'TODAS') q.set('severidade', filtroSeveridade);
      if (filtroStatus !== 'TODOS') q.set('status', filtroStatus);
      if (filtroDominio !== 'TODOS') q.set('dominio', filtroDominio);
      if (eventoId) q.set('eventoId', eventoId);

      const res = await fetch(`/api/operacao/alertas?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAlertas(data.alertas || []);
        setKpis({
          total: data.total || 0,
          criticos: data.criticos || 0,
          emAtendimento: data.emAtendimento || 0,
          resolvidos: data.resolvidos || 0,
        });
      }
    } catch (e) {
      console.error('Falha ao carregar alertas:', e);
    } finally {
      setLoading(false);
    }
  }, [filtroSeveridade, filtroStatus, filtroDominio, eventoId]);

  useEffect(() => {
    carregarAlertas();
    const interval = setInterval(carregarAlertas, 10000);
    return () => clearInterval(interval);
  }, [carregarAlertas]);

  const reconhecerAlerta = async (id: string) => {
    try {
      await fetch(`/api/operacao/alertas/${id}/reconhecer`, { method: 'POST' });
      setAlertas((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'RECONHECIDO', reconhecidoEm: new Date().toISOString(), reconhecidoPor: 'Você' } : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const salvarAtribuicao = async () => {
    if (!modalAtribuir || !responsavelNome) return;
    setSalvandoAtribuicao(true);
    try {
      await fetch(`/api/operacao/alertas/${modalAtribuir.id}/atribuir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsavelId: responsavelNome }),
      });
      setAlertas((prev) =>
        prev.map((a) =>
          a.id === modalAtribuir.id ? { ...a, responsavel: responsavelNome, status: 'EM_TRATAMENTO' } : a
        )
      );
      setModalAtribuir(null);
      setResponsavelNome('');
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoAtribuicao(false);
    }
  };

  const criarAlertaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo) return;
    setSalvandoNovo(true);
    try {
      const res = await fetch('/api/operacao/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: eventoId || 'evento-operacao',
          eventoNome: evento?.nome || 'Festival DiskIngressos Live 2026',
          titulo: novoTitulo,
          mensagem: novoMensagem,
          severidade: novoSeveridade,
          dominio: novoDominio,
          slaMinutos: Number(novoSla),
        }),
      });
      if (res.ok) {
        setModalNovo(false);
        setNovoTitulo('');
        setNovoMensagem('');
        carregarAlertas();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoNovo(false);
    }
  };

  const alertasFiltrados = alertas.filter((a) => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      a.id.toLowerCase().includes(term) ||
      a.titulo.toLowerCase().includes(term) ||
      a.mensagem?.toLowerCase().includes(term) ||
      a.origem?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-6 text-slate-100">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={16} />
            Monitoramento de Missão Crítica
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            Central Unificada de Alertas
          </h1>
          <p className="text-slate-400 text-sm">
            Fila operacional com controle de SLA, severidades, atribuição de equipe e escalonamento de incidentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => carregarAlertas()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={() => setModalNovo(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-900/30 transition"
          >
            <Plus size={15} />
            <span>Emitir Alerta Operacional</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#121620] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
            <span>Total de Alertas</span>
            <Bell size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{kpis.total}</div>
          <div className="text-xs text-slate-500 mt-1">Fila operacional ativa</div>
        </div>

        <div className={`rounded-xl border p-4 shadow-sm ${kpis.criticos > 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800 bg-[#121620]'}`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-rose-400">
            <span>Críticos Pendentes</span>
            <AlertOctagon size={16} className="text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">{kpis.criticos}</div>
          <div className="text-xs text-rose-400/80 mt-1">Exigem ação imediata</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121620] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400 uppercase tracking-wider">
            <span>Em Atendimento</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{kpis.emAtendimento}</div>
          <div className="text-xs text-slate-500 mt-1">Com operador designado</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121620] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 uppercase tracking-wider">
            <span>Resolvidos Hoje</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">{kpis.resolvidos}</div>
          <div className="text-xs text-slate-500 mt-1">SLA cumprido</div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111622] border border-slate-800 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Severidade:</span>
            <select
              value={filtroSeveridade}
              onChange={(e) => setFiltroSeveridade(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-slate-900">Todas</option>
              <option value="CRITICA" className="bg-slate-900 text-rose-400">Crítica</option>
              <option value="ALTA" className="bg-slate-900 text-amber-400">Alta</option>
              <option value="ATENCAO" className="bg-slate-900 text-yellow-400">Atenção</option>
              <option value="INFO" className="bg-slate-900 text-sky-400">Informativa</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900">Todos</option>
              <option value="ATIVO" className="bg-slate-900">Ativo</option>
              <option value="RECONHECIDO" className="bg-slate-900">Reconhecido</option>
              <option value="EM_TRATAMENTO" className="bg-slate-900">Em Tratamento</option>
              <option value="RESOLVIDO" className="bg-slate-900">Resolvido</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Domínio:</span>
            <select
              value={filtroDominio}
              onChange={(e) => setFiltroDominio(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900">Todos</option>
              <option value="PORTARIA" className="bg-slate-900">Portaria</option>
              <option value="VENDAS" className="bg-slate-900">Vendas</option>
              <option value="PAGAMENTOS" className="bg-slate-900">Pagamentos</option>
              <option value="INFRAESTRUTURA" className="bg-slate-900">Infraestrutura</option>
              <option value="FINANCEIRO" className="bg-slate-900">Financeiro</option>
              <option value="ANTIFRAUDE" className="bg-slate-900">Antifraude</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filtrar por código, título ou origem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* LISTA DE ALERTAS */}
      <div className="space-y-3">
        {loading && alertas.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#121620] p-12 text-center text-slate-400 text-sm">
            <RefreshCcw size={24} className="animate-spin mx-auto text-rose-500 mb-3" />
            Sincronizando fila de alertas operacionais...
          </div>
        ) : alertasFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#10131b] p-12 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400/60 mb-3" />
            <h3 className="text-base font-bold text-white">Nenhum alerta pendente com os filtros selecionados</h3>
            <p className="text-xs text-slate-500 mt-1">Todos os sistemas operando dentro dos parâmetros de normalidade.</p>
          </div>
        ) : (
          alertasFiltrados.map((alerta) => {
            const isCritico = alerta.severidade === 'CRITICA';
            const isAlta = alerta.severidade === 'ALTA';
            const isResolvido = alerta.status === 'RESOLVIDO';

            return (
              <div
                key={alerta.id}
                className={`rounded-xl border p-4 md:p-5 transition ${
                  isResolvido
                    ? 'border-slate-800/60 bg-[#0e1118]/60 opacity-75'
                    : isCritico
                    ? 'border-rose-500/60 bg-gradient-to-r from-rose-950/40 via-[#141217] to-[#121620] shadow-lg shadow-rose-950/20'
                    : isAlta
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 via-[#14151a] to-[#121620]'
                    : 'border-slate-800 bg-[#121620] hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* CONTEÚDO PRINCIPAL */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {alerta.id}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCritico
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : isAlta
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : alerta.severidade === 'ATENCAO'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {alerta.severidade}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {alerta.dominio}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isResolvido
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : alerta.status === 'EM_TRATAMENTO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : alerta.status === 'RECONHECIDO'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {alerta.status}
                      </span>

                      {alerta.incidenteId && (
                        <Link
                          href={`/operacao/incidentes`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50"
                        >
                          <span>{alerta.incidenteId} (Incidente)</span>
                          <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {isCritico && <Flame size={16} className="text-rose-500 shrink-0" />}
                      <span>{alerta.titulo}</span>
                    </h3>

                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {alerta.mensagem}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span>Origem: <strong className="text-slate-300">{alerta.origem}</strong></span>
                      <span>Criado: <strong className="text-slate-300">{new Date(alerta.criadoEm).toLocaleTimeString('pt-BR')}</strong></span>
                      {alerta.responsavel ? (
                        <span className="text-sky-400 font-semibold flex items-center gap-1">
                          <UserCheck size={12} />
                          {alerta.responsavel}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">Não atribuído</span>
                      )}
                    </div>

                    {alerta.metricasImpactadas && alerta.metricasImpactadas.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {alerta.metricasImpactadas.map((m: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/90 border border-slate-700/80 rounded px-2.5 py-1 text-[11px]">
                            <span className="text-slate-400">{m.nome}: </span>
                            <span className="font-bold text-white">{m.valor}</span>
                            {m.meta && <span className="text-slate-500 ml-1">(meta: {m.meta})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CONTROLE DE SLA E AÇÕES */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-end">
                        <Clock size={13} className={isCritico ? 'text-rose-400' : 'text-slate-400'} />
                        <span>SLA Operacional: <strong>{alerta.slaMinutos}m</strong></span>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                        {alerta.tempoDecorridoMinutos}m decorridos
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {alerta.status === 'ATIVO' && (
                        <button
                          onClick={() => reconhecerAlerta(alerta.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition"
                        >
                          <CheckCircle2 size={13} />
                          <span>Reconhecer</span>
                        </button>
                      )}

                      {!isResolvido && (
                        <button
                          onClick={() => {
                            setModalAtribuir(alerta);
                            setResponsavelNome(alerta.responsavel || '');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                        >
                          <UserPlus size={13} />
                          <span>{alerta.responsavel ? 'Reatribuir' : 'Atribuir'}</span>
                        </button>
                      )}

                      {isCritico && !alerta.incidenteId && (
                        <Link
                          href={`/operacao/incidentes?alertaId=${alerta.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
                        >
                          <ShieldAlert size={13} />
                          <span>Escalar P1</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL ATRIBUIR */}
      {modalAtribuir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121620] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus size={18} className="text-sky-400" />
              <span>Atribuir Responsável ao Alerta</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Alerta <strong>{modalAtribuir.id}</strong> — {modalAtribuir.titulo}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Operador ou Time Responsável:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Engenharia de Gateway, Fiscal Portaria A..."
                  value={responsavelNome}
                  onChange={(e) => setResponsavelNome(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAtribuir(null)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={salvandoAtribuicao || !responsavelNome}
                  onClick={salvarAtribuicao}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {salvandoAtribuicao ? 'Atribuindo...' : 'Confirmar Atribuição'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO ALERTA */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#121620] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-500" />
              <span>Emitir Novo Alerta Operacional</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dispara notificação para os canais de prontidão do evento.
            </p>

            <form onSubmit={criarAlertaManual} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Título do Alerta:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fila excessiva na catraca 3, Lentidão na leitura de QR..."
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Descrição Detalhada:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a evidência em campo e o impacto observado..."
                  value={novoMensagem}
                  onChange={(e) => setNovoMensagem(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Severidade:</label>
                  <select
                    value={novoSeveridade}
                    onChange={(e) => setNovoSeveridade(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="CRITICA">Crítica (P1)</option>
                    <option value="ALTA">Alta (P2)</option>
                    <option value="ATENCAO">Atenção</option>
                    <option value="INFO">Informativa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Domínio:</label>
                  <select
                    value={novoDominio}
                    onChange={(e) => setNovoDominio(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="PORTARIA">Portaria</option>
                    <option value="VENDAS">Vendas</option>
                    <option value="PAGAMENTOS">Pagamentos</option>
                    <option value="INFRAESTRUTURA">Infraestrutura</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="ANTIFRAUDE">Antifraude</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">SLA (Minutos):</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={novoSla}
                    onChange={(e) => setNovoSla(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoNovo}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {salvandoNovo ? 'Emitindo...' : 'Disparar Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
