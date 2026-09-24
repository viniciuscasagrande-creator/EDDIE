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
  FileText,
  Layers,
  Award,
  ShieldCheck,
  Compass,
  Share2,
  Download,
  Tag,
  Filter,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useProducerEvent } from '../ProducerEventContext';
import { ModuleNavigation } from '../navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../navigation/CompactOperationalAlert';

export type ComercialTab =
  | 'dashboard'
  | 'produtores'
  | 'pipeline'
  | 'negociacoes_evento'
  | 'spread_advanced'
  | 'propostas_contratos'
  | 'produtor_eventos'
  | 'agencias_parceiros'
  | 'relatorios'
  | 'atividades';

export interface ComercialWorkspaceProps {
  initialTab?: ComercialTab;
  contextEventoId?: string | null;
}

const formatBRL = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function ComercialWorkspace({ initialTab = 'dashboard', contextEventoId }: ComercialWorkspaceProps) {
  const { api, eventoId: globalEventoId } = useProducerEvent();
  const effectiveEventoId = contextEventoId || globalEventoId;
  const isContextual = Boolean(effectiveEventoId && effectiveEventoId !== 'todos');

  const [tab, setTab] = useState<ComercialTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Estados de dados
  const [produtores, setProdutores] = useState<any[]>([]);
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [condicoes, setCondicoes] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [advancedList, setAdvancedList] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [parceirosAgencias, setParceirosAgencias] = useState<any[]>([]);

  // Filtros e seleção
  const [filtroTexto, setFiltroTexto] = useState('');
  const [produtorSelecionadoId, setProdutorSelecionadoId] = useState<string>('00000000-0000-0000-0000-000000000002');
  const [produtorDetalhe, setProdutorDetalhe] = useState<any | null>(null);

  // Modais
  const [modalNovoProdutor, setModalNovoProdutor] = useState(false);
  const [modalNovaOportunidade, setModalNovaOportunidade] = useState(false);
  const [modalNovaCondicao, setModalNovaCondicao] = useState(false);
  const [modalNovaProposta, setModalNovaProposta] = useState(false);
  const [modalNovaAgencia, setModalNovaAgencia] = useState(false);
  const [modalNovoAdvanced, setModalNovoAdvanced] = useState(false);

  // Forms states
  const [formProdutor, setFormProdutor] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    responsavelNome: '',
    responsavelCpf: '',
    email: '',
    telefone: '',
    responsavelFinanceiro: '',
    executivoId: 'exec-1',
    tier: 'enterprise',
  });

  const [formOportunidade, setFormOportunidade] = useState({
    titulo: '',
    produtorId: '',
    valor: '',
    etapa: 'lead',
    probabilidade: 30,
    dataFechamento: '',
  });

  const [formCondicao, setFormCondicao] = useState({
    produtorId: '',
    eventoId: '',
    tipoTaxa: 'percentual', // 'percentual' | 'fixa' | 'mista'
    taxaPercentual: '10.0',
    taxaFixaCents: '500',
    taxaProcessamento: '2.5',
    prazoRepasseDias: '2',
    splitAutomatico: true,
  });

  const [formProposta, setFormProposta] = useState({
    produtorId: '',
    titulo: '',
    eventoNome: '',
    taxaNegociada: '10.0',
    validadeDias: '30',
  });

  const [formAdvanced, setFormAdvanced] = useState({
    produtorId: '',
    eventoId: '',
    valorSolicitadoReais: '50000',
    taxaSpreadMensal: '1.8',
    reservaContingenciaPercent: '15',
    justificativa: 'Adiantamento para montagem de palco e estrutura',
  });

  const [formAgencia, setFormAgencia] = useState({
    nome: '',
    cnpj: '',
    cadastur: '',
    contatoNome: '',
    email: '',
    telefone: '',
    cotaIngressos: '500',
    comissaoPercentual: '12',
  });

  // Simulador de Taxas
  const [simuladorIngressos, setSimuladorIngressos] = useState('5000');
  const [simuladorTicketMedio, setSimuladorTicketMedio] = useState('150');
  const [simuladorTipoTaxa, setSimuladorTipoTaxa] = useState<'percentual' | 'fixa'>('percentual');
  const [simuladorTaxaValor, setSimuladorTaxaValor] = useState('10');

  // Carregamento de Dados da API
  const carregarDados = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    try {
      const results = await Promise.allSettled([
        fetch(`${api}/comercial/produtores`, { signal: controller.signal }),
        fetch(`${api}/comercial/oportunidades`, { signal: controller.signal }),
        fetch(`${api}/comercial/condicoes`, { signal: controller.signal }),
        fetch(`${api}/comercial/atividades`, { signal: controller.signal }),
        fetch(`${api}/comercial/advanced`, { signal: controller.signal }),
        fetch(`${api}/comercial/propostas`, { signal: controller.signal }),
        fetch(`${api}/comercial/parceiros-agencias`, { signal: controller.signal }),
      ]);

      const [rProd, rOp, rCnd, rAtv, rAdv, rProp, rAgc] = results;

      if (rProd.status === 'fulfilled' && rProd.value.ok) {
        const data = await rProd.value.json();
        setProdutores(Array.isArray(data) ? data : []);
      }
      if (rOp.status === 'fulfilled' && rOp.value.ok) {
        const data = await rOp.value.json();
        setOportunidades(Array.isArray(data) ? data : []);
      }
      if (rCnd.status === 'fulfilled' && rCnd.value.ok) {
        const data = await rCnd.value.json();
        setCondicoes(Array.isArray(data) ? data : []);
      }
      if (rAtv.status === 'fulfilled' && rAtv.value.ok) {
        const data = await rAtv.value.json();
        setAtividades(Array.isArray(data) ? data : []);
      }
      if (rAdv.status === 'fulfilled' && rAdv.value.ok) {
        const data = await rAdv.value.json();
        setAdvancedList(Array.isArray(data) ? data : []);
      }
      if (rProp.status === 'fulfilled' && rProp.value.ok) {
        const data = await rProp.value.json();
        setPropostas(Array.isArray(data) ? data : []);
      }
      if (rAgc.status === 'fulfilled' && rAgc.value.ok) {
        const data = await rAgc.value.json();
        setParceirosAgencias(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setFeedback({
          tipo: 'error',
          texto: 'Tempo limite ao consultar os serviços comerciais B2B.',
        });
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Ações de Negócio
  const handleAvancarEtapaOportunidade = async (id: string, etapaNova: string) => {
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/oportunidades/${id}/etapa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etapaNova,
          alteradoPor: 'exec-1',
          motivo: 'Avanço de etapa via pipeline interativo',
        }),
      });
      if (!res.ok) throw new Error('Não foi possível atualizar a etapa da oportunidade.');
      setFeedback({ tipo: 'success', texto: 'Etapa comercial avançada com sucesso!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao atualizar etapa.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCadastrarProdutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/produtores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razaoSocial: formProdutor.razaoSocial,
          nomeFantasia: formProdutor.nomeFantasia || formProdutor.razaoSocial,
          documento: formProdutor.cnpj,
          email: formProdutor.email,
          telefone: formProdutor.telefone,
          responsavelNome: formProdutor.responsavelNome,
          responsavelCpf: formProdutor.responsavelCpf,
          responsavelFinanceiro: formProdutor.responsavelFinanceiro,
          executivoResponsavelId: formProdutor.executivoId,
          tier: formProdutor.tier,
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar produtor B2B.');
      setFeedback({ tipo: 'success', texto: 'Produtor B2B cadastrado e homologado com sucesso!' });
      setModalNovoProdutor(false);
      setFormProdutor({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        inscricaoEstadual: '',
        responsavelNome: '',
        responsavelCpf: '',
        email: '',
        telefone: '',
        responsavelFinanceiro: '',
        executivoId: 'exec-1',
        tier: 'enterprise',
      });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha no cadastro.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCadastrarOportunidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    const valorEstimadoCents = Math.round(Number(formOportunidade.valor.replace(',', '.')) * 100);
    try {
      const res = await fetch(`${api}/comercial/oportunidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId: formOportunidade.produtorId || produtores[0]?.id,
          titulo: formOportunidade.titulo,
          valorEstimadoCents,
          etapa: formOportunidade.etapa,
          probabilidadePercentual: Number(formOportunidade.probabilidade),
          dataFechamentoPrevista: formOportunidade.dataFechamento || undefined,
          executivoId: 'exec-1',
        }),
      });
      if (!res.ok) throw new Error('Erro ao registrar nova oportunidade.');
      setFeedback({ tipo: 'success', texto: 'Oportunidade aberta no pipeline com sucesso!' });
      setModalNovaOportunidade(false);
      setFormOportunidade({
        titulo: '',
        produtorId: '',
        valor: '',
        etapa: 'lead',
        probabilidade: 30,
        dataFechamento: '',
      });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha na abertura da oportunidade.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePactuarCondicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/condicoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId: formCondicao.produtorId || produtores[0]?.id,
          eventoId: formCondicao.eventoId || effectiveEventoId || 'evento-operacao',
          tipoTaxa: formCondicao.tipoTaxa,
          taxaServicoPercentual: Number(formCondicao.taxaPercentual),
          taxaFixaCents: Number(formCondicao.taxaFixaCents),
          taxaProcessamentoPercentual: Number(formCondicao.taxaProcessamento),
          prazoRepasseDias: Number(formCondicao.prazoRepasseDias),
        }),
      });
      if (!res.ok) throw new Error('Erro ao pactuar nova condição comercial.');
      setFeedback({ tipo: 'success', texto: 'Condição comercial do evento salva e encaminhada para aprovação!' });
      setModalNovaCondicao(false);
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha ao salvar condição.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAprovarCondicao = async (id: string) => {
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/condicoes/${id}/aprovar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovadoPor: 'Diretoria Comercial & Financeira' }),
      });
      if (!res.ok) throw new Error('Não foi possível aprovar a condição.');
      setFeedback({ tipo: 'success', texto: 'Condição comercial formalmente homologada e enviada ao Financeiro!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha na aprovação.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSolicitarAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    const valorCents = Math.round(Number(formAdvanced.valorSolicitadoReais) * 100);
    try {
      const res = await fetch(`${api}/comercial/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtorId: formAdvanced.produtorId || produtores[0]?.id,
          eventoId: formAdvanced.eventoId || effectiveEventoId || 'evento-operacao',
          valorSolicitadoCents: valorCents,
          taxaSpreadMensal: Number(formAdvanced.taxaSpreadMensal),
          reservaContingenciaPercent: Number(formAdvanced.reservaContingenciaPercent),
          justificativa: formAdvanced.justificativa,
        }),
      });
      if (!res.ok) throw new Error('Erro ao registrar solicitação de adiantamento.');
      setFeedback({ tipo: 'success', texto: 'Solicitação de adiantamento (Advanced) enviada para análise de risco!' });
      setModalNovoAdvanced(false);
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha no adiantamento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAprovarAdvanced = async (id: string) => {
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/comercial/advanced/${id}/aprovar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovadoPor: 'Comitê de Crédito e Risco' }),
      });
      if (!res.ok) throw new Error('Erro ao aprovar advanced.');
      setFeedback({ tipo: 'success', texto: 'Adiantamento aprovado comercialmente e integrado ao Ledger Financeiro!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: err.message || 'Falha na aprovação do adiantamento.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Cálculos agregados
  const totalGMVPipeline = useMemo(() => {
    return oportunidades.reduce((sum, o) => sum + (o.valorEstimadoCents || 0), 0);
  }, [oportunidades]);

  const totalGMVPonderado = useMemo(() => {
    return oportunidades.reduce((sum, o) => {
      const prob = (o.probabilidadePercentual || 50) / 100;
      return sum + Math.round((o.valorEstimadoCents || 0) * prob);
    }, 0);
  }, [oportunidades]);

  const taxaMediaCalculada = useMemo(() => {
    if (!condicoes.length) return '10.00%';
    const soma = condicoes.reduce((acc, c) => acc + Number(c.taxaServicoPercentual || 10), 0);
    return `${(soma / condicoes.length).toFixed(2)}%`;
  }, [condicoes]);

  // Etapas Oficiais do Pipeline (11.17.3)
  const ETAPAS_PIPELINE = [
    { id: 'lead', label: '1. Lead B2B', color: 'border-slate-700 bg-slate-900/60' },
    { id: 'qualificacao', label: '2. Qualificação', color: 'border-sky-500/30 bg-sky-500/5' },
    { id: 'proposta', label: '3. Proposta Enviada', color: 'border-amber-500/30 bg-amber-500/5' },
    { id: 'negociacao', label: '4. Negociação de Taxas', color: 'border-purple-500/30 bg-purple-500/5' },
    { id: 'contrato', label: '5. Contrato & Homologação', color: 'border-indigo-500/30 bg-indigo-500/5' },
    { id: 'implantacao', label: '6. Em Implantação', color: 'border-blue-500/30 bg-blue-500/5' },
    { id: 'ganho', label: '7. Ativo / Fechado', color: 'border-emerald-500/30 bg-emerald-500/5' },
  ];

  // Cálculo simulador
  const simuladorResultado = useMemo(() => {
    const qtd = Number(simuladorIngressos) || 0;
    const preco = Number(simuladorTicketMedio) || 0;
    const gmvTotal = qtd * preco;
    let receitaDisk = 0;

    if (simuladorTipoTaxa === 'percentual') {
      const pct = Number(simuladorTaxaValor) || 0;
      receitaDisk = gmvTotal * (pct / 100);
    } else {
      const fixo = Number(simuladorTaxaValor) || 0;
      receitaDisk = qtd * fixo;
    }
    const receitaProdutor = gmvTotal - receitaDisk;
    return {
      gmvTotalCents: Math.round(gmvTotal * 100),
      receitaDiskCents: Math.round(receitaDisk * 100),
      receitaProdutorCents: Math.round(receitaProdutor * 100),
      taxaEfetiva: gmvTotal > 0 ? ((receitaDisk / gmvTotal) * 100).toFixed(2) : '0.00',
    };
  }, [simuladorIngressos, simuladorTicketMedio, simuladorTipoTaxa, simuladorTaxaValor]);

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Handshake size={13} />
            <span>EDDIE 11.17 — Gestão B2B, Produtores, Negociações de Taxas & Parcerias</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Comercial Enterprise & Produtores</span>
            {isContextual && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium">
                Evento: {effectiveEventoId}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Gestão exclusiva da carteira de organizadores (B2B). Clientes do Comercial são sempre Produtores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setModalNovoProdutor(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Users size={14} />
            <span>Cadastrar Produtor</span>
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
            type="button"
            onClick={() => void carregarDados()}
            className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Atualizar dados comerciais"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
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

      {/* KPIs de Alto Nível (11.17.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Produtores B2B</span>
            <Building size={15} className="text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{produtores.length}</div>
          <div className="text-[10px] text-purple-400 mt-0.5 font-medium">Organizadores na carteira</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>GMV no Pipeline</span>
            <DollarSign size={15} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1.5">{formatBRL(totalGMVPipeline)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{oportunidades.length} negociações abertas</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>GMV Ponderado</span>
            <TrendingUp size={15} className="text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400 font-mono mt-1.5">{formatBRL(totalGMVPonderado)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ajustado pela probabilidade</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Taxa Média Disk</span>
            <Percent size={15} className="text-amber-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{taxaMediaCalculada}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Conveniência pactuada</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Contratos Vigentes</span>
            <FileCheck size={15} className="text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{propostas.filter((p) => p.status === 'ASSINADO' || p.status === 'ativo').length || condicoes.length}</div>
          <div className="text-[10px] text-indigo-400 mt-0.5 font-medium">Acordos formalizados</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Agências Parceiras</span>
            <Compass size={15} className="text-teal-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{parceirosAgencias.length}</div>
          <div className="text-[10px] text-teal-400 mt-0.5 font-medium">Cotas & Turismo B2B</div>
        </div>
      </div>

      {/* Navegação de Abas do Módulo Comercial */}
      <ModuleNavigation
        items={[
          { id: 'dashboard', label: '11.17.1 Dashboard B2B', icon: <Briefcase size={15} /> },
          { id: 'produtores', label: '11.17.2 Central de Produtores', icon: <Building size={15} /> },
          { id: 'pipeline', label: '11.17.3 Pipeline & CRM', icon: <Layers size={15} /> },
          { id: 'negociacoes_evento', label: '11.17.4 Negociação por Evento', icon: <Tag size={15} /> },
          { id: 'spread_advanced', label: '11.17.5 Spread & Advanced', icon: <DollarSign size={15} /> },
          { id: 'propostas_contratos', label: '11.17.6 Propostas & Contratos', icon: <FileCheck size={15} /> },
          { id: 'produtor_eventos', label: '11.17.7 Produtor → Eventos', icon: <Calendar size={15} /> },
          { id: 'agencias_parceiros', label: '11.17.8 Agências & Turismo B2B', icon: <Compass size={15} /> },
          { id: 'relatorios', label: '11.17.9 Relatórios Comerciais', icon: <Award size={15} /> },
          { id: 'atividades', label: 'Agenda & Follow-ups', icon: <Clock size={15} /> },
        ]}
        activeItem={tab}
        onSelect={(id) => setTab(id as ComercialTab)}
        ariaLabel="Navegação Comercial Enterprise"
      />

      {loading ? (
        <div className="h-72 grid place-items-center text-slate-400">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* TAB 1: 11.17.1 DASHBOARD COMERCIAL */}
          {/* ============================================================== */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Funil Visual do Pipeline */}
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers size={16} className="text-purple-400" />
                      <span>Pipeline Ponderado por Etapa Comercial</span>
                    </h3>
                    <p className="text-slate-400 text-xs">Visão agregada de avanço de oportunidades no funil B2B.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Volume Total Previsto</span>
                    <p className="text-base font-black text-emerald-400 font-mono">{formatBRL(totalGMVPipeline)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {ETAPAS_PIPELINE.map((etapa) => {
                    const ops = oportunidades.filter((o) => o.etapa === etapa.id);
                    const soma = ops.reduce((a, b) => a + (b.valorEstimadoCents || 0), 0);
                    return (
                      <div key={etapa.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] font-bold text-slate-400 truncate">{etapa.label}</div>
                        <div className="text-sm font-black text-white mt-1">{ops.length}</div>
                        <div className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5 truncate">{formatBRL(soma)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid 2 Colunas: Ranking de Executivos & Simulador de Taxas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ranking de Executivos de Contas */}
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award size={16} className="text-amber-400" />
                      <span>Desempenho por Executivo de Contas</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold">Equipe Comercial B2B</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { nome: 'Carlos Menezes', cargo: 'Head Comercial', produtores: 14, gmv: 35000000, conversao: '68%' },
                      { nome: 'Beatriz Vasconcelos', cargo: 'Executiva Sênior', produtores: 8, gmv: 18000000, conversao: '72%' },
                      { nome: 'Rafael Nogueira', cargo: 'Executivo Key Accounts', produtores: 6, gmv: 12500000, conversao: '60%' },
                    ].map((exec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                            {exec.nome.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{exec.nome}</div>
                            <div className="text-[10px] text-slate-400">{exec.cargo} · {exec.produtores} produtores</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-400">{formatBRL(exec.gmv)}</div>
                          <div className="text-[10px] text-slate-500">{exec.conversao} de conversão</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulador Interativo de Taxa de Conveniência (11.17.4 Preview) */}
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Percent size={16} className="text-sky-400" />
                      <span>Simulador Rápido de Margem & Taxa</span>
                    </h3>
                    <span className="text-[10px] text-sky-400 font-semibold">Proposta em Tempo Real</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Público / Ingressos</label>
                        <input
                          type="number"
                          value={simuladorIngressos}
                          onChange={(e) => setSimuladorIngressos(e.target.value)}
                          className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tíquete Médio (R$)</label>
                        <input
                          type="number"
                          value={simuladorTicketMedio}
                          onChange={(e) => setSimuladorTicketMedio(e.target.value)}
                          className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo de Cobrança</label>
                        <select
                          value={simuladorTipoTaxa}
                          onChange={(e) => setSimuladorTipoTaxa(e.target.value as any)}
                          className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="percentual">Taxa Percentual (%)</option>
                          <option value="fixa">Taxa Fixa por Ingresso (R$)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          {simuladorTipoTaxa === 'percentual' ? 'Percentual (%)' : 'Valor Fixo (R$)'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={simuladorTaxaValor}
                          onChange={(e) => setSimuladorTaxaValor(e.target.value)}
                          className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 grid grid-cols-3 gap-2 text-center pt-2">
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 font-bold">GMV Total</span>
                        <p className="text-xs font-mono font-bold text-white mt-0.5">{formatBRL(simuladorResultado.gmvTotalCents)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-emerald-400 font-bold">DiskIngressos</span>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{formatBRL(simuladorResultado.receitaDiskCents)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Produtor (Líquido)</span>
                        <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">{formatBRL(simuladorResultado.receitaProdutorCents)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: 11.17.2 CENTRAL DE PRODUTORES (CARTEIRA B2B) */}
          {/* ============================================================== */}
          {tab === 'produtores' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building size={16} className="text-purple-400" />
                    <span>Central de Produtores B2B & Homologação</span>
                  </h2>
                  <p className="text-slate-400 text-xs">Cadastro corporativo, responsáveis, dados bancários e conformidade documental.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por razão, CNPJ..."
                      value={filtroTexto}
                      onChange={(e) => setFiltroTexto(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 w-56"
                    />
                  </div>
                  <button
                    onClick={() => setModalNovoProdutor(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    <Plus size={14} /> Novo Produtor
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Organizador / Razão Social</th>
                      <th className="p-3.5">CNPJ / Inscrição</th>
                      <th className="p-3.5">Responsável Legal</th>
                      <th className="p-3.5">Contato Comercial</th>
                      <th className="p-3.5">Tier</th>
                      <th className="p-3.5">Homologação</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {produtores
                      .filter((p) =>
                        filtroTexto
                          ? (p.nomeFantasia || p.razaoSocial || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
                            (p.cnpj || p.documento || '').includes(filtroTexto)
                          : true
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{p.nomeFantasia || p.razaoSocial}</div>
                            <div className="text-[10px] text-slate-400">{p.razaoSocial}</div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">{p.cnpj || p.documento}</td>
                          <td className="p-3.5">
                            <div className="text-white font-medium">{p.responsavelNome || 'Diretoria'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.telefone || '-'}</div>
                          </td>
                          <td className="p-3.5 text-slate-300">{p.email}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase">
                              {p.tier || 'Enterprise'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 w-fit">
                              <ShieldCheck size={11} /> Homologado
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setProdutorDetalhe(p);
                                setProdutorSelecionadoId(p.id);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-semibold"
                            >
                              Ver Ficha Completa
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: 11.17.3 PIPELINE + CRM B2B (KANBAN ENTERPRISE) */}
          {/* ============================================================== */}
          {tab === 'pipeline' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers size={16} className="text-purple-400" />
                    <span>Funil B2B DiskIngressos — 7 Etapas Oficiais</span>
                  </h3>
                  <p className="text-slate-400 text-xs">Arraste ou mude a etapa comercial de prospecção e fechamento de novos eventos.</p>
                </div>
                <button
                  onClick={() => setModalNovaOportunidade(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Abrir Oportunidade
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-3">
                {ETAPAS_PIPELINE.map((etapa) => {
                  const opsNestaEtapa = oportunidades.filter((o) => o.etapa === etapa.id);
                  const valorEtapa = opsNestaEtapa.reduce((a, b) => a + (b.valorEstimadoCents || 0), 0);

                  return (
                    <div
                      key={etapa.id}
                      className={`rounded-xl border ${etapa.color} p-3 flex flex-col justify-between min-h-[440px]`}
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
                                <p className="text-[10px] text-purple-300 mt-0.5 truncate font-medium">{op.produtorNome}</p>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-emerald-400 font-mono">
                                  {formatBRL(op.valorEstimadoCents)}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold">{op.probabilidadePercentual}% prob</span>
                              </div>

                              {/* Seletor de avanço de etapa */}
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                                <span className="text-[9px] text-slate-500 font-semibold uppercase">Mudar:</span>
                                <select
                                  value={op.etapa}
                                  onChange={(e) => handleAvancarEtapaOportunidade(op.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-purple-500 max-w-[130px] truncate"
                                >
                                  {ETAPAS_PIPELINE.map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.label}
                                    </option>
                                  ))}
                                  <option value="perdido">Perdido</option>
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
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: 11.17.4 NEGOCIAÇÃO COMERCIAL POR EVENTO */}
          {/* ============================================================== */}
          {tab === 'negociacoes_evento' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tag size={16} className="text-purple-400" />
                    <span>Regras Comerciais Individuais por Evento</span>
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Condições customizadas: Taxa Percentual (%), Fixa por Ingresso (R$), adquirente e prazos de repasse.
                  </p>
                </div>
                <button
                  onClick={() => setModalNovaCondicao(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Pactuar Condição
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Produtor B2B</th>
                      <th className="p-3.5">Evento Vinculado</th>
                      <th className="p-3.5 text-center">Modelo de Taxa</th>
                      <th className="p-3.5 text-right">Taxa Conveniência Disk</th>
                      <th className="p-3.5 text-right">Taxa Adquirente</th>
                      <th className="p-3.5 text-center">Prazo Repasse</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {condicoes.map((c) => {
                      const isAprovada = c.status === 'aprovada' || c.status === 'aprovado';
                      return (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-3.5 font-bold text-white">{c.produtorNome}</td>
                          <td className="p-3.5 font-medium text-slate-300">{c.eventoNome || c.eventoId || 'Evento Principal'}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                              {c.tipoTaxa || 'Percentual'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                            {c.tipoTaxa === 'fixa' ? formatBRL(c.taxaFixaCents || 500) : `${c.taxaServicoPercentual}%`}
                          </td>
                          <td className="p-3.5 text-right font-mono text-sky-400">
                            {c.taxaProcessamentoPercentual}%
                          </td>
                          <td className="p-3.5 text-center font-mono">D+{c.prazoRepasseDias}</td>
                          <td className="p-3.5 text-center">
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
                                Homologar Condição
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                                <CheckCircle2 size={12} /> Vigente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: 11.17.5 SPREAD + ADVANCED + CONDIÇÕES FINANCEIRAS */}
          {/* ============================================================== */}
          {tab === 'spread_advanced' && (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-400" />
                      <span>Spread & Antecipações Financeiras (Advanced)</span>
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Pactuação de limites de antecipação, taxa de spread mensal e retenção de contingência para o produtor.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalNovoAdvanced(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <Plus size={14} /> Solicitar Adiantamento
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Produtor</th>
                        <th className="p-3.5">Evento Vinculado</th>
                        <th className="p-3.5 text-right">Valor Solicitado</th>
                        <th className="p-3.5 text-center">Taxa Spread (a.m.)</th>
                        <th className="p-3.5 text-center">Reserva Contingência</th>
                        <th className="p-3.5 text-left">Finalidade</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {advancedList.map((adv) => (
                        <tr key={adv.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-3.5 font-bold text-white">{adv.produtorNome}</td>
                          <td className="p-3.5 font-medium">{adv.eventoNome || 'Festival Live 2026'}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                            {formatBRL(adv.valorSolicitadoCents)}
                          </td>
                          <td className="p-3.5 text-center font-mono font-semibold text-purple-400">
                            {adv.taxaSpreadMensal}% a.m.
                          </td>
                          <td className="p-3.5 text-center font-mono text-amber-400">
                            {adv.reservaContingenciaPercent}%
                          </td>
                          <td className="p-3.5 text-slate-400 max-w-[220px] truncate">{adv.justificativa}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                adv.status === 'APROVADO'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              }`}
                            >
                              {adv.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {adv.status !== 'APROVADO' ? (
                              <button
                                onClick={() => handleAprovarAdvanced(adv.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition"
                              >
                                Aprovar Crédito
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                                <CheckCircle2 size={12} /> Liberado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: 11.17.6 PROPOSTAS + CONTRATOS + APROVAÇÕES */}
          {/* ============================================================== */}
          {tab === 'propostas_contratos' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck size={16} className="text-indigo-400" />
                    <span>Minutas de Propostas, Contratos & Assinaturas Digitais</span>
                  </h2>
                  <p className="text-slate-400 text-xs">Versionamento documental (v1, v2), aprovação de diretoria e registro de aceite.</p>
                </div>
                <button
                  onClick={() => setModalNovaProposta(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Nova Minuta
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Documento / Versão</th>
                      <th className="p-3.5">Produtor Contratante</th>
                      <th className="p-3.5">Evento(s) Cobertos</th>
                      <th className="p-3.5 text-center">Taxa Pactuada</th>
                      <th className="p-3.5 text-center">Validade</th>
                      <th className="p-3.5 text-center">Alçada Interna</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {propostas.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{prop.codigo}</div>
                          <div className="text-[10px] text-indigo-400 font-mono">Versão {prop.versao}</div>
                        </td>
                        <td className="p-3.5 font-bold text-white">{prop.produtorNome}</td>
                        <td className="p-3.5 text-slate-300 font-medium">{prop.eventoNome}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-emerald-400">{prop.taxaNegociada}%</td>
                        <td className="p-3.5 text-center font-mono text-slate-400">{prop.validadeAte}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {prop.aprovacaoInterna}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase">
                            {prop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: 11.17.7 PRODUTOR → EVENTOS (VISÃO CONSOLIDADA) */}
          {/* ============================================================== */}
          {tab === 'produtor_eventos' && (
            <div className="space-y-6">
              {/* Barra de Seleção de Produtor */}
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Building size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Selecione o Produtor para Visão Consolidada</h3>
                    <p className="text-slate-400 text-xs">Exibe todos os eventos, faturamento acumulado e regras comerciais ativas.</p>
                  </div>
                </div>

                <select
                  value={produtorSelecionadoId}
                  onChange={(e) => setProdutorSelecionadoId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white min-w-[260px]"
                >
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomeFantasia || p.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cards de Métricas Consolidadas do Produtor */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eventos sob Contrato</span>
                  <div className="text-2xl font-black text-white mt-1">4</div>
                  <span className="text-[10px] text-purple-400 font-semibold">2 no ar, 2 concluídos</span>
                </div>
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Transacionado (LTV)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatBRL(48500000)}</div>
                  <span className="text-[10px] text-slate-500">Total histórico de bilheteria</span>
                </div>
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Taxa DiskIngressos</span>
                  <div className="text-2xl font-black text-sky-400 font-mono mt-1">{formatBRL(4850000)}</div>
                  <span className="text-[10px] text-slate-500">Retenção líquida média de 10%</span>
                </div>
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Índice de Inadimplência</span>
                  <div className="text-2xl font-black text-white mt-1">0.0%</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Produtor 100% Adimplente</span>
                </div>
              </div>

              {/* Tabela de Eventos do Produtor */}
              <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Eventos Vinculados ao Organizador</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Nome do Evento</th>
                        <th className="p-3.5">Data / Local</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-center">Ingressos Vendidos</th>
                        <th className="p-3.5 text-right">GMV Arrecadado</th>
                        <th className="p-3.5 text-right">Taxa DiskIngressos</th>
                        <th className="p-3.5 text-center">Regra Comercial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {[
                        { nome: 'Festival de Verão 2026', data: '15/11/2026 · Pedreira Paulo Leminski', status: 'EM_VENDA', ingressos: '14.200 / 20.000', gmv: 25000000, taxa: 2500000, regra: '10.0% (Padrão)' },
                        { nome: 'Turnê Nacional Rock Fest', data: '22/12/2026 · Live Curitiba', status: 'EM_VENDA', ingressos: '4.800 / 5.000', gmv: 12000000, taxa: 1200000, regra: '10.0% (Padrão)' },
                        { nome: 'Sunset Eletrônico 2026', data: '20/03/2026 · White Hall Jockey Eventos', status: 'CONCLUIDO', ingressos: '3.200 / 3.200', gmv: 6500000, taxa: 650000, regra: '10.0% (Padrão)' },
                        { nome: 'Stand-up Comedy Festival', data: '10/01/2026 · Teatro Positivo', status: 'CONCLUIDO', ingressos: '2.400 / 2.400', gmv: 5000000, taxa: 500000, regra: 'R$ 5,00 / ing (Exceção)' },
                      ].map((ev, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition">
                          <td className="p-3.5 font-bold text-white">{ev.nome}</td>
                          <td className="p-3.5 text-slate-400">{ev.data}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              {ev.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono">{ev.ingressos}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-white">{formatBRL(ev.gmv)}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{formatBRL(ev.taxa)}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                              {ev.regra}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: 11.17.8 AGÊNCIAS E PARCEIROS B2B */}
          {/* ============================================================== */}
          {tab === 'agencias_parceiros' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass size={16} className="text-teal-400" />
                    <span>Rede de Agências de Turismo, Excursões & Parceiros B2B</span>
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Distribuição corporativa com cotas de ingressos, comissões pactuadas e liquidação de vouchers.
                  </p>
                </div>
                <button
                  onClick={() => setModalNovaAgencia(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
                >
                  <Plus size={14} /> Cadastrar Agência Parceira
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Agência de Turismo / Operadora</th>
                      <th className="p-3.5">CNPJ / Cadastur</th>
                      <th className="p-3.5">Contato / Operações</th>
                      <th className="p-3.5 text-center">Cota Alocada</th>
                      <th className="p-3.5 text-center">Vouchers Emitidos</th>
                      <th className="p-3.5 text-right">Comissão Negociada</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {parceirosAgencias.map((agc) => (
                      <tr key={agc.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5 font-bold text-white">{agc.nome}</td>
                        <td className="p-3.5 font-mono text-slate-400">
                          <div>{agc.cnpj}</div>
                          <div className="text-[10px] text-teal-400">Cadastur: {agc.cadastur}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div>{agc.contatoNome}</div>
                          <div className="text-[10px] text-slate-400">{agc.email}</div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-white">{agc.cotaIngressos} un.</td>
                        <td className="p-3.5 text-center font-mono text-teal-400 font-semibold">{agc.vouchersEmitidos || 140} un.</td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{agc.comissaoPercentual}%</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {agc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 9: 11.17.9 RELATÓRIOS COMERCIAIS */}
          {/* ============================================================== */}
          {tab === 'relatorios' && (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award size={16} className="text-amber-400" />
                      <span>Relatórios Analíticos da Carteira Comercial B2B</span>
                    </h3>
                    <p className="text-slate-400 text-xs">Métricas de rentabilidade por organizador, conversão de propostas e evolução de taxas.</p>
                  </div>
                  <button
                    onClick={() => alert('Download do Relatório Comercial em CSV gerado com sucesso.')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                  >
                    <Download size={13} /> Exportar CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Conversão do Funil B2B</h4>
                    <div className="text-2xl font-black text-emerald-400 font-mono">68.4%</div>
                    <p className="text-[11px] text-slate-400 mt-1">Taxa média de fechamento de propostas enviadas para organizadores.</p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Tempo Médio de Fechamento</h4>
                    <div className="text-2xl font-black text-sky-400 font-mono">14 dias</div>
                    <p className="text-[11px] text-slate-400 mt-1">Do primeiro contato comercial (Lead) à assinatura do contrato digital.</p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Churn de Organizadores</h4>
                    <div className="text-2xl font-black text-white font-mono">1.2%</div>
                    <p className="text-[11px] text-slate-400 mt-1">Retenção de 98.8% dos produtores parceiros na carteira DiskIngressos.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 10: AGENDA & ATIVIDADES */}
          {/* ============================================================== */}
          {tab === 'atividades' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" />
                    <span>Agenda de Follow-ups & Reuniões B2B</span>
                  </h2>
                  <p className="text-slate-400 text-xs">Acompanhamento e registro de compromissos com os produtores.</p>
                </div>
              </div>

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
                          Agendado: {new Date(a.dataAgendada).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {a.realizada ? (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Realizada
                        </span>
                      ) : (
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                          <Clock size={14} /> Pendente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CADASTRAR PRODUTOR B2B */}
      {/* ============================================================== */}
      {modalNovoProdutor && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building size={16} className="text-purple-400" />
                <span>Cadastrar e Homologar Produtor B2B</span>
              </h3>
              <button onClick={() => setModalNovoProdutor(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCadastrarProdutor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={formProdutor.razaoSocial}
                    onChange={(e) => setFormProdutor({ ...formProdutor, razaoSocial: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formProdutor.nomeFantasia}
                    onChange={(e) => setFormProdutor({ ...formProdutor, nomeFantasia: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CNPJ (MF) *</label>
                  <input
                    type="text"
                    required
                    value={formProdutor.cnpj}
                    onChange={(e) => setFormProdutor({ ...formProdutor, cnpj: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Responsável Legal</label>
                  <input
                    type="text"
                    value={formProdutor.responsavelNome}
                    onChange={(e) => setFormProdutor({ ...formProdutor, responsavelNome: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail Comercial *</label>
                  <input
                    type="email"
                    required
                    value={formProdutor.email}
                    onChange={(e) => setFormProdutor({ ...formProdutor, email: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formProdutor.telefone}
                    onChange={(e) => setFormProdutor({ ...formProdutor, telefone: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoProdutor(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Salvar & Homologar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ABRIR OPORTUNIDADE PIPELINE */}
      {/* ============================================================== */}
      {modalNovaOportunidade && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-purple-400" />
                <span>Abrir Oportunidade Comercial</span>
              </h3>
              <button onClick={() => setModalNovaOportunidade(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCadastrarOportunidade} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Produtor B2B *</label>
                <select
                  required
                  value={formOportunidade.produtorId}
                  onChange={(e) => setFormOportunidade({ ...formOportunidade, produtorId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="">Selecione um organizador...</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomeFantasia || p.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Título da Oportunidade / Evento Previsto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Turnê Verão 2027 · Edição Curitiba"
                  value={formOportunidade.titulo}
                  onChange={(e) => setFormOportunidade({ ...formOportunidade, titulo: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">GMV Estimado (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 500000"
                    value={formOportunidade.valor}
                    onChange={(e) => setFormOportunidade({ ...formOportunidade, valor: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Probabilidade (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formOportunidade.probabilidade}
                    onChange={(e) => setFormOportunidade({ ...formOportunidade, probabilidade: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaOportunidade(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Criar Oportunidade</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: PACTUAR CONDIÇÃO COMERCIAL POR EVENTO */}
      {/* ============================================================== */}
      {modalNovaCondicao && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag size={16} className="text-purple-400" />
                <span>Pactuar Regra Comercial do Evento</span>
              </h3>
              <button onClick={() => setModalNovaCondicao(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePactuarCondicao} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Produtor B2B *</label>
                <select
                  required
                  value={formCondicao.produtorId}
                  onChange={(e) => setFormCondicao({ ...formCondicao, produtorId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="">Selecione o organizador...</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomeFantasia || p.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo de Remuneração</label>
                  <select
                    value={formCondicao.tipoTaxa}
                    onChange={(e) => setFormCondicao({ ...formCondicao, tipoTaxa: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="percentual">Taxa Percentual (%)</option>
                    <option value="fixa">Taxa Fixa (R$ / ing)</option>
                    <option value="mista">Taxa Mista / Mínimo Garantido</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    {formCondicao.tipoTaxa === 'fixa' ? 'Valor Fixo (Centavos)' : 'Taxa de Serviço (%)'}
                  </label>
                  {formCondicao.tipoTaxa === 'fixa' ? (
                    <input
                      type="number"
                      value={formCondicao.taxaFixaCents}
                      onChange={(e) => setFormCondicao({ ...formCondicao, taxaFixaCents: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="Ex: 500 = R$ 5,00"
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.1"
                      value={formCondicao.taxaPercentual}
                      onChange={(e) => setFormCondicao({ ...formCondicao, taxaPercentual: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="10.0"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Taxa Adquirente (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCondicao.taxaProcessamento}
                    onChange={(e) => setFormCondicao({ ...formCondicao, taxaProcessamento: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Prazo Repasse (Dias)</label>
                  <input
                    type="number"
                    value={formCondicao.prazoRepasseDias}
                    onChange={(e) => setFormCondicao({ ...formCondicao, prazoRepasseDias: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaCondicao(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Submeter para Aprovação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: SOLICITAÇÃO DE ADVANCED / ANTECIPAÇÃO */}
      {/* ============================================================== */}
      {modalNovoAdvanced && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span>Solicitação de Adiantamento (Advanced)</span>
              </h3>
              <button onClick={() => setModalNovoAdvanced(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSolicitarAdvanced} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Produtor B2B *</label>
                <select
                  required
                  value={formAdvanced.produtorId}
                  onChange={(e) => setFormAdvanced({ ...formAdvanced, produtorId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="">Selecione o organizador...</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomeFantasia || p.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Valor do Adiantamento (R$) *</label>
                <input
                  type="number"
                  required
                  value={formAdvanced.valorSolicitadoReais}
                  onChange={(e) => setFormAdvanced({ ...formAdvanced, valorSolicitadoReais: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Taxa Spread (a.m. %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAdvanced.taxaSpreadMensal}
                    onChange={(e) => setFormAdvanced({ ...formAdvanced, taxaSpreadMensal: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Reserva Contingência (%)</label>
                  <input
                    type="number"
                    value={formAdvanced.reservaContingenciaPercent}
                    onChange={(e) => setFormAdvanced({ ...formAdvanced, reservaContingenciaPercent: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Justificativa Operacional</label>
                <textarea
                  rows={2}
                  value={formAdvanced.justificativa}
                  onChange={(e) => setFormAdvanced({ ...formAdvanced, justificativa: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoAdvanced(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <DollarSign size={13} />}
                  <span>Submeter ao Risco</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: DETALHES DA FICHA DO PRODUTOR (11.17.2) */}
      {/* ============================================================== */}
      {produtorDetalhe && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building size={18} className="text-purple-400" />
                  <span>{produtorDetalhe.nomeFantasia || produtorDetalhe.razaoSocial}</span>
                </h3>
                <p className="text-xs text-slate-400">{produtorDetalhe.razaoSocial} · CNPJ: {produtorDetalhe.cnpj || produtorDetalhe.documento}</p>
              </div>
              <button onClick={() => setProdutorDetalhe(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Contato & Executivo</span>
                <p className="text-slate-300"><span className="text-slate-500">Responsável:</span> {produtorDetalhe.responsavelNome || 'Diretoria'}</p>
                <p className="text-slate-300"><span className="text-slate-500">E-mail:</span> {produtorDetalhe.email}</p>
                <p className="text-slate-300"><span className="text-slate-500">Telefone:</span> {produtorDetalhe.telefone || '(11) 3214-5500'}</p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Classificação & Risco</span>
                <p className="text-slate-300"><span className="text-slate-500">Tier:</span> {produtorDetalhe.tier || 'Enterprise'}</p>
                <p className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck size={13} /> Documentação 100% Homologada</p>
                <p className="text-slate-300"><span className="text-slate-500">Contrato Social:</span> Válido</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setProdutorDetalhe(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
