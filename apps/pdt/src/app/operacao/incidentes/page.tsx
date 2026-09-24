'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  MessageSquare,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  ShieldAlert,
  Sliders,
  UserCheck,
  Users,
} from 'lucide-react';
import { useProducerEvent } from '../../../components/ProducerEventContext';

export default function IncidentesOperacionaisPage() {
  const { eventoId, evento } = useProducerEvent();
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroSeveridade, setFiltroSeveridade] = useState('TODAS');
  const [busca, setBusca] = useState('');
  const [kpis, setKpis] = useState({ total: 0, p1Ativos: 0, emTratamento: 0, resolvidos: 0 });

  // Modal Novo Incidente
  const [modalNovo, setModalNovo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoDescricao, setNovoDescricao] = useState('');
  const [novoSeveridade, setNovoSeveridade] = useState('P1');
  const [novoDominio, setNovoDominio] = useState('GATEWAY');
  const [novoResponsavel, setNovoResponsavel] = useState('NOC Lead');
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  // Modal Atualizar Status / Nota
  const [modalNota, setModalNota] = useState<any | null>(null);
  const [novaNota, setNovaNota] = useState('');
  const [proximoStatus, setProximoStatus] = useState('');
  const [salvandoNota, setSalvandoNota] = useState(false);

  const carregarIncidentes = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (filtroStatus !== 'TODOS') q.set('status', filtroStatus);
      if (filtroSeveridade !== 'TODAS') q.set('severidade', filtroSeveridade);
      if (eventoId) q.set('eventoId', eventoId);

      const res = await fetch(`/api/operacao/incidentes?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setIncidentes(data.incidentes || []);
        setKpis({
          total: data.total || 0,
          p1Ativos: data.p1Ativos || 0,
          emTratamento: data.emTratamento || 0,
          resolvidos: data.resolvidos || 0,
        });
      }
    } catch (e) {
      console.error('Falha ao carregar incidentes:', e);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus, filtroSeveridade, eventoId]);

  useEffect(() => {
    carregarIncidentes();
    const interval = setInterval(carregarIncidentes, 12000);
    return () => clearInterval(interval);
  }, [carregarIncidentes]);

  const atualizarStatusIncidente = async () => {
    if (!modalNota) return;
    setSalvandoNota(true);
    try {
      const res = await fetch('/api/operacao/incidentes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalNota.id,
          novoStatus: proximoStatus || modalNota.status,
          nota: novaNota,
        }),
      });
      if (res.ok) {
        setModalNota(null);
        setNovaNota('');
        carregarIncidentes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoNota(false);
    }
  };

  const criarIncidente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo) return;
    setSalvandoNovo(true);
    try {
      const res = await fetch('/api/operacao/incidentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: eventoId || 'evento-operacao',
          eventoNome: evento?.nome || 'Festival DiskIngressos Live 2026',
          titulo: novoTitulo,
          descricao: novoDescricao,
          severidade: novoSeveridade,
          dominio: novoDominio,
          responsavel: novoResponsavel,
        }),
      });
      if (res.ok) {
        setModalNovo(false);
        setNovoTitulo('');
        setNovoDescricao('');
        carregarIncidentes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoNovo(false);
    }
  };

  const incidentesFiltrados = incidentes.filter((inc) => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      inc.id.toLowerCase().includes(term) ||
      inc.titulo.toLowerCase().includes(term) ||
      inc.descricao?.toLowerCase().includes(term) ||
      inc.responsavel?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-6 text-slate-100">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={16} />
            ITIL / Gestão Operacional de Resposta
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            Gestão de Incidentes & Ocorrências
          </h1>
          <p className="text-slate-400 text-sm">
            Orquestração de crise, controle de SLA de resolução, time respondedor e integração com War Room.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/eventos/${eventoId || 'evento-operacao'}/sala-situacao`}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
          >
            <ShieldAlert size={14} className="animate-pulse" />
            <span>Sala de Situação (War Room)</span>
          </Link>

          <button
            onClick={() => carregarIncidentes()}
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
            <span>Abrir Incidente</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#121620] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
            <span>Total de Incidentes</span>
            <Shield size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{kpis.total}</div>
          <div className="text-xs text-slate-500 mt-1">Registrados no ciclo</div>
        </div>

        <div className={`rounded-xl border p-4 shadow-sm ${kpis.p1Ativos > 0 ? 'border-rose-500/60 bg-rose-950/25' : 'border-slate-800 bg-[#121620]'}`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-rose-400">
            <span>Incidentes P1 (Críticos)</span>
            <AlertOctagon size={16} className="text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">{kpis.p1Ativos}</div>
          <div className="text-xs text-rose-400/80 mt-1">Com War Room convocada</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121620] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400 uppercase tracking-wider">
            <span>Em Tratamento</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{kpis.emTratamento}</div>
          <div className="text-xs text-slate-500 mt-1">Equipe técnica atuando</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121620] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 uppercase tracking-wider">
            <span>Resolvidos</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">{kpis.resolvidos}</div>
          <div className="text-xs text-slate-500 mt-1">Solução documentada</div>
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
              <option value="P1" className="bg-slate-900 text-rose-400">P1 - Crítico</option>
              <option value="P2" className="bg-slate-900 text-amber-400">P2 - Alto</option>
              <option value="P3" className="bg-slate-900 text-yellow-400">P3 - Médio</option>
              <option value="P4" className="bg-slate-900 text-sky-400">P4 - Baixo</option>
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
              <option value="NOVO" className="bg-slate-900">Novo</option>
              <option value="RECONHECIDO" className="bg-slate-900">Reconhecido</option>
              <option value="EM_TRATAMENTO" className="bg-slate-900">Em Tratamento</option>
              <option value="MONITORANDO" className="bg-slate-900">Monitorando</option>
              <option value="RESOLVIDO" className="bg-slate-900">Resolvido</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por ID, título, responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* LISTA DE INCIDENTES */}
      <div className="space-y-4">
        {loading && incidentes.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#121620] p-12 text-center text-slate-400 text-sm">
            <RefreshCcw size={24} className="animate-spin mx-auto text-rose-500 mb-3" />
            Carregando incidentes operacionais...
          </div>
        ) : incidentesFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#10131b] p-12 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400/60 mb-3" />
            <h3 className="text-base font-bold text-white">Nenhum incidente registrado</h3>
            <p className="text-xs text-slate-500 mt-1">A operação do evento está transcorrendo de forma estável.</p>
          </div>
        ) : (
          incidentesFiltrados.map((inc) => {
            const isP1 = inc.severidade === 'P1';
            const isP2 = inc.severidade === 'P2';
            const isResolvido = inc.status === 'RESOLVIDO';

            return (
              <div
                key={inc.id}
                className={`rounded-2xl border p-5 md:p-6 transition ${
                  isResolvido
                    ? 'border-slate-800 bg-[#0e1118]/70 opacity-80'
                    : isP1
                    ? 'border-rose-500/70 bg-gradient-to-r from-rose-950/40 via-[#151218] to-[#121620] shadow-xl shadow-rose-950/20'
                    : isP2
                    ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-[#14151a] to-[#121620]'
                    : 'border-slate-800 bg-[#121620]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  {/* CONTEÚDO */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                        {inc.id}
                      </span>

                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
                          isP1
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isP2
                            ? 'bg-amber-500 text-black font-bold'
                            : inc.severidade === 'P3'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-sky-500 text-white'
                        }`}
                      >
                        {inc.severidade}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                        {inc.dominio}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                          isResolvido
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : inc.status === 'EM_TRATAMENTO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : inc.status === 'MONITORANDO'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {inc.status}
                      </span>

                      {inc.salaSituacaoAtiva && (
                        <Link
                          href={inc.salaSituacaoUrl || `/eventos/${eventoId || 'evento-operacao'}/sala-situacao`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-sm animate-bounce"
                        >
                          <Flame size={12} />
                          <span>SALA DE CRISE ATIVA</span>
                          <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">{inc.titulo}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{inc.descricao}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 pt-1">
                      <span>Responsável: <strong className="text-white">{inc.responsavel}</strong></span>
                      <span>Criado: <strong className="text-slate-300">{new Date(inc.criadoEm).toLocaleTimeString('pt-BR')}</strong></span>
                      <span>Atualizado: <strong className="text-slate-300">{new Date(inc.atualizadoEm).toLocaleTimeString('pt-BR')}</strong></span>
                    </div>

                    {/* TIMELINE PREVIEW */}
                    {inc.timeline && inc.timeline.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Últimos registros da ocorrência:
                        </div>
                        <div className="space-y-1.5">
                          {inc.timeline.slice(-2).map((t: any) => (
                            <div key={t.id} className="text-xs bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2">
                              <span className="font-mono text-[10px] text-slate-500 shrink-0 pt-0.5">
                                {new Date(t.timestamp).toLocaleTimeString('pt-BR')}
                              </span>
                              <span className="text-slate-300">
                                <strong>{t.autor}:</strong> {t.mensagem}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONTROLE DE SLA E AÇÕES */}
                  <div className="flex flex-col lg:items-end justify-between gap-4 shrink-0 lg:w-60 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-5">
                    <div className="w-full lg:text-right space-y-1">
                      <div className="text-xs text-slate-400">SLA de Resposta / Resolução:</div>
                      <div className="text-sm font-bold text-white flex items-center lg:justify-end gap-1.5">
                        <Clock size={14} className={isP1 ? 'text-rose-400' : 'text-slate-400'} />
                        <span>{inc.slaRespostaMinutos}m resp. / {inc.slaResolucaoMinutos}m resol.</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-rose-300">
                        {inc.tempoDecorridoMinutos} minutos decorridos
                      </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-col gap-2 w-full">
                      {isP1 && (
                        <Link
                          href={inc.salaSituacaoUrl || `/eventos/${eventoId || 'evento-operacao'}/sala-situacao`}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-bold text-white transition shadow-lg shadow-rose-950/40"
                        >
                          <ShieldAlert size={14} />
                          <span>Abrir War Room</span>
                        </Link>
                      )}

                      {!isResolvido && (
                        <button
                          onClick={() => {
                            setModalNota(inc);
                            setProximoStatus(
                              inc.status === 'NOVO'
                                ? 'RECONHECIDO'
                                : inc.status === 'RECONHECIDO'
                                ? 'EM_TRATAMENTO'
                                : inc.status === 'EM_TRATAMENTO'
                                ? 'MONITORANDO'
                                : 'RESOLVIDO'
                            );
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                        >
                          <MessageSquare size={14} />
                          <span>Atualizar / Nota</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL NOVO INCIDENTE */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#121620] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-500" />
              <span>Abrir Novo Incidente Operacional</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Classifique a ocorrência conforme a matriz de impacto e convoque os responsáveis.
            </p>

            <form onSubmit={criarIncidente} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Título do Incidente:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parada parcial de catracas no Setor B..."
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Descrição do Impacto & Evidência:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalhe o sintoma em campo, horário inicial e escopo de usuários afetados..."
                  value={novoDescricao}
                  onChange={(e) => setNovoDescricao(e.target.value)}
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
                    <option value="P1">P1 - Crítico (Parada)</option>
                    <option value="P2">P2 - Alto (Degradação)</option>
                    <option value="P3">P3 - Médio</option>
                    <option value="P4">P4 - Baixo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Domínio:</label>
                  <select
                    value={novoDominio}
                    onChange={(e) => setNovoDominio(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="GATEWAY">Gateway / Pix</option>
                    <option value="PORTARIA">Portaria & Acesso</option>
                    <option value="PDV_BILHETERIA">PDV / Bilheteria</option>
                    <option value="INFRAESTRUTURA">Infraestrutura</option>
                    <option value="ESTOQUE">Estoque / Lotes</option>
                    <option value="FINANCEIRO">Financeiro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Líder Técnico:</label>
                  <input
                    type="text"
                    value={novoResponsavel}
                    onChange={(e) => setNovoResponsavel(e.target.value)}
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
                  {salvandoNovo ? 'Criando Incidente...' : 'Registrar Incidente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATUALIZAR STATUS / NOTA */}
      {modalNota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121620] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-sky-400" />
              <span>Atualizar Incidente {modalNota.id}</span>
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Avançar Status:</label>
                <select
                  value={proximoStatus}
                  onChange={(e) => setProximoStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="RECONHECIDO">RECONHECIDO (Triado)</option>
                  <option value="EM_TRATAMENTO">EM_TRATAMENTO (Time atuando)</option>
                  <option value="MONITORANDO">MONITORANDO (Solução aplicada)</option>
                  <option value="RESOLVIDO">RESOLVIDO (Encerrado)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Nota Operacional:</label>
                <textarea
                  rows={3}
                  placeholder="Descreva a ação executada, mitigação ou causa raiz..."
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNota(null)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={salvandoNota}
                  onClick={atualizarStatusIncidente}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {salvandoNota ? 'Salvando...' : 'Salvar Atualização'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
