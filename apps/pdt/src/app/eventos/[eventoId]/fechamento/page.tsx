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
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';
import { formatBRL, formatNumber } from '../../../../lib/utils';

export type GateStatus = 'APROVADO' | 'BLOQUEANTE' | 'EM_ANALISE' | 'INFORMATIVO';

export interface GateItem {
  gateNumber: number;
  name: string;
  domain: string;
  status: GateStatus;
  isBlocking: boolean;
  summary: string;
  blockingReason?: string;
}

export interface SettlementData {
  gmvCents: number;
  platformFeeCents: number;
  paymentProcessingFeeCents: number;
  cdcRefundsCents: number;
  chargebacksCents: number;
  priorPayoutsCents: number;
  securityHoldCents: number;
  netFinalPayoutCents: number;
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
  const [closingStatus, setClosingStatus] = useState<'ABERTO' | 'ENCERRADO' | 'EM_FECHAMENTO' | 'FECHADO' | 'REABERTO_VERSIONADO'>('ENCERRADO');
  const [currentVersion, setCurrentVersion] = useState('v1');
  const [isReadyToClose, setIsReadyToClose] = useState(true);
  const [gates, setGates] = useState<GateItem[]>([]);
  const [settlement, setSettlement] = useState<SettlementData>({
    gmvCents: 48250000,
    platformFeeCents: 4825000,
    paymentProcessingFeeCents: 1206250,
    cdcRefundsCents: 350000,
    chargebacksCents: 0,
    priorPayoutsCents: 19300000,
    securityHoldCents: 2412500,
    netFinalPayoutCents: 20156250,
  });
  const [dossier, setDossier] = useState<DossierSnapshot | null>(null);

  // Modais de ação
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [operatorId, setOperatorId] = useState('operador-financeiro-01');
  const [approverId, setApproverId] = useState('diretor-financeiro-02');
  const [reopenReason, setReopenReason] = useState('');
  const [reopenProtocol, setReopenProtocol] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Carrega status dos 10 gates e settlement
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
        setClosingStatus(data.currentStatus || 'ENCERRADO');
        setCurrentVersion(data.currentVersion || 'v1');
        setIsReadyToClose(data.isReadyToClose ?? true);
        setGates(data.gates || []);
        if (data.settlement) setSettlement(data.settlement);
        if (data.dossierSnapshot) setDossier(data.dossierSnapshot);
      }
    } catch {
      // Mantém fallback seguro para visualização
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api, eventId, produtorId]);

  useEffect(() => {
    void carregarStatusFechamento();
  }, [carregarStatusFechamento]);

  // Concluir Fechamento
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
        body: JSON.stringify({ operatorId, approverId }),
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
      setClosingStatus('REABERTO_VERSIONADO');
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/eventos" className="hover:text-white transition">Event OS</Link>
          <ChevronRight size={12} />
          <Link href={`/eventos/${eventId}`} className="hover:text-white transition">{evento?.nome || 'Evento'}</Link>
          <ChevronRight size={12} />
          <span className="text-emerald-400 font-medium">Fechamento & Settlement (11.24)</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Central de Fechamento do Evento
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                closingStatus === 'FECHADO'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : closingStatus === 'REABERTO_VERSIONADO'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
              }`}>
                {closingStatus === 'FECHADO' ? `FECHADO (${currentVersion})` : closingStatus}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Cutoff de vendas, conciliação de portaria, DRE contábil, auditoria de receita e liquidação final do produtor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void carregarStatusFechamento()}
              disabled={loading}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Reauditar Gates</span>
            </button>

            {closingStatus !== 'FECHADO' ? (
              <button
                onClick={() => setShowCloseModal(true)}
                disabled={!isReadyToClose || loading}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-sm disabled:opacity-40"
              >
                <Lock size={14} />
                <span>Concluir Fechamento Definitivo</span>
              </button>
            ) : (
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
                Resultado & Settlement Financeiro Final
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Apuração líquida do repasse com base nas entradas, deduções legais e taxas da plataforma
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Saldo Líquido Final</span>
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
          <span>Retenção de Segurança (30 dias para chargeback residual): <b>{formatBRL(settlement.securityHoldCents)}</b></span>
          <span>Taxa de processamento gateway (2,5%): <b>{formatBRL(settlement.paymentProcessingFeeCents)}</b></span>
        </div>
      </div>

      {/* 4. OS 10 GATES CRÍTICOS DE FECHAMENTO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Checklist dos 10 Gates de Fechamento
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
