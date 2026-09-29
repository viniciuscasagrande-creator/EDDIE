'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  RefreshCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AutomacoesNav } from '../../../components/automacoes/AutomacoesNav';
import { AutomacoesClient, FluxoOperacionalItem } from '@/lib/automacoes-client';

export default function FluxosOperacionaisPage() {
  const [loading, setLoading] = useState(true);
  const [fluxos, setFluxos] = useState<FluxoOperacionalItem[]>([]);

  const carregarFluxos = async () => {
    setLoading(true);
    try {
      const data = await AutomacoesClient.getFluxos();
      setFluxos(data);
    } catch (err) {
      console.error('Erro ao carregar fluxos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFluxos();
  }, []);

  return (
    <div className="space-y-6 max-w-full text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <GitBranch size={15} />
            <span>Processos Coordenados & Modelos de Negócio</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            Fluxos Operacionais Padronizados
          </h1>
          <p className="text-xs text-slate-400">
            Modelos de processos intermódulos: Repasse, Estorno, Fechamento de Evento e Alteração Bancária.
          </p>
        </div>

        <button
          onClick={carregarFluxos}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#16181d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar Modelos</span>
        </button>
      </div>

      <AutomacoesNav />

      {/* Grid de Fluxos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fluxos.map((fluxo) => (
          <div
            key={fluxo.codigo}
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold bg-slate-800 text-sky-400 text-xs px-2 py-0.5 rounded">
                  {fluxo.codigo}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                  {fluxo.categoria}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm mt-2">{fluxo.nome}</h3>
              <p className="text-xs text-slate-400 mt-1">Modelo Padronizado: {fluxo.modeloPadrao}</p>

              {/* Etapas do Fluxo */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Etapas Sequenciais:</p>
                <div className="relative border-l border-slate-800 ml-2 space-y-2.5 pl-4 text-xs">
                  {fluxo.etapas.map((etapa) => (
                    <div key={etapa.ordem} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border border-slate-950" />
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{etapa.ordem}. {etapa.nome}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                            etapa.tipo === 'AUTOMATICA'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {etapa.tipo === 'HUMANA' ? 'Aprovação Humana' : 'Automática'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">Ator: {etapa.ator}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Auditoria: 100% Rastreável</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Ativo em Produção
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
