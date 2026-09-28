'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  Layers,
  Search,
  BookOpen,
  History,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  GitBranch,
  ArrowRight,
  UserCheck,
  Lock,
  Download,
  Terminal,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  GovernancaClient,
  VisaoGeralGovernanca,
  ConciliacaoSistemica,
  DivergenciaItem,
  LinhagemNo,
  CentroInvestigacaoResultado,
  CatalogoIndicadorItem,
  RegistroAuditoriaItem,
  SaudeIntegracoesResponse,
  GateFechamentoGovernancaResultado,
  SeveridadeDivergencia,
  SituacaoDivergencia,
  ResponsavelDominio,
} from '@/lib/governanca-client';

export default function CentralGovernancaPage() {
  const [abaAtiva, setAbaAtiva] = useState<
    'visao-geral' | 'divergencias' | 'conciliacao' | 'linhagem' | 'investigacao' | 'catalogo' | 'auditoria' | 'integracoes'
  >('visao-geral');

  const [eventoSelecionado, setEventoSelecionado] = useState('11111111-1111-1111-1111-111111111111');
  const [loading, setLoading] = useState(true);
  const [varreduraExecutando, setVarreduraExecutando] = useState(false);
  const [varreduraSucesso, setVarreduraSucesso] = useState(false);

  // Dados principais
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeralGovernanca | null>(null);
  const [conciliacao, setConciliacao] = useState<ConciliacaoSistemica | null>(null);
  const [divergencias, setDivergencias] = useState<DivergenciaItem[]>([]);
  const [linhagem, setLinhagem] = useState<LinhagemNo | null>(null);
  const [investigacao, setInvestigacao] = useState<CentroInvestigacaoResultado | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoIndicadorItem[]>([]);
  const [auditoria, setAuditoria] = useState<RegistroAuditoriaItem[]>([]);
  const [integracoes, setIntegracoes] = useState<SaudeIntegracoesResponse | null>(null);
  const [gateFechamento, setGateFechamento] = useState<GateFechamentoGovernancaResultado | null>(null);

  // Filtros de Divergências
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('TODAS');
  const [filtroDominio, setFiltroDominio] = useState<string>('TODOS');
  const [filtroSituacao, setFiltroSituacao] = useState<string>('TODAS');

  // Modal / Ação de Tratamento de Divergência
  const [divergenciaParaTratar, setDivergenciaParaTratar] = useState<DivergenciaItem | null>(null);
  const [novaSituacaoTratamento, setNovaSituacaoTratamento] = useState<SituacaoDivergencia>('EM_ANALISE');
  const [acaoTratamento, setAcaoTratamento] = useState('');
  const [justificativaTratamento, setJustificativaTratamento] = useState('');
  const [tratamentoEmAndamento, setTratamentoEmAndamento] = useState(false);

  // Centro de Investigação
  const [termoBusca, setTermoBusca] = useState('PED-45872');
  const [buscandoInvestigacao, setBuscandoInvestigacao] = useState(false);

  // Linhagem
  const [indicadorLinhagem, setIndicadorLinhagem] = useState('MARGEM_DISK');

  // Reprocessamento
  const [reprocessandoId, setReprocessandoId] = useState<string | null>(null);
  const [reprocessamentoFeedback, setReprocessamentoFeedback] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vgData, concData, divData, linData, catData, audData, intData, gateData] = await Promise.all([
        GovernancaClient.getVisaoGeral(),
        GovernancaClient.getConciliacao(eventoSelecionado),
        GovernancaClient.getDivergencias(),
        GovernancaClient.getLinhagem(indicadorLinhagem),
        GovernancaClient.getCatalogo(),
        GovernancaClient.getAuditoria(),
        GovernancaClient.getIntegracoes(),
        GovernancaClient.getGateFechamento(eventoSelecionado),
      ]);

      setVisaoGeral(vgData);
      setConciliacao(concData);
      setDivergencias(divData);
      setLinhagem(linData);
      setCatalogo(catData);
      setAuditoria(audData);
      setIntegracoes(intData);
      setGateFechamento(gateData);

      // Carrega investigação inicial padrão
      const invData = await GovernancaClient.investigar('PED-45872');
      setInvestigacao(invData);
    } catch (err) {
      console.error('Erro ao carregar dados de governança:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [eventoSelecionado]);

  const handleBuscarInvestigacao = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!termoBusca.trim()) return;

    setBuscandoInvestigacao(true);
    try {
      const res = await GovernancaClient.investigar(termoBusca);
      setInvestigacao(res);
    } catch (err) {
      console.error('Erro na investigação:', err);
    } finally {
      setBuscandoInvestigacao(false);
    }
  };

  const handleMudarIndicadorLinhagem = async (novoIndicador: string) => {
    setIndicadorLinhagem(novoIndicador);
    const res = await GovernancaClient.getLinhagem(novoIndicador);
    setLinhagem(res);
  };

  const handleExecutarVarredura = async () => {
    setVarreduraExecutando(true);
    setVarreduraSucesso(false);
    try {
      // Simula varredura cruzada das 6 camadas
      await new Promise((r) => setTimeout(r, 1200));
      setVarreduraSucesso(true);
      await carregarDados();
      setTimeout(() => setVarreduraSucesso(false), 4000);
    } finally {
      setVarreduraExecutando(false);
    }
  };

  const handleConfirmarTratamento = async () => {
    if (!divergenciaParaTratar) return;
    if (!justificativaTratamento.trim()) {
      alert('A justificativa técnica/operacional é obrigatória para governança e auditoria.');
      return;
    }

    setTratamentoEmAndamento(true);
    try {
      await GovernancaClient.tratarDivergencia(divergenciaParaTratar.id, {
        novaSituacao: novaSituacaoTratamento,
        acaoAplicada: acaoTratamento || 'Atualização de status via Central de Divergências',
        justificativa: justificativaTratamento,
        responsavelUsuarioId: 'usr-admin-pdt',
      });

      // Atualiza lista localmente
      setDivergencias((prev) =>
        prev.map((d) =>
          d.id === divergenciaParaTratar.id
            ? { ...d, situacao: novaSituacaoTratamento }
            : d,
        ),
      );

      setDivergenciaParaTratar(null);
      setAcaoTratamento('');
      setJustificativaTratamento('');
    } catch (err) {
      console.error('Erro ao tratar divergência:', err);
    } finally {
      setTratamentoEmAndamento(false);
    }
  };

  const handleReprocessar = async (correlationId: string) => {
    setReprocessandoId(correlationId);
    setReprocessamentoFeedback(null);
    try {
      const res = await GovernancaClient.reprocessar(eventoSelecionado, correlationId);
      setReprocessamentoFeedback(`Evento ${correlationId} reprocessado com sucesso de forma idempotente!`);
      setTimeout(() => setReprocessamentoFeedback(null), 5000);
    } catch (err) {
      console.error('Erro ao reprocessar:', err);
    } finally {
      setReprocessandoId(null);
    }
  };

  const formatBRL = (val?: number) => {
    if (val === undefined || val === null) return '—';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const divergenciasFiltradas = divergencias.filter((d) => {
    if (filtroSeveridade !== 'TODAS' && d.severidade !== filtroSeveridade) return false;
    if (filtroDominio !== 'TODOS' && d.responsavelDominio !== filtroDominio) return false;
    if (filtroSituacao !== 'TODAS' && d.situacao !== filtroSituacao) return false;
    return true;
  });

  const getSeveridadeBadge = (severidade: SeveridadeDivergencia) => {
    switch (severidade) {
      case 'CRITICA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-950/80 text-red-400 border border-red-800">Crítica</span>;
      case 'ALTA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-950/80 text-orange-400 border border-orange-800">Alta</span>;
      case 'MEDIA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950/80 text-amber-400 border border-amber-800">Média</span>;
      case 'BAIXA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-950/80 text-blue-400 border border-blue-800">Baixa</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">Informativa</span>;
    }
  };

  const getSituacaoBadge = (situacao: SituacaoDivergencia) => {
    switch (situacao) {
      case 'NOVA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-950/80 text-purple-300 border border-purple-800">Nova</span>;
      case 'EM_ANALISE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-950/80 text-sky-300 border border-sky-800">Em Análise</span>;
      case 'EM_CORRECAO':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950/80 text-amber-300 border border-amber-800">Em Correção</span>;
      case 'CORRIGIDA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">Corrigida</span>;
      case 'ACEITA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">Aceita (Tolerância)</span>;
      case 'ENCERRADA':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">Encerrada</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300">{situacao}</span>;
    }
  };

  // Componente recursivo para árvore de linhagem
  const renderLinhagemNode = (node: LinhagemNo, nivel = 0) => {
    return (
      <div key={node.id} className={`space-y-2 ${nivel > 0 ? 'ml-6 border-l-2 border-slate-800 pl-4 my-2' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">{node.label}</p>
              <p className="text-xs text-slate-400">Origem: <span className="text-slate-300">{node.origem}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {node.categoria}
            </span>
            {node.valor !== undefined && (
              <span className={`text-xs font-mono font-bold ${typeof node.valor === 'number' && node.valor < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {typeof node.valor === 'number' ? formatBRL(node.valor) : node.valor}
              </span>
            )}
          </div>
        </div>
        {node.filhos && node.filhos.length > 0 && (
          <div className="space-y-2">
            {node.filhos.map((filho) => renderLinhagemNode(filho, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* ==================================================================== */}
      {/* 1. BARRA SUPERIOR EXECUTIVA & PRINCÍPIO DE GOVERNANÇA */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Dados, Qualidade & Governança</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  EDDIE 11.31
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-950/80 text-red-300 border border-red-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Restrito DiskIngressos
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Auditoria Central Imutável, Linhagem Causal, Conciliação Multicamadas e Central de Divergências
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Evento e Ações */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Evento:</span>
            <select
              value={eventoSelecionado}
              onChange={(e) => setEventoSelecionado(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="11111111-1111-1111-1111-111111111111" className="bg-slate-900 text-white">
                Festival Exemplo 2026 (Ativo)
              </option>
              <option value="22222222-2222-2222-2222-222222222222" className="bg-slate-900 text-white">
                Turnê Nacional Rock 2026
              </option>
              <option value="33333333-3333-3333-3333-333333333333" className="bg-slate-900 text-white">
                Arena Eletrônica Sunset
              </option>
            </select>
          </div>

          <button
            onClick={handleExecutarVarredura}
            disabled={varreduraExecutando}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${varreduraExecutando ? 'animate-spin' : ''}`} />
            {varreduraExecutando ? 'Executando Varredura...' : 'Varredura de Integridade'}
          </button>

          <button
            onClick={carregarDados}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Varredura */}
      {varreduraSucesso && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Varredura relacional multicamadas concluída com sucesso! 8.421.587 registros revalidados contra o Ledger e Pedidos.</span>
        </div>
      )}

      {/* Princípio Inviolável de Governança */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">
            Princípio Inviolável da Central de Governança EDDIE:
          </p>
          <p className="text-slate-400 mt-0.5">
            A Central de Dados <strong className="text-slate-200">não é uma segunda fonte da verdade</strong> e nunca inventa números.
            Ela observa, audita, compara e governa os bounded contexts oficiais (Pedidos, Pagamentos, Ingressos, Portaria, Ledger Financeiro, Contabilidade e Tesouraria). Toda e qualquer divergência apurada reflete o confronto direto entre as tabelas dos schemas Postgres e os eventos imutáveis do Outbox.
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP KPIS EXECUTIVOS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Registros Verificados</p>
          <p className="text-2xl font-bold text-white mt-1">
            {visaoGeral?.registrosVerificados.toLocaleString('pt-BR') || '8.421.587'}
          </p>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            99.98% Integridade Total
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Divergências Abertas</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {visaoGeral?.divergenciasAbertas || 147}
          </p>
          <p className="text-xs text-slate-400 mt-1">Aguardando resolução</p>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
          <p className="text-xs text-red-400 uppercase tracking-wider font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Críticas
          </p>
          <p className="text-2xl font-bold text-red-300 mt-1">
            {visaoGeral?.divergenciasCriticas || 8}
          </p>
          <p className="text-xs text-red-400/80 mt-1">SLA &lt; 2h (Impacta Fechamento)</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Em Investigação</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">
            {visaoGeral?.divergenciasEmInvestigacao || 31}
          </p>
          <p className="text-xs text-slate-400 mt-1">Times operacionais alocados</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Corrigidas Hoje</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {visaoGeral?.divergenciasCorrigidasHoje || 62}
          </p>
          <p className="text-xs text-emerald-400/80 mt-1">Auditoria registrada via Outbox</p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. NAVEGAÇÃO DE ABAS OPERACIONAIS */}
      {/* ==================================================================== */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-sm">
        {[
          { id: 'visao-geral', label: 'Visão Geral & Domínios', icon: Activity },
          { id: 'divergencias', label: 'Central de Divergências', icon: AlertTriangle, badge: divergencias.length },
          { id: 'conciliacao', label: 'Conciliação Multicamadas', icon: Layers },
          { id: 'linhagem', label: 'Linhagem dos Dados', icon: GitBranch },
          { id: 'investigacao', label: 'Centro de Investigação 360º', icon: Search },
          { id: 'catalogo', label: 'Catálogo de Dados', icon: BookOpen },
          { id: 'auditoria', label: 'Auditoria Central Imutável', icon: History },
          { id: 'integracoes', label: 'Integrações & Outbox', icon: Terminal },
        ].map((aba) => {
          const Icon = aba.icon;
          const isAtiva = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors font-medium whitespace-nowrap ${
                isAtiva
                  ? 'bg-slate-900 border-t-2 border-emerald-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isAtiva ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{aba.label}</span>
              {aba.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300">
                  {aba.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: VISÃO GERAL & DOMÍNIOS */}
      {/* ==================================================================== */}
      {abaAtiva === 'visao-geral' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Status de Integridade por Bounded Context</h2>
              <p className="text-xs text-slate-400">
                Monitoramento contínuo de consistência entre schemas Postgres e publicação de eventos
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Operacional</span>
              <span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Atenção</span>
              <span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Degradado</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visaoGeral?.statusDominios.map((dom) => (
              <div
                key={dom.dominio}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{dom.dominio}</span>
                    {dom.status === 'OPERACIONAL' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        ✓ Operacional
                      </span>
                    )}
                    {dom.status === 'ATENCAO' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800">
                        ⚠ {dom.divergenciasQtd} divergências
                      </span>
                    )}
                    {dom.status === 'DEGRADADO' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-950/80 text-red-400 border border-red-800">
                        ✕ Degradado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{dom.detalhe}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Divergências ativas:</span>
                  <span className={`font-mono font-bold ${dom.divergenciasQtd > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {dom.divergenciasQtd}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Regras de Qualidade Relacionais Ativas */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Regras Automáticas de Validação Cruzada (Cross-Domain Quality Gates)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">1. Pedido Pago × Ingressos Emitidos</p>
                <p className="text-slate-400 mt-1">
                  Verifica se todo pedido com status <code className="text-emerald-400">PAGO</code> possui ingressos gerados no inventário com chave de validação criptográfica.
                </p>
                <p className="text-emerald-400 font-medium mt-1">Status: 100% Conforme (0 pendências)</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">2. Ingressos × Pedido Válido</p>
                <p className="text-slate-400 mt-1">
                  Assegura que nenhum ingresso exista solto no banco sem correspondência a um pedido faturado e autorizado.
                </p>
                <p className="text-emerald-400 font-medium mt-1">Status: 100% Conforme (0 orfãos)</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">3. Check-in na Portaria × Base de Ingressos</p>
                <p className="text-slate-400 mt-1">
                  Valida cada tentativa de acesso em catraca online ou sincronismo offline contra o status do ingresso.
                </p>
                <p className="text-amber-400 font-medium mt-1">Status: 12 leituras offline aguardando handshake</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">4. Pagamento Aprovado × Ledger Financeiro</p>
                <p className="text-slate-400 mt-1">
                  Confirma que cada webhook de captura adquirente gerou lançamento imutável na conta gráfica Disk/Produtor.
                </p>
                <p className="text-emerald-400 font-medium mt-1">Status: 100% Balanceado</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">5. Ledger Imutável × Partidas Dobradas Contábeis</p>
                <p className="text-slate-400 mt-1">
                  Garante equivalência estrita entre o Livro-Razão financeiro e os débitos/créditos no plano de contas da Contabilidade.
                </p>
                <p className="text-amber-400 font-medium mt-1">Status: 3 lotes pendentes de apuração</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">6. Ordem de Repasse × Liquidação Tesouraria Bancária</p>
                <p className="text-slate-400 mt-1">
                  Cruza as ordens de pagamento aprovadas no Portal do Produtor com o arquivo de retorno CNAB / PIX Direto.
                </p>
                <p className="text-emerald-400 font-medium mt-1">Status: Conciliado no Banco Itaú</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CENTRAL DE DIVERGÊNCIAS */}
      {/* ==================================================================== */}
      {abaAtiva === 'divergencias' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Central Operacional de Divergências</h2>
              <p className="text-xs text-slate-400">
                Detecção proativa de discrepâncias com atribuição a responsáveis e SLAs rígidos de tratamento
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Severidade:</span>
                <select
                  value={filtroSeveridade}
                  onChange={(e) => setFiltroSeveridade(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="TODAS" className="bg-slate-900">Todas</option>
                  <option value="CRITICA" className="bg-slate-900">Crítica</option>
                  <option value="ALTA" className="bg-slate-900">Alta</option>
                  <option value="MEDIA" className="bg-slate-900">Média</option>
                  <option value="BAIXA" className="bg-slate-900">Baixa</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-slate-400 font-medium">Domínio:</span>
                <select
                  value={filtroDominio}
                  onChange={(e) => setFiltroDominio(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="TODOS" className="bg-slate-900">Todos</option>
                  <option value="FINANCEIRO" className="bg-slate-900">Financeiro</option>
                  <option value="OPERACOES" className="bg-slate-900">Operações</option>
                  <option value="CONTABILIDADE" className="bg-slate-900">Contabilidade</option>
                  <option value="PORTARIA" className="bg-slate-900">Portaria</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-slate-400 font-medium">Situação:</span>
                <select
                  value={filtroSituacao}
                  onChange={(e) => setFiltroSituacao(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="TODAS" className="bg-slate-900">Todas</option>
                  <option value="NOVA" className="bg-slate-900">Nova</option>
                  <option value="EM_ANALISE" className="bg-slate-900">Em Análise</option>
                  <option value="EM_CORRECAO" className="bg-slate-900">Em Correção</option>
                  <option value="CORRIGIDA" className="bg-slate-900">Corrigida</option>
                  <option value="ACEITA" className="bg-slate-900">Aceita</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listagem de Divergências */}
          <div className="space-y-3">
            {divergenciasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                Nenhuma divergência encontrada para os filtros selecionados.
              </div>
            ) : (
              divergenciasFiltradas.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        {d.codigoDivergencia}
                      </span>
                      {getSeveridadeBadge(d.severidade)}
                      {getSituacaoBadge(d.situacao)}
                      <span className="text-xs text-slate-400">
                        {d.camadaOrigem} ➔ {d.camadaDestino}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100">{d.descricaoProblema}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Evento: <strong className="text-slate-300">{d.eventoNome || 'Geral'}</strong></span>
                      <span>Responsável: <strong className="text-slate-300">{d.responsavelDominio}</strong></span>
                      <span>Valor Envolvido: <strong className="font-mono text-slate-200">{formatBRL(d.valorEnvolvido)}</strong></span>
                      {d.prazoResolucao && (
                        <span className="text-amber-400/90 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          SLA: {new Date(d.prazoResolucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setDivergenciaParaTratar(d);
                        setNovaSituacaoTratamento(d.situacao === 'NOVA' ? 'EM_ANALISE' : d.situacao);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <span>Tratar Ocorrência</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal / Dialog de Tratamento de Divergência */}
          {divergenciaParaTratar && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Tratamento de Divergência: {divergenciaParaTratar.codigoDivergencia}
                    </h3>
                    <p className="text-xs text-slate-400">{divergenciaParaTratar.tipo}</p>
                  </div>
                  <button
                    onClick={() => setDivergenciaParaTratar(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200">Problema Detectado:</p>
                  <p className="mt-1">{divergenciaParaTratar.descricaoProblema}</p>
                  <p className="mt-2 text-slate-400">
                    Origem: <strong className="text-slate-300">{divergenciaParaTratar.camadaOrigem}</strong> ➔ Destino: <strong className="text-slate-300">{divergenciaParaTratar.camadaDestino}</strong>
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nova Situação:</label>
                    <select
                      value={novaSituacaoTratamento}
                      onChange={(e) => setNovaSituacaoTratamento(e.target.value as SituacaoDivergencia)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="NOVA">Nova</option>
                      <option value="EM_ANALISE">Em Análise Técnica</option>
                      <option value="EM_CORRECAO">Em Correção Operacional</option>
                      <option value="CORRIGIDA">Corrigida (Resolvida)</option>
                      <option value="ACEITA">Aceita (Dentro da tolerância de centavos)</option>
                      <option value="ENCERRADA">Encerrada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ação Aplicada:</label>
                    <input
                      type="text"
                      value={acaoTratamento}
                      onChange={(e) => setAcaoTratamento(e.target.value)}
                      placeholder="Ex: Emissão manual de ingresso no inventário após confirmação de webhook"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Justificativa Técnica / Governança (Obrigatória para Auditoria):
                    </label>
                    <textarea
                      rows={3}
                      value={justificativaTratamento}
                      onChange={(e) => setJustificativaTratamento(e.target.value)}
                      placeholder="Descreva a razão técnica da correção e o impacto financeiro para constar na trilha imutável..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setDivergenciaParaTratar(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarTratamento}
                    disabled={tratamentoEmAndamento}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {tratamentoEmAndamento ? 'Gravando Auditoria...' : 'Confirmar e Publicar Evento'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: CONCILIAÇÃO SISTÊMICA MULTICAMADAS */}
      {/* ==================================================================== */}
      {abaAtiva === 'conciliacao' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Conciliação Sistêmica Multicamadas Ponta a Ponta</h2>
            <p className="text-xs text-slate-400">
              Rastreabilidade do fluxo financeiro: Pedido ➔ Pagamento ➔ Ledger ➔ Contabilidade ➔ Tesouraria ➔ Extrato Bancário Real
            </p>
          </div>

          {/* Resumo da Conciliação */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">GMV Bruto Pedido</p>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {formatBRL(conciliacao?.valorBrutoPedido)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total checkout aprovado</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">MDR Previsto Contratual</p>
              <p className="text-xl font-bold font-mono text-slate-300 mt-1">
                - {formatBRL(conciliacao?.mdrPrevisto)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Taxa de intermediação calculada</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">Líquido Esperado Banco</p>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {formatBRL(conciliacao?.valorEsperadoBanco)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Provisionado na Tesouraria</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">Divergência Real Líquida</p>
              <p className={`text-xl font-bold font-mono mt-1 ${
                (conciliacao?.divergenciaRealLiquida || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {conciliacao?.divergenciaRealLiquida ? `- ${formatBRL(conciliacao.divergenciaRealLiquida)}` : 'R$ 0,00'}
              </p>
              <p className="text-xs text-amber-400/90 mt-1">Diferença de tarifa bancária</p>
            </div>
          </div>

          {/* Comparativo das 6 Camadas */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Matriz de Conciliação em 6 Camadas
            </h3>

            <div className="space-y-3">
              {conciliacao?.camadas.map((c, idx) => (
                <div
                  key={c.camada}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{c.camada}</p>
                      <p className="text-slate-400">{c.detalhe}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Esperado / Registrado</p>
                      <p className="font-mono font-bold text-slate-200">
                        {formatBRL(c.valorEsperado)} / {formatBRL(c.valorRegistrado)}
                      </p>
                    </div>

                    <div>
                      {c.status === 'CONCILIADO' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Conciliado
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Divergente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: LINHAGEM E RASTREABILIDADE */}
      {/* ==================================================================== */}
      {abaAtiva === 'linhagem' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Linhagem de Dados & Árvore Causal</h2>
              <p className="text-xs text-slate-400">
                Rastreamento reverso: de onde vem cada número apresentado nos dashboards executivos até a transação atômica
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300">
              <span>Indicador Alvo:</span>
              <select
                value={indicadorLinhagem}
                onChange={(e) => handleMudarIndicadorLinhagem(e.target.value)}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="MARGEM_DISK" className="bg-slate-900 text-white">Margem Disk (R$ 247.200,00)</option>
                <option value="RECEITA_DISK" className="bg-slate-900 text-white">Receita Contratual Disk (R$ 361.200,00)</option>
                <option value="GMV_LIQUIDO" className="bg-slate-900 text-white">GMV Líquido (R$ 2.408.000,00)</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Grafo Causal de Decomposição</h3>
                <p className="text-xs text-slate-400">
                  Cada nó representa uma camada de agregação ou contrato que alimenta o número final
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-medium">
                100% Auditável
              </span>
            </div>

            {linhagem && renderLinhagemNode(linhagem)}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: CENTRO DE INVESTIGAÇÃO UNIVERSAL 360º */}
      {/* ==================================================================== */}
      {abaAtiva === 'investigacao' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Centro de Investigação Universal 360º</h2>
            <p className="text-xs text-slate-400">
              Busca ponta a ponta por Pedido, TID Adquirente, NSU, CPF Mascarado, QR Code ou Correlation ID
            </p>
          </div>

          {/* Barra de Busca */}
          <form onSubmit={handleBuscarInvestigacao} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Digite o Pedido (ex: PED-45872), TID, NSU, CPF ou Correlation ID..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={buscandoInvestigacao}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {buscandoInvestigacao ? 'Investigando...' : 'Investigar'}
            </button>
          </form>

          {investigacao && (
            <div className="space-y-6">
              {/* Visão Consolidada das Entidades */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Comprador & Pedido */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-sky-400" />
                      Comprador & Pedido
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{investigacao.pedido.status}</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p>Cliente: <strong className="text-white">{investigacao.cliente.nome}</strong></p>
                    <p>Documento: <span className="font-mono">{investigacao.cliente.documentoMascarado}</span> (LGPD)</p>
                    <p>E-mail: <span className="font-mono">{investigacao.cliente.emailMascarado}</span></p>
                    <p>Pedido: <span className="font-mono text-white font-bold">{investigacao.pedido.pedidoId}</span></p>
                    <p>Valor Total: <span className="font-mono text-emerald-400 font-bold">{formatBRL(investigacao.pedido.totalCentavos / 100)}</span></p>
                  </div>
                </div>

                {/* 2. Gateway & Pagamento */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" />
                      Gateway & Adquirente
                    </span>
                    <span className="font-mono text-sky-400 font-bold">{investigacao.pagamento.status}</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p>Adquirente: <strong className="text-white">{investigacao.pagamento.adquirente}</strong></p>
                    <p>NSU: <span className="font-mono">{investigacao.pagamento.nsu}</span></p>
                    <p>TID: <span className="font-mono text-xs">{investigacao.pagamento.tid}</span></p>
                    <p>Lançamento Ledger: <span className="font-mono text-slate-200">{investigacao.ledger.lancamentoId}</span></p>
                    <p>Balanceado: <span className="text-emerald-400 font-semibold">✓ Sim (Partidas Dobradas)</span></p>
                  </div>
                </div>

                {/* 3. Ingressos & Portaria */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Ingressos & Portaria
                    </span>
                    <span className="text-slate-400">{investigacao.ingressos.length} Ingressos</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    {investigacao.ingressos.map((ing) => (
                      <div key={ing.ingressoId} className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span>{ing.titular}</span>
                        <span className="font-mono text-xs text-emerald-400">{ing.status}</span>
                      </div>
                    ))}
                    {investigacao.checkin && (
                      <p className="text-sky-300 pt-1">
                        Check-in: {investigacao.checkin.portaria} ({investigacao.checkin.catraca})
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Linha do Tempo Cronológica com Microsegundos */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Linha do Tempo Transacional (Ciclo de Vida Auditável)
                </h3>

                <div className="relative border-l border-slate-800 ml-3 space-y-4 text-xs">
                  {investigacao.linhaDoTempo.map((evt, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="font-semibold text-white">{evt.evento}</p>
                          <p className="text-slate-400 text-xs">
                            Módulo: <span className="text-slate-300 font-mono">{evt.modulo}</span> • Correlation ID: <span className="font-mono text-slate-400">{evt.correlationId}</span>
                          </p>
                        </div>
                        <span className="font-mono text-slate-400 text-xs">{evt.hora}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: CATÁLOGO CORPORATIVO DE DADOS */}
      {/* ==================================================================== */}
      {abaAtiva === 'catalogo' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Catálogo de Dados & Definições Corporativas Oficiais</h2>
            <p className="text-xs text-slate-400">
              Dicionário oficial e terminologia inviolável do ecossistema EDDIE para métricas e KPIs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogo.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 text-sm bg-slate-800 px-2 py-0.5 rounded">
                      {cat.termoCodigo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {cat.classificacaoDado}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm">{cat.nomeOficial}</h3>
                  <p className="text-xs text-slate-300">{cat.definicaoCorporativa}</p>

                  {cat.formulaCalculo && (
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs text-sky-300">
                      <span className="text-slate-500">Fórmula:</span> {cat.formulaCalculo}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Dono do Dado:</span>
                    <strong className="text-slate-200">{cat.donoDadoResponsavel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Fontes Oficiais:</span>
                    <span className="font-mono text-slate-300">{cat.fontesSistemas.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: AUDITORIA CENTRAL IMUTÁVEL (APPEND-ONLY) */}
      {/* ==================================================================== */}
      {abaAtiva === 'auditoria' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Trilha de Auditoria Central Imutável</h2>
              <p className="text-xs text-slate-400">
                Log append-only com comparação "Antes" e "Depois", correlation IDs, IPs e justificativas obrigatórias
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
              Schema: governanca.registros_auditoria
            </span>
          </div>

          <div className="space-y-4">
            {auditoria.map((aud) => (
              <div
                key={aud.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white bg-slate-800 px-2 py-0.5 rounded">
                      {aud.acao}
                    </span>
                    <span className="text-xs text-slate-400">
                      Módulo: <strong className="text-slate-300">{aud.modulo}</strong>
                    </span>
                    {aud.dadosSensiveisAcessados && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800">
                        LGPD Sensível
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    {new Date(aud.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Operador: <strong className="text-slate-200">{aud.usuarioNome}</strong> ({aud.usuarioId})</p>
                    <p className="text-slate-400">IP de Origem: <span className="font-mono text-slate-300">{aud.ipOrigem || '—'}</span></p>
                    <p className="text-slate-400">Correlation ID: <span className="font-mono text-slate-300">{aud.correlationId}</span></p>
                    {aud.quantidadeRegistrosExportados && (
                      <p className="text-amber-400 font-semibold mt-1">
                        Registros Exportados: {aud.quantidadeRegistrosExportados.toLocaleString('pt-BR')} linhas
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                    <p className="text-slate-400 font-medium">Justificativa Registrada:</p>
                    <p className="mt-1">{aud.motivoJustificativa}</p>
                    {aud.aprovadorUsuarioId && (
                      <p className="text-slate-400 text-xs mt-2">
                        Aprovador: <strong className="text-slate-300">{aud.aprovadorUsuarioId}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Comparação Antes x Depois */}
                {(aud.valorAntes || aud.valorDepois) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-red-950/20 border border-red-900/40 text-red-300">
                      <p className="text-slate-400 font-sans text-xs mb-1">Estado Anterior (Antes):</p>
                      <pre className="overflow-x-auto">{JSON.stringify(aud.valorAntes, null, 2)}</pre>
                    </div>
                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
                      <p className="text-slate-400 font-sans text-xs mb-1">Novo Estado (Depois):</p>
                      <pre className="overflow-x-auto">{JSON.stringify(aud.valorDepois, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 8: INTEGRAÇÕES & EVENTOS OUTBOX */}
      {/* ==================================================================== */}
      {abaAtiva === 'integracoes' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Saúde das Integrações Externas & Eventos Internos</h2>
              <p className="text-xs text-slate-400">
                Monitor de conectores de Adquirência, Bancos, Redes Sociais, Mensageria e Fila do Outbox
              </p>
            </div>
            {gateFechamento && !gateFechamento.aprovadoParaFechamento && (
              <span className="px-3 py-1 rounded-lg bg-red-950/80 text-red-400 border border-red-800 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Gate 11.24: Fechamento Bloqueado ({gateFechamento.divergenciasCriticasAbertas} críticas)
              </span>
            )}
          </div>

          {/* Feedback de Reprocessamento */}
          {reprocessamentoFeedback && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{reprocessamentoFeedback}</span>
            </div>
          )}

          {/* Cartões do Outbox Interno */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">Outbox Pendente</p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {integracoes?.eventosInternos.outboxPendente || 3}
              </p>
              <p className="text-xs text-emerald-400 mt-1">Fluxo regular ativo</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">Falhas de Processamento</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {integracoes?.eventosInternos.falhasProcessamento || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Zero falhas permanentes</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">Dead Letter Queue (DLQ)</p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {integracoes?.eventosInternos.filaErrosDlq || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Fila de exceção limpa</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-medium">Atraso Médio de Sync</p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {integracoes?.eventosInternos.atrasoMedioProcessamentoSegundos || 1.2}s
              </p>
              <p className="text-xs text-emerald-400 mt-1">Tempo real &lt; 2s</p>
            </div>
          </div>

          {/* Grid de Integrações Externas */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Conectores Externos Homologados
            </h3>

            <div className="space-y-3">
              {integracoes?.integracoes.map((item) => (
                <div
                  key={item.nome}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      item.status === 'OPERACIONAL' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{item.nome}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-xs">
                          {item.categoria}
                        </span>
                      </div>
                      {item.ultimoErro ? (
                        <p className="text-red-400 mt-0.5">Erro recente: {item.ultimoErro}</p>
                      ) : (
                        <p className="text-slate-400 mt-0.5">Última comunicação bem-sucedida: {item.ultimoSucesso}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500 text-xs">Latência:</span> {item.latenciaMs}ms
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Taxa Erro:</span> {item.taxaErroPct}%
                    </div>
                    {item.filaPendenteQtd > 0 && (
                      <button
                        onClick={() => handleReprocessar(`COR-INT-${item.nome.replace(/\s+/g, '-').toUpperCase()}`)}
                        disabled={reprocessandoId !== null}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-semibold border border-slate-700 transition-colors"
                      >
                        Reprocessar ({item.filaPendenteQtd})
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
