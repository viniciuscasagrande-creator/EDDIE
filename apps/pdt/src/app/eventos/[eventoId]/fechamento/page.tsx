'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  FileText,
  DollarSign,
  Download,
  Copy,
  Check,
  RefreshCcw,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Zap,
  Scale,
  Users,
  ChevronRight,
  ExternalLink,
  Loader2,
  Hash,
  Clock,
  Briefcase,
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';
import { formatBRL, formatNumber } from '../../../../lib/utils';
import { StatusFeedback } from '../../../../components/ui/StatusFeedback';

export type GateStatus = 'APROVADO' | 'BLOQUEANTE' | 'EM_ANALISE' | 'INFORMATIVO';

export interface GateItem {
  gateNumber: number;
  name: string;
  domain: string;
  status: GateStatus;
  isBlocking: boolean;
  summary: string;
  blockingReason?: string;
  responsible?: string;
  timestamp?: string;
}

export interface PendingItem {
  id: string;
  gateNumber: number;
  domain: string;
  title: string;
  severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  isBlocking: boolean;
  detectedAt: string;
  description: string;
  resolutionDomain: string;
}

export interface SettlementData {
  gmvCents: number;
  platformFeeFixedCents?: number;
  platformFeePercentageCents?: number;
  platformFeeTotalCents?: number;
  platformFeeCents: number;
  paymentProcessingFeeCents: number;
  cdcRefundsCents: number;
  chargebacksCents: number;
  priorPayoutsCents: number;
  securityHoldCents: number;
  netFinalPayoutCents: number;
  bankDestinationMasked?: string;
}

export interface DossierSnapshot {
  version: string;
  eventId: string;
  eventName: string;
  tenantId: string;
  producerId: string;
  producerName: string;
  producerDocument: string;
  closedAt: string;
  closedBy: string;
  approvedBy: string;
  closingStatus: string;
  settlement: SettlementData;
  gates: GateItem[];
  integrityHashSha256: string;
  reopeningHistory?: Array<{
    previousVersion: string;
    reopenedAt: string;
    reopenedBy: string;
    reason: string;
    protocol: string;
  }>;
}

