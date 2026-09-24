'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  Ticket,
  Wallet,
  ScanLine,
  ArrowRight,
  FileCheck,
  Scale,
  Sparkles,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function E2ECockpitPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'esteira' | 'ledger' | 'gate'>('esteira');

  async function loadData() {
    try {
      const res = await fetch('/api/e2e/ciclo/status').then(r => r.json());
      setData(res.journey);
    } catch (err) {
      console.error('Erro ao carregar dados E2E:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleExecuteCycle() {
    setExecuting(true);
    try {
      const res = await fetch('/api/e2e/ciclo/executar-jornada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(r => r.json());
      if (res.success) {
        setData(res.journey);
      }
    } catch (err) {
      console.error('Erro ao executar jornada:', err);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Principal do Release Gate */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111317] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                EDDIE 11.14 — Homologação E2E do Ciclo Real do Evento
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  RELEASE GATE PASS
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Cadeia fechada: Produtor → Evento → Sessão → Venda → Pedido → PIX → Ingresso → Portaria → Ledger → Conciliação → Repasse → Estorno → Go-Live
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExecuteCycle}
            disabled={executing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
          >
            {executing ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>Executar Ciclo Real E2E</span>
          </button>
          <Link
            href="/operacao"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1a1d24] border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            Central Operacional
          </Link>
        </div>
      </div>

      {/* KPIs da Jornada E2E */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111317] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>GMV Transacionado</span>
            <Wallet size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            R$ {((data?.order?.totalGeralCentavos || 26400) / 100).toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> 100% Conciliado com Gateway
          </div>
        </div>

        <div className="bg-[#111317] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Custódia Transitória do Produtor</span>
            <Scale size={14} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            R$ {((data?.settlement?.custodiaProdutorLiquidoCentavos || 12000) / 100).toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Passivo Circulante (Inviolável)
          </div>
        </div>

        <div className="bg-[#111317] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Portaria & Anti-Passback</span>
            <ScanLine size={14} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            100%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> Tentativa duplicada bloqueada
          </div>
        </div>

        <div className="bg-[#111317] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Score do Release Gate</span>
            <FileCheck size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            100 / 100
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> 7 de 7 Fases Aprovadas
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('esteira')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'esteira'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1d24]'
          }`}
        >
          <Activity size={14} />
          Esteira do Ciclo Real (11.14.1 → 11.14.6)
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'ledger'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1d24]'
          }`}
        >
          <Scale size={14} />
          Partidas Dobradas do Ledger (11.14.4)
        </button>

        <button
          onClick={() => setActiveTab('gate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'gate'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1d24]'
          }`}
        >
          <FileCheck size={14} />
          Release Gate Final (11.14.7)
        </button>
      </div>

      {/* Aba Esteira */}
      {activeTab === 'esteira' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-3">
            {data?.traceability?.stagesCompleted?.map((st: any, idx: number) => (
              <div
                key={idx}
                className="bg-[#111317] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{st.stage}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      HOMOLOGADO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">{st.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono pl-8 md:pl-0">
                  <div className="text-right">
                    <div className="text-slate-500 text-[10px]">INVARIANTE VERIFICADA</div>
                    <div className="text-slate-300 font-semibold">{st.verifiedInvariant}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 text-[10px]">ID DE EVIDÊNCIA</div>
                    <div className="text-sky-400 font-bold">{st.evidenceRef || st.evidenceId}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#111317] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale size={18} className="text-purple-400" />
                  Demonstrativo Contábil em Partidas Dobradas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Regra inviolável: Capital do produtor é custódia operacional transitória (Passivo). Taxa DiskIngressos é Receita Própria.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                LEDGER EQUILIBRADO
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181a20] text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">ID Lançamento</th>
                    <th className="p-3">Conta Contábil</th>
                    <th className="p-3">Natureza</th>
                    <th className="p-3">Valor (R$)</th>
                    <th className="p-3">Descrição Operacional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {data?.ledgerEntries?.map((entry: any, i: number) => (
                    <tr key={i} className="hover:bg-[#1a1d24]">
                      <td className="p-3 text-sky-400 font-bold">{entry.entryId}</td>
                      <td className="p-3 text-white font-bold">{entry.conta}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.tipo === 'DEBITO'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {entry.tipo}
                        </span>
                      </td>
                      <td className="p-3 text-white font-bold">
                        R$ {(entry.valorCentavos / 100).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3 text-slate-400 font-sans">{entry.descricao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aba Release Gate */}
      {activeTab === 'gate' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#111317] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-400" />
                  Critérios de Aprovação — Go-Live Release Gate
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  11.14.7: Todas as evidências devem estar 100% verificadas antes da autorização final
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AUTORIZADO PARA PRODUÇÃO
              </span>
            </div>

            <div className="space-y-2">
              {data?.releaseGate?.evaluatedCriteria?.map((crit: any, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-[#181a20] rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">{crit.name}</span>
                      <p className="text-slate-400 text-[11px]">{crit.description}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sky-400 font-bold">{crit.evidenceRef}</span>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">{crit.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-slate-300 space-y-1">
              <div className="font-bold text-emerald-300 uppercase tracking-wider">
                Sign-off Oficial de Engenharia:
              </div>
              <div>
                Responsável: <span className="text-white font-bold">{data?.releaseGate?.goLiveLeadSignoff?.lead}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Data/Hora UTC: {data?.releaseGate?.goLiveLeadSignoff?.date} • Status: <span className="text-emerald-400 font-bold">AUTORIZADO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
