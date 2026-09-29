'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Landmark,
  FileText,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Upload,
  Download,
  DollarSign,
  Key,
  Layers,
  Search,
  Filter,
  ShieldAlert,
  ArrowLeftRight,
  Calendar,
  CheckSquare,
  Scale,
  Eye,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuthSession } from '../../../components/AuthSessionContext';

interface Conta {
  id: string;
  bancoCodigo: string;
  bancoNome: string;
  agencia: string;
  conta: string;
  tipo: string;
  finalidade: string;
  saldoReal: number;
  saldoConciliado: number;
  saldoDisponivel: number;
  saldoBloqueado: number;
  status: string;
}

interface SubcontaEvento {
  eventoId: string;
  eventoNome: string;
  produtorNome: string;
  saldoTotal: number;
  saldoDisponivel: number;
  saldoRetido: number;
}

interface Recebivel {
  id: string;
  adquirente: string;
  bandeira: string;
  modalidade: string;
  nsu: string;
  dataPrevista: string;
  valorBruto: number;
  mdrTaxaEsperada: number;
  mdrValorEsperado: number;
  mdrTaxaCobrada?: number;
  mdrValorCobrado?: number;
  divergencia: number;
  valorLiquido: number;
  status: 'PREVISTO' | 'LIQUIDADO' | 'DIVERGENCIA';
}

interface OrdemPagamento {
  id: string;
  codigo: string;
  tipo: 'REPASSE' | 'ANTECIPACAO' | 'FORNECEDOR' | 'TRIBUTO';
  beneficiarioNome: string;
  beneficiarioCpfCnpj: string;
  valor: number;
  metodo: 'PIX' | 'TED' | 'CNAB_240' | 'CNAB_400';
  dataVencimento: string;
  status: 'CRIADO' | 'VALIDADO' | 'APROVADO' | 'PROGRAMADO' | 'ENVIADO' | 'PROCESSANDO' | 'LIQUIDADO' | 'CONCILIADO' | 'SITUACAO_DESCONHECIDA';
  documentoCodigo?: string;
  documentoAssinado: boolean;
  autenticacaoBancaria?: string;
}

interface ConciliacaoItem {
  id: string;
  nivel: 'NIVEL_1_OPERACIONAL' | 'NIVEL_2_BANCO_LIQUIDACAO' | 'NIVEL_3_BANCO_LEDGER';
  descricao: string;
  banco: string;
  valorExtrato: number;
  valorSistema: number;
  divergencia: number;
  status: 'CONCILIADO_AUTOMATICO' | 'REQUER_ANALISE' | 'DIVERGENCIA';
  justificativa?: string;
}

const mockContas: Conta[] = [
  {
    id: 'cta-itau-principal',
    bancoCodigo: '341',
    bancoNome: 'Itaú Unibanco S.A.',
    agencia: '0450',
    conta: '88410-3',
    tipo: 'CORRENTE',
    finalidade: 'OPERACIONAL',
    saldoReal: 5450000.0,
    saldoConciliado: 5450000.0,
    saldoDisponivel: 5000000.0,
    saldoBloqueado: 450000.0,
    status: 'ATIVA',
  },
  {
    id: 'cta-bradesco-operacao',
    bancoCodigo: '237',
    bancoNome: 'Banco Bradesco S.A.',
    agencia: '1205',
    conta: '45020-1',
    tipo: 'CORRENTE',
    finalidade: 'REPASSES',
    saldoReal: 2800000.0,
    saldoConciliado: 2800000.0,
    saldoDisponivel: 2800000.0,
    saldoBloqueado: 0.0,
    status: 'ATIVA',
  },
  {
    id: 'cta-bb-aplicacao',
    bancoCodigo: '001',
    bancoNome: 'Banco do Brasil S.A.',
    agencia: '0018',
    conta: '99200-8',
    tipo: 'APLICAÇÃO CDB',
    finalidade: 'RESERVA',
    saldoReal: 10000000.0,
    saldoConciliado: 10000000.0,
    saldoDisponivel: 10000000.0,
    saldoBloqueado: 0.0,
    status: 'ATIVA',
  },
];

