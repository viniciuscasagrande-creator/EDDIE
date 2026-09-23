'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Plus, RefreshCw, CheckCircle2, Clock, MapPin, ArrowLeft } from 'lucide-react';

export default function SessoesPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    inicioEm: '',
    fimEm: '',
    aberturaPortas: '',
    capacidadeTotal: 3000,
  });

  async function carregarSessoes() {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(`/api/eventos/${eventoId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSessoes(Array.isArray(data.sessoes) ? data.sessoes : []);
      }
    } catch (e: any) {
      setErro('Falha ao carregar sessões.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarSessoes();
  }, [eventoId]);

  const handleCriarSessao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inicioEm) {
      setErro('Informe a data e horário de início da sessão.');
      return;
    }
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      const res = await fetch(`/api/eventos/${eventoId}/sessoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inicioEm: form.inicioEm,
          fimEm: form.fimEm || undefined,
          capacidadeTotal: Number(form.capacidadeTotal),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao criar sessão.');
      }

      setSucesso('Nova sessão cadastrada com sucesso!');
      setModalAberto(false);
      setForm({ inicioEm: '', fimEm: '', aberturaPortas: '', capacidadeTotal: 3000 });
      await carregarSessoes();
    } catch (err: any) {
      setErro(err.message || 'Falha ao salvar sessão.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href={`/eventos/${eventoId}/detalhes`} className="hover:text-white flex items-center gap-1">
              <ArrowLeft size={12} /> Detalhes do Evento
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-sky-400" size={24} /> Sessões do Evento
          </h1>
          <p className="text-sm text-slate-400">
            Gerenciamento de datas, horários e capacidades específicas para {eventoId}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarSessoes}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 shadow-sm transition"
          >
            <Plus size={15} /> Nova Sessão
          </button>
        </div>
      </div>

      {sucesso && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} /> {sucesso}
        </div>
      )}
      {erro && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          {erro}
        </div>
      )}

      {/* Modal Nova Sessão */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="text-sky-400" size={18} /> Adicionar Sessão
            </h2>
            <form onSubmit={handleCriarSessao} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Início da Sessão *</label>
                <input
                  type="datetime-local"
                  value={form.inicioEm}
                  onChange={(e) => setForm({ ...form, inicioEm: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Previsão de Término</label>
                <input
                  type="datetime-local"
                  value={form.fimEm}
                  onChange={(e) => setForm({ ...form, fimEm: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Capacidade da Sessão</label>
                <input
                  type="number"
                  value={form.capacidadeTotal}
                  onChange={(e) => setForm({ ...form, capacidadeTotal: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 rounded-lg bg-sky-600 font-semibold text-white hover:bg-sky-500 transition disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar Sessão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Sessões */}
      <div className="grid gap-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Carregando sessões...</div>
        ) : sessoes.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#121620] p-12 text-center text-slate-400">
            Nenhuma sessão encontrada para este evento.
          </div>
        ) : (
          sessoes.map((s: any, idx: number) => (
            <div
              key={s.id || idx}
              className="rounded-xl border border-slate-700 bg-[#121620] p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">Sessão #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {s.status || 'CONFIRMADA'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Clock size={14} className="text-sky-400" />
                  Início: {s.inicioEm ? new Date(s.inicioEm).toLocaleString('pt-BR') : 'A definir'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Capacidade</div>
                <div className="text-lg font-bold text-white">{s.capacidadeTotal || '—'} lugares</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
