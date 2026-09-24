'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Lock,
  RefreshCcw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';

export default function InteligenciaFinanceiraPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [dados, setDados] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarFinanceiro = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/eventos/${eventoId}/inteligencia/financeira`);
      if (res.ok) {
        setDados(await res.json());
      }
    } catch (e) {
      console.error('Falha ao carregar inteligência financeira:', e);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    carregarFinanceiro();
    const interval = setInterval(carregarFinanceiro, 15000);
    return () => clearInterval(interval);
  }, [carregarFinanceiro]);

  const formatBRL = (cents = 0) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

  return (
    <div className="space-y-6 max-w-full text-slate-100 pb-12">
      {/* CABEÇALHO */}
      <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#171a22] via-[#14161c] to-[#121418] p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/eventos/${eventoId || 'evento-operacao'}/inteligencia`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <ArrowLeft size={13} />
                <span>Voltar à Inteligência</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/20">
                <Scale size={14} />
                LEDGER & CUSTÓDIA DE REPASSES
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-2">
              Inteligência Financeira, Liquidação & Repasses
            </h1>
            <p className="text-xs text-slate-400">
              Auditoria de fluxo de caixa, segregação patrimonial e cronograma de liquidação financeira.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/financeiro"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <span>Módulo Financeiro Geral</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={() => carregarFinanceiro()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ALERTA DE SEGREGAÇÃO PATRIMONIAL E REGRA DE NEGÓCIO INVIOLÁVEL */}
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs text-emerald-200 flex items-start gap-3 shadow-md">
        <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-emerald-300 font-bold block text-sm">
            Segregação Patrimonial Rígida (Regra Contábil do Modulith)
          </strong>
          <p className="leading-relaxed">
            Os valores pertencentes ao produtor constituem <strong className="text-white">custódia operacional transitória</strong> e em hipótese alguma são contabilizados como receita própria da DiskIngressos. Todos os dados abaixo refletem lançamentos imutáveis do Ledger contábil. Projeções estatísticas nunca substituem valores confirmados de liquidação bancária.
          </p>
        </div>
      </div>

      {/* KPI CARDS: SEGREGAÇÃO FINANCEIRA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-1 shadow-lg">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Volume Bruto (GMV)</div>
          <div className="text-2xl font-black text-white mt-1">
            {dados?.gmvTotalCentavos != null ? formatBRL(dados.gmvTotalCentavos) : loading ? 'Carregando...' : 'Dados indisponíveis'}
          </div>
          <div className="text-[11px] text-slate-500">100% dos ingressos faturados</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-[#121620] p-5 space-y-1 shadow-lg">
          <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Líquido do Produtor</span>
            <Wallet size={15} />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {dados?.direitosProdutor?.valorLiquidoTotalCentavos != null
              ? formatBRL(dados.direitosProdutor.valorLiquidoTotalCentavos)
              : '—'}
          </div>
          <div className="text-[11px] text-emerald-300/80">Custódia transitória líquida</div>
        </div>

        <div className="rounded-2xl border border-sky-500/40 bg-[#121620] p-5 space-y-1 shadow-lg">
          <div className="text-xs text-sky-400 font-bold uppercase tracking-wider">Disponível para Repasse</div>
          <div className="text-2xl font-black text-sky-300 mt-1">
            {dados?.direitosProdutor?.disponivelParaRepasseCentavos != null
              ? formatBRL(dados.direitosProdutor.disponivelParaRepasseCentavos)
              : '—'}
          </div>
          <div className="text-[11px] text-slate-400">Saldo liberável imediatamente</div>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-[#121620] p-5 space-y-1 shadow-lg">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Retenção Técnica (CDC)</span>
            <Lock size={14} />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {dados?.direitosProdutor?.retencaoSegurancaCdcCentavos != null
              ? formatBRL(dados.direitosProdutor.retencaoSegurancaCdcCentavos)
              : '—'}
          </div>
          <div className="text-[11px] text-slate-400">Garantia legal pós-evento (7 dias)</div>
        </div>
      </div>

      {/* DETALHAMENTO DA RECEITA DISKINGRESSOS vs CUSTOS DE PROCESSAMENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building size={16} className="text-sky-400" />
              <span>Receita Própria da DiskIngressos (Take Rate)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40">
              {dados?.receitaPropriaDiskIngressos?.percentualContratual != null
                ? `${dados.receitaPropriaDiskIngressos.percentualContratual}% Contratual`
                : 'Pendente'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Taxa de Serviço da Plataforma:</span>
              <strong className="text-white font-mono text-sm">
                {dados?.receitaPropriaDiskIngressos?.valorCentavos != null
                  ? formatBRL(dados.receitaPropriaDiskIngressos.valorCentavos)
                  : '—'}
              </strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Remuneração contratual da plataforma sobre a venda de ingressos. Emissão de NFS-e realizada automaticamente pelo módulo de contabilidade.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard size={16} className="text-amber-400" />
              <span>Custos de Adquirência & Gateway</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
              {dados?.custosGatewayAdquirencia?.custoTotalCentavos != null
                ? formatBRL(dados.custosGatewayAdquirencia.custoTotalCentavos)
                : '—'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Processamento Pix (Taxa Fixa + %):</span>
              <strong className="text-slate-200">
                {dados?.custosGatewayAdquirencia?.processamentoPixCentavos != null
                  ? formatBRL(dados.custosGatewayAdquirencia.processamentoPixCentavos)
                  : '—'}
              </strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Processamento Cartão de Crédito / Antifraude:</span>
              <strong className="text-slate-200">
                {dados?.custosGatewayAdquirencia?.processamentoCartaoCentavos != null
                  ? formatBRL(dados.custosGatewayAdquirencia.processamentoCartaoCentavos)
                  : '—'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* CRONOGRAMA DE LIQUIDAÇÃO & REPASSES */}
      <div className="rounded-2xl border border-slate-800 bg-[#121620] p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-emerald-400" />
              <span>Cronograma de Repasses e Liquidação Bancária</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Lançamentos bancários vinculados aos fechamentos contratuais do evento.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {(!dados?.cronogramaRepasses || dados.cronogramaRepasses.length === 0) ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              Nenhum repasse agendado ou processado para este evento até o momento.
            </div>
          ) : (
            dados.cronogramaRepasses.map((rep: any) => {
              const isLiquidado = rep.status === 'LIQUIDADO';
              const isBloqueado = rep.status === 'BLOQUEADO';
              return (
                <div
                  key={rep.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-sm">{rep.descricao}</div>
                    <div className="text-[11px] text-slate-400">
                      Vencimento: {new Date(rep.dataPrevista).toLocaleDateString('pt-BR')} · Chave Pix: {rep.chavePixDestino}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        {formatBRL(rep.valorCentavos)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isLiquidado ? `Liquidado em ${new Date(rep.dataLiquidacao).toLocaleDateString('pt-BR')}` : rep.motivo || 'Programado'}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLiquidado
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isBloqueado
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
