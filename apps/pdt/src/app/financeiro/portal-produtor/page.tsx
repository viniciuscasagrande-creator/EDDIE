'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
  Search,
  Download,
  Filter,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  Eye,
  Plus,
  Lock,
  Percent,
  Receipt,
  FileCheck,
  Ban,
  X,
  CreditCard,
  Send,
  AlertCircle,
  HelpCircle,
  Bell,
  Sparkles,
  Info,
} from 'lucide-react';

export type PortalTab =
  | 'inicio'
  | 'saldos'
  | 'extrato'
  | 'taxas'
  | 'repasses'
  | 'transferencias'
  | 'estornos'
  | 'fluxo'
  | 'dre'
  | 'documentos'
  | 'dados_bancarios'
  | 'solicitacoes';

export interface ProducerHomeSummary {
  producerId: string;
  consolidatedBalance: {
    disponivelCents: number;
    aReceberCents: number;
    reservadoEstornoCents: number;
    emLiquidacaoCents: number;
    bloqueadoCents: number;
    contabilCents: number;
    totalRecebidoAcumuladoCents: number;
  };
  proximoRepasse: {
    dataProgramada: string | null;
    valorEstimadoCents: number;
    status: string | null;
    eventoNome?: string | null;
  } | null;
  metricasOperacionais: {
    totalEventosAtivos: number;
    ingressosVendidosTotal: number;
    totalEstornosCents: number;
    totalChargebacksCents: number;
    taxaEfetivaMediaPercent: number;
  };
  solicitacoesAbertasCount: number;
  pendenciasCadastraisCount: number;
  notificacoesNaoLidasCount: number;
  lastUpdatedAt: string;
}

export interface ProducerEventItem {
  eventId: string;
  nome: string;
  slug: string;
  status: string;
  dataInicio: string;
  local: string;
  ingressosVendidos: number;
  capacidadeTotal: number;
  receitaBrutaCents: number;
  balance: {
    disponivelCents: number;
    retidoCents: number;
    reservadoEstornoCents: number;
    emLiquidacaoCents: number;
    bloqueadoCents: number;
    contabilCents: number;
  };
  taxaContratada: {
    modelo: 'PERCENTUAL' | 'FIXA';
    taxaPercentual?: number;
    taxaFixaCentavos?: number;
    versao: number;
  };
}

export interface StatementEntry {
  id: string;
  data: string;
  eventoId: string;
  eventoNome?: string;
  tipo: 'CREDITO' | 'DEBITO';
  categoria: string;
  descricao: string;
  valorCents: number;
  saldoResultanteCents: number;
  referenciaId: string;
  status: string;
}

export interface SettlementItem {
  id: string;
  eventId: string | null;
  eventoNome?: string;
  valorBrutoBaseCents: number;
  retencoesTaxaCents: number;
  descontosAutorizadosCents: number;
  valorLiquidoCents: number;
  status: string;
  dataProgramada: string;
  dataLiquidacao: string | null;
  destinoBancarioMascarado: string;
  codigoRetornoBancario: string | null;
  temComprovante: boolean;
  comprovanteUrl?: string;
  referencia: string;
}

export interface DreData {
  periodo: string;
  receitaBrutaIngressosCents: number;
  ingressosVendidosTotal: number;
  taxasServicoDiskCents: number;
  taxasProcessamentoGatewayCents: number;
  estornosEChargebacksCents: number;
  repassesLiquidadosCents: number;
  despesasOperacionaisCadastradasCents: number;
  resultadoLiquidoProdutorCents: number;
  disclaimer: string;
}

export interface BankAccountData {
  bancoNome: string;
  bancoCodigo: string;
  agenciaMascarada: string;
  contaMascarada: string;
  tipoConta: string;
  titularNome: string;
  titularCpfCnpjMascarado: string;
  chavePixMascarada: string;
  statusVerificacao: string;
  ultimaAlteracaoEm: string;
  temSolicitacaoEmAndamento: boolean;
}