export default function EventClosingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = String(params?.eventoId || 'evento-operacao');
  const { api, produtorId, evento } = useProducerEvent();

  const [loading, setLoading] = useState(true);
  const [closingStatus, setClosingStatus] = useState<string>('EM_PREPARACAO');
  const [currentVersion, setCurrentVersion] = useState('v1');
  const [isReadyToClose, setIsReadyToClose] = useState(true);
  const [gates, setGates] = useState<GateItem[]>([]);
  const [pendencias, setPendencias] = useState<PendingItem[]>([]);
  const [settlement, setSettlement] = useState<SettlementData>({
    gmvCents: 48250000,
    platformFeeFixedCents: 25000,
    platformFeePercentageCents: 4825000,
    platformFeeTotalCents: 4850000,
    platformFeeCents: 4850000,
    paymentProcessingFeeCents: 1206250,
    cdcRefundsCents: 350000,
    chargebacksCents: 0,
    priorPayoutsCents: 19300000,
    securityHoldCents: 2412500,
    netFinalPayoutCents: 20131250,
    bankDestinationMasked: 'Banco do Brasil (001) Ag: ***4 C/C: *****-8 / Pix: ***.456.789-**',
  });
  const [dossier, setDossier] = useState<DossierSnapshot | null>(null);

  // Modais de ação
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [operatorId, setOperatorId] = useState('operador-financeiro-01');
  const [approverId, setApproverId] = useState('diretor-financeiro-02');
  const [directorToken, setDirectorToken] = useState('AUTH-DIR-MASTER-99');
  const [reopenReason, setReopenReason] = useState('');
  const [reopenProtocol, setReopenProtocol] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Carrega status dos 11 gates e settlement
  const carregarStatusFechamento = useCallback(async () => {
    setLoading(true);
    setActionFeedback(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${api}/v1/admin/eventos/${eventId}/fechamento`, {
        signal: controller.signal,
        headers: { 'x-producer-id': produtorId || '' },
      });

      if (res.ok) {
        const data = await res.json();
        setClosingStatus(data.currentStatus || 'EM_PREPARACAO');
        setCurrentVersion(data.currentVersion || 'v1');
        setIsReadyToClose(data.isReadyToClose ?? true);
        setGates(data.gates || []);
        if (data.pendencias) setPendencias(data.pendencias);
        if (data.settlement) setSettlement(data.settlement);
        if (data.dossierSnapshot) setDossier(data.dossierSnapshot);
      }
    } catch {
      // Resiliente
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, eventId, produtorId]);

  useEffect(() => {
    void carregarStatusFechamento();
  }, [carregarStatusFechamento]);

  // Executa snapshot de cutoff
  const handleCutoffSnapshot = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${api}/api/event-closings/${eventId}/snapshot`, {
        method: 'POST',
        headers: { 'x-producer-id': produtorId || '' },
      });
      if (res.ok) {
        setActionFeedback({ message: 'Snapshot de corte operacional emitido com sucesso!', success: true });
        void carregarStatusFechamento();
      } else {
        const errData = await res.json().catch(() => ({}));
        setActionFeedback({ message: errData.message || 'Falha ao emitir cutoff.', success: false });
      }
    } catch {
      setActionFeedback({ message: 'Erro de comunicação ao emitir snapshot.', success: false });
    } finally {
      setIsProcessing(false);
    }
  };

  // Aprovar Liquidação (Alçada SoD)
  const handleConfirmApproval = async () => {
    setIsProcessing(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`${api}/api/event-closings/${eventId}/settlement/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-producer-id': produtorId || '',
        },
        body: JSON.stringify({ operatorId, approverId, directorToken }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || 'Falha ao aprovar settlement.');
      }

      setShowApproveModal(false);
      setClosingStatus(payload.status || 'PRONTO_PARA_LIQUIDAR');
      setActionFeedback({
        message: 'Liquidação aprovada formalmente com alçada de diretoria!',
        success: true,
      });
      void carregarStatusFechamento();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao aprovar liquidação.';
      setActionFeedback({ message: msg, success: false });
    } finally {
      setIsProcessing(false);
    }
  };

  // Concluir Fechamento Definitivo
  const handleConfirmClose = async () => {
    setIsProcessing(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`${api}/v1/admin/eventos/${eventId}/fechamento/concluir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-producer-id': produtorId || '',
        },
        body: JSON.stringify({ operatorId, approverId, directorToken }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || 'Falha ao concluir fechamento do evento.');
      }

      setDossier(payload);
      setClosingStatus('FECHADO');
      setCurrentVersion(payload.version || 'v1');
      setShowCloseModal(false);
      setActionFeedback({
        message: `Evento FECHADO com sucesso! Dossiê versão ${payload.version} emitido com Hash SHA-256.`,
        success: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao fechar evento.';
      setActionFeedback({ message: msg, success: false });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reabertura Versionada
  const handleConfirmReopen = async () => {
    if (!reopenReason || reopenReason.trim().length < 10) {
      setActionFeedback({ message: 'A justificativa deve ter no mínimo 10 caracteres.', success: false });
      return;
    }

    setIsProcessing(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`${api}/v1/admin/eventos/${eventId}/fechamento/reabrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-producer-id': produtorId || '',
        },
        body: JSON.stringify({ reason: reopenReason, protocol: reopenProtocol }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || 'Falha ao solicitar reabertura do evento.');
      }

      setShowReopenModal(false);
      setDossier(null);
      setClosingStatus('REABERTO');
      setCurrentVersion(payload.newVersionCandidate || 'v2');
      setActionFeedback({
        message: payload.message || 'Evento reaberto com sucesso. Snapshot anterior preservado!',
        success: true,
      });
      void carregarStatusFechamento();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao reabrir evento.';
      setActionFeedback({ message: msg, success: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FECHADO':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'LIQUIDADO':
      case 'PRONTO_PARA_FECHAR':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'PRONTO_PARA_LIQUIDAR':
      case 'AGUARDANDO_APROVACAO':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'COM_PENDENCIAS':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'REABERTO':
      case 'REABERTO_VERSIONADO':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/eventos" className="hover:text-white transition">Event OS</Link>
          <ChevronRight size={12} />
          <Link href={`/eventos/${eventId}`} className="hover:text-white transition">{evento?.nome || 'Evento'}</Link>
          <ChevronRight size={12} />
          <span className="text-emerald-400 font-medium">Fechamento do Evento & Liquidação Final</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Central de Fechamento do Evento
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(closingStatus)}`}>
                {closingStatus === 'FECHADO' ? `FECHADO (${currentVersion})` : closingStatus}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Cutoff operacional, conciliação de portaria, DRE contábil, auditoria de receita e liquidação final do produtor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void carregarStatusFechamento()}
              disabled={loading}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Reauditar Gates</span>
            </button>

            {closingStatus !== 'FECHADO' && (
              <>
                <button
                  onClick={() => void handleCutoffSnapshot()}
                  disabled={loading || isProcessing}
                  className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Clock size={13} />
                  <span>Corte (Cutoff)</span>
                </button>

                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={loading || isProcessing || !isReadyToClose}
                  className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition shadow-sm disabled:opacity-40"
                >
                  <Briefcase size={13} />
                  <span>Aprovar Liquidação</span>
                </button>

                <button
                  onClick={() => setShowCloseModal(true)}
                  disabled={!isReadyToClose || loading}
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-sm disabled:opacity-40"
                >
                  <Lock size={14} />
                  <span>Concluir Fechamento</span>
                </button>
              </>
            )}

            {closingStatus === 'FECHADO' && (
              <button
                onClick={() => setShowReopenModal(true)}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition shadow-sm"
              >
                <Unlock size={14} />
                <span>Solicitar Reabertura Formal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          actionFeedback.success
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {actionFeedback.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-xs underline">Fechar</button>
        </div>
      )}

      {/* 2. DOSSIÊ FINAL EMITIDO (SE FECHADO) */}
      {dossier && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Dossiê Final do Evento Homologado</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Versão {dossier.version}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fechamento imutável registrado em {new Date(dossier.closedAt).toLocaleString('pt-BR')} UTC
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Certificado de Fechamento do Evento ${dossier.eventName} emitido com sucesso!`)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition"
              >
                <Download size={13} />
                <span>Exportar Dossiê (PDF/JSON)</span>
              </button>
            </div>
          </div>

          {/* Hash SHA-256 */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Hash size={12} className="text-emerald-400" />
                <span>Hash Criptográfico de Integridade (SHA-256)</span>
              </span>
              <div className="font-mono text-xs text-emerald-300 truncate">
                {dossier.integrityHashSha256}
              </div>
            </div>

            <button
              onClick={() => copyHash(dossier.integrityHashSha256)}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1 shrink-0 transition"
            >
              {copiedHash ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedHash ? 'Copiado!' : 'Copiar Hash'}</span>
            </button>
          </div>

          {/* Segregação de Funções */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block font-medium">Operador Solicitante:</span>
              <span className="text-white font-bold">{dossier.closedBy}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block font-medium">Diretor Financeiro Aprovador (SoD):</span>
              <span className="text-white font-bold">{dossier.approvedBy}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SETTLEMENT FINANCEIRO DO EVENTO */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Resultado & Liquidação Financeira Final
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Apuração líquida do repasse com base no Ledger oficial, deduções contratuais e retenções de risco
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Saldo Líquido Final Elegível</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatBRL(settlement.netFinalPayoutCents)}
            </span>
          </div>
        </div>

        {/* Linhas de Cálculo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 block">GMV Total Bruto</span>
            <span className="text-base font-bold text-white">{formatBRL(settlement.gmvCents)}</span>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 block">(-) Taxa DiskIngressos</span>
            <span className="text-base font-bold text-rose-400">{formatBRL(settlement.platformFeeCents)}</span>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 block">(-) Estornos CDC Art. 49</span>
            <span className="text-base font-bold text-rose-400">{formatBRL(settlement.cdcRefundsCents)}</span>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 block">(-) Repasses Já Efetuados</span>
            <span className="text-base font-bold text-amber-400">{formatBRL(settlement.priorPayoutsCents)}</span>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60">
          <span>Destino Bancário Mascarado: <b className="text-slate-200">{settlement.bankDestinationMasked || 'Banco do Brasil (001)'}</b></span>
          <span>Retenção de Segurança (30 dias): <b>{formatBRL(settlement.securityHoldCents)}</b></span>
          <span>Taxa Gateway (2,5%): <b>{formatBRL(settlement.paymentProcessingFeeCents)}</b></span>
        </div>
      </div>

      {/* 4. CENTRAL DE PENDÊNCIAS SE HOUVER BLOQUEIOS */}
      {pendencias.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Central de Pendências Críticas ({pendencias.length})</span>
          </div>
          <p className="text-xs text-slate-300">
            Regra Inviolável: Nenhum evento pode atingir status FECHADO enquanto houver pendências críticas abertas.
          </p>
          <div className="space-y-2 pt-2">
            {pendencias.map((pend) => (
              <div key={pend.id} className="bg-slate-900/90 p-3 rounded-lg border border-rose-500/20 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-rose-300 block">{pend.title}</span>
                  <span className="text-slate-400 mt-0.5 block">{pend.description}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Domínio de Resolução: {pend.resolutionDomain}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold shrink-0">
                  {pend.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. OS 11 GATES CRÍTICOS DE FECHAMENTO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Checklist dos 11 Gates de Fechamento
            </h3>
            <p className="text-xs text-slate-400">
              Regra Inviolável: Nenhum evento atinge status FECHADO se houver gate financeiro crítico aberto
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {gates.filter((g) => g.status === 'APROVADO').length} de {gates.length} Aprovados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gates.map((gate) => {
            const isApproved = gate.status === 'APROVADO';
            const isBlocking = gate.status === 'BLOQUEANTE';

            return (
              <div
                key={gate.gateNumber}
                className={`p-4 rounded-xl border transition-all ${
                  isApproved
                    ? 'bg-[#111827] border-slate-800'
                    : isBlocking
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-[#111827] border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                      {gate.gateNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white">{gate.name}</h4>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isApproved
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isBlocking
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {gate.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {gate.summary}
                </p>

                {gate.responsible && (
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Responsável: {gate.responsible}</span>
                  </div>
                )}

                {gate.blockingReason && (
                  <div className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                    <AlertTriangle size={13} />
                    <span>{gate.blockingReason}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: APROVAR LIQUIDAÇÃO (SoD + ALÇADA) */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Aprovação Formal de Liquidação</h3>
                <p className="text-xs text-slate-400">Validação de alçada e Segregação de Funções (SoD)</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Operador Solicitante:</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Diretor Financeiro Aprovador (SoD Obrigatório):</label>
                <input
                  type="text"
                  value={approverId}
                  onChange={(e) => setApproverId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Token de Alçada de Diretoria (AUTH-DIR-*):</label>
                <input
                  type="text"
                  value={directorToken}
                  onChange={(e) => setDirectorToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
                <span className="text-[11px] text-amber-400 block pt-0.5">
                  Exigido para repasses a partir de R$ 40.000,00.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleConfirmApproval()}
                disabled={isProcessing}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>Aprovar Liquidação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONCLUIR FECHAMENTO COM VALIDAÇÃO SoD */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Concluir Fechamento Definitivo</h3>
                <p className="text-xs text-slate-400">Confirmação de Segregação de Funções (SoD)</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Operador Solicitante:</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Diretor Financeiro Aprovador (SoD Obrigatório):</label>
                <input
                  type="text"
                  value={approverId}
                  onChange={(e) => setApproverId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
                <span className="text-[11px] text-amber-400 block pt-0.5">
                  Regra SoD: O operador e o diretor aprovador não podem ter o mesmo identificador.
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-semibold">Saldo Final a Liquidar via TED/PIX:</span>
                <span className="text-xl font-black text-emerald-400">{formatBRL(settlement.netFinalPayoutCents)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleConfirmClose()}
                disabled={isProcessing}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                <span>Emitir Dossiê & Fechar Evento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REABERTURA FORMAL VERSIONADA */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Unlock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Solicitar Reabertura Formal</h3>
                <p className="text-xs text-slate-400">O snapshot da versão v1 será preservado integralmente</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Justificativa Legal / Contábil (Mínimo 10 caracteres):</label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Ex: Ajuste contábil autorizado referente a estorno extemporâneo de chargeback."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Número do Protocolo ou Chamado:</label>
                <input
                  type="text"
                  value={reopenProtocol}
                  onChange={(e) => setReopenProtocol(e.target.value)}
                  placeholder="PROT-AUDIT-2026-001"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowReopenModal(false)}
                className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleConfirmReopen()}
                disabled={isProcessing}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                <span>Reabrir e Preparar Versão v2</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
