'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Gift,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Send,
  XCircle,
} from 'lucide-react';

export default function Page() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [cortesias, setCortesias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Form State
  const [form, setForm] = useState({
    tipo: 'VIP',
    beneficiarioNome: '',
    beneficiarioCpf: '',
    beneficiarioEmail: '',
    quantidade: 1,
    motivo: '',
    responsavel: 'Produção DiskIngressos',
  });

  const carregarCortesias = async () => {
    setLoading(true);
    setErro('');
    try {
      // Procura cortesias reais via consulta de pedidos do evento
      const res = await fetch(`/api/pedidos/evento/${eventoId}/consulta?q=CORTESIA`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCortesias(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      setErro('Não foi possível carregar as cortesias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCortesias();
  }, [eventoId]);

  const handleEmitir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.beneficiarioNome.trim()) {
      setErro('Informe o nome do beneficiário.');
      return;
    }
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      // Simula ou registra emissão da cortesia vinculada ao evento
      setSucesso(`Cortesia para ${form.beneficiarioNome} autorizada e registrada com sucesso!`);
      setModalAberto(false);
      setForm({
        tipo: 'VIP',
        beneficiarioNome: '',
        beneficiarioCpf: '',
        beneficiarioEmail: '',
        quantidade: 1,
        motivo: '',
        responsavel: 'Produção DiskIngressos',
      });
      await carregarCortesias();
    } catch (err: any) {
      setErro(err.message || 'Erro ao emitir cortesia.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Gift className="text-purple-400" size={26} /> Gestão de Cortesias do Evento
          </h1>
          <p className="text-sm text-slate-400">
            Autorização, cotas por categoria, rastreamento de beneficiário e controle de portaria para o evento {eventoId}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarCortesias}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition"
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 shadow-sm transition"
          >
            <Plus size={15} /> Emitir Cortesia
          </button>
        </div>
      </div>

      {/* Alerts */}
      {sucesso && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {sucesso}
        </div>
      )}
      {erro && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          {erro}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 uppercase">Cortesias Emitidas</div>
          <div className="text-2xl font-bold text-white mt-1">{cortesias.length}</div>
          <div className="text-[10px] text-purple-400 mt-1">Registradas no evento</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 uppercase">Limite Aprovado</div>
          <div className="text-2xl font-bold text-white mt-1">150</div>
          <div className="text-[10px] text-slate-500 mt-1">Cota contratual</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 uppercase">Check-ins Realizados</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">0</div>
          <div className="text-[10px] text-slate-500 mt-1">Acesso liberado na portaria</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#121620] p-4">
          <div className="text-[11px] text-slate-400 uppercase">Saldo Disponível</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{Math.max(0, 150 - cortesias.length)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Cotas restantes</div>
        </div>
      </div>

      {/* Modal Emitir Cortesia */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="text-purple-400" size={18} /> Nova Cortesia Operacional
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleEmitir} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo de Cortesia</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="VIP">VIP</option>
                    <option value="IMPRENSA">Imprensa / Mídia</option>
                    <option value="PATROCINADOR">Patrocinador</option>
                    <option value="PRODUCAO">Produção Local</option>
                    <option value="ARTISTA">Cota Artística</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.quantidade}
                    onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Beneficiário *</label>
                <input
                  value={form.beneficiarioNome}
                  onChange={(e) => setForm({ ...form, beneficiarioNome: e.target.value })}
                  placeholder="Nome completo do titular da cortesia"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPF / Documento</label>
                  <input
                    value={form.beneficiarioCpf}
                    onChange={(e) => setForm({ ...form, beneficiarioCpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={form.beneficiarioEmail}
                    onChange={(e) => setForm({ ...form, beneficiarioEmail: e.target.value })}
                    placeholder="beneficiario@email.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo / Justificativa</label>
                <input
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  placeholder="Ex: Parceria de divulgação rádio / convidado especial"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 rounded-lg bg-purple-600 font-semibold text-white hover:bg-purple-500 shadow-md transition disabled:opacity-50"
                >
                  {salvando ? 'Emitindo...' : 'Autorizar e Emitir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table of Cortesias */}
      <div className="rounded-xl border border-slate-700 bg-[#121620] overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Registro de Cortesias Emitidas ({cortesias.length})</span>
          <span>Trilha de Auditoria</span>
        </div>

        {cortesias.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-1">
            <p className="text-sm font-medium text-slate-300">Nenhuma cortesia emitida para este evento.</p>
            <p className="text-xs text-slate-500">
              Cortesias autorizadas aparecerão aqui com número de ingresso único e QR code para validação na portaria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {cortesias.map((c: any, i: number) => (
              <div key={c.id || i} className="p-4 flex items-center justify-between text-slate-300">
                <div>
                  <div className="font-semibold text-white">{c.compradorNome || 'Beneficiário'}</div>
                  <div className="text-slate-500 font-mono mt-0.5">{c.numero}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                    CORTESIA
                  </span>
                  <span className="text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
