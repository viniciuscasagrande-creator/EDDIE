'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  Building,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Hash,
  Scale,
  Calculator,
  Percent,
  Check,
  FileCode,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  BadgeAlert,
  Info,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { useAuthSession } from '../../components/AuthSessionContext';
import { ModuleNavigation, type ModuleNavigationItem } from '../../components/navigation/ModuleNavigation';

type TabView =
  | 'visao_geral'
  | 'motor_tributario'
  | 'simulador_reforma'
  | 'documentos_emitidos'
  | 'fiscal_entrada'
  | 'retencoes'
  | 'apuracao_tributaria'
  | 'obrigacoes_calendario'
  | 'conciliacao_quatro_pontos'
  | 'conformidade_certificados'
  | 'rastreamento_360'
  | 'fechamento_fiscal';

interface RegraItem {
  id: string;
  codigo: string;
  versao: number;
  descricao: string;
  operacaoTipo: string;
  regimeTributario: string;
  municipioIncidencia?: string;
  status: 'VIGENTE' | 'EXPIRADA' | 'REVOGADA' | 'RASCUNHO';
  exigeNfse: boolean;
  politicaRetencao: string;
  vigenciaInicio: string;
  vigenciaFim?: string;
  itens: {
    tributoCodigo: string;
    basePercentual: number;
    aliquotaPercentual: number;
    retencao: boolean;
    responsavelRetencao: string;
  }[];
}

interface DocumentoFiscalItem {
  id: string;
  chaveFiscal: string;
  numero: string;
  serie: string;
  tipo: string;
  prestadorCnpj: string;
  tomadorCpfCnpj: string;
  tomadorNome: string;
  competencia: string;
  valorTotalCentavos: number;
  baseCalculoCentavos: number;
  valorTributosCentavos: number;
  valorLiquidoCentavos: number;
  status: 'AUTORIZADO' | 'PENDENTE' | 'EM_PROCESSAMENTO' | 'REJEITADO' | 'CANCELADO';
  origemTipo: string;
  origemReferenciaId: string;
  protocoloAutorizacao?: string;
  dataEmissao: string;
  dataAutorizacao?: string;
}