const mockSubcontas: SubcontaEvento[] = [
  {
    eventoId: 'ev-live-1',
    eventoNome: 'Festival DiskIngressos Live 2026',
    produtorNome: 'Live Nation Brasil Entretenimento',
    saldoTotal: 6200000.0,
    saldoDisponivel: 5800000.0,
    saldoRetido: 400000.0,
  },
  {
    eventoId: 'ev-opus-1',
    eventoNome: 'Rock Fest Sunset Curitiba 2026',
    produtorNome: 'Opus Entretenimento S/A',
    saldoTotal: 4750000.0,
    saldoDisponivel: 4500000.0,
    saldoRetido: 250000.0,
  },
  {
    eventoId: 'ev-t4f-1',
    eventoNome: 'Turnê Arena Brasil 2026',
    produtorNome: 'Time For Fun / T4F',
    saldoTotal: 3000000.0,
    saldoDisponivel: 2850000.0,
    saldoRetido: 150000.0,
  },
];

const initialRecebiveis: Recebivel[] = [
  {
    id: 'rec-cielo-1',
    adquirente: 'CIELO',
    bandeira: 'VISA',
    modalidade: 'Crédito à Vista',
    nsu: '984102941',
    dataPrevista: '30/09/2026',
    valorBruto: 450000.0,
    mdrTaxaEsperada: 2.15,
    mdrValorEsperado: 9675.0,
    divergencia: 0,
    valorLiquido: 440325.0,
    status: 'PREVISTO',
  },
  {
    id: 'rec-rede-2',
    adquirente: 'REDE',
    bandeira: 'MASTERCARD',
    modalidade: 'Parcelado 6x',
    nsu: '782910384',
    dataPrevista: '29/09/2026',
    valorBruto: 380000.0,
    mdrTaxaEsperada: 2.8,
    mdrValorEsperado: 10640.0,
    mdrTaxaCobrada: 3.4,
    mdrValorCobrado: 12920.0,
    divergencia: 2280.0,
    valorLiquido: 367080.0,
    status: 'DIVERGENCIA',
  },
  {
    id: 'rec-stone-3',
    adquirente: 'STONE',
    bandeira: 'ELO',
    modalidade: 'Débito',
    nsu: '556102849',
    dataPrevista: '29/09/2026',
    valorBruto: 195000.0,
    mdrTaxaEsperada: 1.2,
    mdrValorEsperado: 2340.0,
    mdrTaxaCobrada: 1.2,
    mdrValorCobrado: 2340.0,
    divergencia: 0,
    valorLiquido: 192660.0,
    status: 'LIQUIDADO',
  },
  {
    id: 'rec-pagbank-4',
    adquirente: 'PAGBANK',
    bandeira: 'PIX',
    modalidade: 'PIX Direto Storefront',
    nsu: '334102848',
    dataPrevista: '29/09/2026',
    valorBruto: 820000.0,
    mdrTaxaEsperada: 0.99,
    mdrValorEsperado: 8118.0,
    divergencia: 0,
    valorLiquido: 811882.0,
    status: 'LIQUIDADO',
  },
];

const initialOrdens: OrdemPagamento[] = [
  {
    id: 'op-1',
    codigo: 'OPG-2026-00081',
    tipo: 'REPASSE',
    beneficiarioNome: 'Live Nation Brasil Produções',
    beneficiarioCpfCnpj: '12.345.678/0001-90',
    valor: 1500000.0,
    metodo: 'PIX',
    dataVencimento: '29/09/2026',
    status: 'APROVADO',
    documentoCodigo: 'REP-2026-00012',
    documentoAssinado: true,
  },
  {
    id: 'op-2',
    codigo: 'OPG-2026-00082',
    tipo: 'ANTECIPACAO',
    beneficiarioNome: 'Opus Entretenimento e Eventos',
    beneficiarioCpfCnpj: '98.765.432/0001-10',
    valor: 800000.0,
    metodo: 'CNAB_240',
    dataVencimento: '30/09/2026',
    status: 'PROGRAMADO',
    documentoCodigo: 'ANT-2026-00008',
    documentoAssinado: true,
  },
  {
    id: 'op-3',
    codigo: 'OPG-2026-00083',
    tipo: 'FORNECEDOR',
    beneficiarioNome: 'Segurança & Geradores Operacionais Ltda',
    beneficiarioCpfCnpj: '44.333.222/0001-55',
    valor: 125000.0,
    metodo: 'TED',
    dataVencimento: '28/09/2026',
    status: 'LIQUIDADO',
    documentoAssinado: false,
    autenticacaoBancaria: 'AUTH-TED-ITA-9928172',
  },
  {
    id: 'op-4',
    codigo: 'OPG-2026-00084',
    tipo: 'TRIBUTO',
    beneficiarioNome: 'Secretaria de Finanças de Curitiba (ISS)',
    beneficiarioCpfCnpj: '76.417.005/0001-86',
    valor: 68000.0,
    metodo: 'CNAB_240',
    dataVencimento: '02/10/2026',
    status: 'VALIDADO',
    documentoAssinado: false,
  },
];

