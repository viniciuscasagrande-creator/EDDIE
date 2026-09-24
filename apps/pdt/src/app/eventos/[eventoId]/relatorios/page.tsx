'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  FileBarChart,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Ticket,
  Gift,
  TrendingUp,
  Percent,
  CheckCircle2,
  RefreshCw,
  Users,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';

const brl = (v: any) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export default function Page() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [periodo, setPeriodo] = useState<'HOJE' | '7D' | '30D' | 'TOTAL'>('TOTAL');
  const [resumo, setResumo] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function carregarDados() {
    setLoading(true);
    setError('');
    try {
      const [resumoRes, pedidosRes] = await Promise.all([
        fetch(`/api/eventos/${eventoId}/os-resumo`, { cache: 'no-store' }),
        fetch(`/api/pedidos/evento/${eventoId}/consulta`, { cache: 'no-store' }),
      ]);

      if (resumoRes.ok) {
        setResumo(await resumoRes.json());
      }
      if (pedidosRes.ok) {
        const d = await pedidosRes.json();
        setPedidos(Array.isArray(d) ? d : (d?.items || d?.pedidos || []));
      }
    } catch (e: any) {
      setError(e.message || 'Falha ao consolidar relatórios do evento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [eventoId]);

  // Derived metrics
  const safePedidos = Array.isArray(pedidos) ? pedidos : [];
  const totalVendas = Number(resumo?.gmv || resumo?.totalVendas || 0);
  const totalPedidos = safePedidos.length;
  const ingressosVendidos = Number(resumo?.ingressosVendidos || 0);
  const totalCortesias = Number(resumo?.cortesias || 0);
  const capacidade = Number(resumo?.capacidadeTotal || 0);
  const ocupacao = capacidade ? ((ingressosVendidos + totalCortesias) / capacidade) * 100 : 0;
  const ticketMedio = ingressosVendidos ? totalVendas / ingressosVendidos : 0;

  const exportarCsv = () => {
    if (!safePedidos.length) return;
    const header = ['NumeroPedido', 'Data', 'Comprador', 'Documento', 'Status', 'Total', 'TaxaDisk'];
    const rows = safePedidos.map((p) => [
      p.numero,
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
      `"${p.compradorNome || ''}"`,
      p.compradorDocumento || '',
      p.status,
      Number(p.total || 0).toFixed(2),
      Number(p.taxaDisk || 0).toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_evento_${eventoId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileBarChart className="text-sky-400" size={26} /> Central de Relatórios do Evento
          </h1>
          <p className="text-sm text-slate-400">
            Métricas auditáveis de vendas, ingressos, ocupação, meios de pagamento e financeiro do evento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-xl border border-slate-700 bg-[#121620] p-1 text-xs">
            {(['HOJE', '7D', '30D', 'TOTAL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  periodo === p ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'HOJE' ? 'Hoje' : p === '7D' ? '7 Dias' : p === '30D' ? '30 Dias' : 'Total'}
              </button>
            ))}
          </div>

          <button
            onClick={exportarCsv}
            disabled={safePedidos.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-sky-500 transition disabled:opacity-40"
          >
            <Download size={14} /> Exportar CSV
          </button>

          <button
            onClick={carregarDados}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition"
            title="Recarregar dados"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 font-medium">RECEITA TOTAL</div>
          <div className="text-xl font-bold text-white mt-1">{totalVendas ? brl(totalVendas) : '—'}</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <DollarSign size={10} /> GMV Transacionado
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 font-medium">TOTAL PEDIDOS</div>
          <div className="text-xl font-bold text-white mt-1">{totalPedidos || '—'}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <ShoppingCart size={10} /> Transações
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 font-medium">INGRESSOS VENDIDOS</div>
          <div className="text-xl font-bold text-white mt-1">{ingressosVendidos || '—'}</div>
          <div className="text-[10px] text-sky-400 mt-1 flex items-center gap-1">
            <Ticket size={10} /> Ingressos Únicos
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 font-medium">TICKET MÉDIO</div>
          <div className="text-xl font-bold text-white mt-1">{ticketMedio ? brl(ticketMedio) : '—'}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> Por Ingresso
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 font-medium">CORTESIAS</div>
          <div className="text-xl font-bold text-white mt-1">{totalCortesias || '—'}</div>
          <div className="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
            <Gift size={10} /> Autorizadas
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 font-medium">OCUPAÇÃO</div>
          <div className="text-xl font-bold text-white mt-1">{ocupacao ? `${ocupacao.toFixed(1)}%` : '—'}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Percent size={10} /> Da Capacidade
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Meios de Pagamento */}
        <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard size={18} className="text-sky-400" /> Meios de Pagamento Utilizados
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Crédito', icon: CreditCard, count: '—', val: '—' },
              { label: 'PIX', icon: CheckCircle2, count: '—', val: '—' },
              { label: 'Débito', icon: CreditCard, count: '—', val: '—' },
              { label: 'Dinheiro/PDV', icon: DollarSign, count: '—', val: '—' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
                <div className="text-xs text-slate-400">{m.label}</div>
                <div className="text-base font-bold text-white mt-1">{m.count}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.val}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Valores reais por gateway processador vinculados aos pagamentos do evento.
          </p>
        </div>

        {/* Setores e Ocupação */}
        <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building size={18} className="text-sky-400" /> Ocupação por Setores
          </h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
            <p className="text-xs text-slate-400">
              Capacidade física cadastrada: <b className="text-white">{capacidade || 'A definir'} lugares</b>
            </p>
            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, ocupacao))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>0 vendidos</span>
              <span>{ocupacao.toFixed(1)}% ocupado</span>
              <span>{capacidade} total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relatório Financeiro e Repasses do Evento */}
      <div className="rounded-2xl border border-slate-700 bg-[#121620] p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" /> Balanço Financeiro do Evento
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-xs text-slate-400">Receita Bruta (GMV)</div>
            <div className="text-xl font-bold text-white mt-1">{brl(totalVendas)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total transacionado</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-xs text-slate-400">Taxa de Serviço DiskIngressos</div>
            <div className="text-xl font-bold text-sky-400 mt-1">
              {brl(safePedidos.reduce((acc, p) => acc + Number(p.taxaDisk || 0), 0))}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Condição comercial por evento</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-xs text-slate-400">Repasse Estimado ao Produtor</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {brl(safePedidos.reduce((acc, p) => acc + Number(p.repasseProdutor || p.subtotal || 0), 0))}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Líquido de face apurado</div>
          </div>
        </div>
      </div>

      {/* Portaria e Check-ins */}
      <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users size={18} className="text-sky-400" /> Operação de Portaria e Check-ins
        </h2>
        <p className="text-xs text-slate-400">
          Validação em tempo real de ingressos e catracas vinculadas ao evento {eventoId}.
        </p>
        <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
          Leituras de catraca e check-ins aparecerão aqui quando a portaria estiver em operação.
        </div>
      </div>
    </div>
  );
}
