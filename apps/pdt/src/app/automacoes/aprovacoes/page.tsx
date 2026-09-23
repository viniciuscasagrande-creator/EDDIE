'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  DollarSign,
  Lock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';

export default function FilaAprovacoesPage() {
  const [loading, setLoading] = useState(true);
  const [aprovacoes, setAprovacoes] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('PENDENTE');
  const [justificativas, setJustificativas] = useState<Record<string, string>>({});
  const [processando, setProcessando] = useState<string | null>(null);

  const carregarAprovacoes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/automacoes/aprovacoes?status=${filtroStatus}`);
      if (res.ok) {
        const d = await res.json();
        setAprovacoes(d.aprovacoes || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAprovacoes();
  }, [filtroStatus]);

  const processarDecisao = async (id: string, decisao: 'APROVAR' | 'REJEITAR') => {
    setProcessando(id);
    try {
      const res = await fetch('/api/automacoes/aprovacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          decisao,
          justificativa: justificativas[id] || '',
        }),
      });
      if (res.ok) {
        carregarAprovacoes();
      }
    } catch {} finally {
      setProcessando(null);
    }
  };

  const formatBRL = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lock size={15} />
            <span>Alçada & Segurança Operacional (Human-in-the-Loop)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Fila de Aprovações Pendentes
          </h1>
          <p className="text-xs text-slate-400">
            Ações financeiras e operacionais de alto impacto exigem autorização expressa do gestor antes da execução.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={carregarAprovacoes}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar Fila</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <AutomacoesNav pendentesCount={aprovacoes.filter((a) => a.status === 'PENDENTE').length} />

      {/* Alerta de Diretriz de Segurança */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4 flex items-start gap-3 text-xs text-sky-200">
        <ShieldCheck size={18} className="text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Regra de Segurança Inviolável:</span> Repasses financeiros,
          estornos em lote, bloqueios de setor e contingências de gateway são protegidos por alçada.
          Nenhuma transação financeira é executada pelo motor de regras sem validação e registro de auditoria.
        </div>
      </div>

      {/* Filtro de Status */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400">Visualizar:</span>
        {['PENDENTE', 'APROVADO', 'REJEITADO', 'TODOS'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filtroStatus === s
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#1a1c22] text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {aprovacoes.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#16181d] p-12 text-center text-slate-400 text-xs">
            Nenhuma solicitação encontrada neste status.
          </div>
        ) : (
          aprovacoes.map((item) => {
            const isPendente = item.status === 'PENDENTE';
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-5 shadow-lg space-y-4 transition ${
                  isPendente
                    ? 'border-amber-500/40 bg-[#191b21]'
                    : 'border-slate-800 bg-[#14161a] opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.severidade === 'CRITICA'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.severidade}
                    </span>
                    <h3 className="font-bold text-white text-base">{item.titulo}</h3>
                  </div>

                  <span className="font-mono text-xs text-slate-400">
                    ID: {item.id} · {new Date(item.criadoEm).toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="text-slate-300 leading-relaxed">{item.descricao}</p>
                    <div className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Regra de Origem:</span>{' '}
                      {item.regraOrigem}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Solicitante:</span>{' '}
                      {item.solicitante}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#14151a] p-3 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Impacto Operacional & Financeiro
                      </div>
                      <div className="text-amber-300 font-semibold mt-1">{item.impacto}</div>
                      {item.impactoFinanceiroCents && (
                        <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                          {formatBRL(item.impactoFinanceiroCents)}
                        </div>
                      )}
                    </div>

                    {!isPendente && (
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span>Decidido por: <b>{item.decididoPor}</b></span>
                        {item.justificativa && <p className="italic mt-0.5">"{item.justificativa}"</p>}
                      </div>
                    )}
                  </div>
                </div>

                {isPendente && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Justificativa da decisão (opcional)..."
                      value={justificativas[item.id] || ''}
                      onChange={(e) =>
                        setJustificativas({ ...justificativas, [item.id]: e.target.value })
                      }
                      className="rounded-lg border border-slate-700 bg-[#121418] px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500 flex-1 max-w-md"
                    />

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => processarDecisao(item.id, 'REJEITAR')}
                        disabled={processando === item.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        <span>Rejeitar</span>
                      </button>

                      <button
                        onClick={() => processarDecisao(item.id, 'APROVAR')}
                        disabled={processando === item.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-900/30 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        <span>Aprovar Ação</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
