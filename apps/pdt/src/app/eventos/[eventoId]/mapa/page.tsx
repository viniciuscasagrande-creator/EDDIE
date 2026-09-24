'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function Page() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [d, setD] = useState<any>(null);
  const [step, setStep] = useState(3);

  useEffect(() => {
    fetch(`/api/eventos/${eventoId}/mapa`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setD)
      .catch(() => setD(null));
  }, [eventoId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mapa de Assentos & Setores</h1>
          <p className="text-xs text-slate-400 mt-0.5">Visualização de inventário e marcação de assentos numerados do evento.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#131722] overflow-hidden shadow-sm">
        <div className="p-6 flex justify-center gap-8 border-b border-slate-800 bg-[#10141d]">
          {['ESCOLHER MODO', 'TIPO DE CORTESIA', 'SELECIONAR', 'CONFIRMAR'].map((x, i) => (
            <div key={x} className="text-center">
              <div
                className={`mx-auto w-9 h-9 grid place-items-center rounded-full font-bold text-xs ${
                  i + 1 <= step ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
              <div className="text-[11px] font-bold text-slate-300 mt-2">{x}</div>
            </div>
          ))}
        </div>

        <div className="min-h-[380px] relative grid place-items-center p-8 bg-[#0d1017]">
          <div className="absolute right-4 top-4 grid gap-2">
            {[ZoomIn, ZoomOut, Maximize2].map((Icon, idx) => (
              <button key={idx} className="p-2.5 rounded-lg bg-[#161a24] border border-slate-800 text-slate-300 hover:text-white transition">
                <Icon size={16} />
              </button>
            ))}
          </div>

          {d?.assentos?.length ? (
            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 max-w-4xl">
              {d.assentos.map((a: any) => (
                <button
                  key={a.codigo}
                  title={a.codigo}
                  className={`w-3.5 h-3.5 rounded-full transition ${
                    a.status === 'VENDIDO'
                      ? 'bg-slate-500'
                      : a.status === 'BLOQUEADO'
                      ? 'bg-rose-500'
                      : a.status === 'CORTESIA'
                      ? 'bg-fuchsia-400'
                      : 'bg-sky-500'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-slate-400 text-xs">
                Mapa interativo aguardando cadastro de assentos e setores deste evento.
              </div>
              <div className="mt-6 grid grid-cols-12 gap-2 opacity-60 max-w-md mx-auto">
                {Array.from({ length: 48 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i % 11 === 0 ? 'bg-rose-500' : i % 7 === 0 ? 'bg-fuchsia-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-amber-400 mt-4 font-medium">
                Aguardando integração do mapa de assentos para {eventoId}.
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-5 bg-[#10141d]">
          <div className="flex flex-wrap gap-5 text-xs text-slate-300">
            {[
              ['bg-slate-500', 'Vendido'],
              ['bg-rose-500', 'Bloqueado'],
              ['bg-amber-500', 'Acessibilidade / PNE'],
              ['bg-fuchsia-400', 'Cortesia'],
              ['bg-emerald-500', 'Selecionado'],
              ['bg-sky-500', 'Disponível'],
            ].map(([c, l]) => (
              <span key={l} className="flex gap-2 items-center">
                <i className={`w-3.5 h-3.5 rounded-full ${c}`} />
                {l}
              </span>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition">
              <ChevronLeft size={14} /> Voltar
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition">
              Próximo <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
