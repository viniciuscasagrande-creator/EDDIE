'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Ticket, Plus, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';

const brl = (v: any) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export default function LotesPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    sessaoId: '',
    nome: '1º Lote',
    precoFace: 120,
    quantidadeTotal: 500,
    modalidade: 'INTEIRA',
  });

  async function carregarDados() {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(`/api/eventos/${eventoId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const s = Array.isArray(data.sessoes) ? data.sessoes : [];
        setSessoes(s);
        if (s.length && !form.sessaoId) {
          setForm((f) => ({ ...f, sessaoId: s[0].id }));
        }
      }
    } catch (e: any) {
      setErro('Falha ao carregar lotes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [eventoId]);

  const handleCriarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sessaoId) {
      setErro('Selecione uma sessão para o lote.');
      return;
    }
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      const res = await fetch(`/api/eventos/sessoes/${form.sessaoId}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          precoFace: Number(form.precoFace),
          quantidadeTotal: Number(form.quantidadeTotal),
          modalidade: form.modalidade,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao criar lote.');
      }

      setSucesso(`Lote ${form.nome} criado com sucesso!`);
      setModalAberto(false);
      setForm((f) => ({ ...f, nome: '', precoFace: 100, quantidadeTotal: 500 }));
      await carregarDados();
    } catch (err: any) {
      setErro(err.message || 'Falha ao salvar lote.');
    } finally {
      setSalvando(false);
    }
  };

  const todosLotes = sessoes.flatMap((s) => (s.lotes || []).map((l: any) => ({ ...l, sessaoId: s.id })));

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
            <Ticket className="text-sky-400" size={24} /> Lotes e Preços de Ingressos
          </h1>
          <p className="text-sm text-slate-400">
            Definição de preço de face, modalidades e quantidades por lote do evento {eventoId}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarDados}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 shadow-sm transition"
          >
            <Plus size={15} /> Novo Lote
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

      {/* Modal Novo Lote */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="text-sky-400" size={18} /> Adicionar Lote
            </h2>
            <form onSubmit={handleCriarLote} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sessão Vinculada *</label>
                <select
                  value={form.sessaoId}
                  onChange={(e) => setForm({ ...form, sessaoId: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {sessoes.map((s, i) => (
                    <option key={s.id} value={s.id}>
                      Sessão #{i + 1} ({s.inicioEm ? new Date(s.inicioEm).toLocaleDateString('pt-BR') : s.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Identificação do Lote *</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: 1º Lote, Lote Promocional"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço de Face (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precoFace}
                    onChange={(e) => setForm({ ...form, precoFace: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={form.quantidadeTotal}
                    onChange={(e) => setForm({ ...form, quantidadeTotal: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Modalidade</label>
                <select
                  value={form.modalidade}
                  onChange={(e) => setForm({ ...form, modalidade: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="INTEIRA">Inteira</option>
                  <option value="MEIA_ENTRADA">Meia-Entrada</option>
                  <option value="SOLIDARIO">Ingresso Solidário</option>
                </select>
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
                  {salvando ? 'Salvando...' : 'Salvar Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Lotes */}
      <div className="grid gap-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Carregando lotes...</div>
        ) : todosLotes.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#121620] p-12 text-center text-slate-400">
            Nenhum lote cadastrado para as sessões deste evento.
          </div>
        ) : (
          todosLotes.map((lot: any, idx: number) => (
            <div
              key={lot.id || idx}
              className="rounded-xl border border-slate-700 bg-[#121620] p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{lot.nome}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {lot.modalidade || 'INTEIRA'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Quantidade: {lot.quantidadeTotal || '—'} ingressos
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Preço de Face</div>
                <div className="text-xl font-bold text-emerald-400">{brl(lot.precoFace)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