const initialConciliacoes: ConciliacaoItem[] = [
  {
    id: 'c-1',
    nivel: 'NIVEL_1_OPERACIONAL',
    descricao: 'Pedido Venda #98412 ↔ Liquidação PIX Storefront',
    banco: 'SPI Bacen / Itaú',
    valorExtrato: 480.0,
    valorSistema: 480.0,
    divergencia: 0,
    status: 'CONCILIADO_AUTOMATICO',
  },
  {
    id: 'c-2',
    nivel: 'NIVEL_2_BANCO_LIQUIDACAO',
    descricao: 'Crédito Adquirente Stone Lote #882 ↔ Extrato Bancário',
    banco: 'Banco Bradesco',
    valorExtrato: 192660.0,
    valorSistema: 192660.0,
    divergencia: 0,
    status: 'CONCILIADO_AUTOMATICO',
  },
  {
    id: 'c-3',
    nivel: 'NIVEL_3_BANCO_LEDGER',
    descricao: 'Extrato Itaú Consolidado ↔ Conta Gráfica Ledger Disk',
    banco: 'Itaú Unibanco',
    valorExtrato: 5450000.0,
    valorSistema: 5450150.0,
    divergencia: -150.0,
    status: 'DIVERGENCIA',
    justificativa: 'Tarifa bancária de manutenção de conta de R$ 150,00 ainda não escriturada no razão.',
  },
];

const initialBeneficiarios = [
  {
    id: 'b-1',
    nome: 'Live Nation Brasil Produções',
    cnpj: '12.345.678/0001-90',
    banco: '341 - Itaú',
    chavePix: 'financeiro@livenation.com.br (EMAIL)',
    status: 'ATIVO',
    quarentenaAte: null,
  },
  {
    id: 'b-2',
    nome: 'Opus Entretenimento e Eventos',
    cnpj: '98.765.432/0001-10',
    banco: '237 - Bradesco',
    chavePix: '98765432000110 (CNPJ)',
    status: 'ATIVO',
    quarentenaAte: null,
  },
  {
    id: 'b-3',
    nome: 'Produtora Alpha Prime Music',
    cnpj: '33.222.111/0001-44',
    banco: '033 - Santander',
    chavePix: '33222111000144 (CNPJ)',
    status: 'EM_QUARENTENA',
    quarentenaAte: 'Amanhã às 14:00 (24h de quarentena de segurança)',
  },
];

