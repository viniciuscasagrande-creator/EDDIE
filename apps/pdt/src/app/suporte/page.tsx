'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LifeBuoy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  RefreshCcw,
  Wifi,
  Shield,
  CreditCard,
  QrCode,
  Flame,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

interface Ocorrencia {
  id: string;
  eventoId: string;
  produtorId: string;
  titulo: string;
  descricao: string;
  tipo: 'catraca' | 'bilheteria' | 'rede' | 'credenciamento' | 'seguranca' | 'outro';
  status: 'aberta' | 'em_andamento' | 'escalada' | 'resolvida';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  responsavel?: string | null;
  solucao?: string | null;
  createdAt: string;
}

export default function SuportePage() {
  const { api, produtorId, eventoId, evento } = useProducerEvent();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Modal Nova Ocorrência
  const [modalNovo, setModalNovo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'catraca' | 'bilheteria' | 'rede' | 'credenciamento' | 'seguranca' | 'outro'>('catraca');
  const [severidade, setSeveridade] = useState<'baixa' | 'media' | 'alta' | 'critica'>('media');
  const [responsavel, setResponsavel] = useState('Equipe Técnica de Campo');

  // Modal Resolução
  const [resolvendoItem, setResolvendoItem] = useState<Ocorrencia | null>(null);
  const [solucao, setSolucao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const qs = eventoId ? `?eventoId=${eventoId}` : produtorId ? `?produtorId=${produtorId}` : '';
      const res = await fetch(`${api}/suporte/ocorrencias${qs}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Não foi possível carregar as ocorrências.');
      const data = await res.json();
      setOcorrencias(Array.isArray(data) ? data : (data.items || []));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Falha na comunicação.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, eventoId, produtorId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    return ocorrencias.filter((o) => {
      const matchStatus = filtroStatus === 'todas' || o.status === filtroStatus;
      const matchTipo = filtroTipo === 'todos' || o.tipo === filtroTipo;
      return matchStatus && matchTipo;
    });
  }, [ocorrencias, filtroStatus, filtroTipo]);

  const stats = useMemo(() => {
    const total = ocorrencias.length;
    const ativas = ocorrencias.filter((o) => o.status !== 'resolvida').length;
    const criticas = ocorrencias.filter((o) => o.severidade === 'critica' && o.status !== 'resolvida').length;
    const resolvidas = ocorrencias.filter((o) => o.status === 'resolvida').length;
    return { total, ativas, criticas, resolvidas };
  }, [ocorrencias]);

  const submeterOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !eventoId) {
      alert('Selecione um evento no topo antes de registrar uma ocorrência.');
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch(`${api}/suporte/ocorrencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId,
          produtorId: produtorId || '00000000-0000-0000-0000-000000000001',
          titulo,
          descricao,
          tipo,
          severidade,
          responsavel,
        }),
      });
      if (!res.ok) throw new Error('Falha ao registrar ocorrência.');
      setModalNovo(false);
      setTitulo('');
      setDescricao('');
      await carregar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar.');
    } finally {
      setSalvando(false);
    }
  };

  const resolverOcorrencia = async () => {
    if (!api || !resolvendoItem || !solucao.trim()) return;
    setSalvando(true);
    try {
      const res = await fetch(`${api}/suporte/ocorrencias/${resolvendoItem.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolvida',
          solucao: solucao.trim(),
        }),
      });
      if (!res.ok) throw new Error('Falha ao resolver ocorrência.');
      setResolvendoItem(null);
      setSolucao('');
      await carregar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar resolução.');
    } finally {
      setSalvando(false);
    }
  };

  const tipoIcon = (t: string) => {
    switch (t) {
      case 'catraca':
        return <QrCode size={16} className="text-sky-400" />;
      case 'rede':
        return <Wifi size={16} className="text-emerald-400" />;
      case 'seguranca':
        return <Shield size={16} className="text-amber-400" />;
      case 'bilheteria':
        return <CreditCard size={16} className="text-purple-400" />;
      default:
        return <AlertTriangle size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[.18em]">
            <LifeBuoy size={15} /> Suporte Operacional ao Produtor
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Suporte & Ocorrências de Campo</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestão em tempo real de catracas, bilheterias físicas, conectividade, credenciamento e incidentes durante a realização dos eventos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void carregar()}
            className="p-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            title="Atualizar"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => setModalNovo(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/20"
          >
            <PlusCircle size={15} /> Registrar Ocorrência
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Total Registrado</span>
            <LifeBuoy size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats.total}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Em Aberto / Campo</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{stats.ativas}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Incidentes Críticos</span>
            <Flame size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{stats.criticas}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Resolvidas</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{stats.resolvidas}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 font-semibold mr-1">Status:</span>
          {['todas', 'aberta', 'em_andamento', 'escalada', 'resolvida'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filtroStatus === st
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="catraca">Catracas / Acesso</option>
            <option value="bilheteria">Bilheteria Física</option>
            <option value="rede">Conectividade / Rede</option>
            <option value="credenciamento">Credenciamento</option>
            <option value="seguranca">Segurança</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      {/* Lista de Ocorrências */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Quadro Operacional de Incidentes</h2>
          <span className="text-xs text-slate-400">{filtradas.length} ocorrência(s)</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm">Carregando ocorrências...</div>
        ) : filtradas.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            Nenhuma ocorrência registrada para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtradas.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 mt-1">
                    {tipoIcon(item.tipo)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{item.titulo}</h3>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.severidade === 'critica'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : item.severidade === 'alta'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.severidade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">{item.descricao}</p>
                    {item.solucao && (
                      <div className="text-xs text-emerald-400 mt-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <b>Solução técnica aplicada:</b> {item.solucao}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-3">
                      <span>Responsável: <b>{item.responsavel || 'Não atribuído'}</b></span>
                      <span>•</span>
                      <span>Registrado em: {new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      item.status === 'resolvida'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.status === 'escalada'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                  {item.status !== 'resolvida' && (
                    <button
                      onClick={() => setResolvendoItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} /> Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Registrar Ocorrência */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle size={18} className="text-amber-400" /> Registrar Ocorrência Operacional
            </h3>
            <form onSubmit={submeterOcorrencia} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-400">Título do Incidente</span>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Catraca 04 com timeout de leitura no Portão A"
                  className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Tipo de Incidente</span>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="catraca">Catracas / Acesso</option>
                    <option value="bilheteria">Bilheteria Física</option>
                    <option value="rede">Conectividade / Rede</option>
                    <option value="credenciamento">Credenciamento</option>
                    <option value="seguranca">Segurança</option>
                    <option value="outro">Outro</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Severidade</span>
                  <select
                    value={severidade}
                    onChange={(e) => setSeveridade(e.target.value as any)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica (P1 - Parada Operacional)</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-slate-400">Técnico / Responsável</span>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-400">Descrição Detalhada do Problema</span>
                <textarea
                  rows={3}
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Relate os sintomas, portão ou equipamento afetado..."
                  className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-amber-500"
                />
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {salvando ? 'Registrando...' : 'Registrar Ocorrência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resolução */}
      {resolvendoItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" /> Resolver Ocorrência
            </h3>
            <p className="text-xs text-slate-400">
              Descreva a solução técnica ou ação adotada para normalizar a operação do incidente.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-white">{resolvendoItem.titulo}</span>
              <p className="text-slate-400 mt-1">{resolvendoItem.descricao}</p>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-400">Solução Aplicada</span>
              <textarea
                rows={3}
                required
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
                placeholder="Ex: Reiniciado terminal de leitura e trocado cabo de rede do Switch A."
                className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResolvendoItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={salvando || !solucao.trim()}
                onClick={resolverOcorrencia}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Confirmar Resolução'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
