'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Users,
  AlertTriangle,
  Smartphone,
  CreditCard,
  QrCode,
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Activity,
  FileText,
  Network,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  segurancaClient,
  CentralSegurancaSnapshot,
  SessaoSegurancaDto,
  OperacaoSensivelDto,
  AvaliacaoRiscoTransacaoDto,
  TentativaIngressoDto,
  CasoInvestigacaoDto,
  BloqueioSegurancaDto,
  CredencialParceiroApiDto,
  TipoBloqueio,
} from '@/lib/seguranca-client';

export default function CentralSegurancaPage() {
  const [snapshot, setSnapshot] = useState<CentralSegurancaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<
    | 'visao-geral'
    | 'identidades'
    | 'sessoes'
    | 'operacoes'
    | 'pagamentos'
    | 'ingressos'
    | 'riscos'
    | 'apis'
    | 'investigacoes'
    | 'bloqueios'
    | 'politicas'
    | 'auditoria'
  >('visao-geral');

  // Filtros e buscas
  const [buscaGeral, setBuscaGeral] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Modais de ação
  const [modalNovoBloqueio, setModalNovoBloqueio] = useState(false);
  const [novoBloqueioTipo, setNovoBloqueioTipo] = useState<TipoBloqueio>('DISPOSITIVO');
  const [novoBloqueioAlvo, setNovoBloqueioAlvo] = useState('');
  const [novoBloqueioMotivo, setNovoBloqueioMotivo] = useState('');

  const [modalNovaCredencial, setModalNovaCredencial] = useState(false);
  const [novaCredencialNome, setNovaCredencialNome] = useState('');
  const [novaCredencialParceiro, setNovaCredencialParceiro] = useState('');
  const [chaveRecemCriada, setChaveRecemCriada] = useState<string | null>(null);

  const [modalJit, setModalJit] = useState(false);
  const [jitUsuarioId, setJitUsuarioId] = useState('usr-op-catraca');
  const [jitPermissao, setJitPermissao] = useState('eventos:write');
  const [jitHoras, setJitHoras] = useState(2);
  const [jitMotivo, setJitMotivo] = useState('');

  // Investigação selecionada para grafo
  const [investigacaoAtivaId, setInvestigacaoAtivaId] = useState<string>('inv-case-001');

  useEffect(() => {
    carregarSnapshot();
  }, []);

  async function carregarSnapshot() {
    setLoading(true);
    try {
      const data = await segurancaClient.getSnapshot();
      setSnapshot(data);
    } catch (err) {
      console.error('Falha ao carregar snapshot de segurança', err);
    } finally {
      setLoading(false);
    }
  }

  function dispararNotificacao(msg: string) {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(null), 4000);
  }

  async function encerrarSessao(sessaoId: string) {
    await segurancaClient.encerrarSessao(sessaoId, 'admin-console');
    dispararNotificacao(`Sessão ${sessaoId} encerrada remotamente.`);
    await carregarSnapshot();
  }

  async function revogarBloqueio(bloqueioId: string) {
    await segurancaClient.revogarBloqueio(bloqueioId, 'admin-console');
    dispararNotificacao(`Bloqueio ${bloqueioId} revogado com sucesso.`);
    await carregarSnapshot();
  }

  async function salvarNovoBloqueio(e: React.FormEvent) {
    e.preventDefault();
    if (!novoBloqueioAlvo || !novoBloqueioMotivo) return;

    await segurancaClient.aplicarBloqueio({
      tipo: novoBloqueioTipo,
      alvoIdentificador: novoBloqueioAlvo,
      alvoDescricao: `Bloqueio manual via Console de Segurança`,
      motivo: novoBloqueioMotivo,
      evidencias: ['Acionamento direto do operador de segurança'],
      bloqueadoPor: 'admin-console',
    });

    setModalNovoBloqueio(false);
    setNovoBloqueioAlvo('');
    setNovoBloqueioMotivo('');
    dispararNotificacao('Novo bloqueio de segurança aplicado com sucesso.');
    await carregarSnapshot();
  }

  async function salvarNovaCredencial(e: React.FormEvent) {
    e.preventDefault();
    if (!novaCredencialNome || !novaCredencialParceiro) return;

    const res = await segurancaClient.gerarCredencialParceiro({
      parceiroId: `parc-${Date.now()}`,
      parceiroNome: novaCredencialParceiro,
      nome: novaCredencialNome,
      escopos: ['eventos:read', 'reservas:write'],
      limiteRequisicoesMinuto: 300,
    });

    if (res?.secretOneTime) {
      setChaveRecemCriada(res.secretOneTime);
    }
    setNovaCredencialNome('');
    setNovaCredencialParceiro('');
    dispararNotificacao('Nova credencial gerada! Guarde o segredo exibido.');
    await carregarSnapshot();
  }

  async function concederAcessoJit(e: React.FormEvent) {
    e.preventDefault();
    if (!jitMotivo) return;

    await segurancaClient.concederAcessoTemporario({
      usuarioId: jitUsuarioId,
      permissao: jitPermissao,
      duracaoHoras: jitHoras,
      motivo: jitMotivo,
      concedidoPor: 'admin-console',
    });

    setModalJit(false);
    setJitMotivo('');
    dispararNotificacao(`Acesso temporário concedido com sucesso por ${jitHoras} horas.`);
    await carregarSnapshot();
  }

  if (loading && !snapshot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-neutral-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium">Carregando Central de Segurança & Antifraude (EDDIE 11.34)...</p>
      </div>
    );
  }

  const kpis = snapshot?.kpis || {
    sessoesAtivas: 184,
    operacoesRisco: 12,
    investigacoesAbertas: 7,
    bloqueiosAtivos: 9,
    tentativasSuspeitas: 21,
    alertasCriticos: 2,
  };

  const saude = snapshot?.saudeDominios || {
    identidade: 'NORMAL',
    pagamentos: 'ATENCAO',
    ingressos: 'NORMAL',
    portaria: 'NORMAL',
    financeiro: 'ATENCAO',
    apis: 'NORMAL',
  };

  const casoSelecionado = snapshot?.investigacoes.find((c) => c.id === investigacaoAtivaId) || snapshot?.investigacoes[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* Toast de Notificação */}
      {mensagemSucesso && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              EDDIE 11.34
            </span>
            <span className="text-xs text-neutral-400">Camada Transversal de Proteção</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            SEGURANÇA E ANTIFRAUDE
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Proteção contínua da cadeia: Usuário → Identidade → Sessão/Dispositivo → Permissão → Operação → Risco → Decisão → Auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => carregarSnapshot()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800/80 hover:bg-neutral-700 rounded-md border border-neutral-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            Atualizar Sinal
          </button>
          <button
            onClick={() => setModalNovoBloqueio(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-md transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Bloqueio
          </button>
        </div>
      </div>

      {/* Cartões de Métricas Operacionais (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-lg shadow-sm">
          <div className="text-xs font-medium text-neutral-400">Sessões ativas</div>
          <div className="text-2xl font-bold text-white mt-1">{kpis.sessoesAtivas}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 183 autenticadas
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-lg shadow-sm">
          <div className="text-xs font-medium text-neutral-400">Operações de risco</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{kpis.operacoesRisco}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Nível 3 e Nível 4</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-lg shadow-sm">
          <div className="text-xs font-medium text-neutral-400">Investigações abertas</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{kpis.investigacoesAbertas}</div>
          <div className="text-[11px] text-cyan-500/80 mt-1">2 em análise profunda</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-lg shadow-sm">
          <div className="text-xs font-medium text-neutral-400">Bloqueios ativos</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{kpis.bloqueiosAtivos}</div>
          <div className="text-[11px] text-rose-500/80 mt-1">Dispositivos, IPs e QRs</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-lg shadow-sm">
          <div className="text-xs font-medium text-neutral-400">Tentativas suspeitas</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{kpis.tentativasSuspeitas}</div>
          <div className="text-[11px] text-orange-500/80 mt-1">Últimas 24 horas</div>
        </div>

        <div className="bg-neutral-900/80 border border-rose-900/40 bg-rose-950/10 p-3.5 rounded-lg shadow-sm">
          <div className="text-xs font-medium text-rose-300">Alertas críticos</div>
          <div className="text-2xl font-bold text-rose-500 mt-1">{kpis.alertasCriticos}</div>
          <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" /> Ação imediata
          </div>
        </div>
      </div>

      {/* Linha de Saúde dos Domínios (Status Operacional) */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-lg">
        <div className="text-xs font-semibold text-neutral-400 mb-2.5 uppercase tracking-wider">
          Saúde Operacional por Domínio
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/60 rounded border border-neutral-700/60">
            <span className="text-xs font-medium text-neutral-300">IDENTIDADE</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Normal
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-amber-950/20 rounded border border-amber-800/40">
            <span className="text-xs font-medium text-amber-200">PAGAMENTOS</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
              Atenção
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/60 rounded border border-neutral-700/60">
            <span className="text-xs font-medium text-neutral-300">INGRESSOS</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Normal
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/60 rounded border border-neutral-700/60">
            <span className="text-xs font-medium text-neutral-300">PORTARIA</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Normal
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-amber-950/20 rounded border border-amber-800/40">
            <span className="text-xs font-medium text-amber-200">FINANCEIRO</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
              Atenção
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/60 rounded border border-neutral-700/60">
            <span className="text-xs font-medium text-neutral-300">APIs</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Normal
            </span>
          </div>
        </div>
      </div>

      {/* Menu de Navegação Horizontal das 12 Seções */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-800 scrollbar-thin">
        {[
          { id: 'visao-geral', label: 'Visão Geral', icon: Activity },
          { id: 'identidades', label: 'Identidades e Acessos', icon: Users },
          { id: 'sessoes', label: 'Sessões e Dispositivos', icon: Smartphone },
          { id: 'operacoes', label: 'Operações Sensíveis', icon: Sliders },
          { id: 'pagamentos', label: 'Antifraude de Pagamentos', icon: CreditCard },
          { id: 'ingressos', label: 'Antifraude de Ingressos', icon: QrCode },
          { id: 'riscos', label: 'Riscos e Anomalias', icon: AlertTriangle },
          { id: 'apis', label: 'APIs e Integrações', icon: Globe },
          { id: 'investigacoes', label: 'Investigações', icon: Network },
          { id: 'bloqueios', label: 'Bloqueios', icon: Lock },
          { id: 'politicas', label: 'Políticas de Segurança', icon: ShieldCheck },
          { id: 'auditoria', label: 'Auditoria de Segurança', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const ativo = abaAtiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id as typeof abaAtiva)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md text-xs font-medium whitespace-nowrap transition border-b-2 ${
                ativo
                  ? 'border-amber-500 text-amber-400 bg-neutral-800/60'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: VISÃO GERAL */}
      {/* ==================================================================== */}
      {abaAtiva === 'visao-geral' && (
        <div className="space-y-6">
          {/* Alertas Críticos Imediatos */}
          <div className="bg-rose-950/20 border border-rose-900/60 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-semibold text-rose-300">Alertas Críticos de Segurança Requerendo Ação</h3>
              </div>
              <span className="text-xs bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded font-mono">2 pendentes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-900/90 border border-rose-900/40 p-3 rounded-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-400">Carding Bot Automatizado</span>
                    <span className="text-neutral-500">há 35 min</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    5 tentativas com cartões de titulares diferentes em 8 minutos originadas do IP anônimo 185.220.101.5. Dispositivo bloqueado preventivamente.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setInvestigacaoAtivaId('inv-case-001');
                      setAbaAtiva('investigacoes');
                    }}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Ver Grafo do Caso INV-2026-0081 →
                  </button>
                </div>
              </div>

              <div className="bg-neutral-900/90 border border-amber-900/40 p-3 rounded-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400">Quarentena Bancária Ativa (24h)</span>
                    <span className="text-neutral-500">Restam 20h</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Tentativa de aprovação de repasse de R$ 150.000 para Opus Entretenimento bloqueada temporariamente devido à alteração recente de dados bancários.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => setAbaAtiva('operacoes')}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Auditar Quarentena em Operações Sensíveis →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Atalhos Operacionais Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setModalJit(true)}
              className="p-4 bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/50 rounded-lg text-left transition group"
            >
              <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Key className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">Conceder JIT / Break-Glass</div>
              <div className="text-xs text-neutral-400 mt-1">Acesso temporário com expiração programada</div>
            </button>

            <button
              onClick={() => setModalNovoBloqueio(true)}
              className="p-4 bg-neutral-900/80 border border-neutral-800 hover:border-rose-500/50 rounded-lg text-left transition group"
            >
              <div className="w-8 h-8 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">Aplicar Bloqueio Imediato</div>
              <div className="text-xs text-neutral-400 mt-1">Barrar dispositivo, IP, CPF, ingresso ou token</div>
            </button>

            <button
              onClick={() => setAbaAtiva('sessoes')}
              className="p-4 bg-neutral-900/80 border border-neutral-800 hover:border-cyan-500/50 rounded-lg text-left transition group"
            >
              <div className="w-8 h-8 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">Auditar Sessões Suspeitas</div>
              <div className="text-xs text-neutral-400 mt-1">1 sessão identificada com salto de geolocalização</div>
            </button>

            <button
              onClick={() => setAbaAtiva('pagamentos')}
              className="p-4 bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/50 rounded-lg text-left transition group"
            >
              <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white">Fila Antifraude de Checkout</div>
              <div className="text-xs text-neutral-400 mt-1">Revisão transparente de sinais de pagamento</div>
            </button>
          </div>

          {/* Feed de Atividade Recente da Central */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              Atividades Recentes de Proteção
            </h3>
            <div className="divide-y divide-neutral-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-neutral-200">
                    Bloqueio do dispositivo <span className="font-mono text-amber-400">FP-BROWSER-8910</span> por ataque de carding
                  </span>
                </div>
                <span className="text-neutral-500">há 35 min</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-neutral-200">
                    Quarentena preventiva de 24h acionada para repasse de <span className="font-semibold text-white">R$ 150.000,00</span>
                  </span>
                </div>
                <span className="text-neutral-500">há 1 hora</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span className="text-neutral-200">
                    Ingresso <span className="font-mono text-amber-400">ing-pista-premium-4491</span> barrado no Portão 04 por duplicidade
                  </span>
                </div>
                <span className="text-neutral-500">há 2 horas</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-neutral-200">
                    Reautenticação Step-up MFA validada com sucesso por Mariana Duarte (Diretora Financeira)
                  </span>
                </div>
                <span className="text-neutral-500">há 4 horas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: IDENTIDADES E ACESSOS (RBAC COM ESCOPO) */}
      {/* ==================================================================== */}
      {abaAtiva === 'identidades' && (
        <div className="space-y-4">
          <div className="bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300">
              <span className="font-semibold text-amber-300">RBAC Unificado e Governança de Escopo:</span> Não criamos um segundo sistema de usuários. Esta camada estende o modelo nativo garantindo que o Produtor A jamais visualize dados do Produtor B (403), auditando MFA ativo, menor privilégio e permissões temporárias JIT.
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={buscaGeral}
                onChange={(e) => setBuscaGeral(e.target.value)}
                placeholder="Buscar usuário, e-mail ou organização..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setModalJit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition"
            >
              <Key className="w-3.5 h-3.5" />
              Conceder Permissão Temporária (JIT)
            </button>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-4">Identidade / Usuário</th>
                    <th className="py-2.5 px-4">Papel & Escopo</th>
                    <th className="py-2.5 px-4">Organização</th>
                    <th className="py-2.5 px-4">MFA / 2FA</th>
                    <th className="py-2.5 px-4">Permissão JIT Ativa</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {[
                    {
                      id: 'usr-admin-master',
                      nome: 'Vinicius Casagrande (Admin Master)',
                      email: 'vinicius@diskingressos.com.br',
                      papel: 'ADMIN_DISKINGRESSOS',
                      escopo: 'DISKINGRESSOS',
                      org: 'DiskIngressos Corporativo',
                      mfa: true,
                      metodo: 'TOTP / Google Authenticator',
                      jit: null,
                      status: 'ATIVO',
                    },
                    {
                      id: 'usr-fin-diretor',
                      nome: 'Mariana Duarte (Diretora Financeira)',
                      email: 'mariana.duarte@diskingressos.com.br',
                      papel: 'FINANCEIRO_DISKINGRESSOS',
                      escopo: 'DISKINGRESSOS',
                      org: 'DiskIngressos Corporativo',
                      mfa: true,
                      metodo: 'Hardware FIDO2 Token',
                      jit: null,
                      status: 'ATIVO',
                    },
                    {
                      id: 'usr-prod-livenation',
                      nome: 'Carlos Eduardo (Live Nation)',
                      email: 'carlos.eduardo@livenation.com.br',
                      papel: 'PRODUTOR_ADMIN',
                      escopo: 'PRODUTOR (prod-live-nation)',
                      org: 'Live Nation Brasil',
                      mfa: true,
                      metodo: 'SMS / TOTP',
                      jit: null,
                      status: 'ATIVO',
                    },
                    {
                      id: 'usr-prod-opus',
                      nome: 'Juliana Siqueira (Opus Entretenimento)',
                      email: 'juliana.siqueira@opusentretenimento.com.br',
                      papel: 'PRODUTOR_ADMIN',
                      escopo: 'PRODUTOR (prod-opus-entretenimento)',
                      org: 'Opus Entretenimento',
                      mfa: false,
                      metodo: 'Pendente ativação',
                      jit: null,
                      status: 'ATIVO',
                    },
                    {
                      id: 'usr-op-catraca',
                      nome: 'Rodrigo Alves (Supervisor Portaria)',
                      email: 'rodrigo.alves@diskingressos.com.br',
                      papel: 'PORTARIA_CHECKIN',
                      escopo: 'DISKINGRESSOS',
                      org: 'Operações de Campo Disk',
                      mfa: true,
                      metodo: 'POS Biométrico Homologado',
                      jit: 'eventos:write (expira em 2h)',
                      status: 'ATIVO',
                    },
                  ].map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{u.nome}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-amber-400">{u.papel}</div>
                        <div className="text-[11px] text-neutral-400">{u.escopo}</div>
                      </td>
                      <td className="py-3 px-4">{u.org}</td>
                      <td className="py-3 px-4">
                        {u.mfa ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {u.metodo}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Não configurado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.jit ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
                            {u.jit}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 3: SESSÕES E DISPOSITIVOS */}
      {/* ==================================================================== */}
      {abaAtiva === 'sessoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Sessões Ativas e Dispositivos Registrados</h3>
            <span className="text-xs text-neutral-400">Total: {snapshot?.sessoes.length || 0} registradas no snapshot</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {snapshot?.sessoes.map((s) => {
              const isSuspeita = s.status === 'SUSPEITA';
              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-lg border transition ${
                    isSuspeita
                      ? 'bg-rose-950/20 border-rose-800/80 shadow-rose-950/30'
                      : 'bg-neutral-900/80 border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{s.usuarioNome}</span>
                        {isSuspeita ? (
                          <span className="px-2 py-0.5 text-[11px] rounded bg-rose-900/80 text-rose-200 border border-rose-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> SUSPEITA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px]">
                            {s.status}
                          </span>
                        )}
                        {s.mfaValidado && (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> MFA Validado
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-neutral-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong className="text-neutral-400">Dispositivo:</strong> {s.dispositivo}</span>
                        <span><strong className="text-neutral-400">IP:</strong> {s.ipOrigem}</span>
                        <span><strong className="text-neutral-400">Localização:</strong> {s.localizacaoAprox || 'N/D'}</span>
                        <span><strong className="text-neutral-400">Atividade:</strong> {s.ultimaAtividade}</span>
                      </div>

                      {isSuspeita && s.motivoSuspeita && (
                        <div className="text-xs text-rose-300 mt-2 bg-rose-950/60 p-2 rounded border border-rose-900/60 font-medium">
                          Motivo do Alerta: {s.motivoSuspeita}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {s.status !== 'ENCERRADA' ? (
                        <button
                          onClick={() => encerrarSessao(s.id)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 rounded transition"
                        >
                          Encerrar Sessão
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500 italic">Sessão já encerrada</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 4: OPERAÇÕES SENSÍVEIS & SEGREGAÇÃO DE FUNÇÕES (SoD) */}
      {/* ==================================================================== */}
      {abaAtiva === 'operacoes' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Matriz de Incompatibilidade & Segregação de Funções (SoD)
            </h3>
            <p className="text-xs text-neutral-300">
              O sistema barra automaticamente a aprovação de operações críticas pelo mesmo operador que as cadastrou ou solicitou:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-xs">
                <div className="font-semibold text-amber-400">Repasses Financeiros</div>
                <div className="text-neutral-400 mt-1 font-mono text-[11px]">CRIAR_REPASSE ≠ APROVAR_REPASSE</div>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-xs">
                <div className="font-semibold text-amber-400">Contas Bancárias</div>
                <div className="text-neutral-400 mt-1 font-mono text-[11px]">CADASTRAR_CONTA ≠ APROVAR_CONTA</div>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-xs">
                <div className="font-semibold text-amber-400">Reembolsos & Estornos</div>
                <div className="text-neutral-400 mt-1 font-mono text-[11px]">SOLICITAR_ESTORNO ≠ APROVAR_ESTORNO</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Log de Operações Sensíveis Executadas e Quarentenas</h3>
            <div className="space-y-3">
              {snapshot?.operacoesSensiveis.map((op) => {
                const isQuarentena = op.status === 'RETIDO_QUARENTENA';
                return (
                  <div
                    key={op.id}
                    className={`p-3.5 rounded-lg border text-xs ${
                      isQuarentena
                        ? 'bg-amber-950/20 border-amber-800/80'
                        : 'bg-neutral-950/60 border-neutral-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{op.codigoOperacao}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                          {op.nivel}
                        </span>
                        {isQuarentena ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/80 text-amber-200 border border-amber-700">
                            QUARENTENA 24H ATIVA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            EXECUTADO
                          </span>
                        )}
                      </div>
                      <span className="text-neutral-400">{op.createdAt}</span>
                    </div>

                    <div className="text-neutral-300 mt-2">{op.descricao}</div>

                    <div className="mt-2 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-400 text-[11px]">
                      <span><strong>Operador:</strong> {op.usuarioNome} ({op.usuarioPapel})</span>
                      <span><strong>Recurso:</strong> {op.recursoAfetado} {op.recursoId ? `(${op.recursoId})` : ''}</span>
                      {op.quarentenaAte && (
                        <span className="text-amber-400 font-semibold">
                          Quarentena expira em: {op.quarentenaAte}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 5: ANTIFRAUDE DE PAGAMENTOS */}
      {/* ==================================================================== */}
      {abaAtiva === 'pagamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Orquestrador de Risco & Antifraude de Pagamentos</h3>
              <p className="text-xs text-neutral-400">Score de 0 a 100 com fundamentação detalhada dos sinais detectados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {snapshot?.antifraudePagamentos.map((av) => {
              const isCritico = av.classificacaoRisco === 'CRITICO';
              const isElevado = av.classificacaoRisco === 'ELEVADO';
              return (
                <div
                  key={av.id}
                  className={`p-4 rounded-lg border text-xs ${
                    isCritico
                      ? 'bg-rose-950/20 border-rose-800/70'
                      : isElevado
                      ? 'bg-amber-950/20 border-amber-800/70'
                      : 'bg-neutral-900/80 border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{av.pedidoId}</span>
                      <span className="text-neutral-400 font-medium">
                        R$ {(av.valorCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-mono text-neutral-400">({av.metodo})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">Score:</span>
                      <span
                        className={`font-bold font-mono text-sm px-2 py-0.5 rounded ${
                          isCritico
                            ? 'bg-rose-900/80 text-rose-200'
                            : isElevado
                            ? 'bg-amber-900/80 text-amber-200'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {av.scoreRisco}/100
                      </span>
                      <span
                        className={`font-bold text-[11px] px-2 py-0.5 rounded border ${
                          av.decisao === 'BLOQUEAR'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : av.decisao === 'RETER_ANALISE'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {av.decisao}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="font-semibold text-neutral-300 mb-1">Explicação da Decisão:</div>
                    <p className="text-neutral-300 italic">{av.explicacaoDecisao}</p>
                  </div>

                  <div className="mt-3">
                    <div className="font-semibold text-neutral-400 mb-1">Sinais Comportamentais Analisados:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-400">
                      {av.sinais.map((s, idx) => (
                        <li key={idx} className="text-neutral-300">{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                    <div>
                      Cliente: {av.clienteDocumento || 'Anônimo'} • {av.clienteEmail || 'Sem e-mail'}
                    </div>
                    <div>{av.createdAt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 6: ANTIFRAUDE DE INGRESSOS & PORTARIA */}
      {/* ==================================================================== */}
      {abaAtiva === 'ingressos' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-500" />
              Proteção de Portaria & Rastreabilidade de Ingressos Duplicados
            </h3>
            <p className="text-xs text-neutral-300">
              Scans duplicados não sobrescrevem a leitura original; todas as tentativas físicas ou digitais ficam registradas com horário, operador e leitor.
            </p>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Ingresso / QR</th>
                  <th className="py-2.5 px-4">Resultado da Validação</th>
                  <th className="py-2.5 px-4">Portão / Coletor</th>
                  <th className="py-2.5 px-4">Primeira Leitura Válida</th>
                  <th className="py-2.5 px-4">Horário da Tentativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {snapshot?.tentativasDuplicadasIngressos.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-white">{t.ingressoId}</div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-xs">{t.codigoQr}</div>
                    </td>
                    <td className="py-3 px-4">
                      {t.resultado === 'DUPLICADO_JA_UTILIZADO' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          DUPLICADO BARRADO
                        </span>
                      ) : t.resultado === 'CANCELADO' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-950 text-orange-300 border border-orange-800">
                          INGRESSO CANCELADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          ACESSO LIBERADO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>{t.portao}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{t.dispositivoIdentificador}</div>
                    </td>
                    <td className="py-3 px-4">
                      {t.primeiraValidacaoEm ? (
                        <div className="text-amber-400 font-medium">
                          {t.primeiraValidacaoEm}
                          <div className="text-[10px] text-neutral-400">{t.primeiroPortao}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{t.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 7: RISCOS E ANOMALIAS */}
      {/* ==================================================================== */}
      {abaAtiva === 'riscos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                Burst de Velocidade de Compra (Bot Monitor)
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Monitoramento em tempo real de requisições de compra superiores a 5 tentativas/min por mesmo fingerprint.
              </p>
              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs">
                <div className="flex justify-between items-center text-rose-400 font-bold">
                  <span>FP-BROWSER-8910</span>
                  <span>14 req/min</span>
                </div>
                <div className="text-neutral-400 mt-1">Ação executada: Dispositivo e IP adicionados à lista de bloqueio.</div>
              </div>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                Salto Geográfico Impossível (Velocity Check)
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Detecção de logins sucessivos com distância física incompatível com a janela de tempo transcorrida.
              </p>
              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs">
                <div className="flex justify-between items-center text-amber-400 font-bold">
                  <span>Juliana Siqueira (Opus)</span>
                  <span>Curitiba → Frankfurt (12m)</span>
                </div>
                <div className="text-neutral-400 mt-1">Ação executada: Sessão marcada como suspeita e notificação enviada.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 8: APIS E INTEGRAÇÕES */}
      {/* ==================================================================== */}
      {abaAtiva === 'apis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Credenciais de Parceiros e APIs Externas</h3>
              <p className="text-xs text-neutral-400">
                Segredos mascarados (••••4F92) com rate limiting rígido (ex: 300 req/min) e whitelist de IPs.
              </p>
            </div>
            <button
              onClick={() => setModalNovaCredencial(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Chave de API
            </button>
          </div>

          {chaveRecemCriada && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500 rounded-lg space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Chave Secreta Gerada (Visível Apenas Uma Vez):
              </div>
              <div className="font-mono text-sm bg-neutral-950 p-2.5 rounded border border-emerald-900 text-emerald-400 select-all break-all">
                {chaveRecemCriada}
              </div>
              <p className="text-[11px] text-neutral-400">
                Copie e guarde em cofre seguro. Por razões criptográficas ela não poderá ser recuperada posteriormente.
              </p>
            </div>
          )}

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Parceiro / Integração</th>
                  <th className="py-2.5 px-4">Chave Mascarada</th>
                  <th className="py-2.5 px-4">Escopos Concedidos</th>
                  <th className="py-2.5 px-4">Limite (Req/Min)</th>
                  <th className="py-2.5 px-4">IPs Homologados</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {snapshot?.credenciaisParceiros.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{c.parceiroNome}</div>
                      <div className="text-[11px] text-neutral-400">{c.nome}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.chaveMascarada}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.escopos.map((esc, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                            {esc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{c.limiteRequisicoesMinuto} req/min</td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {c.ipWhitelist.length > 0 ? c.ipWhitelist.join(', ') : 'Qualquer IP'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        ATIVO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 9: INVESTIGAÇÕES & GRAFO DE RELAÇÕES */}
      {/* ==================================================================== */}
      {abaAtiva === 'investigacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Casos de Investigação de Fraude</h3>
            <span className="text-xs text-neutral-400">Total: {snapshot?.investigacoes.length || 0} casos</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de Casos */}
            <div className="space-y-2 lg:col-span-1">
              {snapshot?.investigacoes.map((inv) => {
                const ativo = inv.id === investigacaoAtivaId;
                return (
                  <button
                    key={inv.id}
                    onClick={() => setInvestigacaoAtivaId(inv.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      ativo
                        ? 'bg-neutral-800 border-amber-500 shadow-md'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-400">{inv.codigo}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300">
                        {inv.severidade}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 line-clamp-2">{inv.titulo}</div>
                    <div className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
                      <span>Status: {inv.status}</span>
                      <span>{inv.createdAt.slice(0, 10)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visualizador de Caso & Grafo de Relações */}
            <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800 rounded-lg p-5 space-y-4">
              {casoSelecionado ? (
                <>
                  <div className="border-b border-neutral-800 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-lg text-amber-400">{casoSelecionado.codigo}</span>
                      <span className="text-xs text-neutral-400">Analista: {casoSelecionado.analistaNome || 'N/D'}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{casoSelecionado.titulo}</h4>
                    <p className="text-xs text-neutral-300 mt-2 bg-neutral-950 p-2.5 rounded border border-neutral-800">
                      <strong>Conclusão Técnica:</strong> {casoSelecionado.conclusao}
                    </p>
                  </div>

                  {/* Entidades Vinculadas */}
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Entidades Identificadas no Dossiê
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {casoSelecionado.entidadesVinculadas.map((e, idx) => (
                        <div key={idx} className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-xs">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">{e.tipo}</span>
                          <div className="font-semibold text-white mt-0.5 truncate">{e.nome}</div>
                          <div className="text-[10px] text-neutral-400 font-mono truncate">{e.id}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grafo de Relações Encontradas */}
                  <div>
                    <h5 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Relações Encontradas (Grafo de Evidências)
                    </h5>
                    <div className="space-y-2 bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs font-mono">
                      {casoSelecionado.relacoes.map((rel, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-neutral-300">
                          <span className="font-bold text-cyan-400">{rel.de}</span>
                          <span className="text-amber-500 font-sans text-xs">──[{rel.rotulo}]──►</span>
                          <span className="font-bold text-emerald-400">{rel.para}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-neutral-500 italic">Nenhum caso selecionado.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 10: BLOQUEIOS */}
      {/* ==================================================================== */}
      {abaAtiva === 'bloqueios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bloqueios de Segurança Ativos e Histórico</h3>
            <button
              onClick={() => setModalNovoBloqueio(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Bloqueio
            </button>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Alvo / Tipo</th>
                  <th className="py-2.5 px-4">Motivo do Bloqueio</th>
                  <th className="py-2.5 px-4">Evidências Vinculadas</th>
                  <th className="py-2.5 px-4">Aplicado Por</th>
                  <th className="py-2.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {snapshot?.bloqueios.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-mono">{b.alvoIdentificador}</div>
                      <div className="text-[11px] text-amber-400 font-semibold">{b.tipo}</div>
                      {b.alvoDescricao && <div className="text-[11px] text-neutral-500">{b.alvoDescricao}</div>}
                    </td>
                    <td className="py-3 px-4 text-neutral-200">{b.motivo}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.evidencias.map((ev, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      <div>{b.bloqueadoPor}</div>
                      <div className="text-[10px] text-neutral-500">{b.createdAt.slice(0, 10)}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.ativo ? (
                        <button
                          onClick={() => revogarBloqueio(b.id)}
                          className="px-2.5 py-1 text-xs text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 rounded transition font-medium"
                        >
                          Desbloquear
                        </button>
                      ) : (
                        <span className="text-neutral-500 italic">Revogado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 11: POLÍTICAS DE SEGURANÇA */}
      {/* ==================================================================== */}
      {abaAtiva === 'politicas' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-white">Parâmetros Globais de Proteção da Plataforma</h3>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Quarentena Bancária de 24h para Grandes Repasses</div>
                  <div className="text-neutral-400 mt-0.5">
                    Retém preventivamente aprovações de repasse acima de R$ 100.000 após alteração de conta bancária do produtor.
                  </div>
                </div>
                <span className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ATIVADA (24h)
                </span>
              </div>

              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">MFA Obrigatório para Operações Nível 3 e Nível 4</div>
                  <div className="text-neutral-400 mt-0.5">
                    Exige reautenticação imediata (Step-up) para estornos em lote, criação de perfis admin e liquidações financeiras.
                  </div>
                </div>
                <span className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  OBRIGATÓRIO
                </span>
              </div>

              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Rate Limit Padrão de APIs de Parceiros</div>
                  <div className="text-neutral-400 mt-0.5">
                    Limita a 300 requisições por minuto por chave homologada, rejeitando automaticamente tentativas de scraping.
                  </div>
                </div>
                <span className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  300 REQ/MIN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 12: AUDITORIA DE SEGURANÇA */}
      {/* ==================================================================== */}
      {abaAtiva === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Trilha de Auditoria Imutável de Segurança</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Todos os eventos de segurança, reautenticações, bloqueios e quebras de quarentena geram registros com integridade criptográfica.
            </p>

            <div className="divide-y divide-neutral-800 text-xs font-mono">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">[STEP_UP_MFA_SUCESSO]</span> Usuário usr-fin-diretor revalidou credencial TOTP para repasse #4500.
                </div>
                <span className="text-neutral-500 font-sans">há 4 horas</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-bold">[QUARENTENA_FINANCEIRA_ACIONADA]</span> Repasse de R$ 150.000 retido por 24h devido a alteração bancária.
                </div>
                <span className="text-neutral-500 font-sans">há 5 horas</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-rose-400 font-bold">[BLOQUEIO_SEGURANCA_APLICADO]</span> Fingerprint FP-BROWSER-8910 bloqueado por carding bot.
                </div>
                <span className="text-neutral-500 font-sans">há 6 horas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: NOVO BLOQUEIO */}
      {/* ==================================================================== */}
      {modalNovoBloqueio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                Aplicar Bloqueio de Segurança
              </h3>
              <button onClick={() => setModalNovoBloqueio(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={salvarNovoBloqueio} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Tipo de Alvo</label>
                <select
                  value={novoBloqueioTipo}
                  onChange={(e) => setNovoBloqueioTipo(e.target.value as TipoBloqueio)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                >
                  <option value="DISPOSITIVO">Dispositivo / Fingerprint</option>
                  <option value="USUARIO">Usuário</option>
                  <option value="INGRESSO">Ingresso / QR Code</option>
                  <option value="CREDENCIAL_API">Credencial de API</option>
                  <option value="CUPOM">Cupom de Desconto</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Identificador do Alvo</label>
                <input
                  type="text"
                  value={novoBloqueioAlvo}
                  onChange={(e) => setNovoBloqueioAlvo(e.target.value)}
                  placeholder="Ex: FP-BROWSER-9988 ou ing-pista-12"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Motivo do Bloqueio</label>
                <textarea
                  value={novoBloqueioMotivo}
                  onChange={(e) => setNovoBloqueioMotivo(e.target.value)}
                  placeholder="Descreva o comportamento anômalo ou evidência de fraude..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalNovoBloqueio(false)}
                  className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium"
                >
                  Aplicar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: NOVA CREDENCIAL PARCEIRO */}
      {/* ==================================================================== */}
      {modalNovaCredencial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                Gerar Chave de API de Parceiro
              </h3>
              <button onClick={() => setModalNovaCredencial(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={salvarNovaCredencial} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Nome do Parceiro</label>
                <input
                  type="text"
                  value={novaCredencialParceiro}
                  onChange={(e) => setNovaCredencialParceiro(e.target.value)}
                  placeholder="Ex: Agência Curitiba Turismo"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Finalidade da Integração</label>
                <input
                  type="text"
                  value={novaCredencialNome}
                  onChange={(e) => setNovaCredencialNome(e.target.value)}
                  placeholder="Ex: Consulta de Lotes e Emissão de Reservas"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-neutral-400">
                Rate Limit padrão: <strong>300 req/min</strong>. A chave bruta será exibida uma única vez após criação.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalNovaCredencial(false)}
                  className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium"
                >
                  Gerar Credencial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ACESSO TEMPORÁRIO (JIT) */}
      {/* ==================================================================== */}
      {modalJit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                Conceder Permissão Temporária (JIT / Break-Glass)
              </h3>
              <button onClick={() => setModalJit(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={concederAcessoJit} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Usuário Beneficiário</label>
                <select
                  value={jitUsuarioId}
                  onChange={(e) => setJitUsuarioId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                >
                  <option value="usr-op-catraca">Rodrigo Alves (Supervisor Portaria)</option>
                  <option value="usr-prod-livenation">Carlos Eduardo (Live Nation)</option>
                  <option value="usr-fin-analista">Lucas Mendes (Analista Financeiro)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Permissão a Conceder</label>
                <select
                  value={jitPermissao}
                  onChange={(e) => setJitPermissao(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white font-mono"
                >
                  <option value="eventos:write">eventos:write (Criar e editar eventos)</option>
                  <option value="financeiro:solicitar_repasse">financeiro:solicitar_repasse (Antecipação)</option>
                  <option value="portaria:validar_ingresso">portaria:validar_ingresso (Catraca)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Duração do Acesso (Horas)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={jitHoras}
                  onChange={(e) => setJitHoras(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Justificativa Operacional Obrigatória</label>
                <textarea
                  value={jitMotivo}
                  onChange={(e) => setJitMotivo(e.target.value)}
                  placeholder="Ex: Apoio extraordinário na portaria VIP devido a alta demanda de credenciamento..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white h-16"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalJit(false)}
                  className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium"
                >
                  Conceder Permissão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