export default function TesourariaPage() {
  const { isAdmin } = useAuthSession();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    | 'posicao'
    | 'agenda'
    | 'recebiveis'
    | 'ordens'
    | 'lotes'
    | 'pix_cnab'
    | 'conciliacao'
    | 'transferencias'
    | 'rastreamento'
    | 'fechamento'
  >('posicao');

  // Scenario State
  const [cenario, setCenario] = useState<'BASE' | 'CONSERVADOR' | 'ESTRESSE'>('BASE');

  // Data states
  const [recebiveis, setRecebiveis] = useState<Recebivel[]>(initialRecebiveis);
  const [ordens, setOrdens] = useState<OrdemPagamento[]>(initialOrdens);
  const [conciliacoes, setConciliacoes] = useState<ConciliacaoItem[]>(initialConciliacoes);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'warn'; texto: string } | null>(null);

  // Search State
  const [buscaTermo, setBuscaTermo] = useState('OPG-2026-00081');
  const [resultadoRastreio, setResultadoRastreio] = useState<any>(null);

  // Checklist Fechamento
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Todas as 3 contas bancárias corporativas sincronizadas com extrato', check: true },
    { id: 2, label: 'Zero ordens de pagamento em situação desconhecida ou pendente', check: true },
    { id: 3, label: 'Divergências de MDR auditadas e comunicadas à adquirente', check: true },
    { id: 4, label: 'Saldo bancário total confere com saldo conciliado + pendências justificadas', check: true },
  ]);
  const [fechadoComSucesso, setFechadoComSucesso] = useState(false);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Posição de Caixa Segregada
  const totalSaldoReal = mockContas.reduce((acc, c) => acc + c.saldoReal, 0);
  const totalSaldoConciliado = mockContas.reduce((acc, c) => acc + c.saldoConciliado, 0);
  const totalSaldoDisponivel = mockContas.reduce((acc, c) => acc + c.saldoDisponivel, 0);
  const totalRecursosProdutores = mockSubcontas.reduce((acc, s) => acc + s.saldoTotal, 0);
  const totalComprometido = ordens
    .filter((o) => ['VALIDADO', 'APROVADO', 'PROGRAMADO', 'ENVIADO'].includes(o.status))
    .reduce((acc, o) => acc + o.valor, 0);
  const valoresEmConciliacao = 450000.0;
  const recursosPropriosDisk = Math.max(
    0,
    totalSaldoReal - totalRecursosProdutores - valoresEmConciliacao,
  );

  // Ações de Ordens
  const handleAvancarStatusOrdem = (id: string, novoStatus: OrdemPagamento['status']) => {
    setOrdens((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            status: novoStatus,
            autenticacaoBancaria: novoStatus === 'LIQUIDADO' ? 'AUTH-BACEN-SPI-' + Math.floor(100000 + Math.random() * 900000) : o.autenticacaoBancaria,
          };
        }
        return o;
      }),
    );
    setFeedbackMsg({
      tipo: 'success',
      texto: `Ordem atualizada com sucesso para '${novoStatus}'. Saldo e Ledger sincronizados.`,
    });
  };

  // Ação de Rastreio
  const handleRastrear = () => {
    setResultadoRastreio({
      encontrado: true,
      codigo: buscaTermo,
      tipo: 'REPASSE A PRODUTOR',
      valor: 1500000.0,
      beneficiario: 'Live Nation Brasil Produções',
      documentoCodigo: 'REP-2026-00012',
      documentoStatus: 'ASSINADO E HOMOLOGADO',
      ordemStatus: 'LIQUIDADO',
      banco: '341 - Itaú Unibanco S.A.',
      endToEndId: 'E3410000020260929120001882947118',
      autenticacao: 'AUTH-SPI-9941829-BACEN-OK',
      ledger: 'Subconta Live Nation (Festival Disk 2026) escriturada',
      timeline: [
        { fase: '1. Origem Operacional', desc: 'Fechamento Parcial Festival Disk 2026 aprovado pelo Produtor e Disk', status: 'OK' },
        { fase: '2. Aprovação SoD (11.32)', desc: 'Alçada Diretoria Financeira concedida com dupla checagem', status: 'OK' },
        { fase: '3. Documento & Assinaturas (11.35)', desc: 'REP-2026-00012 assinado com certificado e fé pública', status: 'OK' },
        { fase: '4. Tesouraria & Ordem (11.36)', desc: 'OPG-2026-00081 emitida e programada no lote da conta Itaú', status: 'OK' },
        { fase: '5. Liquidação Bancária', desc: 'Efetivado via SPI / BACEN / PIX Direto com autenticação bancária', status: 'OK' },
        { fase: '6. Conciliação & Ledger', desc: 'Conciliado 1:1 contra o extrato bancário e debitado da subconta do evento', status: 'OK' },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <Landmark className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Tesouraria, Bancos & Gestão de Caixa
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  EDDIE 11.36
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Segregação de Recursos Próprios vs Terceiros, Projeção de Liquidez, Ordens de Pagamento, PIX Direto, MDR & Conciliação em 3 Níveis
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('rastreamento')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Search className="w-4 h-4 text-sky-400" />
            Rastrear Pagamento
          </button>
          <button
            onClick={() => setActiveTab('fechamento')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
          >
            <CheckSquare className="w-4 h-4" />
            Fechamento de Caixa
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedbackMsg.tipo === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ALERTA MANDATÓRIO: SEGREGAÇÃO FUNDAMENTAL DE SALDOS */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-start gap-3.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-amber-300 uppercase tracking-wide">
            Princípio Inviolável da Tesouraria DiskIngressos:
          </span>
          <p className="text-slate-400 leading-relaxed">
            <strong className="text-white">Saldo em Conta Bancária NÃO é Dinheiro Disponível da Disk.</strong> O saldo bancário total de{' '}
            <span className="text-white font-mono font-bold">{formatBRL(totalSaldoReal)}</span> abriga recursos de eventos em andamento (
            <span className="text-amber-300 font-mono font-bold">{formatBRL(totalRecursosProdutores)}</span> de produtores/terceiros). O Ledger
            mantém a segregação lógica estrita de subcontas por evento.
          </p>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        {[
          { id: 'posicao', label: '1. Posição de Caixa', icon: Landmark },
          { id: 'agenda', label: '2. Agenda & Cenários', icon: Calendar },
          { id: 'recebiveis', label: '3. Recebíveis & MDR', icon: ArrowDownLeft },
          { id: 'ordens', label: '4. Contas a Pagar & Ordens', icon: ArrowUpRight },
          { id: 'lotes', label: '5. Lotes & Liquidez', icon: Layers },
          { id: 'pix_cnab', label: '6. PIX & CNAB', icon: Zap },
          { id: 'conciliacao', label: '7. Conciliação (3 Níveis)', icon: Scale },
          { id: 'transferencias', label: '8. Transferências', icon: ArrowLeftRight },
          { id: 'rastreamento', label: '9. Rastrear Pagamento', icon: Search },
          { id: 'fechamento', label: '10. Fechamento & Beneficiários', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: POSIÇÃO DE CAIXA & SEGREGAÇÃO */}
      {activeTab === 'posicao' && (
        <div className="space-y-6">
          {/* Cards de Segregação de Saldos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Saldo Bancário Consolidado
              </span>
              <div className="text-2xl font-bold text-white font-mono">{formatBRL(totalSaldoReal)}</div>
              <p className="text-[10px] text-slate-500">Soma de todas as 3 contas físicas corporativas</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-amber-500/20 space-y-2">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Recursos de Terceiros (Eventos)
              </span>
              <div className="text-2xl font-bold text-amber-300 font-mono">{formatBRL(totalRecursosProdutores)}</div>
              <p className="text-[10px] text-slate-500">Pertencem aos produtores; sob custódia transitória</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Recursos Próprios Disk
              </span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{formatBRL(recursosPropriosDisk)}</div>
              <p className="text-[10px] text-slate-500">Taxas auferidas, comissões e caixa livre corporativo</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                Saldo Comprometido (Ordens)
              </span>
              <div className="text-2xl font-bold text-sky-300 font-mono">{formatBRL(totalComprometido)}</div>
              <p className="text-[10px] text-slate-500">Ordens aprovadas aguardando envio/liquidação</p>
            </div>
          </div>

          {/* Subcontas Lógicas por Evento */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Subcontas Lógicas por Evento (Segregação Ledger)
                </h3>
                <p className="text-xs text-slate-400">
                  O dinheiro em conta bancária é rateado e auditado evento a evento
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Evento</th>
                    <th className="py-3 px-4">Produtor Titular</th>
                    <th className="py-3 px-4 text-right">Saldo Total</th>
                    <th className="py-3 px-4 text-right">Saldo Disponível</th>
                    <th className="py-3 px-4 text-right">Reserva / Retenção</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {mockSubcontas.map((s) => (
                    <tr key={s.eventoId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{s.eventoNome}</td>
                      <td className="py-3 px-4 text-slate-400">{s.produtorNome}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatBRL(s.saldoTotal)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatBRL(s.saldoDisponivel)}</td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400">{formatBRL(s.saldoRetido)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          AUDITADO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contas Bancárias Corporativas */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-sky-400" />
              Contas Bancárias Físicas da DiskIngressos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockContas.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{c.bancoNome}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-sky-500/20 text-sky-300">
                      {c.finalidade}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Agência: {c.agencia} • Conta: {c.conta}
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                    <span className="text-slate-400">Saldo Real:</span>
                    <span className="font-mono font-bold text-white">{formatBRL(c.saldoReal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Disponível:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatBRL(c.saldoDisponivel)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: AGENDA FINANCEIRA & PROJEÇÃO DE CENÁRIOS */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Simulador de Liquidez & Fluxo de Caixa Projetado
                </h3>
                <p className="text-xs text-slate-400">
                  Previsão diária com aplicação de estresse sobre adquirentes e retenções
                </p>
              </div>

              {/* Seletor de Cenários */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['BASE', 'CONSERVADOR', 'ESTRESSE'] as const).map((cen) => (
                  <button
                    key={cen}
                    onClick={() => setCenario(cen)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${
                      cenario === cen
                        ? cen === 'ESTRESSE'
                          ? 'bg-rose-600 text-white'
                          : cen === 'CONSERVADOR'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cenário {cen}
                  </button>
                ))}
              </div>
            </div>

            {/* Fatores do Cenário Ativo */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              {cenario === 'BASE' && (
                <p className="text-slate-400">
                  <strong>Cenário Base:</strong> Liquidações e prazos regulares de repasse D+2 adquirentes e saídas agendadas pontualmente.
                </p>
              )}
              {cenario === 'CONSERVADOR' && (
                <p className="text-amber-300">
                  <strong>Cenário Conservador:</strong> Simula atraso operacional de 15% nos recebíveis de cartão de crédito.
                </p>
              )}
              {cenario === 'ESTRESSE' && (
                <p className="text-rose-300">
                  <strong>Cenário Estresse Severo:</strong> Atraso de 35% nos recebíveis de cartão + retenção preventiva imediata de R$ 250.000,00 para chargebacks.
                </p>
              )}
            </div>

            {/* Tabela de Lançamentos da Agenda */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Data Prevista</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Contraparte</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono">30/09/2026</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">ENTRADA</td>
                    <td className="py-3 px-4">Liquidação Cielo Crédito Visa (D+2)</td>
                    <td className="py-3 px-4 text-slate-400">Cielo S.A.</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {cenario === 'ESTRESSE' ? formatBRL(286211.25) : formatBRL(440325.0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        PREVISTO
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono">29/09/2026</td>
                    <td className="py-3 px-4 text-rose-400 font-semibold">SAÍDA</td>
                    <td className="py-3 px-4">Repasse Live Nation (OPG-2026-00081)</td>
                    <td className="py-3 px-4 text-slate-400">Live Nation Brasil</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatBRL(1500000.0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        APROVADO
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono">30/09/2026</td>
                    <td className="py-3 px-4 text-rose-400 font-semibold">SAÍDA</td>
                    <td className="py-3 px-4">Antecipação Opus Entretenimento</td>
                    <td className="py-3 px-4 text-slate-400">Opus Entretenimento</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatBRL(800000.0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
                        PROGRAMADO
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CONTAS A RECEBER & AUDITORIA DE MDR */}
      {activeTab === 'recebiveis' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  Recebíveis de Adquirentes & Auditoria de MDR
                </h3>
                <p className="text-xs text-slate-400">
                  Auditoria automática de taxas contratadas vs cobradas nas liquidações
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Adquirente & Bandeira</th>
                    <th className="py-3 px-4">Modalidade / NSU</th>
                    <th className="py-3 px-4">Previsão</th>
                    <th className="py-3 px-4 text-right">Valor Bruto</th>
                    <th className="py-3 px-4 text-right">MDR Esperado</th>
                    <th className="py-3 px-4 text-right">MDR Cobrado</th>
                    <th className="py-3 px-4 text-right">Divergência</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {recebiveis.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{r.adquirente}</span> • {r.bandeira}
                      </td>
                      <td className="py-3 px-4">
                        <div>{r.modalidade}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NSU {r.nsu}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{r.dataPrevista}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatBRL(r.valorBruto)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{r.mdrTaxaEsperada}%</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {r.mdrTaxaCobrada ? `${r.mdrTaxaCobrada}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {r.divergencia > 0 ? (
                          <span className="text-rose-400">+{formatBRL(r.divergencia)}</span>
                        ) : (
                          <span className="text-slate-500">R$ 0,00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'DIVERGENCIA'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : r.status === 'LIQUIDADO'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.status === 'DIVERGENCIA' && (
                          <button
                            onClick={() =>
                              setFeedbackMsg({
                                tipo: 'warn',
                                texto: `Divergência de MDR do NSU ${r.nsu} (${r.adquirente}) enviada para contestação no portal da adquirente.`,
                              })
                            }
                            className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-[10px] font-bold transition"
                          >
                            Contestar Taxa
                          </button>
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

      {/* ABA 4: CONTAS A PAGAR & ORDENS DE PAGAMENTO */}
      {activeTab === 'ordens' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  Ordens de Pagamento (Máquina de Estados & SoD)
                </h3>
                <p className="text-xs text-slate-400">
                  Repasses e antecipações exigem documento assinado com fé pública (11.35)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Código / Tipo</th>
                    <th className="py-3 px-4">Beneficiário Favorecido</th>
                    <th className="py-3 px-4">Doc 11.35 Vinculado</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4">Método & Vencimento</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {ordens.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white">{o.codigo}</span>
                        <div className="text-[10px] text-sky-400 font-semibold">{o.tipo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{o.beneficiarioNome}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{o.beneficiarioCpfCnpj}</div>
                      </td>
                      <td className="py-3 px-4">
                        {o.documentoCodigo ? (
                          <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {o.documentoCodigo}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Sem exigência formal</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatBRL(o.valor)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{o.metodo}</div>
                        <div className="text-[10px] text-slate-500">{o.dataVencimento}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'LIQUIDADO'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : o.status === 'APROVADO'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : o.status === 'PROGRAMADO'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {o.status === 'APROVADO' && (
                          <button
                            onClick={() => handleAvancarStatusOrdem(o.id, 'LIQUIDADO')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition"
                          >
                            Liquidar Agora
                          </button>
                        )}
                        {o.status === 'VALIDADO' && (
                          <button
                            onClick={() => handleAvancarStatusOrdem(o.id, 'APROVADO')}
                            className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold transition"
                          >
                            Aprovar Ordem
                          </button>
                        )}
                        {o.status === 'LIQUIDADO' && (
                          <span className="text-[10px] font-mono text-emerald-400">
                            {o.autenticacaoBancaria || 'AUTENTICADO'}
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

      {/* ABA 5: LOTES DE PAGAMENTO & SIMULAÇÃO DE LIQUIDEZ */}
      {activeTab === 'lotes' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Lotes de Pagamento com Simulação de Liquidez
                </h3>
                <p className="text-xs text-slate-400">
                  Validação prévia de saldo disponível em conta antes de autorizar o envio ao banco
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Simulação de Liquidez para Novo Lote:</span>
                <div className="text-sm font-bold text-white">
                  Conta Itaú Principal • Disponível: <span className="text-emerald-400">{formatBRL(5000000.0)}</span>
                </div>
              </div>
              <button
                onClick={() =>
                  setFeedbackMsg({
                    tipo: 'success',
                    texto: 'Simulação de liquidez concluída com sucesso: o lote de R$ 800.000,00 deixará saldo projetado de R$ 4.200.000,00 sem comprometer reservas.',
                  })
                }
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Simular e Criar Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: PIX & CNAB */}
      {activeTab === 'pix_cnab' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              PIX Direto SPI / DICT & Remessas CNAB 240/400
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tratamento resiliente de timeout bancário: pagamentos sem retorno síncrono são registrados em{' '}
              <span className="text-amber-400 font-mono font-bold">SITUACAO_DESCONHECIDA</span> e verificados ativamente por webhook/polling,
              nunca cancelados precipitadamente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white">CNAB 240 / 400</span>
                <p className="text-[11px] text-slate-400">
                  Arquivos estruturados com validação rigorosa de NSR e integridade SHA-256 antes do upload na agência.
                </p>
                <div className="text-xs font-mono text-emerald-400 pt-2">Lote rem-341-1001: R$ 1.750.000,00 (Totalmente Processado)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white">PIX Direto SPI</span>
                <p className="text-[11px] text-slate-400">
                  Idempotência garantida contra cliques duplos. Chaves autenticadas via DICT Bacen.
                </p>
                <div className="text-xs font-mono text-emerald-400 pt-2">EndToEndId: E3410000020260928120001882947118 (Liquidado)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 7: CONCILIAÇÃO BANCÁRIA EM 3 NÍVEIS */}
      {activeTab === 'conciliacao' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Matriz de Conciliação em 3 Níveis
                </h3>
                <p className="text-xs text-slate-400">
                  Nível 1 (Operacional) • Nível 2 (Bancário/Liquidação) • Nível 3 (Contábil / Ledger Imutável)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nível de Conciliação</th>
                    <th className="py-3 px-4">Descrição da Correspondência</th>
                    <th className="py-3 px-4">Banco / Meio</th>
                    <th className="py-3 px-4 text-right">Extrato</th>
                    <th className="py-3 px-4 text-right">Sistema/Ledger</th>
                    <th className="py-3 px-4 text-right">Divergência</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {conciliacoes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-semibold text-sky-400">{c.nivel}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{c.descricao}</div>
                        {c.justificativa && (
                          <div className="text-[10px] text-amber-400 italic">{c.justificativa}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{c.banco}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatBRL(c.valorExtrato)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{formatBRL(c.valorSistema)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {c.divergencia !== 0 ? (
                          <span className="text-rose-400">{formatBRL(c.divergencia)}</span>
                        ) : (
                          <span className="text-slate-500">R$ 0,00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'CONCILIADO_AUTOMATICO'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {c.status}
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

      {/* ABA 8: TRANSFERÊNCIAS (BANCÁRIAS VS INTERNAS) */}
      {activeTab === 'transferencias' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                Transferência Bancária Física
              </h3>
              <p className="text-xs text-slate-400">
                Movimentação real de dinheiro entre contas correntes da DiskIngressos (ex: Itaú → Bradesco) com trânsito bancário.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg text-xs space-y-2">
                <div className="text-white font-semibold">Última Transferência Executada:</div>
                <div className="text-slate-400 font-mono">TRF-2026-9921: Itaú Principal → Bradesco Repasses</div>
                <div className="text-emerald-400 font-mono font-bold">R$ 500.000,00 (CONCLUÍDA)</div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                Transferência Interna no Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Realocação contábil entre eventos sem movimentação física em conta bancária (apenas escrituração de subcontas).
              </p>
              <div className="p-3 bg-slate-950 rounded-lg text-xs space-y-2">
                <div className="text-white font-semibold">Última Realocação Contábil:</div>
                <div className="text-slate-400 font-mono">TIL-2026-4418: Evento Live Nation → Festival Sunset</div>
                <div className="text-emerald-400 font-mono font-bold">R$ 100.000,00 (EXECUTADA)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 9: RASTREABILIDADE PONTA A PONTA */}
      {activeTab === 'rastreamento' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Search className="w-4 h-4 text-sky-400" />
              Rastrear Pagamento de Ponta a Ponta (360º)
            </h3>
            <p className="text-xs text-slate-400">
              Busque por Código de Ordem (OPG-*), Repasse (REP-*), NSU, EndToEndId ou CPF/CNPJ
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={buscaTermo}
                onChange={(e) => setBuscaTermo(e.target.value)}
                placeholder="Ex: OPG-2026-00081 ou REP-2026-00012"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleRastrear}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
              >
                Localizar Trilha
              </button>
            </div>

            {resultadoRastreio && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500">Favorecido:</span>
                    <div className="text-white font-bold">{resultadoRastreio.beneficiario}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Valor Liquidado:</span>
                    <div className="text-emerald-400 font-bold font-mono">{formatBRL(resultadoRastreio.valor)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Documento 11.35:</span>
                    <div className="text-white font-mono">{resultadoRastreio.documentoCodigo}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Autenticação:</span>
                    <div className="text-sky-400 font-mono text-[10px]">{resultadoRastreio.autenticacao}</div>
                  </div>
                </div>

                {/* Timeline das 6 Fases */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Linha do Tempo de Auditoria Ponta a Ponta:
                  </h4>
                  <div className="space-y-2">
                    {resultadoRastreio.timeline.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-white">{item.fase}</span> —{' '}
                          <span className="text-slate-400">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 10: FECHAMENTO DE CAIXA & BENEFICIÁRIOS */}
      {activeTab === 'fechamento' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist de Fechamento */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Checklist Operacional de Fechamento Diário
              </h3>

              <div className="space-y-3 text-xs">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setChecklist((prev) =>
                        prev.map((c) => (c.id === item.id ? { ...c, check: !c.check } : c)),
                      )
                    }
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                        item.check
                          ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {item.check && '✓'}
                    </div>
                    <span className={item.check ? 'text-white' : 'text-slate-400'}>{item.label}</span>
                  </div>
                ))}
              </div>

              {fechadoComSucesso ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-semibold">
                  Fechamento FCH-2026-8819 homologado com sucesso! Lançamento arquivado para auditoria contábil.
                </div>
              ) : (
                <button
                  onClick={() => setFechadoComSucesso(true)}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                >
                  Concluir Fechamento Diário
                </button>
              )}
            </div>

            {/* Cadastro de Beneficiários & Quarentena de 24h */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Beneficiários & Quarentena Bancária de 24h
              </h3>
              <p className="text-xs text-slate-400">
                Novos cadastros ou alterações bancárias entram automaticamente em quarentena para prevenção de fraudes.
              </p>

              <div className="space-y-3">
                {initialBeneficiarios.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{b.nome}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          b.status === 'ATIVO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">{b.cnpj}</div>
                    <div className="text-slate-500 font-mono text-[10px]">{b.chavePix}</div>
                    {b.quarentenaAte && (
                      <div className="text-amber-400 font-medium text-[10px] pt-1">
                        ⏱ {b.quarentenaAte}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
