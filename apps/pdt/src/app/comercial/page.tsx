'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  DollarSign,
  FileCheck,
  Building,
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  RefreshCcw,
  Search,
  Sliders,
  ChevronRight,
  Handshake,
  Percent,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

type TabView = 'pipeline' | 'produtores' | 'condicoes' | 'atividades';

type ProdutorB2B = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  email: string;
  telefone?: string | null;
  status: string;
  executivoResponsavelId: string;
  createdAt: string;
};

type Oportunidade = {
  id: string;
  produtorId: string;
  produtorNome: string;
  titulo: string;
  valorEstimadoCents: number;
  etapa: string;
  probabilidadePercentual: number;
  dataFechamentoPrevista?: string | null;
  executivoId: string;
  createdAt: string;
  updatedAt: string;
};

type CondicaoComercial = {
  id: string;
  produtorId: string;
  produtorNome: string;
  eventoId?: string | null;
  taxaServicoPercentual: number;
  taxaProcessamentoPercentual: number;
  prazoRepasseDias: number;
  status: string;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  aprovadoPor?: string | null;
  aprovadoEm?: string | null;
};

type Atividade = {
  id: string;
  produtorId: string;
  produtorNome: string;
  oportunidadeId?: string | null;
  tipo: string;
  descricao: string;
  dataAgendada: string;
  realizada: boolean;
  realizadaEm?: string | null;
  executadoPor: string;
};

type ResumoPipeline = {
  totalOportunidades: number;
  valorTotalEstimadoCents: number;
  porEtapa: Record<string, { quantidade: number; valorTotalCents: number }>;
};

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const ETAPAS_PIPELINE = [
  { id: 'prospeccao', label: 'Prospecção', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'qualificacao', label: 'Qualificação', color: 'border-sky-500/30 bg-sky-500/5' },
  { id: 'proposta', label: 'Proposta Enviada', color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'negociacao', label: 'Negociação de Taxas', color: 'border-purple-500/30 bg-purple-500/5' },
  { id: 'contrato', label: 'Contrato & Homologação', color: 'border-indigo-500/30 bg-indigo-500/5' },
  { id: 'ganho', label: 'Ganho / Produtor Ativo', color: 'border-emerald-500/30 bg-emerald-500/5' },
];