export default function FiscalPage() {
  const { currentUser } = useAuthSession();
  const { evento } = useProducerEvent();

  const [activeTab, setActiveTab] = useState<TabView>('visao_geral');
  const [competencia, setCompetencia] = useState('2026-09');
  const [filtroTexto, setFiltroTexto] = useState('');

  // Simulador States
  const [simulacaoTipo, setSimulacaoTipo] = useState('INTERMEDIACAO_VENDA');
  const [simulacaoBruto, setSimulacaoBruto] = useState<number>(11000); // R$ 110,00
  const [simulacaoTaxa, setSimulacaoTaxa] = useState<number>(1000); // R$ 10,00
  const [simulacaoCpfCnpj, setSimulacaoCpfCnpj] = useState('123.456.789-00');
  const [simulacaoMunicipio, setSimulacaoMunicipio] = useState('Curitiba / PR');

  // Three-Way Match States
  const [twmFornecedor, setTwmFornecedor] = useState('Geradores & Energia Brasil LTDA');
  const [twmCnpj, setTwmCnpj] = useState('12.345.678/0001-99');
  const [twmDocNum, setTwmDocNum] = useState('NF-e 88412');
  const [twmValorDoc, setTwmValorDoc] = useState(500000); // R$ 5.000
  const [twmValorContrato, setTwmValorContrato] = useState(500000);
  const [twmValorPagamento, setTwmValorPagamento] = useState(500000);
  const [twmResultado, setTwmResultado] = useState<any>(null);

  // Rastrear 360 States
  const [termoRastreio, setTermoRastreio] = useState('FIS-2026-000412');
  const [rastreioResultado, setRastreioResultado] = useState<any>(null);

  // Fechamento States
  const [checklistFechamento, setChecklistFechamento] = useState({
    documentosEmitidosValidados: true,
    documentosEntradaThreeWayMatch: true,
    retencoesConferidas: true,
    apuracoesConcluidas: true,
    conciliacaoQuatroPontosSemDivergencia: true,
    certificadosEmDia: true,
  });
  const [periodoFechado, setPeriodoFechado] = useState(false);

  // Mock dados canônicos
  const regrasMock: RegraItem[] = [
    {
      id: 'reg-01',
      codigo: 'REG-INTERMEDIACAO-V1',
      versao: 1,
      descricao: 'Intermediação de Venda de Ingressos (ISS 5% Curitiba + PIS 0,65% + COFINS 3%)',
      operacaoTipo: 'INTERMEDIACAO_VENDA',
      regimeTributario: 'LUCRO_PRESUMIDO',
      municipioIncidencia: 'Curitiba - PR',
      status: 'VIGENTE',
      exigeNfse: true,
      politicaRetencao: 'DISPENSADA',
      vigenciaInicio: '2026-01-01',
      itens: [
        { tributoCodigo: 'ISS', basePercentual: 100, aliquotaPercentual: 5.0, retencao: false, responsavelRetencao: 'PRESTADOR' },
        { tributoCodigo: 'PIS', basePercentual: 100, aliquotaPercentual: 0.65, retencao: false, responsavelRetencao: 'PRESTADOR' },
        { tributoCodigo: 'COFINS', basePercentual: 100, aliquotaPercentual: 3.0, retencao: false, responsavelRetencao: 'PRESTADOR' },
      ],
    },
    {
      id: 'reg-02',
      codigo: 'REG-REFORMA-IBS-CBS-V1',
      versao: 1,
      descricao: 'Reforma Tributária LC 214/2025 - Modelo IVA Dual (CBS 8,8% + IBS 17,7%)',
      operacaoTipo: 'TAXA_CONVENIENCIA',
      regimeTributario: 'REFORMA_TRIBUTARIA',
      status: 'VIGENTE',
      exigeNfse: true,
      politicaRetencao: 'DISPENSADA',
      vigenciaInicio: '2026-09-01',
      itens: [
        { tributoCodigo: 'CBS', basePercentual: 100, aliquotaPercentual: 8.8, retencao: false, responsavelRetencao: 'PRESTADOR' },
        { tributoCodigo: 'IBS', basePercentual: 100, aliquotaPercentual: 17.7, retencao: false, responsavelRetencao: 'PRESTADOR' },
      ],
    },
    {
      id: 'reg-03',
      codigo: 'REG-DESPESA-FORNECEDOR-V1',
      versao: 1,
      descricao: 'Despesas Operacionais com Retenção na Fonte (IRRF 1,5% + CSRF 4,65%)',
      operacaoTipo: 'DESPESA_FORNECEDOR',
      regimeTributario: 'LUCRO_REAL',
      status: 'VIGENTE',
      exigeNfse: true,
      politicaRetencao: 'OBRIGATORIA',
      vigenciaInicio: '2026-01-01',
      itens: [
        { tributoCodigo: 'IRRF', basePercentual: 100, aliquotaPercentual: 1.5, retencao: true, responsavelRetencao: 'TOMADOR' },
        { tributoCodigo: 'PIS/COFINS/CSLL', basePercentual: 100, aliquotaPercentual: 4.65, retencao: true, responsavelRetencao: 'TOMADOR' },
        { tributoCodigo: 'ISS', basePercentual: 100, aliquotaPercentual: 5.0, retencao: true, responsavelRetencao: 'TOMADOR' },
      ],
    },
  ];

  const docsEmitidosMock: DocumentoFiscalItem[] = [
    {
      id: 'doc-01',
      chaveFiscal: 'FIS-2026-000412',
      numero: '000412',
      serie: '1',
      tipo: 'NFSE',
      prestadorCnpj: '01.234.567/0001-89',
      tomadorCpfCnpj: '12.345.678/0001-10',
      tomadorNome: 'Live Music Entretenimento LTDA',
      competencia: '2026-09',
      valorTotalCentavos: 1500000, // R$ 15.000 de ingressos
      baseCalculoCentavos: 150000,  // R$ 1.500 de taxa Disk (base de cálculo exclusiva)
      valorTributosCentavos: 12975,  // R$ 129,75 (ISS 5% + PIS 0.65% + COFINS 3%)
      valorLiquidoCentavos: 150000,
      status: 'AUTORIZADO',
      origemTipo: 'SERVICO_DISK',
      origemReferenciaId: 'srv-ped-99881',
      protocoloAutorizacao: 'PR-CTBA-2026-98127391',
      dataEmissao: '2026-09-28T14:30:00Z',
      dataAutorizacao: '2026-09-28T14:30:12Z',
    },
    {
      id: 'doc-02',
      chaveFiscal: 'FIS-2026-000413',
      numero: '000413',
      serie: '1',
      tipo: 'NFSE',
      prestadorCnpj: '01.234.567/0001-89',
      tomadorCpfCnpj: '98.765.432/0001-22',
      tomadorNome: 'Opus Entretenimento e Shows',
      competencia: '2026-09',
      valorTotalCentavos: 4200000,
      baseCalculoCentavos: 420000,
      valorTributosCentavos: 36330,
      status: 'AUTORIZADO',
      origemTipo: 'SERVICO_DISK',
      origemReferenciaId: 'srv-ped-99882',
      protocoloAutorizacao: 'PR-CTBA-2026-98127392',
      dataEmissao: '2026-09-28T15:10:00Z',
      dataAutorizacao: '2026-09-28T15:10:05Z',
      valorLiquidoCentavos: 420000,
    },
    {
      id: 'doc-03',
      chaveFiscal: 'FIS-2026-000414',
      numero: '000414',
      serie: '1',
      tipo: 'NFSE',
      prestadorCnpj: '01.234.567/0001-89',
      tomadorCpfCnpj: '55.443.322/0001-88',
      tomadorNome: 'Festival de Inverno Produções',
      competencia: '2026-09',
      valorTotalCentavos: 800000,
      baseCalculoCentavos: 80000,
      valorTributosCentavos: 6920,
      status: 'CANCELADO',
      origemTipo: 'SERVICO_DISK',
      origemReferenciaId: 'srv-ped-99883',
      dataEmissao: '2026-09-27T10:00:00Z',
      valorLiquidoCentavos: 80000,
    },
  ];

  const apuracoesMock = [
    {
      id: 'apu-01',
      codigo: 'APU-2026-09-ISS',
      tributoCodigo: 'ISS',
      descricao: 'ISS Próprio - Curitiba (Intermediação)',
      baseCalculoCentavos: 650000, // R$ 6.500
      aliquotaEfetiva: 5.0,
      debitosCentavos: 32500,     // R$ 325,00
      retencoesCentavos: 0,
      valorApuradoCentavos: 32500,
      status: 'CONCLUIDA',
      memoriaCalculo: {
        totalDocumentos: 142,
        fundamento: 'Lei Complementar 116/2003, item 10.05 (Agenciamento / Intermediação)',
      },
    },
    {
      id: 'apu-02',
      codigo: 'APU-2026-09-PIS',
      tributoCodigo: 'PIS',
      descricao: 'PIS Faturamento (Regime Cumulativo)',
      baseCalculoCentavos: 650000,
      aliquotaEfetiva: 0.65,
      debitosCentavos: 4225,      // R$ 42,25
      retencoesCentavos: 0,
      valorApuradoCentavos: 4225,
      status: 'CONCLUIDA',
      memoriaCalculo: {
        totalDocumentos: 142,
        fundamento: 'Lei 9.718/1998, art. 3º',
      },
    },
    {
      id: 'apu-03',
      codigo: 'APU-2026-09-COFINS',
      tributoCodigo: 'COFINS',
      descricao: 'COFINS Faturamento (Regime Cumulativo)',
      baseCalculoCentavos: 650000,
      aliquotaEfetiva: 3.0,
      debitosCentavos: 19500,     // R$ 195,00
      retencoesCentavos: 0,
      valorApuradoCentavos: 19500,
      status: 'CONCLUIDA',
      memoriaCalculo: {
        totalDocumentos: 142,
        fundamento: 'Lei 9.718/1998, art. 3º',
      },
    },
    {
      id: 'apu-04',
      codigo: 'APU-2026-09-CBS-IBS',
      tributoCodigo: 'CBS/IBS',
      descricao: 'Simulação IVA Dual (LC 214/2025 - Período de Teste)',
      baseCalculoCentavos: 650000,
      aliquotaEfetiva: 26.5,
      debitosCentavos: 172250,
      retencoesCentavos: 60287, // Créditos não cumulativos da cadeia estimada
      valorApuradoCentavos: 111963,
      status: 'EM_REVISAO',
      memoriaCalculo: {
        totalDocumentos: 142,
        fundamento: 'LC 214/2025 e LC 227/2026 (Transição Tributária do Consumo)',
      },
    },
  ];

  const obrigaçõesMock = [
    {
      id: 'obr-01',
      codigo: 'DAM-ISS-CTBA',
      tributo: 'ISS Municipal',
      tipo: 'PRINCIPAL',
      descricao: 'Guia DAM ISSQN Mensal - Serviços de Ingressos Curitiba',
      competencia: '2026-09',
      vencimento: '2026-10-10',
      valorCentavos: 32500,
      status: 'AGUARDANDO_PAGAMENTO',
      codigoBarras: '81670000000-3 32500123000-4 00000000000-0 00000000000-0',
    },
    {
      id: 'obr-02',
      codigo: 'DARF-PIS-COFINS',
      tributo: 'PIS/COFINS',
      tipo: 'PRINCIPAL',
      descricao: 'DARF Mensal PIS/COFINS Cumulativo Código 8109/2172',
      competencia: '2026-09',
      vencimento: '2026-10-25',
      valorCentavos: 23725,
      status: 'PENDENTE',
      codigoBarras: '85830000000-1 23725123000-9 00000000000-0 00000000000-0',
    },
    {
      id: 'obr-03',
      codigo: 'EFD-REINF-MENSAL',
      tributo: 'SPED / EFD-Reinf',
      tipo: 'ACESSORIA',
      descricao: 'Transmissão da EFD-Reinf com Retenções de Serviços Tomados (S-2010/S-2020)',
      competencia: '2026-09',
      vencimento: '2026-10-15',
      valorCentavos: 0,
      status: 'PAGA_CUMPRIDA',
    },
    {
      id: 'obr-04',
      codigo: 'DCTF-WEB-MENSAL',
      tributo: 'DCTFWeb',
      tipo: 'ACESSORIA',
      descricao: 'Declaração de Débitos e Créditos Tributários Federais Web',
      competencia: '2026-09',
      vencimento: '2026-10-22',
      valorCentavos: 0,
      status: 'PENDENTE',
    },
  ];

  const certificadosMock = [
    {
      id: 'cert-01',
      tipo: 'A1',
      titular: 'DISK INGRESSOS SISTEMAS DE INGRESSOS S.A.',
      cnpj: '01.234.567/0001-89',
      emissora: 'Certisign Multipla G7',
      validade: '2027-04-18',
      diasRestantes: 201,
      status: 'ATIVO',
      uso: 'Emissão de NFS-e Curitiba, SPED, EFD-Reinf e DCTFWeb',
    },
    {
      id: 'cert-02',
      tipo: 'A1',
      titular: 'DISK INGRESSOS FILIAL SP S.A.',
      cnpj: '01.234.567/0002-60',
      emissora: 'Valid Certificadora',
      validade: '2026-10-20',
      diasRestantes: 21,
      status: 'ALERTA_RENOVACAO',
      uso: 'Emissão de NFS-e São Paulo',
    },
  ];

  // Cálculo da simulação em tempo real
  const simulacaoCalculada = useMemo(() => {
    const ingresso = Math.max(0, simulacaoBruto - simulacaoTaxa);
    const base = simulacaoTaxa;
    const iss = Math.round(base * 0.05);
    const pis = Math.round(base * 0.0065);
    const cofins = Math.round(base * 0.03);
    const totalAtual = iss + pis + cofins;

    // Reforma LC 214
    const cbs = Math.round(base * 0.088);
    const ibs = Math.round(base * 0.177);
    const totalReformaBruto = cbs + ibs;
    const creditosEstimados = Math.round(totalReformaBruto * 0.35); // 35% de créditos operacionais
    const totalReformaLiquido = totalReformaBruto - creditosEstimados;

    return {
      valorIngresso: ingresso,
      baseDisk: base,
      iss,
      pis,
      cofins,
      totalAtual,
      aliquotaAtual: 8.65,
      cbs,
      ibs,
      totalReformaBruto,
      creditosEstimados,
      totalReformaLiquido,
      aliquotaReformaNominal: 26.5,
      aliquotaReformaEfetiva: Number(((totalReformaLiquido / base) * 100).toFixed(2)),
      variacaoLiquida: totalReformaLiquido - totalAtual,
    };
  }, [simulacaoBruto, simulacaoTaxa]);

  const navItems: ModuleNavigationItem[] = [
    { id: 'visao_geral', label: 'Visão Geral Fiscal', icon: <FileText className="w-4 h-4" /> },
    { id: 'motor_tributario', label: 'Motor & Regras Tributárias', icon: <Scale className="w-4 h-4" /> },
    { id: 'simulador_reforma', label: 'Simulador Dry-Run & LC 214', icon: <Calculator className="w-4 h-4" /> },
    { id: 'documentos_emitidos', label: 'Documentos Fiscais (NFS-e)', icon: <Receipt className="w-4 h-4" />, badge: docsEmitidosMock.length },
    { id: 'fiscal_entrada', label: 'Fiscal Entrada (Three-Way Match)', icon: <Layers className="w-4 h-4" /> },
    { id: 'retencoes', label: 'Retenções Tributárias', icon: <Percent className="w-4 h-4" /> },
    { id: 'apuracao_tributaria', label: 'Apuração & Memória de Cálculo', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'obrigacoes_calendario', label: 'Calendário & Obrigações', icon: <Calendar className="w-4 h-4" />, badge: '4 Guias' },
    { id: 'conciliacao_quatro_pontos', label: 'Conciliação em 4 Pontos', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'conformidade_certificados', label: 'Conformidade & Certificados', icon: <ShieldAlert className="w-4 h-4" />, badge: '1 Alerta' },
    { id: 'rastreamento_360', label: 'Rastrear Documento 360º', icon: <Search className="w-4 h-4" /> },
    { id: 'fechamento_fiscal', label: 'Fechamento Fiscal Mensal', icon: periodoFechado ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-amber-400" /> },
  ];

  const handleValidarThreeWayMatch = () => {
    const dif = twmValorDoc - twmValorContrato;
    const difPag = twmValorPagamento - twmValorDoc;
    const match = dif === 0 && difPag === 0;

    setTwmResultado({
      aprovado: match,
      fornecedor: twmFornecedor,
      documento: twmDocNum,
      diferenca: dif,
      status: match ? 'CORRESPONDENCIA_EXATA' : 'DIVERGENCIA_VALOR',
      diagnostico: match
        ? 'Three-Way Match aprovado com sucesso! Contrato (R$ ' + (twmValorContrato / 100).toFixed(2) + ') = Documento Fiscal (R$ ' + (twmValorDoc / 100).toFixed(2) + ') = Pagamento Tesouraria (R$ ' + (twmValorPagamento / 100).toFixed(2) + ').'
        : `Divergência detectada de R$ ${(Math.abs(dif) / 100).toFixed(2)} entre Contrato e Documento Fiscal. Pendência fiscal aberta para auditoria.`,
    });
  };

  const handleRastrear360 = () => {
    const doc = docsEmitidosMock.find((d) => d.chaveFiscal.toLowerCase().includes(termoRastreio.toLowerCase())) ?? docsEmitidosMock[0];
    if (doc) {
      setRastreioResultado({
        encontrado: true,
        documento: doc,
        origemCore: {
          pedidoCodigo: 'PED-2026-99881',
          eventoNome: evento?.nome ?? 'Festival de Música Eletrônica 2026',
          produtorNome: 'Live Music Entretenimento LTDA',
          valorTotalPedido: doc.valorTotalCentavos,
          taxaConvenienciaDisk: doc.baseCalculoCentavos,
        },
        lancamentoContabil: {
          numeroLancamento: 41829,
          status: 'CONFIRMADO',
          partidas: 'D: Contas a Receber Adquirentes | C: Receita Própria Intermediação (Taxa)',
        },
        apuracao: {
          codigo: 'APU-2026-09-ISS',
          aliquotaISS: '5,00%',
          valorTributoCentavos: Math.round(doc.baseCalculoCentavos * 0.05),
        },
        recolhimentoTesouraria: {
          guiaCodigo: 'DAM-ISS-CTBA',
          vencimento: '10/10/2026',
          status: 'AGUARDANDO_PAGAMENTO',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* HEADER EXECUTIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Central Fiscal e Tributária</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  EDDIE 11.38
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Reforma LC 214/2025
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Motor tributário versionado, emissão de NFS-e, Three-Way Match, apuração com memória de cálculo e segregação de receita
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DE COMPETÊNCIA & AÇÃO RÁPIDA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-xs text-slate-400 mr-1.5">Competência:</span>
            <select
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="2026-09" className="bg-slate-900">Setembro / 2026 (Atual)</option>
              <option value="2026-08" className="bg-slate-900">Agosto / 2026 (Fechado)</option>
              <option value="2026-07" className="bg-slate-900">Julho / 2026 (Fechado)</option>
            </select>
          </div>

          <button
            onClick={() => setActiveTab('simulador_reforma')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Simulador Dry-Run
          </button>
        </div>
      </div>

      {/* REGRA INVIOLÁVEL BANNER */}
      <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-slate-300">
          <span className="font-semibold text-indigo-300 uppercase tracking-wide">
            Princípio Inviolável da Segregação de Receita (EDDIE Core):
          </span>
          <p>
            <strong className="text-white">VENDA DO INGRESSO ≠ RECEITA DA DISK ≠ BASE TRIBUTÁVEL DA DISK.</strong> Os valores de ingressos pertencem ao produtor e transitam em conta gráfica. A base de cálculo tributária da Disk é restrita à taxa de serviço / remuneração de intermediação, parametrizada e versionada por vigência.
          </p>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <ModuleNavigation
        items={navItems}
        activeItem={activeTab}
        onSelect={(id) => setActiveTab(id as TabView)}
        ariaLabel="Navegação Central Fiscal"
      />

      {/* ========================================================================= */}
      {/* 1. VISÃO GERAL FISCAL */}
      {/* ========================================================================= */}
      {activeTab === 'visao_geral' && (
        <div className="space-y-6">
          {/* CARDS DE KPIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Vendas Brutas (Ingressos)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">R$ 6.500.000,00</div>
              <p className="text-xs text-slate-400">Recurso de terceiros segregado da base</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-indigo-500/30 rounded-xl space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-indigo-300 text-xs font-medium">
                <span>Base Tributável Disk (Taxas)</span>
                <Percent className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-300">R$ 650.000,00</div>
              <p className="text-xs text-indigo-400/80">Exatamente 10% da movimentação bruta</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tributos Próprios Devidos</span>
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300">R$ 56.225,00</div>
              <p className="text-xs text-slate-400">ISS (5%) + PIS (0,65%) + COFINS (3%)</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Status da Competência</span>
                {periodoFechado ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${periodoFechado ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {periodoFechado ? 'Fechado & Auditado' : 'Em Apuração (Aberto)'}
              </div>
              <p className="text-xs text-slate-400">Competência {competencia}</p>
            </div>
          </div>

          {/* PAINEL DE SEGREGAÇÃO & COMPOSIÇÃO TRIBUTÁRIA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Demonstrativo de Segregação & Não-Incidência</h3>
                  <p className="text-xs text-slate-400">Garantia estrutural de que valores de ingressos de produtores não geram faturamento na Disk</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  LC 116/03 & Sol. Consulta COSIT
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-white">Faturamento Total Transacionado (Ingressos + Taxas)</span>
                    <p className="text-xs text-slate-400">Total debitado nos cartões e PIX dos compradores</p>
                  </div>
                  <span className="font-mono text-base font-semibold text-slate-200">R$ 6.500.000,00</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg text-rose-300">
                  <div>
                    <span className="text-sm font-medium">(-) Repasses aos Produtores (Recurso de Terceiros)</span>
                    <p className="text-xs text-rose-400/80">Propriedade exclusiva do contratante - Não compõe receita própria</p>
                  </div>
                  <span className="font-mono text-base font-semibold">(-) R$ 5.850.000,00</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-indigo-950/30 border border-indigo-500/40 rounded-lg text-indigo-200">
                  <div>
                    <span className="text-sm font-medium font-semibold text-indigo-300">(=) Receita Própria da Disk (Taxa de Conveniência / Intermediação)</span>
                    <p className="text-xs text-indigo-400">Base exclusiva de cálculo do ISS e Contribuições Federais</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-indigo-300">R$ 650.000,00</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
                <span>NFS-e Emitidas no Período: <strong className="text-white">142 notas</strong></span>
                <span>Alíquota Efetiva Ponderada: <strong className="text-indigo-400">8,65%</strong></span>
                <span>Total de Tributos Próprios: <strong className="text-amber-400">R$ 56.225,00</strong></span>
              </div>
            </div>

            {/* VENCIMENTOS E OBRIGAÇÕES IMEDIATAS */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Próximos Vencimentos</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tesouraria Integrada
                </span>
              </div>

              <div className="space-y-2.5">
                {obrigaçõesMock.slice(0, 3).map((obr) => (
                  <div key={obr.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{obr.codigo}</div>
                      <div className="text-xs text-slate-400">{obr.tributo}</div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">Vence: {obr.vencimento}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-slate-200">
                        {obr.valorCentavos > 0 ? `R$ ${(obr.valorCentavos / 100).toFixed(2)}` : 'Acessória'}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${obr.status === 'PAGA_CUMPRIDA' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {obr.status === 'PAGA_CUMPRIDA' ? 'Cumprida' : 'Aguardando'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('obrigacoes_calendario')}
                className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Ver Todas as Guias e Obrigações <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MOTOR TRIBUTÁRIO & REGRAS VERSIONADAS */}
      {/* ========================================================================= */}
      {activeTab === 'motor_tributario' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Catálogo de Regras Tributárias Versionadas</h2>
              <p className="text-xs text-slate-400">
                Regras paramétricas com vigência temporal. Nenhuma alíquota ou imposto é codificado de forma estática no fluxo de pedidos.
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Nova Regra / Nova Versão
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {regrasMock.map((regra) => (
              <div key={regra.id} className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-indigo-400">{regra.codigo}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Versão {regra.versao}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {regra.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {regra.regimeTributario}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium mt-1">{regra.descricao}</p>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    <div>Vigência Início: <span className="text-slate-200 font-mono">{regra.vigenciaInicio}</span></div>
                    <div>Vigência Fim: <span className="text-slate-200 font-mono">{regra.vigenciaFim ?? 'Indeterminada'}</span></div>
                  </div>
                </div>

                {/* TABELA DE ALÍQUOTAS */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tributos e Alíquotas Aplicáveis</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                    {regra.itens.map((it, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{it.tributoCodigo}</span>
                          <span className="text-xs font-mono font-bold text-indigo-400">{it.aliquotaPercentual.toFixed(2)}%</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Base: {it.basePercentual}% da taxa
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                          <span>{it.retencao ? 'Com Retenção' : 'Sem Retenção'}</span>
                          <span>Resp: {it.responsavelRetencao}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SIMULADOR DRY-RUN & COMPARADOR DA REFORMA TRIBUTÁRIA (LC 214) */}
      {/* ========================================================================= */}
      {activeTab === 'simulador_reforma' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Simulador Dry-Run & Comparador da Reforma Tributária (LC 214/2025)</h2>
            <p className="text-xs text-slate-400">
              Analise o impacto tributário de cada operação com a segregação estrita entre recurso do produtor e receita própria da Disk, comparando o modelo atual com o novo IVA Dual (CBS + IBS).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULÁRIO DE ENTRADA DO SIMULADOR */}
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Parâmetros da Operação
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-medium">Tipo de Operação Fiscal</label>
                  <select
                    value={simulacaoTipo}
                    onChange={(e) => setSimulacaoTipo(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="INTERMEDIACAO_VENDA">Intermediação de Venda de Ingressos</option>
                    <option value="TAXA_CONVENIENCIA">Taxa de Conveniência Direta</option>
                    <option value="SERVICO_PLATAFORMA">Locação e Serviços de Plataforma</option>
                    <option value="DESPESA_FORNECEDOR">Despesa de Fornecedor com Retenção</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Valor Total Pago pelo Cliente (R$)</label>
                  <input
                    type="number"
                    value={simulacaoBruto / 100}
                    onChange={(e) => setSimulacaoBruto(Math.round(Number(e.target.value) * 100))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 outline-none"
                  />
                  <span className="text-[11px] text-slate-500">Ex: Ingresso + Taxa</span>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Taxa de Serviço da Disk (R$)</label>
                  <input
                    type="number"
                    value={simulacaoTaxa / 100}
                    onChange={(e) => setSimulacaoTaxa(Math.round(Number(e.target.value) * 100))}
                    className="w-full mt-1 bg-slate-950 border border-indigo-500/50 rounded-lg p-2 font-mono text-indigo-300 font-bold outline-none"
                  />
                  <span className="text-[11px] text-indigo-400">Esta é a única base de cálculo tributável da Disk!</span>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Tomador (CPF ou CNPJ Alfanumérico)</label>
                  <input
                    type="text"
                    value={simulacaoCpfCnpj}
                    onChange={(e) => setSimulacaoCpfCnpj(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Município de Incidência</label>
                  <input
                    type="text"
                    value={simulacaoMunicipio}
                    onChange={(e) => setSimulacaoMunicipio(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs space-y-1 text-slate-400">
                <span className="font-semibold text-indigo-300">Auditoria Automática:</span>
                <p>
                  Recursos do produtor (R$ {(simulacaoCalculada.valorIngresso / 100).toFixed(2)}) excluídos da base da DiskIngressos.
                </p>
              </div>
            </div>

            {/* COMPARATIVO ATUAL VS REFORMA TRIBUTÁRIA */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* REGIME ATUAL */}
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Regime Atual (Cumulativo)</span>
                    <span className="text-xs font-mono font-bold text-amber-400">8,65% Efetiva</span>
                  </div>
                  <div className="text-xl font-bold text-white">Lucro Presumido + ISS</div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Base de Cálculo Disk:</span>
                      <span>R$ {(simulacaoCalculada.baseDisk / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>ISS (5,00%):</span>
                      <span>R$ {(simulacaoCalculada.iss / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>PIS (0,65%):</span>
                      <span>R$ {(simulacaoCalculada.pis / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>COFINS (3,00%):</span>
                      <span>R$ {(simulacaoCalculada.cofins / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-bold pt-2 border-t border-slate-800">
                      <span>Total Tributos Atuais:</span>
                      <span>R$ {(simulacaoCalculada.totalAtual / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* REFORMA TRIBUTÁRIA LC 214 */}
                <div className="p-5 bg-gradient-to-br from-indigo-950/50 to-slate-900/80 border border-indigo-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Reforma Tributária</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">LC 214/2025</span>
                  </div>
                  <div className="text-xl font-bold text-indigo-200">IVA Dual (CBS + IBS)</div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Base de Cálculo Disk:</span>
                      <span>R$ {(simulacaoCalculada.baseDisk / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-300">
                      <span>CBS Federal (8,80%):</span>
                      <span>R$ {(simulacaoCalculada.cbs / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-300">
                      <span>IBS Subnacional (17,70%):</span>
                      <span>R$ {(simulacaoCalculada.ibs / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>(-) Créditos Operacionais Estimados (35%):</span>
                      <span>(-) R$ {(simulacaoCalculada.creditosEstimados / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-300 font-bold pt-2 border-t border-slate-800">
                      <span>Carga Líquida Estimada:</span>
                      <span>R$ {(simulacaoCalculada.totalReformaLiquido / 100).toFixed(2)} ({simulacaoCalculada.aliquotaReformaEfetiva}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD DE PARECER DE COMPLIANCE */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Parecer de Transição Tributária
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Mesmo com o aumento da alíquota nominal de 8,65% para 26,50% no novo modelo, a DiskIngressos poderá abater créditos de todos os insumos operacionais (servidores AWS, licenças de software, gateway de pagamentos, taxas antifraude e contratações de serviços). A segregação estrita dos ingressos de produtores assegura que a base de cálculo tributária permaneça unicamente sobre a margem de taxa da empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCUMENTOS FISCAIS (NFS-E) */}
      {/* ========================================================================= */}
      {activeTab === 'documentos_emitidos' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Documentos Fiscais Emitidos (NFS-e)</h2>
              <p className="text-xs text-slate-400">
                Emissão idempotente de NFS-e, armazenamento do XML assinado e integração com a Central de Documentos 11.35
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por chave ou tomador..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none w-64"
                />
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Emitir NFS-e
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Chave / Número</th>
                  <th className="py-3 px-4">Tomador (Cliente/Produtor)</th>
                  <th className="py-3 px-4">Venda Bruta</th>
                  <th className="py-3 px-4">Base Disk (Taxa)</th>
                  <th className="py-3 px-4">Tributos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data Emissão</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {docsEmitidosMock
                  .filter((d) => d.chaveFiscal.toLowerCase().includes(filtroTexto.toLowerCase()) || d.tomadorNome.toLowerCase().includes(filtroTexto.toLowerCase()))
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{doc.numero}</div>
                        <div className="text-[11px] font-mono text-slate-500">{doc.chaveFiscal}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{doc.tomadorNome}</div>
                        <div className="text-[11px] font-mono text-slate-500">{doc.tomadorCpfCnpj}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        R$ {(doc.valorTotalCentavos / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-300">
                        R$ {(doc.baseCalculoCentavos / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300">
                        R$ {(doc.valorTributosCentavos / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            doc.status === 'AUTORIZADO'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(doc.dataEmissao).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setTermoRastreio(doc.chaveFiscal);
                              setActiveTab('rastreamento_360');
                            }}
                            title="Rastrear 360"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                          <button title="Ver XML Assinado" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                            <FileCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FISCAL DE ENTRADA & THREE-WAY MATCH */}
      {/* ========================================================================= */}
      {activeTab === 'fiscal_entrada' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Fiscal de Entrada & Validação Three-Way Match</h2>
            <p className="text-xs text-slate-400">
              Conferência em 3 vias para notas fiscais de fornecedores: Contrato/Pedido de Compra ↔ Documento Fiscal ↔ Ordem de Pagamento em Tesouraria, com alocação por Evento (EDDIE 11.30 Rentabilidade).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Validador Three-Way Match
              </h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-300">Fornecedor</label>
                  <input
                    type="text"
                    value={twmFornecedor}
                    onChange={(e) => setTwmFornecedor(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300">CNPJ do Fornecedor</label>
                  <input
                    type="text"
                    value={twmCnpj}
                    onChange={(e) => setTwmCnpj(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300">Número da NF-e / NFS-e</label>
                  <input
                    type="text"
                    value={twmDocNum}
                    onChange={(e) => setTwmDocNum(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[11px]">1. Contrato (R$)</label>
                    <input
                      type="number"
                      value={twmValorContrato / 100}
                      onChange={(e) => setTwmValorContrato(Math.round(Number(e.target.value) * 100))}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 font-mono text-slate-200 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px]">2. Doc Fiscal (R$)</label>
                    <input
                      type="number"
                      value={twmValorDoc / 100}
                      onChange={(e) => setTwmValorDoc(Math.round(Number(e.target.value) * 100))}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 font-mono text-slate-200 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px]">3. Pagamento (R$)</label>
                    <input
                      type="number"
                      value={twmValorPagamento / 100}
                      onChange={(e) => setTwmValorPagamento(Math.round(Number(e.target.value) * 100))}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 font-mono text-slate-200 outline-none text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleValidarThreeWayMatch}
                  className="w-full mt-2 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Executar Three-Way Match
                </button>
              </div>
            </div>

            {/* PAINEL DE RESULTADO DO THREE-WAY MATCH */}
            <div className="lg:col-span-2 p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-white">Resultado da Validação das Três Vias</h3>

              {twmResultado ? (
                <div className={`p-4 rounded-xl border ${twmResultado.aprovado ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'} space-y-3`}>
                  <div className="flex items-center gap-2">
                    {twmResultado.aprovado ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      {twmResultado.aprovado ? 'Three-Way Match Aprovado: Correspondência Exata' : 'Divergência Detectada em Three-Way Match'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{twmResultado.diagnostico}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px]">Contrato / Pedido</span>
                      <div className="text-slate-200 font-bold">R$ {(twmValorContrato / 100).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Nota Fiscal Entrada</span>
                      <div className="text-slate-200 font-bold">R$ {(twmValorDoc / 100).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Pagamento Tesouraria</span>
                      <div className="text-slate-200 font-bold">R$ {(twmValorPagamento / 100).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs space-y-1">
                  <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p>Execute a validação para inspecionar a correspondência das 3 vias.</p>
                  <p className="text-[11px] text-slate-600">Alocação automática no Centro de Custo do Evento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RETENÇÕES TRIBUTÁRIAS */}
      {/* ========================================================================= */}
      {activeTab === 'retencoes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Central de Retenções Tributárias</h2>
            <p className="text-xs text-slate-400">
              Retenções não são descontos comerciais: possuem base de cálculo, alíquota legal, tomador/prestador e responsabilidade explícita pelo recolhimento (IRRF, CSRF 4,65% e ISS Retido).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                Retenções Sofridas (Pela Disk)
              </h3>
              <p className="text-xs text-slate-400">Quando contratantes/tomadores de grande porte retêm impostos na fonte sobre a taxa da Disk</p>

              <div className="space-y-2 pt-2">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">IRRF 1,5% s/ Serviços de Intermediação</span>
                    <p className="text-slate-500 text-[11px]">Compensável na apuração de IRPJ</p>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">R$ 9.750,00</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">CSRF 4,65% (PIS / COFINS / CSLL)</span>
                    <p className="text-slate-500 text-[11px]">Compensável nas guias federais mensais</p>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">R$ 30.225,00</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                Retenções Efetuadas (De Fornecedores)
              </h3>
              <p className="text-xs text-slate-400">Quando a Disk retém na fonte de fornecedores de serviços (palco, segurança, ambulância) para recolhimento</p>

              <div className="space-y-2 pt-2">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">ISS Retido na Fonte (Curitiba / SP)</span>
                    <p className="text-slate-500 text-[11px]">Recolhimento via DAM municipal pela Disk</p>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">R$ 14.500,00</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">CSRF 4,65% Retido s/ Fornecedores</span>
                    <p className="text-slate-500 text-[11px]">Recolhimento via DARF código 5952</p>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">R$ 23.250,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CENTRAL DE APURAÇÃO TRIBUTÁRIA & MEMÓRIA DE CÁLCULO */}
      {/* ========================================================================= */}
      {activeTab === 'apuracao_tributaria' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Apuração Tributária Periódica com Memória de Cálculo</h2>
            <p className="text-xs text-slate-400">
              Drill-down rastreável: Apuração ➔ Tributo ➔ Documento Fiscal ➔ Pedido Core, respondendo à pergunta auditável "Como este tributo foi calculado?".
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {apuracoesMock.map((apu) => (
              <div key={apu.id} className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-indigo-400">{apu.codigo}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {apu.tributoCodigo}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {apu.status}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-white mt-1">{apu.descricao}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Valor a Recolher:</span>
                    <div className="text-xl font-mono font-bold text-amber-300">
                      R$ {(apu.valorApuradoCentavos / 100).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Base Tributável:</span>
                    <div className="text-slate-200 font-bold">R$ {(apu.baseCalculoCentavos / 100).toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Alíquota Efetiva:</span>
                    <div className="text-indigo-400 font-bold">{apu.aliquotaEfetiva.toFixed(2)}%</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Débitos Apurados:</span>
                    <div className="text-slate-200 font-bold">R$ {(apu.debitosCentavos / 100).toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Documentos Considerados:</span>
                    <div className="text-slate-200 font-bold">{apu.memoriaCalculo.totalDocumentos} notas</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-slate-300">Memória de Cálculo & Fundamento Legal:</span>
                  <p className="text-slate-400">{apu.memoriaCalculo.fundamento}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CALENDÁRIO & OBRIGAÇÕES */}
      {/* ========================================================================= */}
      {activeTab === 'obrigacoes_calendario' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Calendário Fiscal & Obrigações (SPED / EFD / DCTF)</h2>
              <p className="text-xs text-slate-400">
                Acompanhamento e liquidação das obrigações principais (guias de pagamento) e acessórias com rastreio de código de barras
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {obrigaçõesMock.map((obr) => (
              <div key={obr.id} className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{obr.codigo}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {obr.tipo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {obr.tributo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{obr.descricao}</p>
                  {obr.codigoBarras && (
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      Linha Digitável: <span className="text-slate-400">{obr.codigoBarras}</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400 font-mono">Vencimento: <strong className="text-amber-400">{obr.vencimento}</strong></div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    {obr.valorCentavos > 0 ? `R$ ${(obr.valorCentavos / 100).toFixed(2)}` : 'Declaratória (R$ 0,00)'}
                  </div>
                  <span
                    className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded ${
                      obr.status === 'PAGA_CUMPRIDA'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300 animate-pulse'
                    }`}
                  >
                    {obr.status === 'PAGA_CUMPRIDA' ? 'Cumprida' : 'Aguardando Pagamento'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. CONCILIAÇÃO EM QUATRO PONTOS */}
      {/* ========================================================================= */}
      {activeTab === 'conciliacao_quatro_pontos' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Conciliação Fiscal em Quatro Pontos</h2>
            <p className="text-xs text-slate-400">
              Integridade ponta a ponta sem divergências entre Operação Core, Documento Fiscal, Livro Contábil e Liquidação em Tesouraria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/70 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ponto 1: Operação Core ↔ NFS-e Emitida
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">100% Conciliado</span>
              </div>
              <p className="text-xs text-slate-300">Todas as taxas de conveniência faturadas na plataforma possuem documento fiscal NFS-e correspondente e autorizado.</p>
              <div className="text-xs font-mono text-slate-400 pt-1">Total Operação: R$ 650.000,00 | Total NFS-e: R$ 650.000,00</div>
            </div>

            <div className="p-4 bg-slate-900/70 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ponto 2: NFS-e Emitida ↔ Contabilidade
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">100% Conciliado</span>
              </div>
              <p className="text-xs text-slate-300">Os valores brutos das notas fiscais conferem com os lançamentos a crédito na Conta de Receita Própria (3.1.01).</p>
              <div className="text-xs font-mono text-slate-400 pt-1">Total NFS-e: R$ 650.000,00 | Total Contábil: R$ 650.000,00</div>
            </div>

            <div className="p-4 bg-slate-900/70 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ponto 3: Contabilidade ↔ Apuração Fiscal
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">100% Conciliado</span>
              </div>
              <p className="text-xs text-slate-300">A base de cálculo da apuração do ISS e Contribuições Federais bate exatamente com os saldos do Razão Contábil.</p>
              <div className="text-xs font-mono text-slate-400 pt-1">Base Contábil: R$ 650.000,00 | Base Apuração: R$ 650.000,00</div>
            </div>

            <div className="p-4 bg-slate-900/70 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ponto 4: Apuração Fiscal ↔ Tesouraria
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Em Pagamento</span>
              </div>
              <p className="text-xs text-slate-300">Os valores de guias geradas na apuração (ISS, DARFs) correspondem às ordens de pagamento provisionadas na Tesouraria.</p>
              <div className="text-xs font-mono text-slate-400 pt-1">Apurado: R$ 56.225,00 | Provisionado: R$ 56.225,00</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. CONFORMIDADE & CERTIFICADOS DIGITAIS */}
      {/* ========================================================================= */}
      {activeTab === 'conformidade_certificados' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Central de Conformidade & Certificados Digitais</h2>
            <p className="text-xs text-slate-400">
              Monitoramento preventivo de expiração de certificados digitais A1/A3, pendências fiscais e alertas de contingência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificadosMock.map((cert) => (
              <div
                key={cert.id}
                className={`p-5 rounded-xl border ${
                  cert.diasRestantes < 30
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/70 border-slate-800 text-slate-200'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Certificado {cert.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${cert.diasRestantes < 30 ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {cert.diasRestantes < 30 ? `Alerta: Expira em ${cert.diasRestantes} dias` : `Válido (${cert.diasRestantes} dias)`}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{cert.validade}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-slate-100">{cert.titular}</div>
                  <div className="font-mono text-slate-400">CNPJ: {cert.cnpj}</div>
                  <div className="text-slate-500">Autoridade: {cert.emissora}</div>
                  <div className="text-[11px] text-indigo-400 pt-1 border-t border-slate-800/80">Finalidade: {cert.uso}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. RASTREAMENTO 360º DE DOCUMENTO FISCAL */}
      {/* ========================================================================= */}
      {activeTab === 'rastreamento_360' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Rastreamento 360º de Documento Fiscal</h2>
            <p className="text-xs text-slate-400">
              Auditoria ponta a ponta conectando: Pedido Core ➔ NFS-e ➔ Lançamento Contábil ➔ Apuração Fiscal ➔ Pagamento na Tesouraria.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Informe a chave fiscal, número da NFS-e ou ID do pedido..."
                value={termoRastreio}
                onChange={(e) => setTermoRastreio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 outline-none"
              />
            </div>
            <button
              onClick={handleRastrear360}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Rastrear 360º
            </button>
          </div>

          {rastreioResultado && (
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-white">{rastreioResultado.documento.chaveFiscal}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {rastreioResultado.documento.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Protocolo: <span className="font-mono text-slate-300">{rastreioResultado.documento.protocoloAutorizacao}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Taxa Faturada (Base Disk)</div>
                  <div className="text-xl font-mono font-bold text-indigo-300">
                    R$ {(rastreioResultado.documento.baseCalculoCentavos / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* TIMELINE DE LINHAGEM E RASTREABILIDADE */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 1. Operação Core
                  </div>
                  <div className="text-white font-medium">{rastreioResultado.origemCore.pedidoCodigo}</div>
                  <div className="text-slate-400 text-[11px]">{rastreioResultado.origemCore.eventoNome}</div>
                  <div className="text-slate-500 text-[10px]">Ingressos: R$ {(rastreioResultado.origemCore.valorTotalPedido / 100).toFixed(2)}</div>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" /> 2. Emissão Fiscal
                  </div>
                  <div className="text-white font-medium">NFS-e Nº {rastreioResultado.documento.numero}</div>
                  <div className="text-slate-400 text-[11px]">{rastreioResultado.documento.tomadorNome}</div>
                  <div className="text-emerald-400 text-[10px]">Autorizado na Prefeitura</div>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" /> 3. Livro Contábil
                  </div>
                  <div className="text-white font-medium">Lançamento Nº {rastreioResultado.lancamentoContabil.numeroLancamento}</div>
                  <div className="text-slate-400 text-[11px]">{rastreioResultado.lancamentoContabil.partidas}</div>
                  <div className="text-emerald-400 text-[10px]">Partidas Dobradas Balanceadas</div>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 4. Guia & Tesouraria
                  </div>
                  <div className="text-white font-medium">{rastreioResultado.recolhimentoTesouraria.guiaCodigo}</div>
                  <div className="text-slate-400 text-[11px]">Venc: {rastreioResultado.recolhimentoTesouraria.vencimento}</div>
                  <div className="text-amber-400 text-[10px]">{rastreioResultado.recolhimentoTesouraria.status}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. FECHAMENTO FISCAL MENSAL */}
      {/* ========================================================================= */}
      {activeTab === 'fechamento_fiscal' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Fechamento do Período Fiscal ({competencia})</h2>
            <p className="text-xs text-slate-400">
              O fechamento fiscal consolida a apuração, valida todas as NFS-e emitidas e bloqueia alterações na competência para garantir auditoria imutável.
            </p>
          </div>

          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-5">
            <h3 className="text-sm font-semibold text-white">Checklist de Integridade Fiscal</h3>

            <div className="space-y-3">
              {[
                { key: 'documentosEmitidosValidados', label: 'Todas as notas fiscais de saída (NFS-e) estão autorizadas sem rejeições pendentes' },
                { key: 'documentosEntradaThreeWayMatch', label: 'Fiscal de entrada 100% conciliado via Three-Way Match (Doc x Contrato x Pagamento)' },
                { key: 'retencoesConferidas', label: 'Retenções na fonte (IRRF, CSRF 4,65% e ISS) conferidas e integradas' },
                { key: 'apuracoesConcluidas', label: 'Apurações de tributos (ISS, PIS, COFINS) concluídas com memórias de cálculo assinadas' },
                { key: 'conciliacaoQuatroPontosSemDivergencia', label: 'Conciliação em 4 pontos executada sem qualquer divergência' },
                { key: 'certificadosEmDia', label: 'Certificados digitais A1/A3 ativos e com validade superior a 15 dias' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={checklistFechamento[item.key as keyof typeof checklistFechamento]}
                    onChange={(e) =>
                      setChecklistFechamento({
                        ...checklistFechamento,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Status Atual:</span>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  {periodoFechado ? (
                    <>
                      <Lock className="w-4 h-4 text-emerald-400" /> Competência Fechada & Bloqueada
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-amber-400" /> Aberta para Novas Emissões
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {periodoFechado ? (
                  <button
                    onClick={() => setPeriodoFechado(false)}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Unlock className="w-4 h-4" /> Solicitar Reabertura Auditada
                  </button>
                ) : (
                  <button
                    onClick={() => setPeriodoFechado(true)}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" /> Efetuar Fechamento Fiscal Mensal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
