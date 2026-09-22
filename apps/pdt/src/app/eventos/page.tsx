'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
  DollarSign,
  Tag,
  RefreshCcw,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

type Lote = {
  id: string;
  nome: string;
  ordem: number;
  precoFace: number | { toNumber?: () => number };
  taxaConveniencia: number | { toNumber?: () => number };
  quantidade: number;
  ativo: boolean;
  abreEm: string;
  fechaEm?: string | null;
  setor?: { id: string; nome: string };
};

type Setor = {
  id: string;
  nome: string;
  marcado: boolean;
  capacidade?: number | null;
};

type Sessao = {
  id: string;
  inicioEm: string;
  fimEm?: string | null;
  capacidadeTotal: number;
  local?: { nome: string; cidade: string; uf: string };
  setores?: Setor[];
  lotes?: Lote[];
};

type EventoDetalhado = {
  id: string;
  nome: string;
  slug: string;
  status: string;
  categoria?: string;
  classificacaoEtaria?: number;
  imagemUrl?: string | null;
  createdAt: string;
  sessoes?: Sessao[];
};

const formatBRL = (val: number | { toNumber?: () => number } | undefined) => {
  if (val === undefined || val === null) return 'R$ 0,00';
  const num = typeof val === 'number' ? val : (val.toNumber ? val.toNumber() : Number(val));
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

export default function EventosPage() {
  const { api, produtorId, eventoId, selecionarEvento, recarregarEventos } = useProducerEvent();
  const [eventos, setEventos] = useState<EventoDetalhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeEvento, setActiveEvento] = useState<EventoDetalhado | null>(null);
  const [selectedSessaoId, setSelectedSessaoId] = useState<string>('');

  // Modals state
  const [isModalEventoOpen, setIsModalEventoOpen] = useState(false);
  const [isModalSessaoOpen, setIsModalSessaoOpen] = useState(false);
  const [isModalSetorOpen, setIsModalSetorOpen] = useState(false);
  const [isModalLoteOpen, setIsModalLoteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form states
  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    slug: '',
    categoria: 'show',
    classificacaoEtaria: 16,
    descricao: '',
  });

  const [novoSessao, setNovoSessao] = useState({
    inicioEm: '2026-11-20T20:00',
    fimEm: '2026-11-21T04:00',
    vendaAbreEm: '2026-09-01T10:00',
    vendaFechaEm: '2026-11-20T19:00',
    capacidadeTotal: 5000,
  });

  const [novoSetor, setNovoSetor] = useState({
    nome: '',
    marcado: false,
    capacidade: 1000,
  });

  const [novoLote, setNovoLote] = useState({
    setorId: '',
    nome: '1º Lote',
    ordem: 1,
    precoFace: 120,
    taxaConveniencia: 18,
    quantidade: 500,
    abreEm: '2026-09-01T10:00',
  });

  const carregarEventos = useCallback(async () => {
    if (!api || !produtorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${api}/eventos/produtor/${produtorId}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : (data.items || []);
        setEventos(lista);
        const sel = lista.find((e: EventoDetalhado) => e.id === eventoId) || lista[0] || null;
        setActiveEvento(sel);
        if (sel?.sessoes?.[0]?.id) {
          setSelectedSessaoId(sel.sessoes[0].id);
        }
      } else {
        if (res.status === 503) {
          setError('API de Produção Offline (503). Configure API_INTERNAL_URL.');
        } else {
          setError(`Erro HTTP ${res.status} ao carregar eventos.`);
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('Tempo limite ao carregar eventos.');
      } else {
        setError(e instanceof Error ? e.message : 'Falha na comunicação com o serviço de eventos.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, produtorId, eventoId]);

  useEffect(() => {
    void carregarEventos();
  }, [carregarEventos]);

  const handlePublicar = async (id: string) => {
    if (!api) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${api}/eventos/${id}/publicar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao publicar evento.');
      }
      setFeedback({ tipo: 'success', texto: 'Evento publicado com sucesso! Vendas liberadas no Checkout.' });
      await recarregarEventos();
      await carregarEventos();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao publicar evento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCriarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${api}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          nome: novoEvento.nome,
          slug: novoEvento.slug || novoEvento.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          categoria: novoEvento.categoria,
          classificacaoEtaria: Number(novoEvento.classificacaoEtaria),
          descricao: novoEvento.descricao || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao cadastrar evento.');
      }
      setIsModalEventoOpen(false);
      setNovoEvento({ nome: '', slug: '', categoria: 'show', classificacaoEtaria: 16, descricao: '' });
      setFeedback({ tipo: 'success', texto: 'Evento criado como Rascunho!' });
      await recarregarEventos();
      await carregarEventos();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao cadastrar evento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCriarSessao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !activeEvento) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      // Obter um local existente ou criar
      const locaisRes = await fetch(`${api}/eventos/locais`);
      const locais = locaisRes.ok ? await locaisRes.json() : [];
      const localId = locais[0]?.id || '00000000-0000-0000-0000-000000000001';

      const res = await fetch(`${api}/eventos/${activeEvento.id}/sessoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localId,
          inicioEm: new Date(novoSessao.inicioEm).toISOString(),
          fimEm: novoSessao.fimEm ? new Date(novoSessao.fimEm).toISOString() : undefined,
          vendaAbreEm: new Date(novoSessao.vendaAbreEm).toISOString(),
          vendaFechaEm: new Date(novoSessao.vendaFechaEm).toISOString(),
          capacidadeTotal: Number(novoSessao.capacidadeTotal),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao adicionar sessão.');
      }
      setIsModalSessaoOpen(false);
      setFeedback({ tipo: 'success', texto: 'Sessão cadastrada com sucesso!' });
      await carregarEventos();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao adicionar sessão.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCriarSetor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !selectedSessaoId) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${api}/eventos/sessoes/${selectedSessaoId}/setores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoSetor.nome,
          marcado: novoSetor.marcado,
          capacidade: novoSetor.capacidade ? Number(novoSetor.capacidade) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao cadastrar setor.');
      }
      setIsModalSetorOpen(false);
      setNovoSetor({ nome: '', marcado: false, capacidade: 1000 });
      setFeedback({ tipo: 'success', texto: 'Setor adicionado à sessão!' });
      await carregarEventos();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao cadastrar setor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCriarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !selectedSessaoId || !novoLote.setorId) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${api}/eventos/sessoes/${selectedSessaoId}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setorId: novoLote.setorId,
          nome: novoLote.nome,
          ordem: Number(novoLote.ordem),
          precoFace: Number(novoLote.precoFace),
          taxaConveniencia: Number(novoLote.taxaConveniencia),
          quantidade: Number(novoLote.quantidade),
          abreEm: new Date(novoLote.abreEm).toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao cadastrar lote.');
      }
      setIsModalLoteOpen(false);
      setFeedback({ tipo: 'success', texto: 'Lote cadastrado e pronto para venda!' });
      await carregarEventos();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao cadastrar lote.' });
    } finally {
      setActionLoading(false);
    }
  };

  const sessaoAtual = activeEvento?.sessoes?.find((s) => s.id === selectedSessaoId) || activeEvento?.sessoes?.[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <Layers size={13} />
            <span>Hierarquia Operacional: Evento → Sessão → Setor → Lote</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Gestão de Eventos, Sessões & Lotes
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Controle integrado de capacidade, precificação de ingressos e ativação de vendas no Checkout DiskIngressos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalEventoOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition"
        >
          <Plus size={16} />
          <span>Cadastrar Novo Evento</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid de Eventos Registrados */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Ticket size={16} className="text-rose-400" />
          <span>Eventos do Produtor ({eventos.length})</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin text-rose-500" />
            <span className="text-xs">Carregando eventos do produtor...</span>
          </div>
        ) : error ? (
          <div className="bg-[#111827] border border-rose-500/30 rounded-xl p-8 text-center space-y-3">
            <p className="text-rose-400 text-sm font-semibold">{error}</p>
            <p className="text-slate-500 text-xs">O serviço de eventos está inacessível ou o backend ainda não foi iniciado.</p>
            <button
              type="button"
              onClick={() => void carregarEventos()}
              className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition inline-flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Tentar novamente</span>
            </button>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <p className="text-slate-400 text-sm">Nenhum evento cadastrado para este produtor ainda.</p>
            <button
              type="button"
              onClick={() => setIsModalEventoOpen(true)}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
            >
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventos.map((ev) => {
              const isSelected = activeEvento?.id === ev.id;
              const totalSessoes = ev.sessoes?.length || 0;
              const totalLotes = ev.sessoes?.reduce((acc, s) => acc + (s.lotes?.length || 0), 0) || 0;

              return (
                <div
                  key={ev.id}
                  className={`bg-[#111827] border rounded-xl p-5 space-y-4 transition relative ${
                    isSelected ? 'border-rose-500/60 ring-1 ring-rose-500/40' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ev.status === 'publicado'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ev.status === 'cancelado'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ev.status}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2 leading-tight">{ev.nome}</h3>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sessões cadastradas:</span>
                      <span className="font-semibold text-white">{totalSessoes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lotes configurados:</span>
                      <span className="font-semibold text-white">{totalLotes}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEvento(ev);
                        selecionarEvento(ev.id);
                        if (ev.sessoes?.[0]?.id) setSelectedSessaoId(ev.sessoes[0].id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Contexto Ativo' : 'Operar Evento'}
                    </button>

                    {ev.status === 'rascunho' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handlePublicar(ev.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Send size={12} />
                        <span>Publicar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cockpit Operacional do Evento Selecionado */}
      {activeEvento && (
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{activeEvento.nome}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeEvento.status === 'publicado'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {activeEvento.status}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Hierarquia ativa: configure sessões, defina setores e crie lotes de ingressos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalSessaoOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus size={14} className="text-rose-400" />
                <span>Nova Sessão</span>
              </button>
            </div>
          </div>

          {/* Sessões tabs */}
          {(!activeEvento.sessoes || activeEvento.sessoes.length === 0) ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <Clock size={28} className="mx-auto text-slate-500" />
              <p className="text-white text-sm font-semibold">Nenhuma sessão cadastrada para este evento.</p>
              <p className="text-slate-400 text-xs">
                Para vender ingressos e publicar o evento, adicione ao menos uma sessão com data e capacidade.
              </p>
              <button
                type="button"
                onClick={() => setIsModalSessaoOpen(true)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar Sessão
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sessão Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
                {activeEvento.sessoes.map((s, idx) => {
                  const isSessaoSelected = s.id === (sessaoAtual?.id || selectedSessaoId);
                  const dataStr = new Date(s.inicioEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSessaoId(s.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
                        isSessaoSelected
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                          : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Clock size={13} />
                      <span>Sessão {idx + 1} — {dataStr}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sessão Details: Setores & Lotes */}
              {sessaoAtual && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna 1: Setores */}
                  <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} className="text-sky-400" />
                        <span>Setores da Sessão</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsModalSetorOpen(true)}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Plus size={12} /> Setor
                      </button>
                    </div>

                    {(!sessaoAtual.setores || sessaoAtual.setores.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">Nenhum setor cadastrado. Adicione Pista, Camarote, etc.</p>
                    ) : (
                      <div className="space-y-2">
                        {sessaoAtual.setores.map((setor) => (
                          <div
                            key={setor.id}
                            className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-white">{setor.nome}</span>
                              <div className="text-[10px] text-slate-500">
                                {setor.marcado ? 'Assentos Marcados' : 'Pista Geral'}
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                              Cap. {setor.capacidade ? `${setor.capacidade} lug.` : 'Livre'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Coluna 2 e 3: Lotes de Ingressos */}
                  <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag size={14} className="text-emerald-400" />
                          <span>Lotes de Ingressos</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Preço Face (produtor) + Taxa de Conveniência (DiskIngressos).
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!sessaoAtual.setores || sessaoAtual.setores.length === 0}
                        onClick={() => {
                          if (sessaoAtual.setores?.[0]?.id) {
                            setNovoLote((prev) => ({ ...prev, setorId: sessaoAtual.setores![0]!.id }));
                          }
                          setIsModalLoteOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Novo Lote
                      </button>
                    </div>

                    {(!sessaoAtual.lotes || sessaoAtual.lotes.length === 0) ? (
                      <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-xs text-slate-500">
                        Nenhum lote ativo. Cadastre ao menos um setor e lote para habilitar a publicação e venda.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                              <th className="pb-2">Lote / Setor</th>
                              <th className="pb-2">Preço Face</th>
                              <th className="pb-2">Taxa Conv.</th>
                              <th className="pb-2">Preço Final</th>
                              <th className="pb-2">Qtd Total</th>
                              <th className="pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {sessaoAtual.lotes.map((lote) => {
                              const face = typeof lote.precoFace === 'number' ? lote.precoFace : Number(lote.precoFace || 0);
                              const taxa = typeof lote.taxaConveniencia === 'number' ? lote.taxaConveniencia : Number(lote.taxaConveniencia || 0);
                              const total = face + taxa;

                              return (
                                <tr key={lote.id} className="hover:bg-slate-900/40">
                                  <td className="py-2.5">
                                    <div className="font-bold text-white">{lote.nome}</div>
                                    <div className="text-[10px] text-slate-500">{lote.setor?.nome || 'Setor Padrão'}</div>
                                  </td>
                                  <td className="py-2.5 font-medium text-slate-300">{formatBRL(face)}</td>
                                  <td className="py-2.5 font-medium text-emerald-400">{formatBRL(taxa)}</td>
                                  <td className="py-2.5 font-bold text-white">{formatBRL(total)}</td>
                                  <td className="py-2.5 text-slate-300">{lote.quantidade.toLocaleString('pt-BR')} un.</td>
                                  <td className="py-2.5">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      Ativo
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Novo Evento */}
      {isModalEventoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cadastrar Novo Evento</h3>
              <button
                type="button"
                onClick={() => setIsModalEventoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarEvento} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Curitiba Music Festival 2026"
                  value={novoEvento.nome}
                  onChange={(e) => setNovoEvento({ ...novoEvento, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
                  <select
                    value={novoEvento.categoria}
                    onChange={(e) => setNovoEvento({ ...novoEvento, categoria: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="show">Show / Concerto</option>
                    <option value="teatro">Teatro / Espetáculo</option>
                    <option value="esporte">Esporte</option>
                    <option value="festa">Festa / Balada</option>
                    <option value="congresso">Congresso / Feira</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Classificação Etária</label>
                  <input
                    type="number"
                    min={0}
                    max={18}
                    value={novoEvento.classificacaoEtaria}
                    onChange={(e) => setNovoEvento({ ...novoEvento, classificacaoEtaria: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Descrição geral do evento, atrações e orientações..."
                  value={novoEvento.descricao}
                  onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalEventoOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Cadastrar Rascunho</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Sessão */}
      {isModalSessaoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Adicionar Sessão</h3>
              <button
                type="button"
                onClick={() => setIsModalSessaoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarSessao} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Início da Sessão</label>
                  <input
                    type="datetime-local"
                    required
                    value={novoSessao.inicioEm}
                    onChange={(e) => setNovoSessao({ ...novoSessao, inicioEm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fim Estimado</label>
                  <input
                    type="datetime-local"
                    value={novoSessao.fimEm}
                    onChange={(e) => setNovoSessao({ ...novoSessao, fimEm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Abertura de Vendas</label>
                  <input
                    type="datetime-local"
                    required
                    value={novoSessao.vendaAbreEm}
                    onChange={(e) => setNovoSessao({ ...novoSessao, vendaAbreEm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Encerramento Vendas</label>
                  <input
                    type="datetime-local"
                    required
                    value={novoSessao.vendaFechaEm}
                    onChange={(e) => setNovoSessao({ ...novoSessao, vendaFechaEm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Capacidade Total de Público</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={novoSessao.capacidadeTotal}
                  onChange={(e) => setNovoSessao({ ...novoSessao, capacidadeTotal: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalSessaoOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Salvar Sessão</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Setor */}
      {isModalSetorOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Novo Setor</h3>
              <button
                type="button"
                onClick={() => setIsModalSetorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarSetor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Setor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pista Premium, Camarote Lateral"
                  value={novoSetor.nome}
                  onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Capacidade do Setor</label>
                <input
                  type="number"
                  min={1}
                  value={novoSetor.capacidade}
                  onChange={(e) => setNovoSetor({ ...novoSetor, capacidade: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalSetorOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Adicionar Setor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Lote */}
      {isModalLoteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Configurar Lote de Ingressos</h3>
              <button
                type="button"
                onClick={() => setIsModalLoteOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarLote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Setor</label>
                <select
                  required
                  value={novoLote.setorId}
                  onChange={(e) => setNovoLote({ ...novoLote, setorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                >
                  {sessaoAtual?.setores?.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome do Lote</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1º Lote"
                    value={novoLote.nome}
                    onChange={(e) => setNovoLote({ ...novoLote, nome: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade de Ingressos</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={novoLote.quantidade}
                    onChange={(e) => setNovoLote({ ...novoLote, quantidade: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço Face (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={novoLote.precoFace}
                    onChange={(e) => setNovoLote({ ...novoLote, precoFace: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Taxa Conveniência (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={novoLote.taxaConveniencia}
                    onChange={(e) => setNovoLote({ ...novoLote, taxaConveniencia: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalLoteOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Salvar Lote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