export default function ComercialPage() {
  const { api } = useProducerEvent();
  const [tab, setTab] = useState<TabView>('pipeline');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Estados de dados
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [produtores, setProdutores] = useState<ProdutorB2B[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoComercial[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [resumo, setResumo] = useState<ResumoPipeline | null>(null);

  // Modais
  const [modalNovoProdutor, setModalNovoProdutor] = useState(false);
  const [modalNovaOportunidade, setModalNovaOportunidade] = useState(false);
  const [modalNovaCondicao, setModalNovaCondicao] = useState(false);
  const [modalNovaAtividade, setModalNovaAtividade] = useState(false);

  // Form states - Produtor
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // Form states - Oportunidade
  const [opTitulo, setOpTitulo] = useState('');
  const [opProdutorId, setOpProdutorId] = useState('');
  const [opValor, setOpValor] = useState('');
  const [opEtapa, setOpEtapa] = useState('prospeccao');
  const [opProb, setOpProb] = useState(30);

  // Form states - Condição
  const [cndProdutorId, setCndProdutorId] = useState('');
  const [cndTaxaServico, setCndTaxaServico] = useState('10.0');
  const [cndTaxaCartao, setCndTaxaCartao] = useState('2.5');
  const [cndPrazoRepasse, setCndPrazoRepasse] = useState('2');

  // Form states - Atividade
  const [atvProdutorId, setAtvProdutorId] = useState('');
  const [atvTipo, setAtvTipo] = useState('reuniao');
  const [atvDescricao, setAtvDescricao] = useState('');
  const [atvData, setAtvData] = useState(new Date().toISOString().slice(0, 16));

  const carregarDados = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rOp, rProd, rCnd, rAtv, rRes] = await Promise.all([
        fetch(`${api}/comercial/oportunidades`),
        fetch(`${api}/comercial/produtores`),
        fetch(`${api}/comercial/condicoes`),
        fetch(`${api}/comercial/atividades`),
        fetch(`${api}/comercial/pipeline/resumo`),
      ]);

      if (rOp.ok) {
        const opData = await rOp.json();
        setOportunidades(Array.isArray(opData) ? opData : []);
      }
      if (rProd.ok) {
        const prodData = await rProd.json();
        setProdutores(Array.isArray(prodData) ? prodData : []);
      }
      if (rCnd.ok) {
        const cndData = await rCnd.json();
        setCondicoes(Array.isArray(cndData) ? cndData : []);
      }
      if (rAtv.ok) {
        const atvData = await rAtv.json();
        setAtividades(Array.isArray(atvData) ? atvData : []);
      }
      if (rRes.ok) {
        setResumo(await rRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Alterar Etapa da Oportunidade
  const handleAvancarEtapa = async (id: string, etapaNova: string) => {
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/oportunidades/${id}/etapa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etapaNova,
          alteradoPor: '00000000-0000-0000-0000-000000000002',
          motivo: 'Avanço de negociação via pipeline',
        }),
      });

      if (!res.ok) throw new Error('Não foi possível alterar a etapa.');
      setFeedback({ tipo: 'success', texto: 'Etapa atualizada com sucesso no pipeline!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Erro ao alterar etapa.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Cadastrar Produtor B2B
  const handleCadastrarProdutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/produtores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razaoSocial,
          nomeFantasia: nomeFantasia || razaoSocial,
          documento,
          email,
          telefone: telefone || undefined,
          executivoResponsavelId: '00000000-0000-0000-0000-000000000002',
        }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar produtor B2B.');
      setFeedback({ tipo: 'success', texto: 'Produtor B2B cadastrado com sucesso!' });
      setModalNovoProdutor(false);
      setRazaoSocial('');
      setNomeFantasia('');
      setDocumento('');
      setEmail('');
      setTelefone('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao cadastrar produtor.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Criar Oportunidade
  const handleCriarOportunidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    const valorEstimadoCents = Math.round(Number(opValor.replace(',', '.')) * 100);

    try {
      const res = await fetch(`${api}/comercial/oportunidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId: opProdutorId || (produtores[0]?.id ?? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
          titulo: opTitulo,
          valorEstimadoCents,
          etapa: opEtapa as any,
          probabilidadePercentual: Number(opProb),
          executivoId: '00000000-0000-0000-0000-000000000002',
        }),
      });

      if (!res.ok) throw new Error('Erro ao abrir oportunidade.');
      setFeedback({ tipo: 'success', texto: 'Nova oportunidade registrada no pipeline comercial!' });
      setModalNovaOportunidade(false);
      setOpTitulo('');
      setOpValor('');
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao abrir oportunidade.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Aprovar Condição Comercial
  const handleAprovarCondicao = async (id: string) => {
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/condicoes/${id}/aprovar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovadoPor: '00000000-0000-0000-0000-000000000002' }),
      });

      if (!res.ok) throw new Error('Erro ao aprovar condição.');
      setFeedback({ tipo: 'success', texto: 'Condição comercial formalmente aprovada!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao aprovar.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Concluir Atividade
  const handleConcluirAtividade = async (id: string) => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/comercial/atividades/${id}/concluir`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Erro ao concluir atividade.');
      setFeedback({ tipo: 'success', texto: 'Atividade marcada como realizada!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha.' });
    }
  };

  const valorTotalPipeline = useMemo(() => {
    return oportunidades.reduce((acc, op) => acc + op.valorEstimadoCents, 0);
  }, [oportunidades]);

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Handshake size={13} />
            <span>CRM Corporativo B2B — Gestão Exclusiva de Produtores & Organizadores</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Comercial, Pipeline & Condições B2B
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Prospecção de novos eventos, pipeline ponderado, negociação de taxas e carteira de produtores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModalNovoProdutor(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Users size={14} />
            <span>Cadastrar Produtor B2B</span>
          </button>

          <button
            type="button"
            onClick={() => setModalNovaOportunidade(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition"
          >
            <Plus size={14} />
            <span>Nova Oportunidade</span>
          </button>

          <button
            onClick={() => void carregarDados()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
            title="Atualizar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>GMV no Pipeline</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">{formatBRL(valorTotalPipeline)}</div>
          <div className="text-[10px] text-slate-500 mt-1">{oportunidades.length} oportunidades ativas</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Produtores na Carteira</span>
            <Users size={16} className="text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">{produtores.length}</div>
          <div className="text-[10px] text-purple-400 mt-1 font-semibold">Organizadores homologados</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Taxa Média Pactuada</span>
            <Percent size={16} className="text-sky-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">9.5%</div>
          <div className="text-[10px] text-slate-500 mt-1">Conveniência média DiskIngressos</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Atividades Pendentes</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-xl font-black text-white mt-2">
            {atividades.filter((a) => !a.realizada).length}
          </div>
          <div className="text-[10px] text-amber-300 mt-1">Follow-ups e reuniões</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'pipeline' as TabView, label: 'Pipeline de Oportunidades (Kanban)', icon: Briefcase },
          { id: 'produtores' as TabView, label: 'Carteira de Produtores B2B', icon: Users },
          { id: 'condicoes' as TabView, label: 'Condições Comerciais Vigentes', icon: FileCheck },
          { id: 'atividades' as TabView, label: 'Agenda & Atividades Comerciais', icon: Calendar },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                active
                  ? 'bg-purple-500/15 border border-purple-500/40 text-purple-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <t.icon size={15} className={active ? 'text-purple-400' : 'text-slate-500'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="h-72 grid place-items-center text-slate-400">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : (
        <>
          {/* TAB: PIPELINE KANBAN */}
          {tab === 'pipeline' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
              {ETAPAS_PIPELINE.map((etapa) => {
                const opsNestaEtapa = oportunidades.filter((o) => o.etapa === etapa.id);
                const valorEtapa = opsNestaEtapa.reduce((a, b) => a + b.valorEstimadoCents, 0);

                return (
                  <div
                    key={etapa.id}
                    className={`rounded-xl border ${etapa.color} p-3 flex flex-col justify-between min-h-[420px]`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-200">{etapa.label}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-purple-400">
                          {opsNestaEtapa.length}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono font-bold text-slate-400 mb-3">
                        Total: <span className="text-white">{formatBRL(valorEtapa)}</span>
                      </div>

                      <div className="space-y-2.5">
                        {opsNestaEtapa.map((op) => (
                          <div
                            key={op.id}
                            className="bg-[#111827] border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">{op.titulo}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{op.produtorNome}</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-400 font-mono">
                                {formatBRL(op.valorEstimadoCents)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">{op.probabilidadePercentual}% prob</span>
                            </div>

                            {/* Seletor de avanço de etapa */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold">Mudar etapa:</span>
                              <select
                                value={op.etapa}
                                onChange={(e) => handleAvancarEtapa(op.id, e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-purple-500"
                              >
                                {ETAPAS_PIPELINE.map((e) => (
                                  <option key={e.id} value={e.id}>
                                    {e.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: PRODUTORES B2B */}
          {tab === 'produtores' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Carteira Corporativa de Produtores</h2>
                  <p className="text-slate-400 text-xs">Organizadores parceiros e empresas contratantes.</p>
                </div>
                <button
                  onClick={() => setModalNovoProdutor(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Cadastrar
                </button>
              </div>

              {produtores.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Razão Social / Nome Fantasia</th>
                        <th className="p-3.5">Documento (CNPJ)</th>
                        <th className="p-3.5">E-mail Comercial</th>
                        <th className="p-3.5">Telefone</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {produtores.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{p.nomeFantasia || p.razaoSocial}</div>
                            <div className="text-[10px] text-slate-400">{p.razaoSocial}</div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">{p.documento}</td>
                          <td className="p-3.5 text-slate-300">{p.email}</td>
                          <td className="p-3.5 text-slate-400">{p.telefone || '-'}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold capitalize">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Users size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhum produtor B2B registrado na carteira comercial.
                </div>
              )}
            </div>
          )}

          {/* TAB: CONDIÇÕES COMERCIAIS */}
          {tab === 'condicoes' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Condições Comerciais Pactuadas</h2>
                  <p className="text-slate-400 text-xs">
                    Taxas de conveniência, taxas de adquirente e prazos de liquidação negociados.
                  </p>
                </div>
              </div>

              {condicoes.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Produtor</th>
                        <th className="p-3.5 text-right">Taxa Conveniência</th>
                        <th className="p-3.5 text-right">Taxa Processamento</th>
                        <th className="p-3.5 text-center">Prazo Repasse</th>
                        <th className="p-3.5 text-left">Status</th>
                        <th className="p-3.5 text-center">Aprovação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {condicoes.map((c) => {
                        const isAprovada = c.status === 'aprovada';
                        return (
                          <tr key={c.id} className="hover:bg-slate-800/30">
                            <td className="p-3.5 font-bold text-white">{c.produtorNome}</td>
                            <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                              {c.taxaServicoPercentual}%
                            </td>
                            <td className="p-3.5 text-right font-mono text-sky-400">
                              {c.taxaProcessamentoPercentual}%
                            </td>
                            <td className="p-3.5 text-center font-mono">D+{c.prazoRepasseDias}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isAprovada
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              {!isAprovada ? (
                                <button
                                  onClick={() => handleAprovarCondicao(c.id)}
                                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition"
                                >
                                  Aprovar Condição
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-semibold">Homologada</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <FileCheck size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhuma condição comercial cadastrada.
                </div>
              )}
            </div>
          )}

          {/* TAB: ATIVIDADES */}
          {tab === 'atividades' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Agenda & Follow-ups Comerciais</h2>
                  <p className="text-slate-400 text-xs">Reuniões, propostas e histórico de contatos com produtores.</p>
                </div>
              </div>

              {atividades.length ? (
                <div className="divide-y divide-slate-800/80">
                  {atividades.map((a) => (
                    <div key={a.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-lg border ${
                            a.realizada
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {a.tipo === 'reuniao' ? <Users size={16} /> : <PhoneCall size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{a.produtorNome}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold uppercase">
                              {a.tipo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{a.descricao}</p>
                          <span className="text-[10px] text-slate-500">
                            Agendado para: {new Date(a.dataAgendada).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div>
                        {!a.realizada ? (
                          <button
                            onClick={() => handleConcluirAtividade(a.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                          >
                            Concluir
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Realizada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Calendar size={24} className="mx-auto mb-2 opacity-50" />
                  Nenhuma atividade agendada no momento.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL CADASTRAR PRODUTOR B2B */}
      {modalNovoProdutor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cadastrar Produtor B2B</h3>
                <p className="text-slate-400 text-xs">Inserção de organizador na carteira comercial.</p>
              </div>
            </div>

            <form onSubmit={handleCadastrarProdutor} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Razão Social</label>
                <input
                  required
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Ex: Prime Produções de Espetáculos Ltda"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Nome Fantasia</label>
                <input
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Ex: Prime Eventos"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">CNPJ / CPF</label>
                  <input
                    required
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Telefone / WhatsApp</label>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(41) 99999-9999"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">E-mail Comercial</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@produtora.com.br"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoProdutor(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA OPORTUNIDADE */}
      {modalNovaOportunidade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nova Oportunidade no Funil</h3>
                <p className="text-slate-400 text-xs">Abertura de negociação para captação de evento.</p>
              </div>
            </div>

            <form onSubmit={handleCriarOportunidade} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Título da Oportunidade</label>
                <input
                  required
                  value={opTitulo}
                  onChange={(e) => setOpTitulo(e.target.value)}
                  placeholder="Ex: Turnê Estádios Sudeste 2027"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Produtor Vinculado</label>
                <select
                  value={opProdutorId}
                  onChange={(e) => setOpProdutorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomeFantasia || p.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">GMV Estimado (R$)</label>
                  <input
                    required
                    value={opValor}
                    onChange={(e) => setOpValor(e.target.value)}
                    placeholder="Ex: 500000,00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Probabilidade (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={opProb}
                    onChange={(e) => setOpProb(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Etapa Inicial</label>
                <select
                  value={opEtapa}
                  onChange={(e) => setOpEtapa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {ETAPAS_PIPELINE.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaOportunidade(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Gravar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
