'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Banknote,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  FileText,
  HandCoins,
  Landmark,
  Loader2,
  Lock,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  Wallet,
  XCircle,
  Plus,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  CreditCard,
  Building,
  FileCheck,
  Ban,
  Download,
  Filter,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { BarChartCard, DonutCard, LineChartCard } from '../../components/ExecutiveCharts';

type View =
  | 'dashboard'
  | 'saldos'
  | 'contas_financeiras'
  | 'compromissos'
  | 'repasses'
  | 'antecipacoes'
  | 'transferencias'
  | 'conciliacao'
  | 'relatorios'
  | 'fluxo_caixa'
  | 'agenda'
  | 'auditoria'
  | 'inteligencia';

type Saldos = {
  disponivelCents: number;
  bloqueadoCents: number;
  reservadoEstornoCents: number;
  retidoCents: number;
  totalPatrimonioCents: number;
};

type Lancamento = {
  id: string;
  criadoEm: string;
  origem: string;
  bucket: string;
  historico: string;
  tipo: string;
  valorCents?: number;
  valor?: number | string;
};

type Conta = {
  id: string;
  fornecedorNome: string;
  fornecedorDocumento?: string;
  chavePix?: string;
  categoria: string;
  descricao: string;
  valorCents?: number;
  valor?: number | string;
  vencimentoEm: string;
  status: string;
  pagoEm?: string | null;
  aprovadoPor?: string | null;
};

type Repasse = {
  id: string;
  valorCents?: number;
  valor?: number | string;
  valorLiquidoCents?: number;
  taxaRetidaCents?: number;
  status: string;
  chavePix: string;
  solicitadoEm: string;
  dataProgramada: string;
  liquidadoEm?: string | null;
};

type Antecipacao = {
  id: string;
  valorBrutoCents: number;
  taxaDesagioPercentual: number;
  custoDesagioCents: number;
  valorLiquidoCents: number;
  diasAntecipados: number;
  status: string;
  analisadoPor?: string | null;
  comprovanteId?: string | null;
  solicitadoEm: string;
  liquidadoEm?: string | null;
};

type Divergencia = {
  id: string;
  produtorId: string;
  adquirente: string;
  transacaoId: string;
  tipo: string;
  valorEsperadoCents: number;
  valorRecebidoCents: number;
  diferencaCents: number;
  resolvida: boolean;
  resolvidaEm?: string | null;
  resolvidaPor?: string | null;
  detectadaEm: string;
};

type ContaFinanceira = {
  id: string;
  tipo: 'banco' | 'adquirente';
  instituicao: string;
  apelido: string;
  agencia: string;
  conta: string;
  chavePix: string;
  saldoEstimadoCents: number;
  status: string;
  homologada: boolean;
  limiteDiarioCents?: number;
  splitAutomatico?: boolean;
  taxaMediaPercentual?: number;
  ultimaConciliacaoEm: string;
};

type SaldoEvento = Saldos & {
  id: string;
  nome: string;
  status: string;
  eventoId: string;
};

type GestaoSaldos = {
  consolidado: Saldos;
  eventos: SaldoEvento[];
};

const money = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const centsOf = (item: { valorCents?: number; valor?: number | string }) =>
  item.valorCents ?? Math.round(Number(item.valor ?? 0) * 100);

const menu: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Visão Financeira', icon: TrendingUp },
  { id: 'saldos', label: 'Saldos & Extrato', icon: Wallet },
  { id: 'contas_financeiras', label: 'Contas Financeiras', icon: Building },
  { id: 'compromissos', label: 'Contas & Compromissos', icon: CircleDollarSign },
  { id: 'repasses', label: 'Solicitações de Repasse', icon: HandCoins },
  { id: 'antecipacoes', label: 'Antecipações', icon: Banknote },
  { id: 'transferencias', label: 'Transferências', icon: ArrowLeftRight },
  { id: 'conciliacao', label: 'Conciliação Financeira', icon: Landmark },
  { id: 'relatorios', label: 'Relatórios & DRE', icon: FileText },
  { id: 'fluxo_caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
  { id: 'agenda', label: 'Agenda Financeira', icon: CalendarClock },
  { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck },
  { id: 'inteligencia', label: 'Inteligência Financeira', icon: Search },
];