export interface RequestItem {
  id: string;
  protocolo: string;
  categoria: string;
  titulo: string;
  descricao: string;
  status: string;
  criadoEm: string;
  timeline: Array<{
    data: string;
    autor: string;
    evento: string;
    detalhes?: string;
  }>;
}

export default function ProducerPortalPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>('inicio');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<ProducerHomeSummary | null>(null);
  const [events, setEvents] = useState<ProducerEventItem[]>([]);
  const [statement, setStatement] = useState<StatementEntry[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [dre, setDre] = useState<DreData | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccountData | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);

  // Modais e formulários
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceEvent, setTransferSourceEvent] = useState('');
  const [transferTargetEvent, setTransferTargetEvent] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const [isBankChangeModalOpen, setIsBankChangeModalOpen] = useState(false);
  const [newBankCode, setNewBankCode] = useState('033');
  const [newBankName, setNewBankName] = useState('Banco Santander Brasil S.A.');
  const [newAgency, setNewAgency] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newPixKey, setNewPixKey] = useState('');
  const [bankChangeReason, setBankChangeReason] = useState('');
  const [bankSubmitting, setBankSubmitting] = useState(false);

  const [receiptModalContent, setReceiptModalContent] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const formatCents = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, evRes, stmtRes, setRes, dreRes, bncRes, reqRes] = await Promise.all([
        fetch('/api/producer/finance/summary'),
        fetch('/api/producer/finance/events'),
        fetch('/api/producer/finance/events/evento-operacao/statement'),
        fetch('/api/producer/finance/settlements'),
        fetch('/api/producer/finance/dre'),
        fetch('/api/producer/finance/bank-account'),
        fetch('/api/producer/finance/requests'),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(evData);
        if (evData.length >= 2) {
          setTransferSourceEvent(evData[0].eventId);
          setTransferTargetEvent(evData[1].eventId);
        }
      }
      if (stmtRes.ok) {
        const data = await stmtRes.json();
        setStatement(data.entries || []);
      }
      if (setRes.ok) setSettlements(await setRes.json());
      if (dreRes.ok) setDre(await dreRes.json());
      if (bncRes.ok) setBankAccount(await bncRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } catch (err) {
      console.error('Falha ao carregar dados do portal do produtor:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceEvent || !transferTargetEvent || !transferAmount) return;

    setTransferSubmitting(true);
    try {
      const amountCents = Math.round(parseFloat(transferAmount.replace(',', '.')) * 100);
      const res = await fetch('/api/producer/finance/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceEventId: transferSourceEvent,
          targetEventId: transferTargetEvent,
          amountCents,
          reason: transferReason || 'Transferência entre eventos próprios',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage(`Solicitação de transferência gerada com protocolo ${data.protocolo}! Enviada para aprovação.`);
        setIsTransferModalOpen(false);
        setTransferAmount('');
        setTransferReason('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Erro ao solicitar transferência.');
      }
    } catch {
      alert('Falha na comunicação com o servidor.');
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleBankChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSubmitting(true);
    try {
      const res = await fetch('/api/producer/finance/bank-account/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bancoCodigo: newBankCode,
          bancoNome: newBankName,
          agencia: newAgency,
          conta: newAccount,
          tipoConta: 'CORRENTE',
          titularNome: bankAccount?.titularNome || 'Produtor',
          titularCpfCnpj: '00.000.000/0001-00',
          chavePix: newPixKey,
          justificativa: bankChangeReason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage(`Solicitação cadastral enviada com protocolo ${data.protocolo}! Em análise pelo financeiro.`);
        setIsBankChangeModalOpen(false);
        loadData();
      } else {
        alert('Erro ao enviar solicitação.');
      }
    } catch {
      alert('Falha na requisição.');
    } finally {
      setBankSubmitting(false);
    }
  };

  const handleOpenReceipt = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/producer/finance/settlements/${settlementId}/receipt`);
      if (res.ok) {
        const data = await res.json();
        setReceiptModalContent(data.comprovanteTexto);
      } else {
        alert('Comprovante não disponível no momento.');
      }
    } catch {
      alert('Erro ao buscar comprovante.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  EDDIE 11.23
                </span>
                <span className="text-xs font-mono text-zinc-400">Producer Financial Portal & Self-Service</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Portal Financeiro do Produtor
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transferir entre Eventos
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <Link
              href="/financeiro/control-tower"
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition"
            >
              Visão Interna
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 mt-4 overflow-x-auto border-t border-zinc-800/60 pt-3">
          {[
            { id: 'inicio', label: 'Início & Saldos', icon: Wallet },
            { id: 'saldos', label: 'Meus Eventos', icon: Calendar },
            { id: 'extrato', label: 'Extrato Financeiro', icon: Receipt },
            { id: 'taxas', label: 'Taxas Negociadas', icon: Percent },
            { id: 'repasses', label: 'Agenda & Repasses', icon: Clock },
            { id: 'transferencias', label: 'Transferências', icon: ArrowRightLeft },
            { id: 'estornos', label: 'Estornos & Disputas', icon: AlertTriangle },
            { id: 'fluxo', label: 'Fluxo de Caixa', icon: TrendingUp },
            { id: 'dre', label: 'DRE Gerencial', icon: FileText },
            { id: 'documentos', label: 'Documentos', icon: FileCheck },
            { id: 'dados_bancarios', label: 'Dados Bancários', icon: CreditCard },
            { id: 'solicitacoes', label: 'Central de Chamados', icon: HelpCircle, count: summary?.solicitacoesAbertasCount },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PortalTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500 text-white font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: INÍCIO FINANCEIRO CONSOLIDADO */}
        {activeTab === 'inicio' && summary && (
          <div className="space-y-6">
            {/* Top Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Saldo Disponível</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                    {formatCents(summary.consolidatedBalance.disponivelCents)}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Liberado para repasse ou transferência
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Derivado do Ledger 11.19
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Vendas a Receber (Retido)</span>
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {formatCents(summary.consolidatedBalance.aReceberCents)}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Vendas liquidadas com liberação programada
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Total retido: {formatCents(summary.consolidatedBalance.contabilCents)}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Reserva de Estornos</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-amber-400 tracking-tight">
                    {formatCents(Math.abs(summary.consolidatedBalance.reservadoEstornoCents))}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Fundo de reserva para garantia de estornos
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Proteção patrimonial do produtor
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Próximo Repasse</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold text-indigo-400 tracking-tight">
                    {summary.proximoRepasse ? formatCents(summary.proximoRepasse.valorEstimadoCents) : 'R$ 0,00'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {summary.proximoRepasse?.dataProgramada
                      ? `Previsto para ${new Date(summary.proximoRepasse.dataProgramada).toLocaleDateString('pt-BR')}`
                      : 'Nenhum repasse agendado'}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Status: {summary.proximoRepasse?.status || 'Nenhum'}
                </div>
              </div>
            </div>

            {/* Quick Actions & Events Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">Visão Geral dos Meus Eventos</h3>
                  <button
                    onClick={() => setActiveTab('saldos')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Ver todos os eventos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-zinc-800">
                  {events.map((ev) => (
                    <div key={ev.eventId} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-white">{ev.nome}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {ev.ingressosVendidos.toLocaleString()} ingressos • Taxa Disk:{' '}
                          <span className="font-mono text-indigo-300">
                            {ev.taxaContratada.modelo === 'PERCENTUAL'
                              ? `${ev.taxaContratada.taxaPercentual}%`
                              : `R$ ${(ev.taxaContratada.taxaFixaCentavos! / 100).toFixed(2)} / ingresso`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">
                          {formatCents(ev.balance.disponivelCents)}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Receita: {formatCents(ev.receitaBrutaCents)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Multi-tenant Protection Card */}
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Segurança & Isolamento
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Sua conta opera sob isolamento estrito multi-tenant. Seus dados financeiros,
                    contratos e transações são acessíveis exclusivamente por usuários autorizados da sua produtora.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Produtora Titular:</span>
                    <span className="font-semibold text-zinc-200">{bankAccount?.titularNome || 'Alpha Ltda'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Conta de Repasse:</span>
                    <span className="font-mono text-zinc-300">{bankAccount?.bancoNome}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Chave PIX:</span>
                    <span className="font-mono text-zinc-300">{bankAccount?.chavePixMascarada}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsBankChangeModalOpen(true)}
                  className="w-full py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition"
                >
                  Alterar Domicílio Bancário
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SALDOS POR EVENTO */}
        {activeTab === 'saldos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Saldos Individuais por Evento</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cada evento possui sua própria conta gráfica isolada no Ledger 11.19.
                </p>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Transferir Saldo entre Eventos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div key={ev.eventId} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">
                        {ev.eventId}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{ev.nome}</h3>
                      <div className="text-xs text-zinc-400 mt-1">{ev.local}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {ev.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-zinc-950/60 text-xs">
                    <div>
                      <div className="text-zinc-500 text-[11px]">Disponível para Repasse</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {formatCents(ev.balance.disponivelCents)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px]">Receita Bruta Acumulada</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {formatCents(ev.receitaBrutaCents)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px]">Retido a Liberar</div>
                      <div className="text-xs font-semibold text-zinc-300 mt-0.5">
                        {formatCents(ev.balance.retidoCents)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px]">Taxa Contratada</div>
                      <div className="text-xs font-mono font-semibold text-indigo-300 mt-0.5">
                        {ev.taxaContratada.modelo === 'PERCENTUAL'
                          ? `${ev.taxaContratada.taxaPercentual}% (v${ev.taxaContratada.versao})`
                          : `R$ ${(ev.taxaContratada.taxaFixaCentavos! / 100).toFixed(2)} (v${ev.taxaContratada.versao})`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400">
                      {ev.ingressosVendidos} ingressos vendidos
                    </span>
                    <button
                      onClick={() => setActiveTab('extrato')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Ver extrato do evento <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EXTRATO FINANCEIRO DETALHADO */}
        {activeTab === 'extrato' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Extrato Financeiro do Evento</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Lançamentos contábeis reais originados do Ledger 11.19 com drill-down e auditoria.
                </p>
              </div>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Data/Hora (UTC)</th>
                    <th className="py-2.5 px-3">Descrição do Fato</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Referência</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3 text-right">Saldo Resultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {statement.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/60 transition">
                      <td className="py-2.5 px-3 text-zinc-400">
                        {new Date(item.data).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-zinc-200">{item.descricao}</td>
                      <td className="py-2.5 px-3 text-zinc-400">{item.categoria}</td>
                      <td className="py-2.5 px-3 text-zinc-500">{item.referenciaId}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            item.tipo === 'CREDITO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.tipo}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          item.tipo === 'CREDITO' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.tipo === 'CREDITO' ? '+' : '-'} {formatCents(item.valorCents)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-zinc-300 font-semibold">
                        {formatCents(item.saldoResultanteCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TAXAS NEGOCIADAS */}
        {activeTab === 'taxas' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Condições Comerciais e Taxas por Evento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div key={ev.eventId} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{ev.nome}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Versão {ev.taxaContratada.versao}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-zinc-950/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Modelo Contratado:</span>
                      <span className="font-semibold text-white">{ev.taxaContratada.modelo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Taxa Vigente:</span>
                      <span className="font-mono text-base font-bold text-indigo-400">
                        {ev.taxaContratada.modelo === 'PERCENTUAL'
                          ? `${ev.taxaContratada.taxaPercentual}%`
                          : `R$ ${(ev.taxaContratada.taxaFixaCentavos! / 100).toFixed(2)} por ingresso`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                    <strong>Garantia Histórica Inviolável:</strong> Alterações comerciais futuras geram uma nova versão
                    e nunca modificam retroativamente os snapshots das vendas passadas.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AGENDA & REPASSES */}
        {activeTab === 'repasses' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Agenda de Repasses e Liquidações Bancárias</h2>
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Lote / Referência</th>
                    <th className="py-2.5 px-3">Evento</th>
                    <th className="py-2.5 px-3">Data Programada</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Destino Bancário</th>
                    <th className="py-2.5 px-3 text-right">Líquido a Receber</th>
                    <th className="py-2.5 px-3 text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono">
                  {settlements.map((set) => (
                    <tr key={set.id} className="hover:bg-zinc-900/60">
                      <td className="py-2.5 px-3 text-zinc-200">{set.referencia}</td>
                      <td className="py-2.5 px-3 font-sans text-zinc-300">{set.eventoNome}</td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {new Date(set.dataProgramada).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            set.status === 'PAGO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {set.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 font-sans text-[11px]">
                        {set.destinoBancarioMascarado}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatCents(set.valorLiquidoCents)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {set.temComprovante ? (
                          <button
                            onClick={() => handleOpenReceipt(set.id)}
                            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 ml-auto"
                          >
                            <Download className="w-3 h-3" />
                            Comprovante
                          </button>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">Aguardando</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: FLUXO DE CAIXA */}
        {activeTab === 'fluxo' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-200 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>Segregação Estrita:</strong> O fluxo de caixa separa rigorosamente os valores{' '}
                <strong>Realizados</strong> (efetivamente transitados pelo Ledger e liquidados) dos valores{' '}
                <strong>Projetados</strong> (vendas parceladas a receber e repasses agendados futuros).
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Fluxo Realizado (Efetivado)
                  </h3>
                  <span className="text-xs font-mono font-bold text-white">
                    {formatCents(summary?.consolidatedBalance.totalRecebidoAcumuladoCents || 0)}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="p-3 rounded-lg bg-zinc-950/60 flex justify-between">
                    <span>Repasses Liquidados na Conta</span>
                    <span className="font-bold text-emerald-400">
                      {formatCents(summary?.consolidatedBalance.totalRecebidoAcumuladoCents || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fluxo Projetado (Futuro Estimado)
                  </h3>
                  <span className="text-xs font-mono font-bold text-white">
                    {formatCents(summary?.consolidatedBalance.aReceberCents || 0)}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="p-3 rounded-lg bg-zinc-950/60 flex justify-between">
                    <span>Previsão de Repasse Agendado</span>
                    <span className="font-bold text-sky-400">
                      {formatCents(summary?.proximoRepasse?.valorEstimadoCents || 0)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 flex justify-between">
                    <span>Vendas em Liquidação Gateway (D+30)</span>
                    <span className="font-bold text-zinc-300">
                      {formatCents(summary?.consolidatedBalance.emLiquidacaoCents || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DRE GERENCIAL */}
        {activeTab === 'dre' && dre && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">DRE Gerencial do Produtor</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{dre.disclaimer}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Exportar Relatório DRE
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/40 font-mono text-xs space-y-3">
              <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-300">
                <span>(+) RECEITA BRUTA DE INGRESSOS ({dre.ingressosVendidosTotal.toLocaleString()} ingressos)</span>
                <span className="font-bold text-white">{formatCents(dre.receitaBrutaIngressosCents)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-rose-400">
                <span>(-) Taxa de Serviço DiskIngressos</span>
                <span>- {formatCents(dre.taxasServicoDiskCents)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-rose-400">
                <span>(-) Taxa de Processamento Gateway / Adquirentes</span>
                <span>- {formatCents(dre.taxasProcessamentoGatewayCents)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-rose-400">
                <span>(-) Estornos e Chargebacks Deduzidos</span>
                <span>- {formatCents(dre.estornosEChargebacksCents)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-zinc-400">
                <span>(-) Despesas Operacionais Cadastradas</span>
                <span>- {formatCents(dre.despesasOperacionaisCadastradasCents)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-zinc-700 text-sm font-bold text-emerald-400">
                <span>(=) RESULTADO LÍQUIDO DO PRODUTOR</span>
                <span>{formatCents(dre.resultadoLiquidoProdutorCents)}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: DADOS BANCÁRIOS */}
        {activeTab === 'dados_bancarios' && bankAccount && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-semibold text-zinc-200">Dados Bancários Cadastrados para Repasse</h2>
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs text-zinc-400">Status Cadastral:</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {bankAccount.statusVerificacao}
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Banco:</span>
                  <span className="font-semibold text-white">{bankAccount.bancoNome} ({bankAccount.bancoCodigo})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Agência:</span>
                  <span className="font-mono text-white">{bankAccount.agenciaMascarada}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Conta Corrente:</span>
                  <span className="font-mono text-white">{bankAccount.contaMascarada}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Titular:</span>
                  <span className="font-semibold text-white">{bankAccount.titularNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Chave PIX:</span>
                  <span className="font-mono text-white">{bankAccount.chavePixMascarada}</span>
                </div>
              </div>

              {bankAccount.temSolicitacaoEmAndamento && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
                  Existe uma solicitação de alteração cadastral em análise pela auditoria Disk.
                </div>
              )}

              <button
                onClick={() => setIsBankChangeModalOpen(true)}
                className="w-full mt-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
              >
                Solicitar Atualização de Domicílio Bancário
              </button>
            </div>
          </div>
        )}

        {/* TAB 12: SOLICITAÇÕES & PROTOCOLOS */}
        {activeTab === 'solicitacoes' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Central de Chamados e Protocolos de Autoatendimento</h2>
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">{req.protocolo}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 font-mono">
                        {req.categoria}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {req.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white">{req.titulo}</h3>
                  <p className="text-xs text-zinc-400">{req.descricao}</p>
                  <div className="border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-500">
                    Último evento:{' '}
                    {req.timeline[req.timeline.length - 1]?.evento || 'Solicitação registrada'} (
                    {new Date(req.criadoEm).toLocaleDateString('pt-BR')})
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="p-8 text-center border border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  Nenhum chamado aberto no momento.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: TRANSFERÊNCIA ENTRE EVENTOS PRÓPRIOS */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                Transferir Saldo entre Eventos Próprios
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Evento de Origem (Débito):</label>
                <select
                  value={transferSourceEvent}
                  onChange={(e) => setTransferSourceEvent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                >
                  {events.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.nome} (Disponível: {formatCents(ev.balance.disponivelCents)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Evento de Destino (Crédito):</label>
                <select
                  value={transferTargetEvent}
                  onChange={(e) => setTransferTargetEvent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                >
                  {events
                    .filter((ev) => ev.eventId !== transferSourceEvent)
                    .map((ev) => (
                      <option key={ev.eventId} value={ev.eventId}>
                        {ev.nome} (Disponível: {formatCents(ev.balance.disponivelCents)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Valor a Transferir (R$):</label>
                <input
                  type="text"
                  placeholder="Ex: 5000,00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Motivo / Justificativa:</label>
                <textarea
                  placeholder="Informe o motivo da transferência interna..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  required
                />
              </div>

              <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 text-[11px] text-zinc-400">
                A transferência será submetida ao workflow financeiro 11.20 com protocolo rastreável. Não é permitida
                transferência para eventos de outros produtores.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  {transferSubmitting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPROVANTE BANCÁRIO */}
      {receiptModalContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Comprovante Bancário de Repasse
              </h3>
              <button onClick={() => setReceiptModalContent(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {receiptModalContent}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setReceiptModalContent(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALTERAÇÃO DE DOMICÍLIO BANCÁRIO */}
      {isBankChangeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Solicitar Atualização de Domicílio Bancário
              </h3>
              <button onClick={() => setIsBankChangeModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBankChangeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Banco:</label>
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Agência:</label>
                  <input
                    type="text"
                    value={newAgency}
                    onChange={(e) => setNewAgency(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Conta:</label>
                  <input
                    type="text"
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    placeholder="Ex: 12345-6"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Chave PIX:</label>
                <input
                  type="text"
                  value={newPixKey}
                  onChange={(e) => setNewPixKey(e.target.value)}
                  placeholder="CNPJ ou e-mail"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Justificativa da Alteração:</label>
                <textarea
                  value={bankChangeReason}
                  onChange={(e) => setBankChangeReason(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  required
                />
              </div>

              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-300">
                <strong>Atenção:</strong> Por motivos de segurança patrimonial, lotes de repasse em andamento
                não serão redirecionados até a validação e homologação dos documentos pelo compliance.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBankChangeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={bankSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
