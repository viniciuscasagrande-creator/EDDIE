'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
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
  Percent,
  Calculator,
  RefreshCw,
  ExternalLink,
  Layers,
  Activity,
  CreditCard,
  Target,
  Lock,
} from 'lucide-react';
import {
  InteligenciaClient,
  CenariosSimulacaoPreco,
  PapelUsuarioContexto,
  DecomposicaoRentabilidadeReal,
} from '@/lib/inteligencia-client';

export default function EventoInteligenciaPage({
  params,
}: {
  params: Promise<{ eventoId: string }>;
}) {
  const [eventoId, setEventoId] = useState('');
  const [papelUsuario, setPapelUsuario] = useState<PapelUsuarioContexto>('ADMINISTRADOR');
  const [abaAtiva, setAbaAtiva] = useState<'rentabilidade' | 'receita' | 'alertas' | 'comparativo'>('rentabilidade');

  const [rentabilidade, setRentabilidade] = useState<DecomposicaoRentabilidadeReal | null>(null);
  const [dimensoes, setDimensoes] = useState<any>(null);
  const [margemIngresso, setMargemIngresso] = useState<any>(null);
  const [pontoEquilibrio, setPontoEquilibrio] = useState<any>(null);
  const [velocidade, setVelocidade] = useState<any>(null);
  const [esgotamento, setEsgotamento] = useState<any>(null);
  const [lotes, setLotes] = useState<any[]>([]);
  const [oportunidadesPerdas, setOportunidadesPerdas] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [comparativo, setComparativo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulador de Preço
  const [precoAtual, setPrecoAtual] = useState(120);
  const [precoProposto, setPrecoProposto] = useState(135);
  const [disponibilidadeRestante, setDisponibilidadeRestante] = useState(5000);
  const [simulacaoResultado, setSimulacaoResultado] = useState<CenariosSimulacaoPreco | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    params.then((p) => setEventoId(p.eventoId));
  }, [params]);

  const carregarDados = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const [
        rentData,
        dimData,
        margData,
        peData,
        velData,
        esgData,
        lotesData,
        oppData,
        alertData,
        compData,
        simData,
      ] = await Promise.all([
        InteligenciaClient.getRentabilidadeReal(eventoId, papelUsuario),
        InteligenciaClient.getRentabilidadeDimensoes(eventoId, papelUsuario),
        InteligenciaClient.getMargemIngresso(eventoId, papelUsuario),
        InteligenciaClient.getPontoEquilibrio(eventoId),
        InteligenciaClient.getVelocidadeVendas(eventoId),
        InteligenciaClient.getPrevisaoEsgotamento(eventoId),
        InteligenciaClient.getInteligenciaLotes(eventoId),
        InteligenciaClient.getOportunidadesEPerdas(eventoId),
        InteligenciaClient.getAlertas(eventoId),
        InteligenciaClient.getComparativoHistorico(eventoId),
        InteligenciaClient.simularPreco({ precoAtual, precoProposto, disponibilidadeRestante }),
      ]);

      setRentabilidade(rentData);
      setDimensoes(dimData);
      setMargemIngresso(margData);
      setPontoEquilibrio(peData);
      setVelocidade(velData);
      setEsgotamento(esgData);
      setLotes(lotesData);
      setOportunidadesPerdas(oppData);
      setAlertas(alertData || []);
      setComparativo(compData);
      setSimulacaoResultado(simData);
    } catch (e) {
      console.error('Falha ao carregar inteligência do evento:', e);
    } finally {
      setLoading(false);
    }
  }, [eventoId, papelUsuario, precoAtual, precoProposto, disponibilidadeRestante]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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

  return (
    <div className="space-y-6 max-w-full text-slate-100 pb-12">
      {/* BANNER PRINCIPAL DE INTELIGÊNCIA DO EVENTO */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-[#15131b] to-[#121620] p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                <Sparkles size={14} className="text-purple-400" />
                EDDIE 11.30 — INTELIGÊNCIA & RENTABILIDADE REAL
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                CONCILIAÇÃO ATIVA
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              {rentabilidade?.eventoNome || 'Inteligência do Evento'}
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Rentabilidade Real, Velocidade de Checkout, Previsão de Esgotamento e Otimização de Lotes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Alternador de Visão de Segurança */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setPapelUsuario('ADMINISTRADOR')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  !isProdutor ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => setPapelUsuario('PRODUTOR')}
                className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
                  isProdutor ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                Produtor
              </button>
            </div>

            <button
              onClick={() => carregarDados()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPIS ESSENCIAIS DO EVENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">GMV Líquido Confirmado</span>
          <div className="text-2xl font-bold text-white mt-1">
            {formatBRL(rentabilidade?.gmvLiquido)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Venda Bruta: {formatBRL(rentabilidade?.vendasBrutas)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Receita Disk (Take-rate)</span>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {isProdutor ? <span className="text-xs text-amber-400 font-medium">Confidencial</span> : formatBRL(rentabilidade?.receitaContratualDisk)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isProdutor ? 'Segregação ativa' : `${rentabilidade?.takeRateContratualPct}% do GMV contratado`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Margem Operacional Disk</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {isProdutor ? <span className="text-xs text-amber-400 font-medium">Confidencial</span> : formatBRL(rentabilidade?.resultadoOperacaoDisk)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isProdutor ? 'Segregação ativa' : `${rentabilidade?.margemDiskPct}% da receita contratual`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Ponto de Equilíbrio</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {pontoEquilibrio?.pontoEquilibrioIngressos.toLocaleString('pt-BR')} un.
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            Superado em +{pontoEquilibrio?.diferencaMargemSeguranca.toLocaleString('pt-BR')} ingressos
          </div>
        </div>
      </div>

      {/* ABAS DO EVENTO */}
      <div className="flex border-b border-slate-800 space-x-1 pb-1 text-sm font-medium">
        <button
          onClick={() => setAbaAtiva('rentabilidade')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            abaAtiva === 'rentabilidade'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Rentabilidade Real
        </button>

        <button
          onClick={() => setAbaAtiva('receita')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            abaAtiva === 'receita'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Inteligência de Receita & Simulador
        </button>

        <button
          onClick={() => setAbaAtiva('alertas')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            abaAtiva === 'alertas'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alertas com Explicabilidade
        </button>

        <button
          onClick={() => setAbaAtiva('comparativo')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
            abaAtiva === 'comparativo'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Comparativo 2026 × 2025
        </button>
      </div>

      {/* ABA RENTABILIDADE */}
      {abaAtiva === 'rentabilidade' && rentabilidade && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-4">Demonstração de Rentabilidade Real do Evento</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="pb-3">Componente</th>
                    <th className="pb-3 text-right">Valor</th>
                    <th className="pb-3 text-right">% do GMV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 text-slate-200">Vendas Brutas</td>
                    <td className="py-2.5 text-right font-mono">{formatBRL(rentabilidade.vendasBrutas)}</td>
                    <td className="py-2.5 text-right text-slate-400">100.0%</td>
                  </tr>
                  <tr className="text-red-400/90">
                    <td className="py-2.5 pl-4">(-) Estornos e Cancelamentos</td>
                    <td className="py-2.5 text-right font-mono">- {formatBRL(rentabilidade.cancelamentosEstornos)}</td>
                    <td className="py-2.5 text-right">- 3.2%</td>
                  </tr>
                  <tr className="text-red-400/90">
                    <td className="py-2.5 pl-4">(-) Chargebacks</td>
                    <td className="py-2.5 text-right font-mono">- {formatBRL(rentabilidade.chargebacks)}</td>
                    <td className="py-2.5 text-right">- 0.48%</td>
                  </tr>
                  <tr className="bg-slate-800/40 font-bold text-white">
                    <td className="py-3 text-purple-300">(=) GMV LÍQUIDO</td>
                    <td className="py-3 text-right font-mono text-emerald-400">{formatBRL(rentabilidade.gmvLiquido)}</td>
                    <td className="py-3 text-right">96.3%</td>
                  </tr>
                  {!isProdutor ? (
                    <>
                      <tr className="text-sky-300">
                        <td className="py-2.5">Receita Contratual Disk</td>
                        <td className="py-2.5 text-right font-mono">{formatBRL(rentabilidade.receitaContratualDisk)}</td>
                        <td className="py-2.5 text-right">{rentabilidade.takeRateContratualPct}%</td>
                      </tr>
                      <tr className="text-amber-400/90">
                        <td className="py-2.5 pl-4">(-) Custos de Adquirência MDR</td>
                        <td className="py-2.5 text-right font-mono">- {formatBRL(rentabilidade.custosAdquirencia)}</td>
                        <td className="py-2.5 text-right">- {rentabilidade.custosAdquirenciaPct}%</td>
                      </tr>
                      <tr className="text-amber-400/90">
                        <td className="py-2.5 pl-4">(-) Comissões e Operação Atribuível</td>
                        <td className="py-2.5 text-right font-mono">- {formatBRL(rentabilidade.comissoesParceiros + rentabilidade.custosAtribuiveisOperacao)}</td>
                        <td className="py-2.5 text-right">- 1.79%</td>
                      </tr>
                      <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/40 font-bold text-white">
                        <td className="py-3 text-emerald-400">(=) RESULTADO OPERAÇÃO DISK</td>
                        <td className="py-3 text-right font-mono text-xl text-emerald-300">
                          {formatBRL(rentabilidade.resultadoOperacaoDisk)}
                        </td>
                        <td className="py-3 text-right text-emerald-400">{rentabilidade.margemDiskPct}%</td>
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
        </div>
      )}

      {/* ABA RECEITA E SIMULADOR */}
      {abaAtiva === 'receita' && (
        <div className="space-y-6">
          {/* Velocidade e Lotes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Velocidade Atual de Vendas
              </h3>
              <p className="text-xs text-slate-400 mb-4">{velocidade?.textoDescritivo}</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">1 hora</span>
                  <div className="text-base font-bold text-white mt-1">{velocidade?.ultimaHora}</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">6 horas</span>
                  <div className="text-base font-bold text-white mt-1">{velocidade?.ultimas6Horas}</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">24 horas</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">{velocidade?.ultimas24Horas}</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">7 dias</span>
                  <div className="text-base font-bold text-white mt-1">{velocidade?.ultimos7Dias}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Previsão de Esgotamento
              </h3>
              <p className="text-xs text-slate-400 mb-4">{esgotamento?.recomendacaoTexto}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Disponíveis</span>
                  <div className="text-base font-bold text-white mt-1">{esgotamento?.disponibilidadeRestante} un.</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Ritmo</span>
                  <div className="text-base font-bold text-purple-400 mt-1">{esgotamento?.ritmoVendasPorDia}/dia</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">Esgotamento</span>
                  <div className="text-base font-bold text-amber-400 mt-1">~{esgotamento?.diasEstimadosAteEsgotamento} dias</div>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULADOR DE PREÇO */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Simulador de Preço do Próximo Lote
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simule cenários antes de publicar o aumento de lote no catálogo de vendas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400">Preço Atual (R$)</label>
                <input
                  type="number"
                  value={precoAtual}
                  onChange={(e) => setPrecoAtual(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Preço Proposto (R$)</label>
                <input
                  type="number"
                  value={precoProposto}
                  onChange={(e) => setPrecoProposto(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Disponibilidade Restante</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={disponibilidadeRestante}
                    onChange={(e) => setDisponibilidadeRestante(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-red-500/30">
                  <span className="text-xs font-bold text-red-400 uppercase">Conservador</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatBRL(simulacaoResultado.cenarioConservador.projecaoReceitaTotal)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{simulacaoResultado.cenarioConservador.premissa}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40">
                  <span className="text-xs font-bold text-purple-300 uppercase">Base (Mais Provável)</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatBRL(simulacaoResultado.cenarioBase.projecaoReceitaTotal)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{simulacaoResultado.cenarioBase.premissa}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Otimista</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatBRL(simulacaoResultado.cenarioOtimista.projecaoReceitaTotal)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{simulacaoResultado.cenarioOtimista.premissa}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA ALERTAS */}
      {abaAtiva === 'alertas' && (
        <div className="space-y-4">
          {alertas.map((alerta) => (
            <div key={alerta.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-white text-base">{alerta.titulo}</span>
              </div>
              <p className="text-xs text-slate-300">{alerta.descricao}</p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
                <span className="text-purple-400 font-bold">Por que estou vendo isso?</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {alerta.explicabilidade.porQueEstouVendoIsso.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <div className="text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                  Ação recomendada: {alerta.explicabilidade.acaoRecomendada}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA COMPARATIVO */}
      {abaAtiva === 'comparativo' && comparativo && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Métrica</th>
                <th className="py-3 px-4 text-right">Edição 2025</th>
                <th className="py-3 px-4 text-right">Edição Atual 2026</th>
                <th className="py-3 px-4 text-right">Variação %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
              {comparativo.metricas.map((m: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 px-4 text-slate-200">{m.metrica}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">{m.edicaoAnterior}</td>
                  <td className="py-3 px-4 text-right font-mono text-white font-bold">{m.edicaoAtual}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={m.favoravel ? 'text-emerald-400' : 'text-red-400'}>
                      {m.variacaoPct > 0 ? `+${m.variacaoPct}%` : `${m.variacaoPct}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