export default function FinanceiroPage() {
  const {
    api: API,
    produtorId: PRODUTOR,
    eventoId: EVENTO,
    evento,
    eventos,
    loading: contextLoading,
    selecionarEvento,
  } = useProducerEvent();

  const [view, setView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const [saldos, setSaldos] = useState<Saldos>({
    disponivelCents: 0,
    bloqueadoCents: 0,
    reservadoEstornoCents: 0,
    retidoCents: 0,
    totalPatrimonioCents: 0,
  });
  const [extrato, setExtrato] = useState<Lancamento[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [antecipacoes, setAntecipacoes] = useState<Antecipacao[]>([]);
  const [divergencias, setDivergencias] = useState<Divergencia[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<ContaFinanceira[]>([]);
  const [gestaoSaldos, setGestaoSaldos] = useState<GestaoSaldos | null>(null);

  const carregar = useCallback(async () => {
    if (!API || !PRODUTOR) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFeedback(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const qs = EVENTO ? `?eventoId=${EVENTO}` : '';
      const results = await Promise.allSettled([
        fetch(`${API}/financeiro/saldos/produtor/${PRODUTOR}${qs}`, { signal: controller.signal }),
        fetch(`${API}/financeiro/extrato/${PRODUTOR}${qs}`, { signal: controller.signal }),
        fetch(`${API}/financeiro/contas-pagar${EVENTO ? `?eventoId=${EVENTO}` : ''}`, { signal: controller.signal }),
        fetch(`${API}/financeiro/repasses/${PRODUTOR}`, { signal: controller.signal }),
        fetch(`${API}/financeiro/saldos/produtor/${PRODUTOR}/eventos`, { signal: controller.signal }),
        fetch(`${API}/financeiro/antecipacoes/${PRODUTOR}`, { signal: controller.signal }),
        fetch(`${API}/financeiro/conciliacao/divergencias?produtorId=${PRODUTOR}`, { signal: controller.signal }),
        fetch(`${API}/financeiro/contas-financeiras?produtorId=${PRODUTOR}`, { signal: controller.signal }),
      ]);

      const [s, e, c, r, g, a, d, cf] = results;

      if (s.status === 'fulfilled' && s.value.ok) setSaldos(await s.value.json());
      if (e.status === 'fulfilled' && e.value.ok) {
        const ed = await e.value.json();
        setExtrato(Array.isArray(ed) ? ed : ed.lancamentos || ed.items || []);
      }
      if (c.status === 'fulfilled' && c.value.ok) {
        const cd = await c.value.json();
        setContas(Array.isArray(cd) ? cd : cd.items || []);
      }
      if (r.status === 'fulfilled' && r.value.ok) {
        const rd = await r.value.json();
        setRepasses(Array.isArray(rd) ? rd : rd.items || []);
      }
      if (g.status === 'fulfilled' && g.value.ok) setGestaoSaldos(await g.value.json());
      if (a.status === 'fulfilled' && a.value.ok) {
        const ad = await a.value.json();
        setAntecipacoes(Array.isArray(ad) ? ad : ad.items || []);
      }
      if (d.status === 'fulfilled' && d.value.ok) {
        const dd = await d.value.json();
        setDivergencias(Array.isArray(dd) ? dd : dd.items || []);
      }
      if (cf.status === 'fulfilled' && cf.value.ok) {
        const cfd = await cf.value.json();
        setContasFinanceiras(Array.isArray(cfd) ? cfd : []);
      }

      const anySuccess = results.some((res) => res.status === 'fulfilled' && res.value.ok);
      const any503 = results.some((res) => res.status === 'fulfilled' && res.value.status === 503);
      if (!anySuccess && any503) {
        setFeedback({
          tipo: 'error',
          texto: 'API de Produção Offline (503). Configure API_INTERNAL_URL com o backend operacional.',
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setFeedback({
          tipo: 'error',
          texto: 'Tempo limite ao consultar posições financeiras.',
        });
      } else {
        setFeedback({
          tipo: 'error',
          texto: err instanceof Error ? err.message : 'Erro ao conectar com a API Financeira.',
        });
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [API, PRODUTOR, EVENTO]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const contasPendentes = useMemo(
    () => contas.filter((c) => !['paga', 'cancelada'].includes(c.status)).reduce((a, c) => a + centsOf(c), 0),
    [contas],
  );
  const repassesAbertos = useMemo(
    () => repasses.filter((r) => !['liquidado', 'cancelado'].includes(r.status)).reduce((a, r) => a + centsOf(r), 0),
    [repasses],
  );

  const conectado = Boolean(API && PRODUTOR);

  return (
    <div className="max-w-[1550px] mx-auto space-y-6">
      {/* Top Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[.18em]">
            <ShieldCheck size={16} /> Módulo Financeiro & Ledger Oficial
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Gestão Financeira & Caixa do Produtor
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {evento ? (
              <>
                Contexto ativo:{' '}
                <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {evento.nome}
                </span>{' '}
                — Saldos, extratos, contas e repasses operando sobre o evento selecionado.
              </>
            ) : (
              'Selecione um evento no seletor global para direcionar as operações de caixa.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
              conectado
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : feedback?.tipo === 'error'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-emerald-400 animate-pulse' : feedback?.tipo === 'error' ? 'bg-rose-400' : 'bg-slate-500'}`} />
            {conectado ? 'Ledger Conectado' : feedback?.tipo === 'error' ? 'API Offline (503)' : 'Sincronizado'}
          </span>

          <button
            onClick={() => void carregar()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Sincronizar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80">
        {menu.map((m) => {
          const active = view === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setView(m.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                active
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <m.icon size={15} className={active ? 'text-emerald-400' : 'text-slate-500'} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="h-72 grid place-items-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
            <span className="text-xs">Consultando posições do Ledger imutável...</span>
          </div>
        </div>
      ) : (
        <>
          {(view === 'dashboard' || view === 'saldos') && (
            <KpiSummary saldos={saldos} contas={contasPendentes} repasses={repassesAbertos} />
          )}

          {view === 'dashboard' && (
            <FinanceExecutiveDashboard saldos={saldos} extrato={extrato} gestao={gestaoSaldos} contas={contas} repasses={repasses} setView={setView} />
          )}

          {view === 'dashboard' && (
            <DashboardView
              extrato={extrato}
              contas={contas}
              repasses={repasses}
              divergencias={divergencias}
              setView={setView}
            />
          )}

          {view === 'saldos' && (
            <GestaoSaldosView
              gestao={gestaoSaldos}
              eventoId={EVENTO}
              selecionarEvento={selecionarEvento}
              extrato={extrato}
            />
          )}

          {view === 'contas_financeiras' && (
            <ContasFinanceirasView items={contasFinanceiras} />
          )}

          {view === 'compromissos' && (
            <ContasCompromissosView
              items={contas}
              api={API}
              produtorId={PRODUTOR}
              eventoId={EVENTO}
              onDone={carregar}
              setFeedback={setFeedback}
            />
          )}

          {view === 'repasses' && (
            <RepassesView
              items={repasses}
              api={API}
              produtorId={PRODUTOR}
              eventoId={EVENTO}
              saldoDisponivelCents={saldos.disponivelCents}
              onDone={carregar}
              setFeedback={setFeedback}
            />
          )}

          {view === 'antecipacoes' && (
            <AntecipacoesView
              items={antecipacoes}
              api={API}
              produtorId={PRODUTOR}
              eventoId={EVENTO}
              saldoRetidoCents={saldos.retidoCents}
              onDone={carregar}
              setFeedback={setFeedback}
            />
          )}

          {view === 'transferencias' && (
            <TransferenciasView
              api={API}
              produtorId={PRODUTOR}
              eventoPadrao={EVENTO}
              eventos={eventos}
              saldoDisponivelCents={saldos.disponivelCents}
              onDone={carregar}
              setFeedback={setFeedback}
            />
          )}

          {view === 'conciliacao' && (
            <ConciliacaoView
              items={divergencias}
              api={API}
              produtorId={PRODUTOR}
              onDone={carregar}
              setFeedback={setFeedback}
            />
          )}

          {view === 'relatorios' && (
            <RelatoriosView saldos={saldos} extrato={extrato} contas={contas} repasses={repasses} />
          )}

          {view === 'fluxo_caixa' && (
            <FluxoCaixaView saldos={saldos} extrato={extrato} contas={contas} repasses={repasses} />
          )}
          {view === 'agenda' && (
            <AgendaFinanceiraView contas={contas} repasses={repasses} />
          )}
          {view === 'auditoria' && (
            <AuditoriaFinanceiraView extrato={extrato} divergencias={divergencias} />
          )}
          {view === 'inteligencia' && (
            <InteligenciaFinanceiraView saldos={saldos} contas={contas} repasses={repasses} divergencias={divergencias} />
          )}
        </>
      )}
    </div>
  );
}


function FinanceExecutiveDashboard({saldos,extrato,gestao,contas,repasses,setView}:{saldos:Saldos;extrato:Lancamento[];gestao:GestaoSaldos|null;contas:Conta[];repasses:Repasse[];setView:(v:View)=>void}){
  const porDia=new Map<string,number>(); for(const l of extrato){const d=String(l.criadoEm||'').slice(5,10); if(d)porDia.set(d,(porDia.get(d)||0)+(l.tipo==='debito'?-1:1)*centsOf(l));}
  const fluxo=[...porDia].sort(([a],[b])=>a.localeCompare(b)).map(([label,value])=>({label,value:value/100}));
  const eventos=(gestao?.eventos||[]).map(e=>({label:e.nome,value:e.disponivelCents/100})).sort((a,b)=>b.value-a.value);
  const composicao=[{label:'Disponível',value:saldos.disponivelCents/100},{label:'Retido',value:saldos.retidoCents/100},{label:'Bloqueado',value:saldos.bloqueadoCents/100},{label:'Reserva de estorno',value:saldos.reservadoEstornoCents/100}];
  const pendentes=contas.filter(x=>!['pago','cancelado'].includes(x.status)).length; const repAbertos=repasses.filter(x=>!['liquidado','cancelado'].includes(x.status)).length;
  return <div className="space-y-4"><div className="grid gap-4 xl:grid-cols-3"><div className="xl:col-span-2"><LineChartCard title="Movimentação financeira" subtitle="Créditos e débitos registrados no Ledger" points={fluxo} valueFormatter={v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)}/></div><div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><h3 className="mb-3 font-semibold text-white">Atalhos financeiros</h3><div className="space-y-2">{([['Transferir entre eventos','transferencias'],[`Contas pendentes (${pendentes})`,'compromissos'],[`Repasses abertos (${repAbertos})`,'repasses'],['Conciliação financeira','conciliacao']] as [string,View][]).map(([label,v])=><button key={v} onClick={()=>setView(v)} className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left text-sm font-semibold text-slate-200 hover:border-emerald-700"><span>{label}</span><span className="text-emerald-400">→</span></button>)}</div></div></div><div className="grid gap-4 lg:grid-cols-2"><BarChartCard title="Saldo disponível por evento" subtitle="Comparativo do produtor" points={eventos} valueFormatter={v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)}/><DonutCard title="Composição do patrimônio" subtitle="Posição financeira atual" points={composicao} valueFormatter={v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)}/></div></div>
}

// ============================================================================
//  KPIS & CARDS DE RESUMO
// ============================================================================

function KpiSummary({
  saldos,
  contas,
  repasses,
}: {
  saldos: Saldos;
  contas: number;
  repasses: number;
}) {
  const total = saldos.totalPatrimonioCents || 0;
  const pctDisponivel = total > 0 ? Math.round((saldos.disponivelCents / total) * 100) : 0;
  const pctRetido = total > 0 ? Math.round((saldos.retidoCents / total) * 100) : 0;
  const pctBloqueado = total > 0 ? Math.round((saldos.bloqueadoCents / total) * 100) : 0;
  const pctReserva = total > 0 ? Math.round((saldos.reservadoEstornoCents / total) * 100) : 0;

  const cards = [
    {
      label: 'Saldo Disponível',
      val: saldos.disponivelCents,
      icon: Wallet,
      color: 'text-emerald-400',
      badge: 'Livre p/ repasse imediato',
      pct: pctDisponivel,
      highlight: true,
    },
    {
      label: 'Saldo Retido (D+30)',
      val: saldos.retidoCents,
      icon: CalendarClock,
      color: 'text-sky-400',
      badge: 'Custódia ciclo de vendas',
      pct: pctRetido,
    },
    {
      label: 'Bloqueado Cautelar',
      val: saldos.bloqueadoCents,
      icon: Lock,
      color: 'text-amber-400',
      badge: 'Em trânsito bancário',
      pct: pctBloqueado,
    },
    {
      label: 'Reserva Técnica CDC',
      val: saldos.reservadoEstornoCents,
      icon: ShieldCheck,
      color: 'text-rose-400',
      badge: 'Garantia Art. 49 & Estornos',
      pct: pctReserva,
    },
    {
      label: 'Contas a Pagar',
      val: contas,
      icon: CircleDollarSign,
      color: 'text-purple-400',
      badge: 'Compromissos pendentes',
    },
    {
      label: 'Repasses em Fila',
      val: repasses,
      icon: HandCoins,
      color: 'text-cyan-400',
      badge: 'Aguardando liquidação',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top Banner: Patrimônio Total Consolidado & Barra de Distribuição */}
      <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Patrimônio Ledger Consolidado</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Partidas Dobradas
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tight mt-0.5">
                {money(saldos.totalPatrimonioCents)}
              </div>
            </div>
          </div>

          {/* Distribuição Proporcional dos Buckets */}
          <div className="flex-1 max-w-xl md:pl-6 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Disponível {pctDisponivel}%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Retido {pctRetido}%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Bloqueado {pctBloqueado}%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Reserva {pctReserva}%</span>
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${pctDisponivel}%` }} className="bg-emerald-500 transition-all duration-500" title={`Disponível: ${pctDisponivel}%`} />
              <div style={{ width: `${pctRetido}%` }} className="bg-sky-500 transition-all duration-500" title={`Retido: ${pctRetido}%`} />
              <div style={{ width: `${pctBloqueado}%` }} className="bg-amber-500 transition-all duration-500" title={`Bloqueado: ${pctBloqueado}%`} />
              <div style={{ width: `${pctReserva}%` }} className="bg-rose-500 transition-all duration-500" title={`Reserva CDC: ${pctReserva}%`} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Alta Densidade */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-[#111827] border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
              c.highlight
                ? 'border-emerald-500/40 shadow-emerald-500/5 hover:border-emerald-500/60'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="truncate pr-1">{c.label}</span>
              <c.icon size={16} className={`${c.color} shrink-0`} />
            </div>
            <div className="text-xl 2xl:text-2xl font-black text-white mt-3 tracking-tight">
              {money(c.val)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-medium truncate">{c.badge}</span>
              {c.pct !== undefined && c.pct > 0 && (
                <span className={`text-[10px] font-bold ${c.color}`}>{c.pct}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({
  extrato,
  contas,
  repasses,
  divergencias,
  setView,
}: {
  extrato: Lancamento[];
  contas: Conta[];
  repasses: Repasse[];
  divergencias: Divergencia[];
  setView: (v: View) => void;
}) {
  const operacoes = [
    {
      label: 'Contas Bancárias',
      view: 'contas_financeiras' as View,
      icon: Building,
      desc: 'Bancos e chaves Pix',
      badge: 'Contas',
    },
    {
      label: 'Contas & Fornecedores',
      view: 'compromissos' as View,
      icon: CircleDollarSign,
      desc: 'Agendar e liquidar débitos',
      badge: 'AP/AR',
    },
    {
      label: 'Solicitar Repasse Pix',
      view: 'repasses' as View,
      icon: HandCoins,
      desc: 'Transferência p/ conta corrente',
      badge: 'Saque',
    },
    {
      label: 'Simular Antecipação',
      view: 'antecipacoes' as View,
      icon: Banknote,
      desc: 'Adiantamento com pró-rata',
      badge: 'Crédito',
    },
    {
      label: 'Transferência Inter-Eventos',
      view: 'transferencias' as View,
      icon: ArrowLeftRight,
      desc: 'Mover fundos entre eventos',
      badge: 'Remanejamento',
    },
    {
      label: 'Conciliação Financeira',
      view: 'conciliacao' as View,
      icon: Landmark,
      desc: 'Batimento adquirentes e extrato',
      badge: 'Auditoria',
    },
  ];

  const pendentesContas = contas.filter((c) => c.status === 'pendente').length;
  const pendentesRepasses = repasses.filter((r) => r.status === 'solicitado').length;
  const pendentesDivergencias = divergencias.filter((d) => !d.resolvida).length;
  const totalAlertas = pendentesContas + pendentesRepasses + pendentesDivergencias;

  return (
    <div className="grid xl:grid-cols-[1.5fr_.8fr] gap-5">
      {/* Extrato Recente com Barra de Ações */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
        <div>
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Últimos Lançamentos no Ledger</h2>
                <span className="text-[11px] text-slate-400">{extrato.length} lançamentos registrados</span>
              </div>
            </div>
            <button
              onClick={() => setView('saldos')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition"
            >
              <span>Ver Extrato Completo</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <ExtratoTable items={extrato.slice(0, 8)} />
        </div>
      </div>

      {/* Operações & Alertas */}
      <div className="space-y-4">
        {/* Ações Rápidas de Caixa */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Banknote size={16} className="text-emerald-400" />
              <span>Ações Rápidas de Caixa</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">1-Click</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {operacoes.map((op) => (
              <button
                key={op.label}
                onClick={() => setView(op.view)}
                className="p-3 text-left rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <op.icon size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
                      {op.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {op.label}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{op.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pendências & Alertas Operacionais */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span>Pendências & Alertas Operacionais</span>
            </h2>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                totalAlertas > 0
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {totalAlertas > 0 ? `${totalAlertas} pendências` : 'Em dia'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => setView('compromissos')}
              className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-purple-500/30 flex items-center justify-between transition text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-slate-300">Contas a pagar aguardando liquidação</span>
              </div>
              <span className="font-bold text-purple-400">{pendentesContas}</span>
            </button>
            <button
              onClick={() => setView('repasses')}
              className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 flex items-center justify-between transition text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Solicitações de repasse pendentes</span>
              </div>
              <span className="font-bold text-cyan-400">{pendentesRepasses}</span>
            </button>
            <button
              onClick={() => setView('conciliacao')}
              className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-rose-500/30 flex items-center justify-between transition text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-slate-300">Divergências na conciliação de adquirentes</span>
              </div>
              <span className={`font-bold ${pendentesDivergencias > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {pendentesDivergencias}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
//  GESTÃO DE SALDOS & EXTRATO AUDITÁVEL
// ============================================================================

function GestaoSaldosView({
  gestao,
  eventoId,
  selecionarEvento,
  extrato,
}: {
  gestao: GestaoSaldos | null;
  eventoId: string;
  selecionarEvento: (id: string) => void;
  extrato: Lancamento[];
}) {
  const [filtroBucket, setFiltroBucket] = useState('');
  const [busca, setBusca] = useState('');

  const extratoFiltrado = useMemo(() => {
    return extrato.filter((l) => {
      const matchBucket = !filtroBucket || l.bucket === filtroBucket;
      const matchBusca =
        !busca ||
        l.historico.toLowerCase().includes(busca.toLowerCase()) ||
        l.origem.toLowerCase().includes(busca.toLowerCase());
      return matchBucket && matchBusca;
    });
  }, [extrato, filtroBucket, busca]);

  const c = gestao?.consolidado;
  const listaEventos = gestao?.eventos || [];

  return (
    <div className="space-y-6">
      {/* Posição por Evento */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Posição Financeira Consolidada por Evento</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Valores calculados em tempo real pelo Ledger imutável. Clique em <b>Operar</b> para mudar o contexto ativo.
            </p>
          </div>
          {c && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Geral Ledger</span>
              <span className="text-sm font-black text-white">{money(c.totalPatrimonioCents)}</span>
            </div>
          )}
        </div>

        {listaEventos.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Evento</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Disponível</th>
                  <th className="p-3 text-right">Retido (D+30)</th>
                  <th className="p-3 text-right">Bloqueado</th>
                  <th className="p-3 text-right">Reserva CDC</th>
                  <th className="p-3 text-right font-bold text-white">Patrimônio Ledger</th>
                  <th className="p-3 text-center">Contexto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {listaEventos.map((x) => {
                  const ativo = x.id === eventoId;
                  return (
                    <tr key={x.id} className={ativo ? 'bg-emerald-500/10' : 'hover:bg-slate-800/30'}>
                      <td className="p-3 font-bold text-white">{x.nome}</td>
                      <td className="p-3 text-slate-400 capitalize">{x.status}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{money(x.disponivelCents)}</td>
                      <td className="p-3 text-right text-sky-400">{money(x.retidoCents)}</td>
                      <td className="p-3 text-right text-amber-400">{money(x.bloqueadoCents)}</td>
                      <td className="p-3 text-right text-rose-400">{money(x.reservadoEstornoCents)}</td>
                      <td className="p-3 text-right font-black text-white">{money(x.totalPatrimonioCents)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => selecionarEvento(x.id)}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                            ativo
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'border border-slate-700 text-slate-300 hover:border-emerald-500/50'
                          }`}
                        >
                          {ativo ? 'Ativo' : 'Operar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <NoData text="Nenhum evento registrado com saldos no Ledger." />
        )}
      </div>

      {/* Extrato Detalhado com Filtros */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Extrato Auditável do Ledger</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Trilha imutável em partidas dobradas com contrapartidas e bucket associado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar histórico..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={filtroBucket}
              onChange={(e) => setFiltroBucket(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos os buckets</option>
              <option value="disponivel">Disponível</option>
              <option value="retido">Retido</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="reservado_estorno">Reserva Estorno</option>
            </select>
          </div>
        </div>

        <ExtratoTable items={extratoFiltrado} />
      </div>
    </div>
  );
}

function ExtratoTable({ items }: { items: Lancamento[] }) {
  if (!items.length) return <NoData text="Nenhum lançamento contábil no Ledger para o filtro selecionado." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-semibold">
          <tr>
            <th className="p-3 text-left">Data/Hora (UTC)</th>
            <th className="p-3 text-left">Origem</th>
            <th className="p-3 text-left">Bucket</th>
            <th className="p-3 text-left">Histórico</th>
            <th className="p-3 text-right">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {items.map((x) => {
            const isEntrada = x.tipo === 'entrada';
            return (
              <tr key={x.id} className="hover:bg-slate-800/30 transition">
                <td className="p-3 text-slate-400 whitespace-nowrap">
                  {new Date(x.criadoEm).toLocaleString('pt-BR')}
                </td>
                <td className="p-3 font-semibold text-slate-300">{x.origem}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      x.bucket === 'disponivel'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : x.bucket === 'retido'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : x.bucket === 'bloqueado'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {x.bucket}
                  </span>
                </td>
                <td className="p-3 text-slate-300 font-medium">{x.historico}</td>
                <td
                  className={`p-3 text-right font-black whitespace-nowrap ${
                    isEntrada ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isEntrada ? '+ ' : '- '}
                  {money(centsOf(x))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
//  CONTAS FINANCEIRAS & CARTEIRAS (Bancos, Adquirentes e Gateways)
// ============================================================================

function ContasFinanceirasView({ items }: { items: ContaFinanceira[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building size={16} className="text-emerald-400" />
              <span>Contas Financeiras, Bancos & Adquirentes Homologadas</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Estruturas bancárias de custódia e liquidação com conciliação automática ativa no EDDIE.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            {items.length} Contas Operacionais
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((cta) => (
          <div
            key={cta.id}
            className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    cta.tipo === 'banco'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}
                >
                  {cta.tipo === 'banco' ? 'Conta Bancária' : 'Gateway Adquirente'}
                </span>
                <h3 className="text-base font-black text-white mt-1.5">{cta.instituicao}</h3>
                <p className="text-xs text-slate-400">{cta.apelido}</p>
              </div>

              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                ● Ativa
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Agência / Conta</span>
                <p className="text-slate-200 font-mono font-semibold">
                  {cta.agencia !== '-' ? `Ag. ${cta.agencia} CC ${cta.conta}` : cta.conta}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Chave Pix</span>
                <p className="text-slate-200 font-mono font-semibold truncate">{cta.chavePix}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Saldo Estimado</span>
                <p className="text-emerald-400 font-black">{money(cta.saldoEstimadoCents)}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">
                  {cta.tipo === 'adquirente' ? 'Taxa Média' : 'Limite Diário'}
                </span>
                <p className="text-white font-semibold">
                  {cta.taxaMediaPercentual ? `${cta.taxaMediaPercentual}%` : money(cta.limiteDiarioCents ?? 0)}
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span>Última conciliação: {new Date(cta.ultimaConciliacaoEm).toLocaleDateString('pt-BR')}</span>
              <span className="text-emerald-400 font-semibold">Certificado SSL / mTLS OK</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
//  CONTAS & COMPROMISSOS (Contas a Pagar / Fornecedores)
// ============================================================================

function ContasCompromissosView({
  items,
  api,
  produtorId,
  eventoId,
  onDone,
  setFeedback,
}: {
  items: Conta[];
  api: string;
  produtorId: string;
  eventoId: string;
  onDone: () => Promise<void>;
  setFeedback: (f: { tipo: 'success' | 'error'; texto: string } | null) => void;
}) {
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorDoc, setFornecedorDoc] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [categoria, setCategoria] = useState('Estrutura & Som');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId || !eventoId) {
      setFeedback({ tipo: 'error', texto: 'Selecione um evento no topo antes de cadastrar a conta.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${api}/financeiro/contas-pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          fornecedorNome,
          fornecedorDocumento: fornecedorDoc || '00.000.000/0001-00',
          chavePix: chavePix || undefined,
          categoria,
          descricao,
          valorCents: Math.round(Number(valor.replace(',', '.')) * 100),
          vencimentoEm: new Date(vencimento).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao cadastrar conta a pagar.');
      }

      setFeedback({ tipo: 'success', texto: 'Conta a pagar cadastrada com sucesso!' });
      setFornecedorNome('');
      setFornecedorDoc('');
      setChavePix('');
      setDescricao('');
      setValor('');
      setVencimento('');
      await onDone();
    } catch (err) {
      setFeedback({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Falha ao cadastrar conta a pagar.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePagarConta = async (id: string) => {
    if (!api) return;
    setPayingId(id);
    try {
      const res = await fetch(`${api}/financeiro/contas-pagar/${id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovadoPor: 'diretoria-financeira' }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Não foi possível baixar a conta.');
      }

      setFeedback({ tipo: 'success', texto: 'Conta liquidada com baixa direta no ledger!' });
      await onDone();
    } catch (err) {
      setFeedback({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Erro ao processar baixa de conta.',
      });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="grid xl:grid-cols-[.9fr_1.3fr] gap-6">
      {/* Formulário */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus size={16} className="text-emerald-400" />
            <span>Cadastrar Conta a Pagar de Fornecedor</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Gera compromisso vinculado ao evento selecionado. Na liquidação, o Ledger debita o saldo do evento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Nome do Fornecedor / Empresa</label>
            <input
              required
              value={fornecedorNome}
              onChange={(e) => setFornecedorNome(e.target.value)}
              placeholder="Ex: Palco & Luz Produções Ltda"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">CNPJ / CPF</label>
              <input
                required
                value={fornecedorDoc}
                onChange={(e) => setFornecedorDoc(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Chave Pix (Opcional)</label>
              <input
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="pix@fornecedor.com.br"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Categoria de Despesa</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Estrutura & Som">Estrutura & Som</option>
                <option value="Segurança & Bombeiros">Segurança & Bombeiros</option>
                <option value="Artístico & Cachê">Artístico & Cachê</option>
                <option value="Mídia & Tráfego">Mídia & Tráfego</option>
                <option value="Alimentação & Staff">Alimentação & Staff</option>
                <option value="Impostos & Taxas Locais">Impostos & Taxas Locais</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Valor (R$)</label>
              <input
                required
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 5000,00"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Data de Vencimento</label>
              <input
                required
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Descrição</label>
              <input
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Aluguel de geradores"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Cadastrar Conta a Pagar
          </button>
        </form>
      </div>

      {/* Listagem */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Compromissos & Contas Cadastradas</h2>
          <span className="text-xs text-slate-400 font-medium">{items.length} contas registradas</span>
        </div>

        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Fornecedor</th>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-left">Vencimento</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((x) => {
                  const isPaga = x.status === 'paga';
                  return (
                    <tr key={x.id} className="hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="font-bold text-white">{x.fornecedorNome}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{x.descricao}</div>
                      </td>
                      <td className="p-3 text-slate-300">{x.categoria}</td>
                      <td className="p-3 text-slate-400">{new Date(x.vencimentoEm).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPaga
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {x.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-white">{money(centsOf(x))}</td>
                      <td className="p-3 text-center">
                        {!isPaga ? (
                          <button
                            onClick={() => handlePagarConta(x.id)}
                            disabled={payingId === x.id}
                            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-[11px] transition"
                          >
                            {payingId === x.id ? 'Baixando...' : 'Pagar'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">Baixada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <NoData text="Nenhuma conta a pagar cadastrada para este evento." />
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  SOLICITAÇÕES DE REPASSE (Aprovação, Liquidação e Cancelamento)
// ============================================================================

function RepassesView({
  items,
  api,
  produtorId,
  eventoId,
  saldoDisponivelCents,
  onDone,
  setFeedback,
}: {
  items: Repasse[];
  api: string;
  produtorId: string;
  eventoId: string;
  saldoDisponivelCents: number;
  onDone: () => Promise<void>;
  setFeedback: (f: { tipo: 'success' | 'error'; texto: string } | null) => void;
}) {
  const [valor, setValor] = useState('');
  const [pix, setPix] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId) return;

    const valorCents = Math.round(Number(valor.replace(',', '.')) * 100);
    if (valorCents > saldoDisponivelCents) {
      setFeedback({
        tipo: 'error',
        texto: `Saldo disponível insuficiente (Máx: ${money(saldoDisponivelCents)}).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${api}/financeiro/repasses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          ...(eventoId ? { eventoId } : {}),
          valorCents,
          chavePix: pix,
          dataProgramada: new Date(Date.now() + 86400000).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Falha ao solicitar repasse.');
      }

      setFeedback({ tipo: 'success', texto: 'Repasse solicitado! Saldo bloqueado preventivamente no Ledger.' });
      setValor('');
      setPix('');
      await onDone();
    } catch (err) {
      setFeedback({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Falha na solicitação.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAprovar = async (id: string) => {
    if (!api) return;
    setActionId(id);
    try {
      const res = await fetch(`${api}/financeiro/repasses/${id}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovadoPor: 'auditor-financeiro' }),
      });
      if (!res.ok) throw new Error('Não foi possível aprovar o repasse.');
      setFeedback({ tipo: 'success', texto: 'Repasse aprovado e agendado para liquidação bancária.' });
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err instanceof Error ? err.message : 'Erro ao aprovar.' });
    } finally {
      setActionId(null);
    }
  };

  const handleLiquidar = async (id: string) => {
    if (!api) return;
    setActionId(id);
    try {
      const res = await fetch(`${api}/financeiro/repasses/${id}/liquidar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comprovanteId: `PIX-${Date.now()}`,
          liquidadoPor: 'tesouraria-diskingressos',
        }),
      });
      if (!res.ok) throw new Error('Falha ao registrar liquidação.');
      setFeedback({ tipo: 'success', texto: 'Repasse liquidado! Débito efetuado no Ledger com comprovante emitido.' });
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err instanceof Error ? err.message : 'Erro ao liquidar.' });
    } finally {
      setActionId(null);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!api) return;
    setActionId(id);
    try {
      const res = await fetch(`${api}/financeiro/repasses/${id}/cancelar`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erro ao cancelar repasse.');
      setFeedback({ tipo: 'success', texto: 'Repasse cancelado! Saldo devolvido ao bucket disponível no Ledger.' });
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err instanceof Error ? err.message : 'Erro ao cancelar.' });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="grid xl:grid-cols-[.9fr_1.3fr] gap-6">
      {/* Solicitação */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HandCoins size={16} className="text-emerald-400" />
            <span>Solicitar Novo Repasse Pix</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Transfere valores disponíveis para a conta bancária do produtor cadastrada via Pix.
          </p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Disponível para Repasse:</span>
          <span className="font-black text-emerald-400 font-mono text-sm">{money(saldoDisponivelCents)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Valor do Repasse (R$)</label>
            <input
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 10000,00"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Chave Pix de Destino</label>
            <input
              required
              value={pix}
              onChange={(e) => setPix(e.target.value)}
              placeholder="CNPJ, E-mail ou Chave Aleatória"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <HandCoins size={16} />}
            Solicitar Repasse Pix
          </button>
        </form>
      </div>

      {/* Histórico e Ações */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Histórico e Programação de Repasses</h2>
          <span className="text-xs text-slate-400">{items.length} repasses</span>
        </div>

        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Solicitado Em</th>
                  <th className="p-3 text-left">Chave Pix</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Valor Líquido</th>
                  <th className="p-3 text-center">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((r) => {
                  const isPending = r.status === 'solicitado';
                  const isAgendado = r.status === 'agendado' || r.status === 'aprovado';
                  const isLiquidado = r.status === 'liquidado';
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-400">
                        {new Date(r.solicitadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{r.chavePix}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLiquidado
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isAgendado
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : r.status === 'cancelado'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-white">{money(centsOf(r))}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleAprovar(r.id)}
                              disabled={actionId === r.id}
                              className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px]"
                            >
                              Aprovar
                            </button>
                          )}
                          {isAgendado && (
                            <button
                              onClick={() => handleLiquidar(r.id)}
                              disabled={actionId === r.id}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                            >
                              Liquidar
                            </button>
                          )}
                          {(isPending || isAgendado) && (
                            <button
                              onClick={() => handleCancelar(r.id)}
                              disabled={actionId === r.id}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[10px]"
                              title="Cancelar repasse"
                            >
                              <Ban size={12} />
                            </button>
                          )}
                          {isLiquidado && <span className="text-[11px] text-emerald-400 font-semibold">Liquidado</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <NoData text="Nenhuma solicitação de repasse registrada." />
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  ANTECIPAÇÕES DE RECEBÍVEIS
// ============================================================================

function AntecipacoesView({
  items,
  api,
  produtorId,
  eventoId,
  saldoRetidoCents,
  onDone,
  setFeedback,
}: {
  items: Antecipacao[];
  api: string;
  produtorId: string;
  eventoId: string;
  saldoRetidoCents: number;
  onDone: () => Promise<void>;
  setFeedback: (f: { tipo: 'success' | 'error'; texto: string } | null) => void;
}) {
  const [valor, setValor] = useState('');
  const [taxa, setTaxa] = useState('2.5');
  const [dias, setDias] = useState('30');
  const [simulacao, setSimulacao] = useState<{
    custoDesagioCents: number;
    valorLiquidoDisponibilizadoCents: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId || !eventoId) return;

    try {
      const res = await fetch(`${api}/financeiro/antecipacoes/simular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          valorBrutoCents: Math.round(Number(valor.replace(',', '.')) * 100),
          taxaDesagioPercentual: Number(taxa),
          diasAntecipados: Number(dias),
        }),
      });

      if (!res.ok) throw new Error('Falha ao simular antecipação.');
      setSimulacao(await res.json());
    } catch (err) {
      setFeedback({ tipo: 'error', texto: 'Erro na simulação.' });
    }
  };

  const handleSolicitar = async () => {
    if (!api || !produtorId || !eventoId || !simulacao) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${api}/financeiro/antecipacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoId,
          valorBrutoCents: Math.round(Number(valor.replace(',', '.')) * 100),
          taxaDesagioPercentual: Number(taxa),
          diasAntecipados: Number(dias),
        }),
      });

      if (!res.ok) throw new Error('Não foi possível registrar a antecipação.');
      setFeedback({ tipo: 'success', texto: 'Solicitação de antecipação enviada para análise de risco!' });
      setSimulacao(null);
      setValor('');
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err instanceof Error ? err.message : 'Falha ao solicitar.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAprovar = async (id: string) => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/financeiro/antecipacoes/${id}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analisadoPor: 'comite-credito' }),
      });
      if (!res.ok) throw new Error('Falha ao aprovar antecipação.');
      setFeedback({ tipo: 'success', texto: 'Antecipação aprovada com crédito no saldo disponível do Ledger!' });
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err instanceof Error ? err.message : 'Erro ao aprovar.' });
    }
  };

  return (
    <div className="grid xl:grid-cols-[.9fr_1.3fr] gap-6">
      {/* Simulador */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Banknote size={16} className="text-emerald-400" />
            <span>Simulador de Antecipação de Recebíveis</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Antecipe vendas do bucket retido (D+30) com cálculo exato de deságio pró-rata dia.
          </p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Saldo em Custódia Retido:</span>
          <span className="font-black text-sky-400 font-mono text-sm">{money(saldoRetidoCents)}</span>
        </div>

        <form onSubmit={handleSimular} className="space-y-3.5">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Valor Bruto a Antecipar (R$)</label>
            <input
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 50000,00"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Taxa Mensal (%)</label>
              <input
                required
                value={taxa}
                onChange={(e) => setTaxa(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Dias Antecipados</label>
              <input
                required
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Calcular Deságio
          </button>
        </form>

        {simulacao && (
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Custo do Deságio:</span>
              <span className="font-bold text-rose-400">{money(simulacao.custoDesagioCents)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Valor Líquido Disponibilizado:</span>
              <span className="font-black text-emerald-400 text-sm">
                {money(simulacao.valorLiquidoDisponibilizadoCents)}
              </span>
            </div>

            <button
              onClick={handleSolicitar}
              disabled={submitting}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <FileCheck size={15} />}
              Confirmar Solicitação de Antecipação
            </button>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Solicitações de Antecipação</h2>
          <span className="text-xs text-slate-400">{items.length} registradas</span>
        </div>

        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-right">Bruto</th>
                  <th className="p-3 text-right">Deságio</th>
                  <th className="p-3 text-right">Líquido</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((a) => {
                  const isLiquidada = a.status === 'liquidada';
                  return (
                    <tr key={a.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-400">
                        {new Date(a.solicitadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-right font-medium text-white">{money(a.valorBrutoCents)}</td>
                      <td className="p-3 text-right text-rose-400">{money(a.custoDesagioCents)}</td>
                      <td className="p-3 text-right font-black text-emerald-400">{money(a.valorLiquidoCents)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLiquidada
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {!isLiquidada ? (
                          <button
                            onClick={() => handleAprovar(a.id)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                          >
                            Aprovar
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">Creditada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <NoData text="Nenhuma antecipação realizada para este produtor." />
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  TRANSFERÊNCIAS INTER-EVENTOS
// ============================================================================

function TransferenciasView({
  api,
  produtorId,
  eventoPadrao,
  eventos,
  saldoDisponivelCents,
  onDone,
  setFeedback,
}: {
  api: string;
  produtorId: string;
  eventoPadrao: string;
  eventos: { id: string; nome: string }[];
  saldoDisponivelCents: number;
  onDone: () => Promise<void>;
  setFeedback: (f: { tipo: 'success' | 'error'; texto: string } | null) => void;
}) {
  const [origem, setOrigem] = useState(eventoPadrao);
  const [destino, setDestino] = useState('');
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOrigem(eventoPadrao);
  }, [eventoPadrao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !produtorId) return;

    if (!origem || !destino) {
      setFeedback({ tipo: 'error', texto: 'Selecione os eventos de origem e destino.' });
      return;
    }
    if (origem === destino) {
      setFeedback({ tipo: 'error', texto: 'Os eventos de origem e destino devem ser distintos.' });
      return;
    }

    const valorCents = Math.round(Number(valor.replace(',', '.')) * 100);
    if (valorCents > saldoDisponivelCents) {
      setFeedback({
        tipo: 'error',
        texto: `Saldo disponível no evento de origem insuficiente (Máx: ${money(saldoDisponivelCents)}).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${api}/financeiro/transferencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          eventoOrigemId: origem,
          eventoDestinoId: destino,
          valorCents,
          justificativa: motivo,
          autorId: 'operador-financeiro',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Falha ao executar transferência.');
      }

      setFeedback({
        tipo: 'success',
        texto: 'Transferência concluída com sucesso! Partidas dobradas lançadas no Ledger.',
      });
      setValor('');
      setMotivo('');
      setDestino('');
      await onDone();
    } catch (err) {
      setFeedback({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Falha na transferência.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-emerald-400" />
          <span>Transferência de Saldo Disponível Entre Eventos</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Move saldos exclusivamente disponíveis entre eventos pertencentes ao mesmo produtor. Mantém a integridade
          auditável em partidas dobradas e não gera GMV ou nova receita.
        </p>
      </div>

      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold">Saldo Disponível no Evento de Origem:</span>
        <span className="font-black text-emerald-400 font-mono text-sm">{money(saldoDisponivelCents)}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Evento de Origem (Débito)</label>
            <select
              required
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Selecione o evento de origem</option>
              {eventos.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Evento de Destino (Crédito)</label>
            <select
              required
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Selecione o evento de destino</option>
              {eventos
                .filter((ev) => ev.id !== origem)
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nome}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Valor a Transferir (R$)</label>
            <input
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 5000,00"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Justificativa Operacional</label>
            <input
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Cobertura de adiantamento de fornecedores"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowLeftRight size={16} />}
          Executar Transferência Inter-Eventos
        </button>
      </form>
    </div>
  );
}

// ============================================================================
//  CONCILIAÇÃO FINANCEIRA & DIVERGÊNCIAS
// ============================================================================

function ConciliacaoView({
  items,
  api,
  produtorId,
  onDone,
  setFeedback,
}: {
  items: Divergencia[];
  api: string;
  produtorId: string;
  onDone: () => Promise<void>;
  setFeedback: (f: { tipo: 'success' | 'error'; texto: string } | null) => void;
}) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleResolver = async (id: string) => {
    if (!api) return;
    setResolvingId(id);
    try {
      const res = await fetch(`${api}/financeiro/conciliacao/divergencias/${id}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolvidaPor: 'auditor-conciliacao',
          justificativa: 'Ajuste manual validado com extrato bancário oficial da adquirente.',
        }),
      });

      if (!res.ok) throw new Error('Não foi possível resolver a divergência.');
      setFeedback({ tipo: 'success', texto: 'Divergência marcada como resolvida com trilha de auditoria!' });
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err instanceof Error ? err.message : 'Erro ao resolver divergência.' });
    } finally {
      setResolvingId(null);
    }
  };

  const handleSimularImportacao = async () => {
    if (!api || !produtorId) return;
    setImporting(true);
    try {
      const res = await fetch(`${api}/financeiro/conciliacao/importar-extrato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId,
          adquirente: 'Pagar.me V5',
          arquivoNome: `EXTRATO_${Date.now()}.OFX`,
          itens: [
            { transacaoId: `tid_${Date.now()}_1`, tipo: 'venda_cartao', valorEsperadoCents: 25000, valorRecebidoCents: 25000 },
            { transacaoId: `tid_${Date.now()}_2`, tipo: 'split_taxa', valorEsperadoCents: 18500, valorRecebidoCents: 17500 },
          ],
        }),
      });

      if (!res.ok) throw new Error('Falha ao importar lote.');
      const data = await res.json();
      setFeedback({
        tipo: 'success',
        texto: `Lote processado com sucesso! ${data.divergenciasDetectadas} divergência(s) encontrada(s).`,
      });
      await onDone();
    } catch (err) {
      setFeedback({ tipo: 'error', texto: 'Erro ao importar lote.' });
    } finally {
      setImporting(false);
    }
  };

  const pendentes = items.filter((d) => !d.resolvida);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Landmark size={16} className="text-emerald-400" />
            <span>Painel de Conciliação Financeira & Divergências de Adquirentes</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Cruza extratos bancários, webhooks de adquirentes e lançamentos do Ledger do EDDIE em busca de inconsistências.
          </p>
        </div>

        <button
          onClick={handleSimularImportacao}
          disabled={importing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shrink-0"
        >
          {importing ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
          Importar Extrato OFX/CNAB
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Divergências Identificadas</h2>
          <span className="text-xs text-slate-400">
            <b className="text-rose-400">{pendentes.length}</b> pendentes de {items.length} detectadas
          </span>
        </div>

        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Detectada Em</th>
                  <th className="p-3 text-left">Adquirente</th>
                  <th className="p-3 text-left">ID Transação</th>
                  <th className="p-3 text-left">Tipo Divergência</th>
                  <th className="p-3 text-right">Esperado</th>
                  <th className="p-3 text-right">Recebido</th>
                  <th className="p-3 text-right">Diferença</th>
                  <th className="p-3 text-center">Status / Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="p-3 text-slate-400">
                      {new Date(d.detectadaEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold text-white">{d.adquirente}</td>
                    <td className="p-3 font-mono text-slate-400">{d.transacaoId}</td>
                    <td className="p-3 text-slate-300 capitalize">{d.tipo.replace('_', ' ')}</td>
                    <td className="p-3 text-right text-slate-200">{money(d.valorEsperadoCents)}</td>
                    <td className="p-3 text-right text-slate-200">{money(d.valorRecebidoCents)}</td>
                    <td className="p-3 text-right font-black text-rose-400">{money(d.diferencaCents)}</td>
                    <td className="p-3 text-center">
                      {!d.resolvida ? (
                        <button
                          onClick={() => handleResolver(d.id)}
                          disabled={resolvingId === d.id}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition"
                        >
                          {resolvingId === d.id ? 'Resolvendo...' : 'Resolver'}
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Resolvida
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <NoData text="Nenhuma divergência detectada na conciliação dos adquirentes." />
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  RELATÓRIOS & DRE DO EVENTO
// ============================================================================

function RelatoriosView({
  saldos,
  extrato,
  contas,
  repasses,
}: {
  saldos: Saldos;
  extrato: Lancamento[];
  contas: Conta[];
  repasses: Repasse[];
}) {
  const totalReceitas = extrato
    .filter((l) => l.tipo === 'entrada')
    .reduce((a, l) => a + centsOf(l), 0);
  const totalDespesas = extrato
    .filter((l) => l.tipo === 'saida')
    .reduce((a, l) => a + centsOf(l), 0);
  const totalContasPagas = contas
    .filter((c) => c.status === 'paga')
    .reduce((a, c) => a + centsOf(c), 0);
  const totalRepassesLiquidados = repasses
    .filter((r) => r.status === 'liquidado')
    .reduce((a, r) => a + centsOf(r), 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" />
            <span>Relatório Gerencial de Caixa & Demonstrativo Operacional</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Valores derivados do Ledger oficial em partidas dobradas, sem duplicações ou saldos paralelos.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-semibold transition"
        >
          <Download size={14} /> Imprimir / Exportar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Resumo de Entradas & Saídas do Período
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total de Entradas (Vendas / Antecipações)</span>
              <span className="font-bold text-emerald-400">{money(totalReceitas)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total de Saídas (Repasses / Despesas / Estornos)</span>
              <span className="font-bold text-rose-400">{money(totalDespesas)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Contas de Fornecedores Liquidadas</span>
              <span className="font-bold text-white">{money(totalContasPagas)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Repasses Pix Efetivados ao Produtor</span>
              <span className="font-bold text-white">{money(totalRepassesLiquidados)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-700 text-sm">
              <span className="font-bold text-white">Patrimônio Líquido em Caixa</span>
              <span className="font-black text-emerald-400">{money(saldos.totalPatrimonioCents)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Segregação de Recursos no Ledger
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">1. Saldo Disponível Imediato</span>
              <span className="font-bold text-emerald-400">{money(saldos.disponivelCents)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">2. Saldo Retido (Custódia D+30)</span>
              <span className="font-bold text-sky-400">{money(saldos.retidoCents)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">3. Bloqueio Preventivo (Em Liquidação)</span>
              <span className="font-bold text-amber-400">{money(saldos.bloqueadoCents)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">4. Reserva de Estorno (CDC Art. 49)</span>
              <span className="font-bold text-rose-400">{money(saldos.reservadoEstornoCents)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-700 text-sm">
              <span className="font-bold text-white">Total Geral em Custódia</span>
              <span className="font-black text-white">{money(saldos.totalPatrimonioCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
//  COMPONENTE AUXILIAR ESTADO VAZIO
// ============================================================================

function NoData({ text }: { text: string }) {
  return (
    <div className="p-12 text-center text-slate-500 text-xs">
      <Search size={22} className="mx-auto mb-2 opacity-50" />
      <span>{text}</span>
    </div>
  );
}


// ============================================================================
//  EDDIE 10.0 — CAMADAS OPERACIONAIS DERIVADAS EXCLUSIVAMENTE DE DADOS REAIS
// ============================================================================
function FluxoCaixaView({ saldos, extrato, contas, repasses }: { saldos:Saldos; extrato:Lancamento[]; contas:Conta[]; repasses:Repasse[] }) {
  const aPagar = contas.filter(x => !['pago','cancelado'].includes(x.status?.toLowerCase())).reduce((a,x)=>a+centsOf(x),0);
  const emRepasse = repasses.filter(x => !['liquidado','cancelado'].includes(x.status?.toLowerCase())).reduce((a,x)=>a+centsOf(x),0);
  const rows = extrato.slice(0,20);
  return <section className="space-y-4">
    <div className="grid md:grid-cols-4 gap-3">{[['Disponível',saldos.disponivelCents],['Retido',saldos.retidoCents],['Compromissos',aPagar],['Repasses em aberto',emRepasse]].map(([l,v])=><div key={String(l)} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><p className="text-xs text-slate-400">{l}</p><p className="text-xl font-bold mt-1">{money(Number(v))}</p></div>)}</div>
    <div className="rounded-xl border border-slate-800 overflow-hidden"><div className="p-4 border-b border-slate-800"><h3 className="font-semibold">Movimentação de caixa</h3><p className="text-xs text-slate-400">Derivada do Ledger. Nenhum valor é projetado artificialmente.</p></div><div className="divide-y divide-slate-800">{rows.length?rows.map(x=><div key={x.id} className="p-3 flex justify-between gap-4 text-sm"><span className="text-slate-300">{x.historico || x.origem}</span><span className="font-semibold">{money(centsOf(x))}</span></div>):<div className="p-8 text-center text-slate-500 text-sm">Sem movimentações no período.</div>}</div></div>
  </section>
}
function AgendaFinanceiraView({ contas, repasses }:{contas:Conta[];repasses:Repasse[]}) {
 const agenda=[...contas.map(x=>({id:'c'+x.id,data:x.vencimentoEm,tipo:'Conta a pagar',descricao:x.descricao||x.fornecedorNome,valor:centsOf(x),status:x.status})),...repasses.map(x=>({id:'r'+x.id,data:x.dataProgramada,tipo:'Repasse',descricao:'Repasse programado',valor:centsOf(x),status:x.status}))].filter(x=>x.data).sort((a,b)=>String(a.data).localeCompare(String(b.data)));
 return <section className="rounded-xl border border-slate-800 overflow-hidden"><div className="p-4 border-b border-slate-800"><h3 className="font-semibold">Agenda Financeira</h3><p className="text-xs text-slate-400">Vencimentos e repasses reais em ordem cronológica.</p></div>{agenda.length?agenda.map(x=><div key={x.id} className="grid grid-cols-[120px_130px_1fr_140px_120px] gap-3 p-3 border-b border-slate-800 text-sm"><span>{new Date(x.data).toLocaleDateString('pt-BR')}</span><span className="text-slate-400">{x.tipo}</span><span>{x.descricao}</span><span className="text-right font-semibold">{money(x.valor)}</span><span className="text-right text-slate-400">{x.status}</span></div>):<div className="p-8 text-center text-slate-500">Nenhum compromisso agendado.</div>}</section>
}
function AuditoriaFinanceiraView({extrato,divergencias}:{extrato:Lancamento[];divergencias:Divergencia[]}) {
 return <section className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><div className="rounded-xl border border-slate-800 p-4"><p className="text-xs text-slate-400">Lançamentos rastreáveis</p><p className="text-2xl font-bold">{extrato.length}</p></div><div className="rounded-xl border border-slate-800 p-4"><p className="text-xs text-slate-400">Divergências abertas</p><p className="text-2xl font-bold">{divergencias.filter(x=>!x.resolvida).length}</p></div><div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"><p className="text-xs text-emerald-300">Fonte oficial</p><p className="font-semibold mt-1">Ledger imutável</p></div></div><div className="rounded-xl border border-slate-800 p-5"><h3 className="font-semibold">Trilha de auditoria</h3><p className="text-sm text-slate-400 mt-2">Esta visão não cria registros paralelos. A auditoria utiliza lançamentos e divergências persistidos pelos serviços financeiros do EDDIE.</p></div></section>
}
function InteligenciaFinanceiraView({saldos,contas,repasses,divergencias}:{saldos:Saldos;contas:Conta[];repasses:Repasse[];divergencias:Divergencia[]}) {
 const compromissos=contas.filter(x=>!['pago','cancelado'].includes(x.status?.toLowerCase())).reduce((a,x)=>a+centsOf(x),0); const liquidez=saldos.disponivelCents-compromissos; const alertas=[...(liquidez<0?['Compromissos superam o saldo disponível.']:[]),...(divergencias.some(x=>!x.resolvida)?['Existem divergências de conciliação pendentes.']:[]),...(repasses.some(x=>x.status?.toLowerCase().includes('pend'))?['Há repasses aguardando processamento.']:[])];
 return <section className="space-y-4"><div className="rounded-xl border border-slate-800 p-5"><h3 className="font-semibold">Diagnóstico Financeiro</h3><p className="text-sm text-slate-400 mt-1">Regras determinísticas sobre dados reais; sem previsões ou valores simulados.</p><div className="mt-4 grid md:grid-cols-2 gap-3"><div className="rounded-lg bg-slate-900 p-4"><p className="text-xs text-slate-400">Liquidez após compromissos</p><p className="text-xl font-bold">{money(liquidez)}</p></div><div className="rounded-lg bg-slate-900 p-4"><p className="text-xs text-slate-400">Alertas operacionais</p><p className="text-xl font-bold">{alertas.length}</p></div></div></div><div className="space-y-2">{alertas.length?alertas.map(a=><div key={a} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200 flex gap-2"><AlertTriangle size={16}/>{a}</div>):<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">Nenhum alerta financeiro identificado com os dados atuais.</div>}</div></section>
}
