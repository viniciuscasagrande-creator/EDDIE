'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  Megaphone,
  Briefcase,
  Scale,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Zap size={14} />
            <span>Monólito Modular Event-Driven</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Painel do Produtor (PDT)
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Plataforma corporativa DiskIngressos integrada para gestão executiva de eventos,
            liquidação financeira em partidas dobradas, inteligência de marketing multicanal e CRM B2B.
          </p>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Saldo Disponível</span>
            <Wallet size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">R$ 148.520,00</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp size={14} /> +12.4% nesta semana
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Receita Atribuída (Mkt)</span>
            <Megaphone size={18} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">R$ 382.900,00</div>
          <div className="text-xs text-sky-400 font-medium">ROAS Médio: 4.8x</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Pipeline B2B</span>
            <Briefcase size={18} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">R$ 1.250.000,00</div>
          <div className="text-xs text-purple-400 font-medium">8 Oportunidades ativas</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Status Contábil</span>
            <Scale size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">Conciliado</div>
          <div className="text-xs text-slate-400 font-medium">Competência 2026-09 Aberta</div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Acesso aos Bounded Contexts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Financeiro */}
          <Link
            href="/financeiro"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                Módulo Financeiro
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Conta gráfica append-only em partidas dobradas, buckets (disponível, bloqueado, retido, estorno), solicitações Pix e antecipações.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 pt-2 border-t border-slate-800/80">
              ✓ 9/9 Passos Concluídos
            </div>
          </Link>

          {/* Marketing */}
          <Link
            href="/marketing"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-sky-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Megaphone size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition">
                Marketing & Remarketing
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Campanhas prontas e multicanais, pixels CAPI (Meta, GA4, TikTok, Spotify), central UTM com QR Codes e motor de atribuição.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-sky-400 pt-2 border-t border-slate-800/80">
              ✓ 9/9 Passos Concluídos
            </div>
          </Link>

          {/* Comercial */}
          <Link
            href="/comercial"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-purple-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Briefcase size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition">
                Comercial (CRM B2B)
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Relacionamento exclusivo com produtores B2B, funil de oportunidades, negociação de taxas e histórico de atividades.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-purple-400 pt-2 border-t border-slate-800/80">
              ✓ 9/9 Passos Concluídos
            </div>
          </Link>

          {/* Contabilidade */}
          <Link
            href="/contabilidade"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-amber-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Scale size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                Contabilidade & DRE
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Escrituração de partidas dobradas segregando receita de taxas dos valores de terceiros, Balancete, DRE e Fechamento.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-amber-400 pt-2 border-t border-slate-800/80">
              ✓ 9/9 Passos Concluídos
            </div>
          </Link>

          {/* Eventos */}
          <Link
            href="/eventos"
            className="group bg-[#111827] hover:bg-[#162032] border border-slate-800 hover:border-rose-500/50 rounded-xl p-6 transition-all space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Calendar size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-500 group-hover:text-rose-400 transition" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition">
                Eventos & Lotes
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Cockpit operacional, criação e virada de lotes, controle de ocupação e sessões com precificação automática.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-rose-400 pt-2 border-t border-slate-800/80">
              ✓ Operacional
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
