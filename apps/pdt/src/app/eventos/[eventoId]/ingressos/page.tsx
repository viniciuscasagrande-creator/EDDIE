'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Search,
  TicketCheck,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function Page() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [q, setQ] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'PAGO' | 'AGUARDANDO_PAGAMENTO' | 'CANCELADO'>('TODOS');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);

  async function load(term = '') {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/pedidos/evento/${eventoId}/consulta?q=${encodeURIComponent(term)}`, {
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(`API retornou status ${r.status}`);
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Falha ao consultar pedidos e ingressos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [eventoId]);

  const filtrados = useMemo(() => {
    return rows.filter((r) => {
      if (statusFiltro === 'TODOS') return true;
      return String(r.status || '').toUpperCase() === statusFiltro;
    });
  }, [rows, statusFiltro]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Consulta de Ingressos & Pedidos</h1>
          <p className="text-sm text-slate-400">
            Rastreabilidade e busca unificada: Pedido → Comprador/CPF → Pagamento → Ingresso Individual do evento.
          </p>
        </div>
        <button
          onClick={() => load(q)}
          disabled={loading}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-sky-500 flex items-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar Dados
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#0d1728] p-5">
          <ShoppingCart className="text-sky-400" size={24} />
          <h3 className="text-white font-semibold mt-3">Pedidos Realizados</h3>
          <p className="text-xs text-slate-400 mt-1">
            Numeração independente com snapshot comercial congelado.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0d1728] p-5">
          <TicketCheck className="text-emerald-400" size={24} />
          <h3 className="text-white font-semibold mt-3">Ingressos Únicos</h3>
          <p className="text-xs text-slate-400 mt-1">
            Numeração individual, QR code criptográfico e status de portaria.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0d1728] p-5">
          <CreditCard className="text-amber-400" size={24} />
          <h3 className="text-white font-semibold mt-3">Pagamentos & Repasse</h3>
          <p className="text-xs text-slate-400 mt-1">
            Transação adquirente, NSU, Pix e cálculo de taxa Disk por evento.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(q);
          }}
          className="flex-1 min-w-[280px] rounded-xl border border-slate-800 bg-[#0d1728] px-4 py-2.5 flex items-center gap-2.5 focus-within:border-sky-500 transition"
        >
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-transparent outline-none flex-1 text-sm text-white placeholder-slate-500"
            placeholder="Buscar por nº do pedido, nº do ingresso, nome, CPF/documento ou telefone..."
          />
        </form>

        <div className="flex rounded-xl border border-slate-800 bg-[#0d1728] p-1 gap-1 text-xs">
          {(['TODOS', 'PAGO', 'AGUARDANDO_PAGAMENTO', 'CANCELADO'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFiltro(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFiltro === st
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'TODOS'
                ? 'Todos'
                : st === 'PAGO'
                ? 'Pagos'
                : st === 'AGUARDANDO_PAGAMENTO'
                ? 'Aguardando'
                : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1728] overflow-hidden">
        <div className="grid grid-cols-12 gap-2 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-400 border-b border-slate-800">
          <span className="col-span-3">Pedido & Data</span>
          <span className="col-span-3">Comprador / Titular</span>
          <span className="col-span-2">Situação</span>
          <span className="col-span-2 text-right">Valor Total</span>
          <span className="col-span-2 text-center">Ingressos</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={20} className="animate-spin text-sky-400" />
            <span className="text-sm">Consultando transações reais do evento...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-300">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => load(q)}
              className="mt-3 text-xs underline text-sky-400 hover:text-sky-300"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-1">
            <p className="text-sm font-medium text-slate-300">Nenhum pedido ou ingresso encontrado.</p>
            <p className="text-xs text-slate-500">
              A listagem utiliza a fonte de dados transacional em tempo real. Nenhum dado demonstrativo é gerado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtrados.map((pedido) => {
              const isExpanded = selectedPedido === pedido.id;
              const ingressos = Array.isArray(pedido.ingressos) ? pedido.ingressos : [];
              const isPago = String(pedido.status).toUpperCase() === 'PAGO';

              return (
                <div key={pedido.id} className="transition hover:bg-slate-900/30">
                  <div
                    onClick={() => setSelectedPedido(isExpanded ? null : pedido.id)}
                    className="grid grid-cols-12 gap-2 px-4 py-3.5 text-sm items-center cursor-pointer select-none"
                  >
                    <div className="col-span-3">
                      <div className="font-mono text-sky-400 font-semibold">{pedido.numero}</div>
                      <div className="text-[11px] text-slate-500">
                        {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('pt-BR') : '—'}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="text-white font-medium truncate">{pedido.compradorNome || 'Não informado'}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {pedido.compradorDocumento || pedido.compradorEmail || 'Sem documento'}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPago
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isPago ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {pedido.status}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="font-semibold text-white">R$ {Number(pedido.total || 0).toFixed(2)}</div>
                      <div className="text-[11px] text-slate-500">
                        Taxa: R$ {Number(pedido.taxaDisk || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-300">
                        <TicketCheck size={16} className="text-sky-400" />
                        {ingressos.length}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Ingressos Detail */}
                  {isExpanded && (
                    <div className="bg-[#09101d] px-6 py-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                        <span className="font-semibold uppercase tracking-wider text-slate-300">
                          Ingressos Vinculados ao Pedido ({ingressos.length})
                        </span>
                        <span>Snapshot Comercial: {pedido.modeloTaxaSnapshot || 'Padrão'}</span>
                      </div>

                      {ingressos.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">
                          {isPago
                            ? 'Nenhum ingresso emitido para este pedido.'
                            : 'Ingressos serão gerados e liberados assim que o pagamento for confirmado.'}
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {ingressos.map((ing: any) => (
                            <div
                              key={ing.id || ing.numero}
                              className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <QrCode size={18} className="text-sky-400" />
                                <div>
                                  <div className="font-mono text-white font-semibold">{ing.numero}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Hash: {String(ing.qrTokenHash || '').slice(0, 16)}...
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-slate-300">
                                  Status: <b className="text-emerald-400">{ing.status || 'VALIDO'}</b>
                                </span>
                                <span className="text-slate-400">
                                  Check-in: {ing.utilizadoEm ? new Date(ing.utilizadoEm).toLocaleString('pt-BR') : 'Não realizado'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
