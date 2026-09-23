'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Info,
  Calendar,
  MapPin,
  Building,
  Layers,
  Percent,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  RefreshCw,
  FileCheck,
  Settings,
} from 'lucide-react';

export default function Page() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [processando, setProcessando] = useState(false);

  async function carregarDetalhes() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/eventos/${eventoId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Falha ao buscar detalhes do evento (status ${res.status})`);
      const data = await res.json();
      setEvento(data);
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar detalhes do evento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDetalhes();
  }, [eventoId]);

  async function handlePublicar() {
    setProcessando(true);
    setMensagemSucesso('');
    setError('');
    try {
      const res = await fetch(`/api/eventos/${eventoId}/publicar`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao publicar evento.');
      }
      setMensagemSucesso('Evento publicado com sucesso no site e na bilheteria!');
      await carregarDetalhes();
    } catch (e: any) {
      setError(e.message || 'Erro ao publicar evento.');
    } finally {
      setProcessando(false);
    }
  }

  const sessoes = Array.isArray(evento?.sessoes) ? evento.sessoes : [];
  const local = sessoes[0]?.local || evento?.local;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Info className="text-sky-400" size={26} /> Detalhes & Configurações do Evento
          </h1>
          <p className="text-sm text-slate-400">
            Ciclo de vida, local, sessões, condição comercial e auditoria do evento {eventoId}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarDetalhes}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition"
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handlePublicar}
            disabled={processando || evento?.status === 'PUBLICADO'}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 shadow-sm transition disabled:opacity-40"
          >
            <Send size={14} />
            {processando ? 'Publicando...' : evento?.status === 'PUBLICADO' ? 'Evento Publicado' : 'Publicar Evento'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {mensagemSucesso && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {mensagemSucesso}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-2">
          <RefreshCw size={24} className="animate-spin text-sky-400 mx-auto" />
          <p className="text-sm">Carregando dados estruturais do evento...</p>
        </div>
      ) : !evento ? (
        <div className="rounded-2xl border border-slate-800 bg-[#121620] p-12 text-center text-slate-400">
          Dados do evento não disponíveis na API.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Card: Dados Gerais */}
          <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck size={16} className="text-sky-400" /> Dados Gerais
            </h2>
            <div className="divide-y divide-slate-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Nome Oficial:</span>
                <span className="font-semibold text-white">{evento.nome}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Identificador / Código:</span>
                <span className="font-mono text-sky-300">{evento.codigo || evento.id}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Status de Publicação:</span>
                <span className="font-semibold text-emerald-400">{evento.status || 'RASCUNHO'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Categoria:</span>
                <span className="text-slate-300">{evento.categoria || 'SHOW'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Classificação Etária:</span>
                <span className="text-slate-300">{evento.classificacaoEtaria || 'LIVRE'}</span>
              </div>
            </div>
          </div>

          {/* Card: Local e Capacidade */}
          <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-purple-400" /> Local & Espaço Físico
            </h2>
            <div className="divide-y divide-slate-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Espaço / Arena:</span>
                <span className="font-semibold text-white">{local?.nome || 'Local a definir'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Cidade / UF:</span>
                <span className="text-slate-300">{local ? `${local.cidade || ''} - ${local.uf || ''}` : '—'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Endereço:</span>
                <span className="text-slate-300">{local?.endereco || '—'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Capacidade Total Cadastrada:</span>
                <span className="font-semibold text-white">
                  {local?.capacidadeTotal || evento.capacidadeTotal || '—'} lugares
                </span>
              </div>
            </div>
          </div>

          {/* Card: Sessões e Datas */}
          <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-emerald-400" /> Sessões ({sessoes.length})
            </h2>
            {sessoes.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">Nenhuma sessão associada ao evento.</p>
            ) : (
              <div className="space-y-2">
                {sessoes.map((s: any, idx: number) => (
                  <div key={s.id || idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Sessão #{idx + 1}</span>
                      <span className="text-emerald-400 font-normal">{s.status || 'CONFIRMADA'}</span>
                    </div>
                    <div className="text-slate-400">
                      Início: {s.inicioEm ? new Date(s.inicioEm).toLocaleString('pt-BR') : 'A definir'}
                    </div>
                    <div className="text-slate-500">
                      Capacidade desta sessão: {s.capacidadeTotal || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Condição Comercial / Taxa Disk */}
          <div className="rounded-2xl border border-slate-700 bg-[#121620] p-5 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Percent size={16} className="text-amber-400" /> Condição Comercial do Evento
            </h2>
            <div className="divide-y divide-slate-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Regra Comercial:</span>
                <span className="font-semibold text-emerald-400">Aprovada & Vinculada</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Prazo de Repasse:</span>
                <span className="text-slate-300">D+2 após a realização do evento</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Taxa DiskIngressos:</span>
                <span className="text-slate-300">Percentual / Híbrida conforme contrato</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Imutabilidade:</span>
                <span className="text-sky-300 font-semibold">Snapshot congelado nos pedidos</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
