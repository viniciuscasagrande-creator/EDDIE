'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  RefreshCcw,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';
import { AutomacoesClient, ResumoCaixaTrabalho, PendenciaTrabalhoItem } from '@/lib/automacoes-client';

export default function MinhasPendenciasPage() {
  const [loading, setLoading] = useState(true);
  const [caixa, setCaixa] = useState<ResumoCaixaTrabalho | null>(null);
  const [filtroDepto, setFiltroDepto] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  const carregarCaixa = async () => {
    setLoading(true);
    try {
      const data = await AutomacoesClient.getCaixaTrabalho();
      setCaixa(data);
    } catch (err) {
      console.error('Erro ao carregar pendências:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCaixa();
  }, []);

  const itensFiltrados = (caixa?.itens || []).filter((item) => {
    if (filtroDepto !== 'TODOS' && item.departamento !== filtroDepto) return false;
    if (filtroTipo !== 'TODOS' && item.tipo !== filtroTipo) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Inbox size={15} />
            <span>Caixa de Trabalho Operacional & Filas Departamentais</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Minhas Pendências
          </h1>
          <p className="text-xs text-slate-400">
            Painel unificado de tarefas, aprovações de alçada, divergências da 11.31 e alertas por departamento.
          </p>
        </div>

        <button
          onClick={carregarCaixa}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar Caixa</span>
        </button>
      </div>

      <AutomacoesNav />

      {/* Cards de Métricas da Caixa de Trabalho */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Total Pendente</p>
          <p className="text-xl font-bold text-white mt-1">{caixa?.totalPendentes || 28}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Em todas as filas</p>
        </div>

        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40">
          <p className="text-red-400 font-semibold uppercase text-[10px]">Urgentes</p>
          <p className="text-xl font-bold text-red-400 mt-1">{caixa?.totalUrgentes || 4}</p>
          <p className="text-[11px] text-red-400/80 mt-0.5">Requer ação imediata</p>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-800/40">
          <p className="text-sky-400 font-semibold uppercase text-[10px]">Minhas</p>
          <p className="text-xl font-bold text-sky-300 mt-1">{caixa?.minhas || 9}</p>
          <p className="text-[11px] text-sky-400/80 mt-0.5">Sob sua responsabilidade</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Delegadas</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{caixa?.delegadas || 2}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cobertura de ausência</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-slate-400 font-semibold uppercase text-[10px]">Itens Vencidos</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{caixa?.vencidas || 1}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">SLA estourado</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
          <span className="text-slate-400">Departamento:</span>
          <select
            value={filtroDepto}
            onChange={(e) => setFiltroDepto(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none"
          >
            <option value="TODOS" className="bg-slate-900">Todos</option>
            <option value="FINANCEIRO" className="bg-slate-900">Financeiro</option>
            <option value="ATENDIMENTO" className="bg-slate-900">Atendimento / SAC</option>
            <option value="OPERACOES" className="bg-slate-900">Operações</option>
            <option value="COMERCIAL" className="bg-slate-900">Comercial</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
          <span className="text-slate-400">Tipo de Trabalho:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none"
          >
            <option value="TODOS" className="bg-slate-900">Todos</option>
            <option value="APROVACAO" className="bg-slate-900">Aprovação de Alçada</option>
            <option value="DIVERGENCIA" className="bg-slate-900">Divergência 11.31</option>
            <option value="TAREFA" className="bg-slate-900">Tarefa Operacional</option>
          </select>
        </div>
      </div>

      {/* Lista de Itens da Caixa de Trabalho */}
      <div className="space-y-3">
        {itensFiltrados.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
              item.atrasado
                ? 'bg-red-950/20 border-red-800/60'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold bg-slate-800 text-sky-400 px-2 py-0.5 rounded">
                  {item.codigo}
                </span>
                <span className="font-bold text-white text-sm">{item.titulo}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {item.departamento}
                </span>
                {item.atrasado && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                    SLA Vencido
                  </span>
                )}
                {item.minha && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                    Atribuído a Você
                  </span>
                )}
              </div>

              <p className="text-slate-300">{item.descricao}</p>

              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] pt-1">
                <span>Origem / Solicitante: <strong className="text-slate-200">{item.solicitanteOuOrigem}</strong></span>
                {item.valor !== undefined && (
                  <span>Valor: <strong className="font-mono text-emerald-400">{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                )}
                {item.slaLimite && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock size={11} /> Prazo: {item.slaLimite}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.tipo === 'APROVACAO' ? (
                <Link
                  href="/automacoes/aprovacoes"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1"
                >
                  <span>Analisar Alçada</span>
                  <ArrowRight size={13} />
                </Link>
              ) : (
                <button
                  onClick={() => alert(`Assumindo tarefa ${item.codigo}`)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  Assumir Item
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
