'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  DollarSign,
  Ticket,
  Gift,
  CheckSquare,
  CreditCard,
  Landmark,
  Banknote,
  TrendingUp,
} from 'lucide-react';

const brl = (v: any) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export default function Page() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/eventos/${eventoId}/os-resumo`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setD)
      .catch(() => setD(null));
  }, [eventoId]);

  const meios = d?.meiosPagamento || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard do Evento</h1>
          <p className="text-xs text-slate-400 mt-0.5">Visão geral executiva de vendas, estoque e modalidades de pagamento.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 rounded-xl border border-slate-800 bg-[#131722] divide-y md:divide-y-0 md:divide-x divide-slate-800 shadow-sm">
        <Top icon={DollarSign} value={d?.gmv != null ? brl(d.gmv) : '—'} label="Total de Vendas" />
        <Top icon={Ticket} value={d?.ingressosVendidos ?? '—'} label="Vendidos" />
        <Top icon={Gift} value={d?.cortesias ?? '—'} label="Cortesias" />
        <Top icon={CheckSquare} value={d?.restantes ?? '—'} label="Restantes" />
      </div>

      <section className="rounded-xl border border-slate-800 bg-[#131722] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-white text-base">Ritmo de Vendas</h2>
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            <button className="bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white">Financeiro</button>
            <button className="bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-300">Quantidade</button>
          </div>
        </div>
        <div className="grid lg:grid-cols-[320px_1fr] min-h-[300px]">
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-5 bg-[#10141d]">
            <Mini label="TICKET MÉDIO" value={d?.ticketMedio != null ? brl(d.ticketMedio) : '—'} />
            <Mini label="PONTO DE EQUILÍBRIO" value={d?.pontoEquilibrio != null ? brl(d.pontoEquilibrio) : '—'} />
            <Mini label="META DE VENDAS" value={d?.metaVendas != null ? brl(d.metaVendas) : '—'} />
            <Mini label="PROJEÇÃO FINAL" value={d?.projecaoFinal != null ? brl(d.projecaoFinal) : '—'} />
          </div>
          <Chart values={d?.ritmoVendas} />
        </div>
      </section>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {(meios.length ? meios : [{ nome: 'Crédito' }, { nome: 'PIX' }, { nome: 'Débito' }, { nome: 'Dinheiro' }]).map(
          (m: any) => (
            <div key={m.nome} className="rounded-xl border border-slate-800 bg-[#131722] p-5 shadow-sm">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">{m.nome}</div>
              <div className="text-2xl font-black text-white mt-2">
                {m.quantidade ?? '—'}{' '}
                <small className="text-xs font-normal text-slate-400">vendas</small>
              </div>
              <div className="text-base font-mono font-semibold text-sky-400 mt-2">
                {m.valor != null ? brl(m.valor) : '—'}
              </div>
            </div>
          )
        )}
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <Chart title="Quantidade por período" values={d?.quantidadePeriodo} />
        <Chart title="Valor (R$) por período" values={d?.valorPeriodo} />
      </div>

      <section className="rounded-xl border border-slate-800 bg-[#131722] overflow-hidden shadow-sm">
        <h2 className="p-5 text-base font-bold text-white border-b border-slate-800">Vendas por Modalidade</h2>
        {(d?.modalidades || []).length ? (
          d.modalidades.map((m: any) => (
            <div key={m.nome} className="grid grid-cols-[1fr_140px_140px] p-4 border-b border-slate-800 text-sm">
              <b className="text-white">{m.nome}</b>
              <span className="text-slate-300 text-right">{m.quantidade}</span>
              <span className="text-sky-400 text-right font-mono font-semibold">{brl(m.total)}</span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            As modalidades aparecerão quando a API retornar vendas do evento.
          </div>
        )}
      </section>
    </div>
  );
}

function Top({ icon: I, value, label }: any) {
  return (
    <div className="p-5 flex gap-4 items-center">
      <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
        <I size={24} />
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function Mini({ label, value }: any) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</div>
      <div className="font-black text-white text-base mt-0.5 font-mono">{value}</div>
    </div>
  );
}

function Chart({ title = 'Evolução financeira', values }: any) {
  const v = Array.isArray(values) && values.length ? values.map((x: any) => Number(x.valor ?? x)) : [];
  return (
    <div className="p-6 min-h-[260px] bg-[#131722] rounded-xl border border-slate-800">
      <h3 className="text-white font-semibold text-sm">{title}</h3>
      <div className="h-[180px] mt-4 flex items-end gap-1.5 border-b border-l border-slate-800 p-3">
        {v.length ? (
          v.slice(-50).map((x: number, i: number) => {
            const max = Math.max(...v, 1);
            return (
              <div
                key={i}
                className="flex-1 bg-sky-500/70 hover:bg-sky-400 rounded-t transition"
                style={{ height: `${Math.max(4, (x / max) * 100)}%` }}
              />
            );
          })
        ) : (
          <div className="m-auto text-xs text-slate-500">Aguardando dados reais da API deste evento.</div>
        )}
      </div>
    </div>
  );
}
