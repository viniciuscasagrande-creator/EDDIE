'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Percent,
  Calculator,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Layers,
  Activity,
  CreditCard,
  Building,
  Target,
  FileText,
  Lock,
} from 'lucide-react';
import {
  InteligenciaClient,
  PainelExecutivoInteligencia,
  CenariosSimulacaoPreco,
  PapelUsuarioContexto,
  DecomposicaoRentabilidadeReal,
} from '@/lib/inteligencia-client';

export default function CentralInteligenciaPage() {
  const [periodo, setPeriodo] = useState('Setembro 2026');
  const [papelUsuario, setPapelUsuario] = useState<PapelUsuarioContexto>('ADMINISTRADOR');
  const [abaAtiva, setAbaAtiva] = useState<'rentabilidade' | 'receita' | 'produtor' | 'alertas' | 'oportunidades' | 'comparativo'>('rentabilidade');

  const [painel, setPainel] = useState<PainelExecutivoInteligencia | null>(null);
  const [rentabilidadeDimensoes, setRentabilidadeDimensoes] = useState<any>(null);
  const [margemIngresso, setMargemIngresso] = useState<any>(null);
  const [pontoEquilibrio, setPontoEquilibrio] = useState<any>(null);
  const [velocidade, setVelocidade] = useState<any>(null);
  const [esgotamento, setEsgotamento] = useState<any>(null);
  const [lotes, setLotes] = useState<any[]>([]);
  const [oportunidadesPerdas, setOportunidadesPerdas] = useState<any>(null);
  const [produtor360, setProdutor360] = useState<any>(null);
  const [comparativo, setComparativo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulador de Preço
  const [precoAtual, setPrecoAtual] = useState(120);
  const [precoProposto, setPrecoProposto] = useState(135);
  const [disponibilidadeRestante, setDisponibilidadeRestante] = useState(5000);
  const [simulacaoResultado, setSimulacaoResultado] = useState<CenariosSimulacaoPreco | null>(null);
  const [, startTransition] = useTransition();

  const carregarDados = async () => {
    setLoading(true);
    try {
      const eventoId = '11111111-1111-1111-1111-111111111111';
      const [
        painelData,
        dimensoesData,
        margemData,
        peData,
        velData,
        esgData,
        lotesData,
        oppPerdasData,
        p360Data,
        compData,
        simData,
      ] = await Promise.all([
        InteligenciaClient.getPainelExecutivo(periodo, papelUsuario),
        InteligenciaClient.getRentabilidadeDimensoes(eventoId, papelUsuario),
        InteligenciaClient.getMargemIngresso(eventoId, papelUsuario),
        InteligenciaClient.getPontoEquilibrio(eventoId),
        InteligenciaClient.getVelocidadeVendas(eventoId),
        InteligenciaClient.getPrevisaoEsgotamento(eventoId),
        InteligenciaClient.getInteligenciaLotes(eventoId),
        InteligenciaClient.getOportunidadesEPerdas(eventoId),
        InteligenciaClient.getVisaoProdutor360('prod-t4f', papelUsuario),
        InteligenciaClient.getComparativoHistorico(eventoId),
        InteligenciaClient.simularPreco({ precoAtual, precoProposto, disponibilidadeRestante }),
      ]);

      setPainel(painelData);
      setRentabilidadeDimensoes(dimensoesData);
      setMargemIngresso(margemData);
      setPontoEquilibrio(peData);
      setVelocidade(velData);
      setEsgotamento(esgData);
      setLotes(lotesData);
      setOportunidadesPerdas(oppPerdasData);
      setProdutor360(p360Data);
      setComparativo(compData);
      setSimulacaoResultado(simData);
    } catch (err) {
      console.error('Erro ao carregar dados de inteligência:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [periodo, papelUsuario]);

  const handleSimulacao = () => {
    startTransition(async () => {
      const res = await InteligenciaClient.simularPreco({
        precoAtual,
        precoProposto,
        disponibilidadeRestante,
      });
      setSimulacaoResultado(res);
    });
  };

  const formatBRL = (val?: number) => {
    if (val === undefined || val === null) return '—';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isProdutor = papelUsuario === 'PRODUTOR';
  const decomposicao: DecomposicaoRentabilidadeReal | undefined = painel?.rentabilidadeEventos[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* ==================================================================== */}
      {/* 1. BARRA SUPERIOR EXECUTIVA TRANSVERSAL */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Central de Inteligência Executiva</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  EDDIE 11.30
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Rentabilidade Real, Inteligência Preditiva de Receita e Inteligência do Produtor B2B 360º
              </p>
            </div>
          </div>
        </div>

        {/* Filtros e Alternador de Papel (Governança & Segregação) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 font-medium">Visão:</span>
            <button
              onClick={() => setPapelUsuario('ADMINISTRADOR')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                !isProdutor ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DiskIngressos (Geral)
            </button>
            <button
              onClick={() => setPapelUsuario('PRODUTOR')}
              className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
                isProdutor ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3 h-3" />
              Produtor (Segregada)
            </button>
          </div>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="Setembro 2026">Setembro 2026</option>
            <option value="2026-Q3">3º Trimestre 2026</option>
            <option value="2026-Q4">4º Trimestre 2026 (Projeção)</option>
            <option value="2026-ANUAL">Ano Consolidado 2026</option>
          </select>

          <button
            onClick={carregarDados}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. CARDS DE KPIS DO TOPO */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* GMV Líquido */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>GMV Líquido</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {formatBRL(painel?.kpisTopo.gmvTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 flex items-center font-medium">
              <ArrowUpRight className="w-3 h-3" /> +19.0%
            </span>
            <span>vs edição anterior</span>
          </div>
        </div>

        {/* Receita Disk (Confidencial para Produtor) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Receita Disk (Take-rate)</span>
            {isProdutor ? <Lock className="w-4 h-4 text-amber-400" /> : <Percent className="w-4 h-4 text-purple-400" />}
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {isProdutor ? (
              <span className="text-xs text-amber-400/90 font-medium">Confidencial (Interno)</span>
            ) : (
              formatBRL(painel?.kpisTopo.receitaDiskTotal)
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {isProdutor ? 'Segregação ativa' : 'Média de 15.0% take-rate'}
          </div>
        </div>

        {/* Margem Operacional Disk (Confidencial para Produtor) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Margem Disk Líquida</span>
            {isProdutor ? <Lock className="w-4 h-4 text-amber-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {isProdutor ? (
              <span className="text-xs text-amber-400/90 font-medium">Confidencial (Interno)</span>
            ) : (
              formatBRL(painel?.kpisTopo.margemDiskTotal)
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {isProdutor ? 'Segregação ativa' : `${painel?.kpisTopo.margemMediaPct}% da receita contratual`}
          </div>
        </div>

        {/* Público Validado */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Público Validado (Portaria)</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {painel?.kpisTopo.publicoValidadoTotal.toLocaleString('pt-BR')}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">89.8%</span>
            <span>presença real (11.29.5)</span>
          </div>
        </div>

        {/* Eventos Ativos */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Eventos em Monitoramento</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {painel?.kpisTopo.eventosAtivos} ativos
          </div>
          <div className="mt-1 text-xs text-slate-400">
            18 realizados historicamente
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. TRÍADE METODOLÓGICA: REALIZADO vs META vs PREVISÃO */}
      {/* ==================================================================== */}
      {painel?.metasPrevisao && (
        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Alinhamento Metodológico: Realizado × Meta × Previsão ({painel.metasPrevisao.periodo})
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Premissas baseadas em séries temporais e conciliação imutável</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50">
              <span className="text-xs text-slate-400">Vendas (GMV)</span>
              <div className="text-lg font-bold text-white mt-1">
                {formatBRL(painel.metasPrevisao.vendas.realizado)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>Meta: {formatBRL(painel.metasPrevisao.vendas.meta)}</span>
                <span className="text-purple-400 font-semibold">{painel.metasPrevisao.vendas.atingimentoPct}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50">
              <span className="text-xs text-slate-400">Público Validado</span>
              <div className="text-lg font-bold text-white mt-1">
                {painel.metasPrevisao.publico.realizado.toLocaleString('pt-BR')} pessoas
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>Meta: {painel.metasPrevisao.publico.meta.toLocaleString('pt-BR')}</span>
                <span className="text-sky-400 font-semibold">{painel.metasPrevisao.publico.atingimentoPct}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50">
              <span className="text-xs text-slate-400">Receita Disk</span>
              <div className="text-lg font-bold text-white mt-1">
                {isProdutor ? 'Confidencial' : formatBRL(painel.metasPrevisao.receitaDisk?.realizado)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>{isProdutor ? 'Segregação ativa' : `Meta: ${formatBRL(painel.metasPrevisao.receitaDisk?.meta)}`}</span>
                {!isProdutor && <span className="text-emerald-400 font-semibold">{painel.metasPrevisao.receitaDisk?.atingimentoPct}%</span>}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/50">
              <span className="text-xs text-slate-400">Margem Operacional</span>
              <div className="text-lg font-bold text-white mt-1">
                {isProdutor ? 'Confidencial' : formatBRL(painel.metasPrevisao.margemDisk?.realizado)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>{isProdutor ? 'Segregação ativa' : `Meta: ${formatBRL(painel.metasPrevisao.margemDisk?.meta)}`}</span>
                {!isProdutor && <span className="text-emerald-400 font-semibold">{painel.metasPrevisao.margemDisk?.atingimentoPct}%</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. NAVEGAÇÃO ENTRE AS ABAS OPERACIONAIS */}
      {/* ==================================================================== */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => setAbaAtiva('rentabilidade')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'rentabilidade'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          11.30.1 Rentabilidade Real
        </button>

        <button
          onClick={() => setAbaAtiva('receita')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'receita'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          11.30.2 Inteligência de Receita
        </button>

        <button
          onClick={() => setAbaAtiva('produtor')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'produtor'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          11.30.3 Visão do Produtor 360º
        </button>

        <button
          onClick={() => setAbaAtiva('alertas')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'alertas'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alertas com Explicabilidade
          {painel?.alertasPrincipais && painel.alertasPrincipais.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              {painel.alertasPrincipais.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAbaAtiva('oportunidades')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'oportunidades'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Central de Oportunidades
        </button>

        <button
          onClick={() => setAbaAtiva('comparativo')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'comparativo'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Comparativo entre Edições
        </button>
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: 11.30.1 — RENTABILIDADE REAL */}
      {/* ==================================================================== */}
      {abaAtiva === 'rentabilidade' && decomposicao && (
        <div className="space-y-6">
          {/* CASCATA DE RENTABILIDADE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              Demonstração da Cadeia de Rentabilidade Real
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Origem imutável: Pagamentos + Ledger Contábil + Contrato Comercial + MDR Adquirentes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Componente da Rentabilidade</th>
                    <th className="pb-3 text-right">Valor Consolidado</th>
                    <th className="pb-3 text-right">Efeito / Proporção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 text-slate-200">Vendas Brutas (Gross Sales)</td>
                    <td className="py-2.5 text-right font-mono text-white">{formatBRL(decomposicao.vendasBrutas)}</td>
                    <td className="py-2.5 text-right text-slate-400">100.0%</td>
                  </tr>
                  <tr className="text-red-400/90">
                    <td className="py-2.5 pl-4">(-) Cancelamentos e Estornos (CDC 7 dias)</td>
                    <td className="py-2.5 text-right font-mono">- {formatBRL(decomposicao.cancelamentosEstornos)}</td>
                    <td className="py-2.5 text-right">- 3.2%</td>
                  </tr>
                  <tr className="text-red-400/90">
                    <td className="py-2.5 pl-4">(-) Chargebacks (Contestação Bancária)</td>
                    <td className="py-2.5 text-right font-mono">- {formatBRL(decomposicao.chargebacks)}</td>
                    <td className="py-2.5 text-right">- 0.48%</td>
                  </tr>
                  <tr className="bg-slate-800/40 font-bold text-white">
                    <td className="py-3 text-purple-300">(=) GMV LÍQUIDO</td>
                    <td className="py-3 text-right font-mono text-emerald-400">{formatBRL(decomposicao.gmvLiquido)}</td>
                    <td className="py-3 text-right text-slate-300">96.3% do bruto</td>
                  </tr>

                  {/* Custos e Margem Disk (Segregados se PRODUTOR) */}
                  {!isProdutor ? (
                    <>
                      <tr className="text-sky-300">
                        <td className="py-2.5 text-slate-200">Receita Contratual Disk (Take-rate Contratado)</td>
                        <td className="py-2.5 text-right font-mono text-sky-400">{formatBRL(decomposicao.receitaContratualDisk)}</td>
                        <td className="py-2.5 text-right text-slate-400">{decomposicao.takeRateContratualPct}% do GMV</td>
                      </tr>
                      <tr className="text-amber-400/90">
                        <td className="py-2.5 pl-4">(-) Custos de Adquirência MDR (Adyen, Cielo, Rede)</td>
                        <td className="py-2.5 text-right font-mono">- {formatBRL(decomposicao.custosAdquirencia)}</td>
                        <td className="py-2.5 text-right">- {decomposicao.custosAdquirenciaPct}% do GMV</td>
                      </tr>
                      <tr className="text-amber-400/90">
                        <td className="py-2.5 pl-4">(-) Comissões de Parceiros e Agências</td>
                        <td className="py-2.5 text-right font-mono">- {formatBRL(decomposicao.comissoesParceiros)}</td>
                        <td className="py-2.5 text-right">- 1.04% do GMV</td>
                      </tr>
                      <tr className="text-amber-400/90">
                        <td className="py-2.5 pl-4">(-) Custos Atribuíveis de Operação (Portaria, SAC, Infra)</td>
                        <td className="py-2.5 text-right font-mono">- {formatBRL(decomposicao.custosAtribuiveisOperacao)}</td>
                        <td className="py-2.5 text-right">- 0.75% do GMV</td>
                      </tr>
                      <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/40 font-bold text-white">
                        <td className="py-3 text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          (=) RESULTADO DA OPERAÇÃO DISK (MARGEM LÍQUIDA)
                        </td>
                        <td className="py-3 text-right font-mono text-xl text-emerald-300">
                          {formatBRL(decomposicao.resultadoOperacaoDisk)}
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-bold">
                          {decomposicao.margemDiskPct}% da receita
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-xs text-amber-400 bg-amber-950/20 rounded">
                        <Lock className="w-4 h-4 inline-block mr-1" />
                        Custos internos e margens operacionais da DiskIngressos são estritamente confidenciais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MARGEM POR INGRESSO E PONTO DE EQUILÍBRIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Margem por Ingresso */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                Margem Unitária por Ingresso Vendido
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Decomposição média por ingresso emitido nesta edição.
              </p>
              {margemIngresso && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Preço Médio do Ingresso:</span>
                    <span className="font-bold text-white font-mono">{formatBRL(margemIngresso.precoMedioIngresso)}</span>
                  </div>
                  {!isProdutor && (
                    <>
                      <div className="flex justify-between py-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Receita Disk por Ingresso:</span>
                        <span className="font-bold text-sky-400 font-mono">{formatBRL(margemIngresso.receitaDiskPorIngresso)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800 text-red-400">
                        <span>(-) Custo Financeiro / MDR Unitário:</span>
                        <span className="font-mono">- {formatBRL(margemIngresso.custoFinanceiroPorIngresso)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800 text-red-400">
                        <span>(-) Outros Custos Operacionais Atribuíveis:</span>
                        <span className="font-mono">- {formatBRL(margemIngresso.outrosCustosPorIngresso)}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-emerald-950/20 px-2 rounded font-bold text-emerald-300">
                        <span>(=) Margem Operacional Disk / Ingresso:</span>
                        <span className="font-mono text-sm">{formatBRL(margemIngresso.margemDiskPorIngresso)} ({margemIngresso.margemPercentual}%)</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Ponto de Equilíbrio (Break-Even) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Ponto de Equilíbrio Disk (Break-Even Operacional)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Volume de ingressos para cobrir custos fixos e variáveis atribuídos à operação deste evento.
              </p>
              {pontoEquilibrio && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">Ponto de Equilíbrio Exigido</div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        {pontoEquilibrio.pontoEquilibrioIngressos.toLocaleString('pt-BR')} ingressos
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Ingressos Já Vendidos</div>
                      <div className="text-xl font-bold text-emerald-400 mt-0.5">
                        {pontoEquilibrio.ingressosVendidos.toLocaleString('pt-BR')} ingressos
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-xs text-emerald-200">
                      <strong>Break-even Superado:</strong> Margem de segurança de{' '}
                      <span className="font-bold underline">+{pontoEquilibrio.diferencaMargemSeguranca.toLocaleString('pt-BR')} ingressos</span>{' '}
                      acima da meta mínima de sustentabilidade da operação.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DECOMPOSIÇÃO POR DIMENSÕES */}
          {rentabilidadeDimensoes && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rentabilidade por Adquirente */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  Rentabilidade e Eficiência por Adquirente
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Custo efetivo de processamento para cada R$ 1 milhão transacionado no gateway.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="pb-2">Adquirente</th>
                        <th className="pb-2 text-right">Volume</th>
                        <th className="pb-2 text-right">MDR Médio</th>
                        <th className="pb-2 text-right">Custo / R$ 1 Milhão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {rentabilidadeDimensoes.porAdquirente.map((adq: any) => (
                        <tr key={adq.adquirente}>
                          <td className="py-2.5 text-slate-200">{adq.adquirente}</td>
                          <td className="py-2.5 text-right font-mono">{formatBRL(adq.volumeProcessado)}</td>
                          <td className="py-2.5 text-right text-slate-400">{adq.taxaMediaMdrPct}%</td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                            {formatBRL(adq.custoPorMilhao)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rentabilidade por Lote */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Efeito Econômico da Precificação por Lote
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Evolução da margem com a progressão da virada de lotes.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="pb-2">Lote</th>
                        <th className="pb-2 text-right">Preço</th>
                        <th className="pb-2 text-right">Vendidos</th>
                        <th className="pb-2 text-right">Margem %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {rentabilidadeDimensoes.porLote.map((lt: any) => (
                        <tr key={lt.loteId}>
                          <td className="py-2.5 text-slate-200">{lt.nomeLote}</td>
                          <td className="py-2.5 text-right font-mono">{formatBRL(lt.precoUnitario)}</td>
                          <td className="py-2.5 text-right">{lt.ingressosVendidos} un.</td>
                          <td className="py-2.5 text-right font-bold text-purple-400">
                            {lt.margemPct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: 11.30.2 — INTELIGÊNCIA DE RECEITA */}
      {/* ==================================================================== */}
      {abaAtiva === 'receita' && (
        <div className="space-y-6">
          {/* VELOCIDADE E ESGOTAMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Velocidade de Vendas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Velocidade Dinâmica de Vendas
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {velocidade?.tendencia}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{velocidade?.textoDescritivo}</p>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Última Hora</div>
                  <div className="text-base font-bold text-white mt-1">{velocidade?.ultimaHora}</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">6 Horas</div>
                  <div className="text-base font-bold text-white mt-1">{velocidade?.ultimas6Horas}</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">24 Horas</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">{velocidade?.ultimas24Horas}</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">7 Dias</div>
                  <div className="text-base font-bold text-white mt-1">{velocidade?.ultimos7Dias}</div>
                </div>
              </div>
            </div>

            {/* Previsão de Esgotamento */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Previsão Preditiva de Esgotamento
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  Risco de Esgotamento Precoce
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{esgotamento?.recomendacaoTexto}</p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Disponíveis</span>
                  <div className="text-base font-bold text-white mt-0.5">{esgotamento?.disponibilidadeRestante} un.</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Ritmo Atual</span>
                  <div className="text-base font-bold text-purple-400 mt-0.5">{esgotamento?.ritmoVendasPorDia}/dia</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Esgotamento</span>
                  <div className="text-base font-bold text-amber-400 mt-0.5">~{esgotamento?.diasEstimadosAteEsgotamento} dias</div>
                </div>
              </div>
            </div>
          </div>

          {/* INTELIGÊNCIA DE LOTES COM BOTÃO [ANALISAR] */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Inteligência de Lotes & Decisões Operacionais
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Recomendações baseadas na ocupação real sem aumento indiscriminado de preço.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lotes.map((lote) => (
                <div
                  key={lote.loteId}
                  className={`p-4 rounded-xl border ${
                    lote.utilizacaoPct > 90
                      ? 'bg-purple-950/30 border-purple-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white text-sm">{lote.nome}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        lote.utilizacaoPct === 100
                          ? 'bg-slate-800 text-slate-400'
                          : lote.utilizacaoPct > 90
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {lote.utilizacaoPct}% ocupado
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">
                    {lote.ingressosVendidos.toLocaleString('pt-BR')} de {lote.capacidadeTotal.toLocaleString('pt-BR')} ingressos
                  </div>
                  {lote.acaoRecomendada ? (
                    <div className="space-y-2">
                      <div className="text-xs text-purple-300 font-medium">{lote.acaoRecomendada}</div>
                      <button
                        onClick={() => {
                          setPrecoAtual(145);
                          setPrecoProposto(180);
                          setDisponibilidadeRestante(6000);
                          handleSimulacao();
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        [Analisar & Simular Preço]
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Operação estável no momento</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SIMULADOR DE PREÇO INTERATIVO (CENÁRIOS CONSERVADOR, BASE, OTIMISTA) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-400" />
                  Simulador de Alteração de Preço (Cenários Estatísticos)
                </h3>
                <p className="text-xs text-slate-400">
                  Teste o impacto na receita e na demanda antes de efetivar qualquer virada de lote no catálogo.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                Modelo de Elasticidade
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 font-medium">Preço Atual (R$)</label>
                <input
                  type="number"
                  value={precoAtual}
                  onChange={(e) => setPrecoAtual(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Preço Proposto (R$)</label>
                <input
                  type="number"
                  value={precoProposto}
                  onChange={(e) => setPrecoProposto(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Disponibilidade do Lote (unidades)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={disponibilidadeRestante}
                    onChange={(e) => setDisponibilidadeRestante(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-purple-500"
                  />
                  <button
                    onClick={handleSimulacao}
                    className="mt-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Simular
                  </button>
                </div>
              </div>
            </div>

            {simulacaoResultado && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cenário Conservador */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-red-500/30">
                    <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Cenário Conservador</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {formatBRL(simulacaoResultado.cenarioConservador.projecaoReceitaTotal)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Vendas estimadas: <strong>{simulacaoResultado.cenarioConservador.projecaoVendas.toLocaleString('pt-BR')} un.</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                      {simulacaoResultado.cenarioConservador.premissa}
                    </p>
                  </div>

                  {/* Cenário Base */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/50">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Cenário Base (Mais Provável)</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {formatBRL(simulacaoResultado.cenarioBase.projecaoReceitaTotal)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Vendas estimadas: <strong>{simulacaoResultado.cenarioBase.projecaoVendas.toLocaleString('pt-BR')} un.</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                      {simulacaoResultado.cenarioBase.premissa}
                    </p>
                  </div>

                  {/* Cenário Otimista */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cenário Otimista</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {formatBRL(simulacaoResultado.cenarioOtimista.projecaoReceitaTotal)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Vendas estimadas: <strong>{simulacaoResultado.cenarioOtimista.projecaoVendas.toLocaleString('pt-BR')} un.</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                      {simulacaoResultado.cenarioOtimista.premissa}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-lg text-xs text-slate-400 italic">
                  <strong>Nota Legal:</strong> {simulacaoResultado.notaLegal}
                </div>
              </div>
            )}
          </div>

          {/* OPORTUNIDADES E PERDAS CLASSIFICADAS */}
          {oportunidadesPerdas && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Classificação de Perdas e Receita Recuperável via Remarketing
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mapeamento de carrinhos abandonados, recusas temporárias de cartão e holds expirados.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total de Perdas Mapeadas</div>
                  <div className="text-base font-bold text-red-400">{formatBRL(oportunidadesPerdas.totalPerdasIdentificadas)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {oportunidadesPerdas.perdasPorNatureza.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{p.categoria}</span>
                        <div className="text-[11px] text-slate-400">{p.natureza}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">{formatBRL(p.valor)}</div>
                        <span className={`text-[10px] ${p.recuperavel ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                          {p.recuperavel ? 'Recuperável' : 'Definitivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Recuperação Ativa via Remarketing (11.29.3 / 11.29.5)
                    </span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {formatBRL(oportunidadesPerdas.receitaRecuperadaRemarketing.totalRecuperado)}
                    </div>
                    <div className="text-xs text-slate-300 mt-2">
                      {oportunidadesPerdas.receitaRecuperadaRemarketing.detalhes}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-500/20 flex justify-between text-xs text-emerald-300">
                    <span>Taxa de Recuperação: <strong>{oportunidadesPerdas.receitaRecuperadaRemarketing.taxaRecuperacaoPct}%</strong></span>
                    <span>Tentativas: <strong>{oportunidadesPerdas.receitaRecuperadaRemarketing.tentativasRecuperadas} pedidos</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 3: 11.30.3 — INTELIGÊNCIA DO PRODUTOR */}
      {/* ==================================================================== */}
      {abaAtiva === 'produtor' && produtor360 && (
        <div className="space-y-6">
          {/* CABEÇALHO B2B 360º */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Parceiro Homologado
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{produtor360.cabecalho.nomeFantasia}</h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  {produtor360.cabecalho.razaoSocial} • Relacionamento ativo desde {produtor360.cabecalho.relacionamentoDesde}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-400">Exposição ao Risco</span>
                  <div className="text-sm font-bold text-emerald-400">{produtor360.cabecalho.exposicaoRisco}</div>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-slate-400">Saldo Disponível</span>
                  <div className="text-sm font-bold text-white font-mono">
                    {formatBRL(produtor360.cabecalho.saldoAtualDisponivel)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">GMV Histórico Acumulado</span>
                <div className="text-base font-bold text-white mt-1">{formatBRL(produtor360.cabecalho.gmvHistorico)}</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Eventos Realizados</span>
                <div className="text-base font-bold text-white mt-1">{produtor360.cabecalho.eventosRealizados} edições</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Público Validado Total</span>
                <div className="text-base font-bold text-sky-400 mt-1">{produtor360.cabecalho.publicoValidadoTotal.toLocaleString('pt-BR')}</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Conciliação Bancária</span>
                <div className="text-base font-bold text-emerald-400 mt-1">{produtor360.financeiro.statusConciliacaoBancaria}</div>
              </div>
            </div>
          </div>

          {/* 6 INDICADORES OBJETIVOS DE SAÚDE DO RELACIONAMENTO */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              6 Indicadores Objetivos de Saúde do Relacionamento
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Avaliação multidimensional sem notas artificiais únicas. Cada pilar reflete métricas operacionais comprovadas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(produtor360.saudeRelacionamento).map(([chave, val]: [string, any]) => (
                <div key={chave} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{chave}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {val.status} ({val.score}/10)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{val.detalhe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LINHA DO TEMPO DOS EVENTOS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Linha do Tempo de Eventos & Histórico de Sucesso
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Consistência de público, GMV e taxa de comparecimento ao longo dos anos.
            </p>

            <div className="space-y-6">
              {produtor360.linhaDoTempo.map((itemAno: any) => (
                <div key={itemAno.ano} className="space-y-2">
                  <div className="text-xs font-bold text-purple-400 border-b border-slate-800 pb-1">
                    Ano {itemAno.ano}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {itemAno.eventos.map((ev: any) => (
                      <div key={ev.eventoId} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                        <div className="font-bold text-white text-sm">{ev.eventoNome}</div>
                        <div className="text-slate-400 mt-0.5">{ev.dataEvento}</div>
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-400">GMV</span>
                            <div className="font-mono font-semibold text-white">{formatBRL(ev.vendasTotais)}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Presentes</span>
                            <div className="font-semibold text-sky-400">{ev.publicoValidado.toLocaleString('pt-BR')}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Comparecimento</span>
                            <div className="font-semibold text-emerald-400">{ev.comparecimentoPct}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 4: ALERTAS COM EXPLICABILIDADE OBRIGATÓRIA */}
      {/* ==================================================================== */}
      {abaAtiva === 'alertas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Torre de Controle — Alertas com Explicabilidade
            </h3>
            <p className="text-xs text-slate-400">
              Nenhum alerta é exibido sem justificar matematicamente suas causas e recomendar a ação cabível.
            </p>
          </div>

          <div className="space-y-4">
            {painel?.alertasPrincipais.map((alerta) => (
              <div
                key={alerta.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-red-400">{alerta.categoria}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          Severidade {alerta.severidade}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{alerta.titulo}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{alerta.descricao}</p>
                    </div>
                  </div>
                </div>

                {/* Bloco de Explicabilidade Obrigatória */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Por que estou vendo isso? (Explicabilidade Auditável)
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {alerta.explicabilidade.porQueEstouVendoIsso.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400">Origem da Métrica:</span>
                      <div className="text-white font-medium">{alerta.explicabilidade.origemMetrica}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Ação Recomendada:</span>
                      <div className="text-emerald-400 font-semibold">{alerta.explicabilidade.acaoRecomendada}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 5: CENTRAL DE OPORTUNIDADES ACIONÁVEIS */}
      {/* ==================================================================== */}
      {abaAtiva === 'oportunidades' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Central de Oportunidades de Receita & Automações
            </h3>
            <p className="text-xs text-slate-400">
              Oportunidades identificadas por correlação entre módulos e seus ganhos projetados em R$.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {painel?.oportunidadesPrincipais.map((opt) => (
              <div
                key={opt.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {opt.categoria}
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +{formatBRL(opt.impactoEstimado)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{opt.titulo}</h4>
                  <p className="text-xs text-slate-300 mt-1">{opt.descricao}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2">
                    <strong>Sugestão:</strong> {opt.acaoSugerida}
                  </div>
                  <a
                    href={opt.linkAcao}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                  >
                    <span>Executar Ação</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 6: COMPARATIVO HISTÓRICO ENTRE EDIÇÕES */}
      {/* ==================================================================== */}
      {abaAtiva === 'comparativo' && comparativo && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              Comparativo Histórico entre Edições ({comparativo.eventoAtualNome} × {comparativo.eventoAnteriorNome})
            </h3>
            <p className="text-xs text-slate-400">
              Evolução percentual objetiva de vendas, público real, margens e custos financeiros.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Métrica Analisada</th>
                  <th className="py-3 px-4 text-right">Edição Anterior (2025)</th>
                  <th className="py-3 px-4 text-right">Edição Atual (2026)</th>
                  <th className="py-3 px-4 text-right">Variação %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
                {comparativo.metricas.map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-200">{m.metrica}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{m.edicaoAnterior}</td>
                    <td className="py-3 px-4 text-right font-mono text-white font-bold">{m.edicaoAtual}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          m.favoravel ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {m.variacaoPct > 0 ? `+${m.variacaoPct}%` : `${m.variacaoPct}%`}
                        {m.favoravel ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
