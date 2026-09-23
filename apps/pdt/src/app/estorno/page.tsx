'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCcw,
  Search,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  User,
  Scale,
  Calendar,
  DollarSign,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { ModuleNavigation } from '../../components/navigation/ModuleNavigation';
import { CompactOperationalAlert } from '../../components/navigation/CompactOperationalAlert';

type StatusEstorno = 'solicitado' | 'em_analise' | 'aprovado' | 'negado' | 'executado' | 'falha';

interface Transicao {
  id: string;
  de: string | null;
  para: string;
  atorId: string;
  observacao?: string | null;
  criadoEm: string;
}

interface SolicitacaoEstornoItem {
  id: string;
  pedidoId: string;
  clienteId: string;
  motivo: string;
  status: StatusEstorno;
  valorSolicitadoCents: number;
  valorAprovadoCents?: number | null;
  taxaRetidaCents?: number | null;
  debitoProdutorCents?: number | null;
  solicitadoEm: string;
  analisadoPor?: string | null;
  motivoNegativa?: string | null;
  transicoes?: Transicao[];
}

export default function EstornoPage() {
  const { api } = useProducerEvent();
  const [estornos, setEstornos] = useState<SolicitacaoEstornoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  // Modal de Decisão
  const [modalDecisao, setModalDecisao] = useState<{
    item: SolicitacaoEstornoItem;
    acao: 'APROVAR' | 'NEGAR';
  } | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Modal de Nova Solicitação
  const [modalNovo, setModalNovo] = useState(false);
  const [novoPedidoId, setNovoPedidoId] = useState('');
  const [novoClienteId, setNovoClienteId] = useState('');
  const [novoEventoId, setNovoEventoId] = useState('');
  const [novoMotivo, setNovoMotivo] = useState('ARREPENDIMENTO_CDC_7_DIAS');
  const [novoValor, setNovoValor] = useState('');
  const [retemTaxa, setRetemTaxa] = useState(false);
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().slice(0, 10));
  const [dataEvento, setDataEvento] = useState(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));

  // Controle de Abas Estornos vs Chargebacks (EDDIE 11.9)
  const [secaoAtiva, setSecaoAtiva] = useState<'estornos' | 'chargebacks'>('estornos');
  const [chargebacks, setChargebacks] = useState<any[]>([]);
  const [modalChargeback, setModalChargeback] = useState<any>(null);
  const [justificativaDefesa, setJustificativaDefesa] = useState('');
  const [enviandoDefesa, setEnviandoDefesa] = useState(false);

  const carregar = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    try {
      const [resEstornos, resChargebacks] = await Promise.all([
        fetch(`${api}/estornos`, { signal: controller.signal }),
        fetch(`${api}/chargebacks`, { signal: controller.signal }).catch(() => null),
      ]);
      if (resEstornos.ok) {
        const data = await resEstornos.json();
        setEstornos(Array.isArray(data) ? data : (data.items || []));
      }
      if (resChargebacks && resChargebacks.ok) {
        const cbData = await resChargebacks.json();
        setChargebacks(Array.isArray(cbData) ? cbData : []);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Tempo limite ao carregar estornos e chargebacks.');
      } else {
        setError(err instanceof Error ? err.message : 'Falha na comunicação com a API.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api]);

  const handleEnviarDefesa = async () => {
    if (!modalChargeback || !justificativaDefesa || !api) return;
    setEnviandoDefesa(true);
    try {
      const res = await fetch(`${api}/chargebacks/${modalChargeback.id}/evidencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentos: ['comprovante_leitura_portaria.pdf', 'comprovante_pagamento.pdf'],
          justificativa: justificativaDefesa,
        }),
      });
      if (res.ok) {
        setModalChargeback(null);
        setJustificativaDefesa('');
        void carregar();
      }
    } finally {
      setEnviandoDefesa(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    return estornos.filter((item) => {
      const matchStatus = filtroStatus === 'todos' || item.status === filtroStatus;
      const matchBusca =
        !busca ||
        item.pedidoId.toLowerCase().includes(busca.toLowerCase()) ||
        item.motivo.toLowerCase().includes(busca.toLowerCase()) ||
        item.id.toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchBusca;
    });
  }, [estornos, filtroStatus, busca]);

  const stats = useMemo(() => {
    const total = estornos.length;
    const pendentes = estornos.filter((e) => e.status === 'solicitado' || e.status === 'em_analise').length;
    const aprovados = estornos.filter((e) => e.status === 'aprovado' || e.status === 'executado').length;
    const negados = estornos.filter((e) => e.status === 'negado').length;
    const valorTotalEstornado = estornos
      .filter((e) => e.status === 'aprovado' || e.status === 'executado')
      .reduce((acc, curr) => acc + (curr.valorAprovadoCents ?? curr.valorSolicitadoCents), 0);

    return { total, pendentes, aprovados, negados, valorTotalEstornado };
  }, [estornos]);

  const money = (cents = 0) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  // Executar Decisão (Aprovar / Negar)
  const executarDecisao = async () => {
    if (!modalDecisao || !api) return;
    setSalvando(true);
    try {
      const res = await fetch(`${api}/estornos/decidir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estornoId: modalDecisao.item.id,
          acao: modalDecisao.acao,
          analisadoPor: 'Operador Financeiro / SAC',
          justificativa: justificativa.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Erro ao registrar decisão na API.');
      setModalDecisao(null);
      setJustificativa('');
      await carregar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao registrar decisão.');
    } finally {
      setSalvando(false);
    }
  };

  // Criar Nova Solicitação
  const submeterSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setSalvando(true);
    try {
      const cents = Math.round(Number(novoValor.replace(',', '.')) * 100);
      const res = await fetch(`${api}/estornos/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: novoPedidoId.trim() || '00000000-0000-0000-0000-000000000001',
          compradorId: novoClienteId.trim() || '00000000-0000-0000-0000-000000000002',
          eventoId: novoEventoId.trim() || '00000000-0000-0000-0000-000000000003',
          motivo: novoMotivo,
          tipo: 'TOTAL',
          valorTotalCents: cents,
          retemTaxaConveniencia: retemTaxa,
          ingressosIds: ['00000000-0000-0000-0000-000000000004'],
          dataCompra: new Date(dataCompra).toISOString(),
          dataInicioEvento: new Date(dataEvento).toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Não foi possível registrar a solicitação de estorno.');
      setModalNovo(false);
      setNovoValor('');
      setNovoPedidoId('');
      await carregar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao registrar solicitação.');
    } finally {
      setSalvando(false);
    }
  };

  // Avaliação CDC Art. 49 em tempo real
  const avaliacaoCdc = useMemo(() => {
    const dias = (Date.now() - new Date(dataCompra).getTime()) / (1000 * 3600 * 24);
    const horasParaEvento = (new Date(dataEvento).getTime() - Date.now()) / (1000 * 3600);
    const elegivel = dias <= 7 && horasParaEvento >= 48;
    return {
      dias: Math.floor(dias),
      horasParaEvento: Math.floor(horasParaEvento),
      elegivel,
      justificativa: elegivel
        ? 'Elegível ao Art. 49 CDC (compra < 7 dias e evento > 48h). Devolução total sem retenção da taxa.'
        : dias > 7
        ? 'Prazo legal de 7 dias do CDC ultrapassado. Requer aprovação de supervisor.'
        : 'Evento a menos de 48h de acontecer. Política padrão restringe arrependimento.',
    };
  }, [dataCompra, dataEvento]);

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header do Módulo */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-[.18em]">
            <RotateCcw size={15} /> Máquina de Estados & Reembolsos
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Estornos & Chargebacks</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestão de direito de arrependimento (Art. 49 CDC), cancelamentos e estornos integrados ao Ledger financeiro em partidas dobradas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void carregar()}
            className="p-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            title="Atualizar"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => setModalNovo(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            <RotateCcw size={15} /> Nova Solicitação
          </button>
        </div>
      </header>

      {/* Navegação Fixa e Responsiva (Sem scroll horizontal) */}
      <ModuleNavigation
        items={[
          { id: 'estornos', label: 'Solicitações de Reembolso', icon: <RotateCcw size={15} />, badge: estornos.length },
          { id: 'chargebacks', label: 'Disputas & Chargebacks', icon: <ShieldAlert size={15} />, badge: chargebacks.length },
        ]}
        activeItem={secaoAtiva}
        onSelect={(id) => setSecaoAtiva(id as 'estornos' | 'chargebacks')}
        ariaLabel="Navegação do módulo de Estorno e Chargebacks"
      />

      {/* Alerta Operacional Compacto */}
      {error && (
        <div className="py-1">
          <CompactOperationalAlert
            status="offline"
            title="Módulo Estornos/Chargebacks Offline (503)"
            detail={error}
            onOpen={() => alert(error)}
          />
        </div>
      )}

      {secaoAtiva === 'estornos' && (
        <>
          {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Total Solicitações</span>
            <FileCheck2 size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats.total}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Pendentes Análise</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{stats.pendentes}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Aprovados</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{stats.aprovados}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Recusados</span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{stats.negados}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            <span>Total Reembolsado</span>
            <TrendingDown size={16} className="text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-300 mt-2">{money(stats.valorTotalEstornado)}</div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por Pedido ou Motivo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['todos', 'solicitado', 'aprovado', 'negado', 'executado'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filtroStatus === st
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Solicitações de Reembolso</h2>
          <span className="text-xs text-slate-400">{filtrados.length} registro(s)</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-rose-500" />
            <span>Carregando solicitações de estorno...</span>
          </div>
        ) : error ? (
          <div className="p-16 text-center space-y-3">
            <div className="text-sm text-rose-400 font-semibold">{error}</div>
            <p className="text-slate-500 text-xs">O módulo de estorno está temporariamente sem resposta do gateway ou Ledger.</p>
            <button
              type="button"
              onClick={() => void carregar()}
              className="px-4 py-2 bg-rose-500/20 text-rose-300 text-xs rounded-lg border border-rose-500/30 hover:bg-rose-500/30 transition font-semibold inline-flex items-center gap-2"
            >
              <RefreshCcw size={13} />
              <span>Tentar novamente</span>
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            Nenhuma solicitação de estorno encontrada para o filtro atual.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/60 text-slate-500">
                <tr>
                  <th className="p-3 text-left">Pedido</th>
                  <th className="p-3 text-left">Motivo Legal / CDC</th>
                  <th className="p-3 text-left">Data Solicitação</th>
                  <th className="p-3 text-right">Valor Solicitado</th>
                  <th className="p-3 text-right">Taxa Retida</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono text-slate-300">
                      {item.pedidoId.slice(0, 8)}...{item.pedidoId.slice(-4)}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{item.motivo}</div>
                      {item.motivoNegativa && (
                        <div className="text-[11px] text-rose-400 mt-0.5">Motivo recusa: {item.motivoNegativa}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {new Date(item.solicitadoEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 text-right font-bold text-white">{money(item.valorSolicitadoCents)}</td>
                    <td className="p-3 text-right text-slate-400">{money(item.taxaRetidaCents ?? 0)}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'aprovado' || item.status === 'executado'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'negado'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {item.status === 'solicitado' || item.status === 'em_analise' ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setModalDecisao({ item, acao: 'APROVAR' })}
                            className="px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-[11px] transition"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => setModalDecisao({ item, acao: 'NEGAR' })}
                            className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-[11px] transition"
                          >
                            Recusar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Decidido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {secaoAtiva === 'chargebacks' && (
        <div className="space-y-6">
          {/* KPI Cards Chargeback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <span>Total Disputas</span>
                <ShieldAlert size={16} className="text-slate-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{chargebacks.length}</div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-wider text-amber-500 font-bold">
                <span>Defesa Pendente</span>
                <Clock size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {chargebacks.filter((c) => !c.defesaEnviada).length}
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-wider text-purple-500 font-bold">
                <span>Em Disputa</span>
                <Scale size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 mt-2">
                {chargebacks.filter((c) => c.defesaEnviada && (!c.resultado || c.resultado === 'pendente')).length}
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-wider text-emerald-500 font-bold">
                <span>Ganhos</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                {chargebacks.filter((c) => c.resultado === 'ganho').length}
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-wider text-rose-500 font-bold">
                <span>Perdidos</span>
                <XCircle size={16} className="text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 mt-2">
                {chargebacks.filter((c) => c.resultado === 'perdido').length}
              </div>
            </div>
          </div>

          {/* Tabela de Chargebacks */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">Casos de Chargeback & Contestação</h2>
              <span className="text-xs text-slate-400">{chargebacks.length} registro(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-900/60 text-slate-500">
                  <tr>
                    <th className="p-3 text-left">Pedido / ID</th>
                    <th className="p-3 text-left">Adquirente</th>
                    <th className="p-3 text-left">Código / Motivo</th>
                    <th className="p-3 text-right">Valor em Disputa</th>
                    <th className="p-3 text-left">Prazo Limite Defesa</th>
                    <th className="p-3 text-center">Status Defesa</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {chargebacks.map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono text-slate-300">
                        {cb.pedidoId?.slice(0, 8)}...{cb.pedidoId?.slice(-4)}
                      </td>
                      <td className="p-3 font-bold text-white">{cb.adquirente}</td>
                      <td className="p-3 text-slate-300">{cb.codigoRazao}</td>
                      <td className="p-3 text-right font-bold text-rose-400">
                        {money(Number(cb.valor || 0) * 100)}
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(cb.prazoDefesaEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cb.resultado === 'ganho'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : cb.resultado === 'perdido'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : cb.defesaEnviada
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {cb.resultado === 'ganho'
                            ? 'Ganho'
                            : cb.resultado === 'perdido'
                            ? 'Perdido'
                            : cb.defesaEnviada
                            ? 'Defesa Enviada'
                            : 'Aguardando Defesa'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setModalChargeback(cb)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          Evidências & Defesa
                        </button>
                      </td>
                    </tr>
                  ))}

                  {chargebacks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 text-xs">
                        Nenhum chargeback ou contestação aberta no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Defesa Chargeback */}
      {modalChargeback && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Anexar Defesa de Chargeback</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pedido: {modalChargeback.pedidoId} • Valor: {money(Number(modalChargeback.valor || 0) * 100)}
                </p>
              </div>
              <button onClick={() => setModalChargeback(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Evidências Operacionais Pré-Coletadas:</div>
              <div>• Comprovante de Pagamento & Autorização Gateway</div>
              <div>• Log de Emissão do Ingresso & Hash QR Code</div>
              <div>• Registro de Check-in em Portaria / Dispositivo (quando houver)</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Parecer / Justificativa da Defesa</label>
              <textarea
                rows={4}
                value={justificativaDefesa}
                onChange={(e) => setJustificativaDefesa(e.target.value)}
                placeholder="Descreva a contestação, termos de serviço aceitos e comprovação da entrega do serviço..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalChargeback(null)}
                className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarDefesa}
                disabled={enviandoDefesa || !justificativaDefesa}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition disabled:opacity-50"
              >
                {enviandoDefesa ? 'Enviando...' : 'Transmitir Defesa à Adquirente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Decisão (Aprovar / Recusar) */}
      {modalDecisao && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {modalDecisao.acao === 'APROVAR' ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" /> Aprovar Reembolso
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-400" /> Recusar Reembolso
                </>
              )}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {modalDecisao.acao === 'APROVAR'
                ? 'Ao aprovar, o estorno será registrado na máquina de estados e o valor solicitado será debitado do saldo do produtor no Ledger.'
                : 'Informe o motivo da recusa para notificação do comprador e registro na trilha de auditoria.'}
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pedido:</span>
                <span className="font-mono text-white">{modalDecisao.item.pedidoId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Solicitado:</span>
                <span className="font-bold text-white">{money(modalDecisao.item.valorSolicitadoCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Motivo declarado:</span>
                <span className="text-slate-300">{modalDecisao.item.motivo}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {modalDecisao.acao === 'APROVAR' ? 'Observações de aprovação (opcional):' : 'Motivo da recusa (obrigatório):'}
              </label>
              <textarea
                rows={3}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder={
                  modalDecisao.acao === 'APROVAR'
                    ? 'Ex: Devolução autorizada via CDC Art. 49 dentro do prazo legal.'
                    : 'Ex: Solicitação realizada após o prazo legal de 7 dias do CDC.'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalDecisao(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={salvando || (modalDecisao.acao === 'NEGAR' && !justificativa.trim())}
                onClick={executarDecisao}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition disabled:opacity-50 ${
                  modalDecisao.acao === 'APROVAR' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {salvando ? 'Processando...' : modalDecisao.acao === 'APROVAR' ? 'Confirmar Aprovação' : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Solicitação com Validação CDC */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-rose-400" /> Nova Solicitação de Reembolso
            </h3>

            {/* Alerta CDC */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex gap-2.5 items-start ${
                avaliacaoCdc.elegivel
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
            >
              <Scale size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Política Legal de Arrependimento (CDC Art. 49):</p>
                <p className="mt-0.5 leading-relaxed">{avaliacaoCdc.justificativa}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Dias desde a compra: <b>{avaliacaoCdc.dias}d</b> • Antecedência do evento: <b>{avaliacaoCdc.horasParaEvento}h</b>
                </p>
              </div>
            </div>

            <form onSubmit={submeterSolicitacao} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Data da Compra</span>
                  <input
                    type="date"
                    required
                    value={dataCompra}
                    onChange={(e) => setDataCompra(e.target.value)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Data do Evento</span>
                  <input
                    type="date"
                    required
                    value={dataEvento}
                    onChange={(e) => setDataEvento(e.target.value)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-slate-400">Motivo do Estorno</span>
                <select
                  value={novoMotivo}
                  onChange={(e) => setNovoMotivo(e.target.value)}
                  className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="ARREPENDIMENTO_CDC_7_DIAS">Arrependimento em até 7 dias (Art. 49 CDC)</option>
                  <option value="EVENTO_CANCELADO">Evento Cancelado (Devolução Integral)</option>
                  <option value="EVENTO_ADIADO">Evento Adiado / Mudança de Data</option>
                  <option value="CHARGEBACK">Contestação Bancária / Chargeback</option>
                  <option value="ACORDO_SAC">Acordo Operacional SAC</option>
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Valor do Reembolso (R$)</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 150,00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="retemTaxa"
                    checked={retemTaxa}
                    onChange={(e) => setRetemTaxa(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <label htmlFor="retemTaxa" className="text-xs text-slate-300">
                    Retém taxa de conveniência da plataforma
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || !novoValor}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {salvando ? 'Registrando...' : 'Registrar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
