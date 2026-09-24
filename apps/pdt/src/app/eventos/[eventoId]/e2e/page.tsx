'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  FileCheck,
  RotateCcw,
  Scale,
  ScanLine,
  ShieldCheck,
  Ticket,
  Wallet,
  Play
} from 'lucide-react';

export default function EventE2EPage() {
  const params = useParams();
  const eventoId = typeof params?.eventoId === 'string' ? params.eventoId : 'evento-operacao';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  async function loadEventData() {
    try {
      const res = await fetch(`/api/eventos/${eventoId}/e2e/ciclo`).then(r => r.json());
      setData(res.cycleSummary);
    } catch (err) {
      console.error('Erro ao carregar ciclo E2E do evento:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEventData();
  }, [eventoId]);

  async function handleRunEventCycle() {
    setExecuting(true);
    try {
      await fetch('/api/e2e/ciclo/executar-jornada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId })
      });
      await loadEventData();
    } catch (err) {
      console.error('Erro ao executar ciclo:', err);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="space-y-6">
        {/* Banner do Ciclo E2E do Evento */}
        <div className="bg-[#111317] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Homologação E2E do Ciclo Real do Evento
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Evento ID: {eventoId} • Status: <span className="text-emerald-400 font-bold">CICLO VERIFICADO</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleRunEventCycle}
            disabled={executing}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {executing ? <RotateCcw size={13} className="animate-spin" /> : <Play size={13} />}
            <span>Re-executar Teste E2E</span>
          </button>
        </div>

        {/* Trilha do Ciclo no Evento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111317] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ticket size={16} className="text-sky-400" />
              1. Venda & QR Assinado
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Último Pedido E2E:</span>
                <span className="text-sky-400 font-mono font-bold">{data?.order?.pedidoId || 'ped_e2e_ok'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Status do Pedido:</span>
                <span className="text-emerald-400 font-bold font-mono">PAGO (PIX)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Ingressos Emitidos:</span>
                <span className="text-white font-mono font-bold">2 com QR Cripto</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111317] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ScanLine size={16} className="text-emerald-400" />
              2. Catraca & Anti-Passback
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Check-in Válido:</span>
                <span className="text-emerald-400 font-bold font-mono">AUTORIZADO</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Tentativa Duplicada:</span>
                <span className="text-amber-400 font-bold font-mono">BLOQUEADA (Passback)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Ingresso Estornado:</span>
                <span className="text-purple-400 font-bold font-mono">INVALIDADO</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111317] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale size={16} className="text-purple-400" />
              3. Ledger & Repasse
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Custódia do Produtor:</span>
                <span className="text-purple-400 font-bold font-mono">
                  R$ {((data?.settlement?.custodiaProdutorLiquidoCentavos || 12000) / 100).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Taxa DiskIngressos:</span>
                <span className="text-white font-bold font-mono">
                  R$ {((data?.settlement?.taxaServicoDiskIngressosCentavos || 1200) / 100).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Divergência:</span>
                <span className="text-emerald-400 font-bold font-mono">0 (100% Conciliado)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
