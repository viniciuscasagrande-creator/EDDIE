'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  MapPin,
  SlidersHorizontal,
  GitCompare,
  LayoutList,
  RefreshCw,
  Ticket,
  Gift,
  TrendingUp,
  Plus,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

const brl = (v: any) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export default function EventosPage() {
  const { api, produtorId, eventos: ctx, recarregarEventos } = useProducerEvent();
  const [lista, setLista] = useState<any[]>(Array.isArray(ctx) && ctx.length ? ctx : []);
  const [filtro, setFiltro] = useState<'ATIVOS' | 'INATIVOS' | 'TODOS'>('ATIVOS');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    if (!api || !produtorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${api}/eventos/produtor/${produtorId}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || data.eventos || [];
        if (items.length > 0) {
          setLista(items);
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
    if (Array.isArray(ctx) && ctx.length > 0) {
      setLista(ctx);
    }
  }, [api, produtorId, ctx]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const dados = useMemo(
    () =>
      lista.filter((e: any) => {
        const s = String(e.status || '').toUpperCase();
        const ok =
          filtro === 'TODOS' ||
          (filtro === 'ATIVOS'
            ? ['PUBLICADO', 'ATIVO', 'EM_VENDA'].includes(s)
            : !['PUBLICADO', 'ATIVO', 'EM_VENDA'].includes(s));
        return ok && String(e.nome || '').toLowerCase().includes(busca.toLowerCase());
      }),
    [lista, filtro, busca]
  );

  const refresh = async () => {
    setLoading(true);
    await recarregarEventos();
    await carregar();
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-sm text-slate-400">
            Visão geral de todos os eventos do produtor. Entre em um evento para operar seus dados individualmente.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/eventos/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 shadow-sm"
          >
            <Plus size={16} /> Novo Evento
          </Link>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1c1e23] px-4 py-2.5 text-sm font-semibold text-white hover:border-sky-500">
            <GitCompare size={16} /> Comparar
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1c1e23] px-4 py-2.5 text-sm font-semibold text-white hover:border-sky-500">
            <LayoutList size={16} /> Horizontal
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {(['ATIVOS', 'INATIVOS', 'TODOS'] as const).map((x) => (
          <button
            key={x}
            onClick={() => setFiltro(x)}
            className={`px-5 py-2.5 rounded-lg border text-sm font-semibold ${
              filtro === x
                ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                : 'border-slate-700 text-slate-300'
            }`}
          >
            {x === 'ATIVOS' ? 'Ativos' : x === 'INATIVOS' ? 'Inativos' : 'Todos'}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar eventos..."
            className="bg-[#101827] border border-slate-700 rounded-lg px-4 text-sm text-white min-w-64"
          />
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1c1e23] px-4 py-2.5 text-sm font-semibold text-white hover:border-sky-500"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-sky-400" />
          <span>Consultando eventos do produtor...</span>
        </div>
      ) : dados.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-12 text-center text-slate-400">
          Nenhum evento encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-5">
          {dados.map((e: any) => {
            const s = e.sessoes?.[0];
            const cap = Number(s?.capacidadeTotal || e.capacidadeTotal || 0);
            const vend = Number(e.ingressosVendidos || e.vendidos || 0);
            const cort = Number(e.cortesias || 0);
            const disp = Math.max(0, cap - vend - cort);
            const ocup = cap ? ((vend + cort) / cap) * 100 : 0;
            const receita = Number(e.gmv || e.totalVendas || e.receita || 0);

            return (
              <div
                key={e.id}
                className="group overflow-hidden rounded-xl border border-slate-800 bg-[#131722] hover:border-sky-500/50 transition flex flex-col justify-between shadow-sm"
              >
                <div className="grid sm:grid-cols-[230px_1fr] min-h-[200px]">
                  <div className="bg-[#15171b] relative">
                    {e.imagemUrl ? (
                      <img src={e.imagemUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full grid place-items-center text-slate-600">
                        <CalendarDays size={46} />
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                      {e.codigo || String(e.id).slice(0, 8)}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-sky-300">
                        {e.nome}
                      </h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <MapPin size={16} />
                        {s?.local?.nome || e.local?.nome || 'Local a definir'}
                      </div>
                    </div>
                    <div className="border-t border-slate-600 mt-4 pt-4 grid grid-cols-4 gap-3 text-center">
                      <Metric label="Total (R$)" value={brl(receita).replace('R$ ', '')} />
                      <Metric label="Vendas" value={vend} />
                      <Metric label="Disponível" value={disp} />
                      <Metric label="Cortesia" value={cort} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-300 inline-flex gap-2">
                        <CalendarDays size={15} />
                        {s?.inicioEm ? new Date(s.inicioEm).toLocaleString('pt-BR') : 'Data a definir'}
                      </span>
                      <span className="text-lg font-bold text-white">
                        {ocup.toFixed(1)}%{' '}
                        <small className="block text-[10px] font-normal text-slate-400">
                          Ocupação
                        </small>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Ações Rápidas do Evento */}
                <div className="border-t border-slate-700/80 bg-[#1e2026] px-5 py-2.5 flex items-center justify-between gap-3">
                  <Link
                    href={`/eventos/${e.id}/operacao`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
                  >
                    <Radio size={13} className="animate-pulse" />
                    <span>Operação Ao Vivo</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/eventos/${e.id}/dashboard`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    >
                      <span>Dashboard</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[11px] text-slate-300">{label}</div>
      <div className="text-lg font-bold text-white mt-1">{value}</div>
      <div className="h-px bg-sky-500/70 mt-2" />
    </div>
  );
}
