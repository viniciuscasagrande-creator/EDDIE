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
  GitBranch,
  Eye,
  History,
  Clock,
  Layers,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';
import {
  AutomacoesClient,
  RegraOperacionalItem,
  SimularRegraResultado,
  GrupoCondicoes,
  AcaoItem,
  StatusRegra,
} from '@/lib/automacoes-client';

export default function RegrasOperacionaisPage() {
  const [loading, setLoading] = useState(true);
  const [regras, setRegras] = useState<RegraOperacionalItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [busca, setBusca] = useState('');

  // Modal de Construtor Visual de Regra
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<'FINANCEIRO' | 'COMERCIAL' | 'EVENTOS' | 'PORTARIA'>('FINANCEIRO');
  const [novoGatilho, setNovoGatilho] = useState('SOLICITACAO_REPASSE_CRIADA');
  const [novoEscopo, setNovoEscopo] = useState<'GLOBAL' | 'PRODUTOR' | 'EVENTO'>('GLOBAL');
  const [novoStatus, setNovoStatus] = useState<StatusRegra>('ATIVA');

  // Construtor de Condições (Grupos E / OU)
  const [grupoOperador, setGrupoOperador] = useState<'E' | 'OU'>('E');
  const [condicoes, setCondicoes] = useState<
    Array<{ campo: string; operador: 'MAIOR_QUE' | 'MENOR_QUE' | 'IGUAL' | 'DIFERENTE'; valor: string }>
  >([
    { campo: 'valorSolicitado', operador: 'MAIOR_QUE', valor: '50000' },
    { campo: 'exposicaoProdutor', operador: 'MAIOR_QUE', valor: '20000' },
  ]);

  // Ações
  const [acaoAprovacao, setAcaoAprovacao] = useState(true);
  const [acaoBloqueio, setAcaoBloqueio] = useState(true);
  const [acaoNotificar, setAcaoNotificar] = useState(true);

  // Simulação Dry-Run
  const [simulandoDryRun, setSimulandoDryRun] = useState(false);
  const [resultadoDryRun, setResultadoDryRun] = useState<SimularRegraResultado | null>(null);

  const [salvando, setSalvando] = useState(false);

  const carregarRegras = async () => {
    setLoading(true);
    try {
      const data = await AutomacoesClient.getRegras();
      setRegras(data);
    } catch (err) {
      console.error('Erro ao carregar regras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRegras();
  }, []);

  const handleAlternarStatus = async (id: string, statusAtual: StatusRegra) => {
    const proximoStatus: StatusRegra =
      statusAtual === 'ATIVA' ? 'PAUSADA' : statusAtual === 'PAUSADA' ? 'MODO_OBSERVACAO' : 'ATIVA';

    try {
      await AutomacoesClient.alternarStatusRegra(id, proximoStatus);
      setRegras((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: proximoStatus } : r)),
      );
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  const handleExecutarSimulacao = async () => {
    setSimulandoDryRun(true);
    try {
      const gruposCondicoes: GrupoCondicoes[] = [
        {
          operador: grupoOperador,
          condicoes: condicoes.map((c) => ({
            campo: c.campo,
            operador: c.operador,
            valorEsperado: Number(c.valor) || c.valor,
          })),
        },
      ];

      const acoes: AcaoItem[] = [];
      if (acaoAprovacao) acoes.push({ tipo: 'SOLICITAR_APROVACAO', parametros: {} });
      if (acaoBloqueio) acoes.push({ tipo: 'BLOQUEAR_OPERACAO', parametros: {} });
      if (acaoNotificar) acoes.push({ tipo: 'NOTIFICAR', parametros: {} });

      const res = await AutomacoesClient.simularDryRun(novoGatilho, gruposCondicoes, acoes, 90);
      setResultadoDryRun(res);
    } catch (err) {
      console.error('Erro ao simular:', err);
    } finally {
      setSimulandoDryRun(false);
    }
  };

  const adicionarCondicao = () => {
    setCondicoes((prev) => [
      ...prev,
      { campo: 'divergenciasCriticas', operador: 'MAIOR_QUE', valor: '0' },
    ]);
  };

  const removerCondicao = (idx: number) => {
    setCondicoes((prev) => prev.filter((_, i) => i !== idx));
  };

  const salvarNovaRegra = async () => {
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      const nova: RegraOperacionalItem = {
        id: `reg-${Date.now()}`,
        codigo: `REG-NOVA-${Math.floor(100 + Math.random() * 900)}`,
        nome: novoNome,
        descricao: novaDescricao || 'Regra configurada via construtor visual',
        categoria: novaCategoria,
        gatilhoEvento: novoGatilho,
        escopoTipo: novoEscopo,
        status: novoStatus,
        prioridade: 80,
        versaoAtiva: 1,
        cooldownSegundos: 0,
        condicoesGrupos: [
          {
            operador: grupoOperador,
            condicoes: condicoes.map((c) => ({
              campo: c.campo,
              operador: c.operador,
              valorEsperado: Number(c.valor) || c.valor,
            })),
          },
        ],
        acoes: [
          ...(acaoAprovacao ? [{ tipo: 'SOLICITAR_APROVACAO', parametros: {} }] : []),
          ...(acaoBloqueio ? [{ tipo: 'BLOQUEAR_OPERACAO', parametros: {} }] : []),
          ...(acaoNotificar ? [{ tipo: 'NOTIFICAR', parametros: {} }] : []),
        ],
        criadoPor: 'diretoria-operacional',
        createdAt: new Date().toISOString(),
      };

      setRegras((prev) => [nova, ...prev]);
      setModalAberto(false);
      setNovoNome('');
      setNovaDescricao('');
      setResultadoDryRun(null);
    } finally {
      setSalvando(false);
    }
  };

  const regrasFiltradas = regras.filter((r) => {
    if (filtroCategoria !== 'TODAS' && r.categoria !== filtroCategoria) return false;
    if (filtroStatus !== 'TODAS' && r.status !== filtroStatus) return false;
    if (busca && !r.nome.toLowerCase().includes(busca.toLowerCase()) && !r.codigo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Sliders size={15} />
            <span>Construtor Visual de Regras & Versionamento</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Motor de Regras Operacionais
          </h1>
          <p className="text-xs text-slate-400">
            Configuração de regras QUANDO / SE combinados / ENTÃO com simulação retroativa e Modo de Observação.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-md shadow-sky-900/20"
          >
            <Plus size={14} />
            <span>Criar Nova Regra</span>
          </button>
        </div>
      </div>

      <AutomacoesNav />

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-slate-400">Categoria:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="TODAS" className="bg-slate-900">Todas</option>
              <option value="FINANCEIRO" className="bg-slate-900">Financeiro</option>
              <option value="COMERCIAL" className="bg-slate-900">Comercial</option>
              <option value="PORTARIA" className="bg-slate-900">Portaria</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-slate-400">Status:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="TODAS" className="bg-slate-900">Todos</option>
              <option value="ATIVA" className="bg-slate-900">Ativa</option>
              <option value="MODO_OBSERVACAO" className="bg-slate-900">Modo Observação</option>
              <option value="PAUSADA" className="bg-slate-900">Pausada</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-sky-500 w-56"
          />
        </div>
      </div>

      {/* Grid de Regras */}
      <div className="space-y-3">
        {regrasFiltradas.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold bg-slate-800 text-sky-400 px-2 py-0.5 rounded">
                  {r.codigo}
                </span>
                <span className="font-bold text-white text-sm">{r.nome}</span>
                <span className="font-mono text-purple-300 bg-purple-950/80 border border-purple-800 px-1.5 py-0.2 rounded text-[10px]">
                  v{r.versaoAtiva} Imutável
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    r.status === 'ATIVA'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : r.status === 'MODO_OBSERVACAO'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {r.status === 'MODO_OBSERVACAO' ? 'Modo Observação (Shadow)' : r.status}
                </span>
              </div>

              <p className="text-slate-300">{r.descricao}</p>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-sky-300 space-y-1">
                <p>
                  <span className="text-slate-500 font-bold">QUANDO</span> {r.gatilhoEvento}
                </p>
                <p>
                  <span className="text-slate-500 font-bold">SE</span>{' '}
                  {r.condicoesGrupos?.map((g) =>
                    g.condicoes.map((c) => `${c.campo} ${c.operador} ${c.valorEsperado}`).join(` ${g.operador} `),
                  )}
                </p>
                <p>
                  <span className="text-slate-500 font-bold">ENTÃO</span>{' '}
                  {r.acoes?.map((a) => a.tipo).join(' + ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAlternarStatus(r.id, r.status)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Alternar Estado
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Construtor Visual de Regra */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Construtor Visual de Regra</h3>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Regra:</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Bloqueio de Repasse por Exposição"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Categoria:</label>
                <select
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="FINANCEIRO">Financeiro</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="PORTARIA">Portaria</option>
                  <option value="EVENTOS">Eventos</option>
                </select>
              </div>
            </div>

            {/* QUANDO */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">1. QUANDO (Gatilho de Evento):</span>
              <select
                value={novoGatilho}
                onChange={(e) => setNovoGatilho(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              >
                <option value="SOLICITACAO_REPASSE_CRIADA">Solicitação de repasse for criada</option>
                <option value="CHARGEBACK_REGISTRADO">Chargeback for registrado</option>
                <option value="LOTE_ESGOTANDO">Lote atingir 95% de ocupação</option>
                <option value="CONTA_BANCARIA_ALTERADA">Produtor solicitar troca de conta bancária</option>
                <option value="CHECKIN_ANOMALO">Validação anômala na portaria</option>
              </select>
            </div>

            {/* SE (Condições Combinadas) */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">2. SE (Condições Lógicas Combinadas):</span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
                  <span className="text-slate-400 text-[10px]">Operador:</span>
                  <button
                    onClick={() => setGrupoOperador('E')}
                    className={`px-1.5 py-0.5 rounded font-bold ${grupoOperador === 'E' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                  >
                    E
                  </button>
                  <button
                    onClick={() => setGrupoOperador('OU')}
                    className={`px-1.5 py-0.5 rounded font-bold ${grupoOperador === 'OU' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    OU
                  </button>
                </div>
              </div>

              {condicoes.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c.campo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCondicoes((prev) => prev.map((item, i) => (i === idx ? { ...item, campo: val } : item)));
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                  />
                  <select
                    value={c.operador}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setCondicoes((prev) => prev.map((item, i) => (i === idx ? { ...item, operador: val } : item)));
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                  >
                    <option value="MAIOR_QUE">maior que</option>
                    <option value="MENOR_QUE">menor que</option>
                    <option value="IGUAL">igual a</option>
                    <option value="DIFERENTE">diferente de</option>
                  </select>
                  <input
                    type="text"
                    value={c.valor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCondicoes((prev) => prev.map((item, i) => (i === idx ? { ...item, valor: val } : item)));
                    }}
                    className="w-28 bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                  />
                  {condicoes.length > 1 && (
                    <button onClick={() => removerCondicao(idx)} className="text-red-400 hover:text-red-300">
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={adicionarCondicao}
                className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Adicionar Condição
              </button>
            </div>

            {/* ENTÃO */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">3. ENTÃO (Ações Coordenadas):</span>
              <div className="space-y-1.5 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acaoAprovacao}
                    onChange={(e) => setAcaoAprovacao(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  <span>Encaminhar para Aprovação da Alçada Responsável</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acaoBloqueio}
                    onChange={(e) => setAcaoBloqueio(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  <span>Bloquear execução automática até autorização expressa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acaoNotificar}
                    onChange={(e) => setAcaoNotificar(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  <span>Notificar equipe via central de notificações</span>
                </label>
              </div>
            </div>

            {/* Botão de Simulação Dry-Run Prévia */}
            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Simulação Dry-Run (Backtesting nos últimos 90 dias)
                </span>
                <button
                  type="button"
                  onClick={handleExecutarSimulacao}
                  disabled={simulandoDryRun}
                  className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold"
                >
                  {simulandoDryRun ? 'Simulando...' : 'Testar Regra'}
                </button>
              </div>

              {resultadoDryRun && (
                <div className="mt-2 pt-2 border-t border-purple-800/30 grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 rounded bg-slate-950">
                    <p className="text-[10px] text-slate-400">Analisadas</p>
                    <p className="font-bold text-white text-sm">{resultadoDryRun.operacoesAnalisadas}</p>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950">
                    <p className="text-[10px] text-slate-400">Seriam Afetadas</p>
                    <p className="font-bold text-amber-400 text-sm">{resultadoDryRun.seriamAfetadas}</p>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950">
                    <p className="text-[10px] text-slate-400">Bloqueadas</p>
                    <p className="font-bold text-red-400 text-sm">{resultadoDryRun.seriamBloqueadas}</p>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950">
                    <p className="text-[10px] text-slate-400">P/ Aprovação</p>
                    <p className="font-bold text-sky-400 text-sm">{resultadoDryRun.iriamParaAprovacao}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={salvarNovaRegra}
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {salvando ? 'Salvando Versão 1...' : 'Publicar Regra v1'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
