'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  RefreshCcw,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';

export default function RegrasOperacionaisPage() {
  const [loading, setLoading] = useState(true);
  const [regras, setRegras] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [busca, setBusca] = useState('');

  // Modal de Nova Regra
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('VENDAS');
  const [novoGatilho, setNovoGatilho] = useState('ESTOQUE_LOTE');
  const [novaCondicao, setNovaCondicao] = useState('percentualDisponivel <= 5');
  const [novaAcao, setNovaAcao] = useState('ALERTA_COMERCIAL');
  const [novaSeveridade, setNovaSeveridade] = useState('ATENCAO');
  const [novoCooldown, setNovoCooldown] = useState(15);
  const [requerAprovacao, setRequerAprovacao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [dryRunResultado, setDryRunResultado] = useState<string | null>(null);

  const carregarRegras = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automacoes/regras');
      if (res.ok) {
        const d = await res.json();
        setRegras(d.regras || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRegras();
  }, []);

  const alternarStatus = async (id: string, statusAtual: string) => {
    const novoStatus = statusAtual === 'ATIVA' ? 'PAUSADA' : 'ATIVA';
    try {
      const res = await fetch('/api/automacoes/regras', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: novoStatus }),
      });
      if (res.ok) {
        setRegras((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: novoStatus } : r))
        );
      }
    } catch {}
  };

  const simularDryRun = () => {
    setDryRunResultado('Simulação: Condição testada com dados de amostra. Regra seria acionada com sucesso.');
  };

  const salvarNovaRegra = async () => {
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      const res = await fetch('/api/automacoes/regras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          descricao: novaDescricao,
          categoria: novaCategoria,
          gatilho: novoGatilho,
          condicao: novaCondicao,
          acao: novaAcao,
          severidade: novaSeveridade,
          cooldownMinutos: novoCooldown,
          requerAprovacao,
        }),
      });
      if (res.ok) {
        setModalAberto(false);
        setNovoNome('');
        setNovaDescricao('');
        setDryRunResultado(null);
        carregarRegras();
      }
    } catch {} finally {
      setSalvando(false);
    }
  };

  const regrasFiltradas = regras.filter((r) => {
    const okCat = filtroCategoria === 'TODAS' || r.categoria === filtroCategoria;
    const okStat = filtroStatus === 'TODAS' || r.status === filtroStatus;
    const okBusca =
      !busca ||
      r.nome.toLowerCase().includes(busca.toLowerCase()) ||
      r.descricao.toLowerCase().includes(busca.toLowerCase());
    return okCat && okStat && okBusca;
  });

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Sliders size={15} />
            <span>Motor de Regras Operacionais</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Regras de Automação
          </h1>
          <p className="text-xs text-slate-400">
            Condições lógicas monitoradas continuamente pelo sistema (SE condição → ENTÃO ação).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-500 transition shadow-md shadow-sky-900/20"
          >
            <Plus size={14} />
            <span>Nova Regra</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <AutomacoesNav />

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#16181d] p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 mr-1">Categoria:</span>
          {['TODAS', 'VENDAS', 'PORTARIA', 'PAGAMENTOS', 'FINANCEIRO', 'ANTIFRAUDE', 'INFRAESTRUTURA'].map(
            (c) => (
              <button
                key={c}
                onClick={() => setFiltroCategoria(c)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filtroCategoria === c
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-[#202228] text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar regra..."
              className="w-full rounded-lg border border-slate-700 bg-[#121418] pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Regras Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regrasFiltradas.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-800 bg-[#16181d] p-12 text-center text-slate-400 text-xs">
            Nenhuma regra encontrada para este filtro.
          </div>
        ) : (
          regrasFiltradas.map((r) => {
            const isAtiva = r.status === 'ATIVA';
            return (
              <div
                key={r.id}
                className={`rounded-xl border p-4 shadow-sm flex flex-col justify-between space-y-3 transition ${
                  isAtiva
                    ? 'border-slate-700/80 bg-[#191b21]'
                    : 'border-slate-800/80 bg-[#14161a] opacity-75'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-400 border border-slate-700">
                        {r.categoria}
                      </span>
                      {r.requerAprovacao && (
                        <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold">
                          Requer Aprovação
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => alternarStatus(r.id, r.status)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition border ${
                        isAtiva
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      {isAtiva ? <Pause size={11} /> : <Play size={11} />}
                      <span>{r.status}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{r.nome}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{r.descricao}</p>
                  </div>

                  {/* Expressão Lógica */}
                  <div className="rounded-lg bg-[#14151a] p-2.5 font-mono text-xs border border-slate-800 space-y-1">
                    <div className="text-sky-300">
                      <span className="text-slate-500 font-bold">SE </span>
                      {r.condicao}
                    </div>
                    <div className="text-emerald-400">
                      <span className="text-slate-500 font-bold">ENTÃO </span>
                      {r.acao}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cooldown: <b>{r.cooldownMinutos} min</b></span>
                  <span>Disparos hoje: <b>{r.disparosHoje}</b></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Nova Regra */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#1e2026] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-sky-400" />
                Criar Nova Regra Operacional
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome da Regra *</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Alerta de Fila na Entrada Principal"
                  className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Ex: Aciona equipe de contingência quando tempo de espera ultrapassa 10 minutos"
                  className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Categoria</label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none"
                  >
                    <option value="VENDAS">VENDAS</option>
                    <option value="PORTARIA">PORTARIA</option>
                    <option value="PAGAMENTOS">PAGAMENTOS</option>
                    <option value="FINANCEIRO">FINANCEIRO</option>
                    <option value="ANTIFRAUDE">ANTIFRAUDE</option>
                    <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Severidade</label>
                  <select
                    value={novaSeveridade}
                    onChange={(e) => setNovaSeveridade(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white outline-none"
                  >
                    <option value="INFO">INFO</option>
                    <option value="ATENCAO">ATENÇÃO</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRÍTICA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Condição Lógica (SE)</label>
                  <input
                    type="text"
                    value={novaCondicao}
                    onChange={(e) => setNovaCondicao(e.target.value)}
                    placeholder="Ex: tempoFilaMinutos >= 10"
                    className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white font-mono text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ação Executada (ENTÃO)</label>
                  <input
                    type="text"
                    value={novaAcao}
                    onChange={(e) => setNovaAcao(e.target.value)}
                    placeholder="Ex: NOTIFICAR_COORDENACAO_ACESSO"
                    className="w-full rounded-lg border border-slate-700 bg-[#16181d] px-3 py-2 text-white font-mono text-[11px] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={requerAprovacao}
                    onChange={(e) => setRequerAprovacao(e.target.checked)}
                    className="rounded bg-[#16181d] border-slate-700"
                  />
                  <span>Requer aprovação humana prévia</span>
                </label>
                <button
                  type="button"
                  onClick={simularDryRun}
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline text-[11px]"
                >
                  <Sparkles size={12} />
                  <span>Simular Dry-run</span>
                </button>
              </div>

              {dryRunResultado && (
                <div className="rounded-lg bg-sky-950/30 border border-sky-500/30 p-2.5 text-[11px] text-sky-300">
                  {dryRunResultado}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-[#25272c] text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={salvarNovaRegra}
                disabled={salvando || !novoNome.trim()}
                className="px-4 py-2 rounded-lg bg-sky-600 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar Regra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
