'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Landmark,
  Layers,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface MockIntent {
  id: string;
  pedidoNumero: string;
  compradorNome: string;
  compradorDocumento: string;
  metodo: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO';
  adquirente: string;
  valorTotal: number;
  splitProdutor: number;
  taxaDisk: number;
  taxaMdr: number;
  parcelas: number;
  nsu: string;
  status: 'APROVADA' | 'PROCESSANDO' | 'RECUSADA';
  data: string;
}

const INITIAL_INTENTS: MockIntent[] = [
  {
    id: 'pay-int-001',
    pedidoNumero: 'PED-20260928-8A9F1B2C',
    compradorNome: 'Carlos Eduardo Souza',
    compradorDocumento: '123.456.789-00',
    metodo: 'PIX',
    adquirente: 'BACEN_DIRETO',
    valorTotal: 340.0,
    splitProdutor: 300.0,
    taxaDisk: 40.0,
    taxaMdr: 3.37,
    parcelas: 1,
    nsu: 'NSU-PIX-9841',
    status: 'APROVADA',
    data: '28/09/2026 15:42',
  },
  {
    id: 'pay-int-002',
    pedidoNumero: 'PED-20260928-4C8D2E1A',
    compradorNome: 'Mariana Silveira Ramos',
    compradorDocumento: '234.567.890-11',
    metodo: 'CARTAO_CREDITO',
    adquirente: 'CIELO',
    valorTotal: 560.0,
    splitProdutor: 500.0,
    taxaDisk: 60.0,
    taxaMdr: 15.97,
    parcelas: 3,
    nsu: 'NSU-CARD-4421',
    status: 'APROVADA',
    data: '28/09/2026 15:38',
  },
  {
    id: 'pay-int-003',
    pedidoNumero: 'PED-20260928-7E2A9F5C',
    compradorNome: 'Felipe Alcantara',
    compradorDocumento: '345.678.901-22',
    metodo: 'PIX',
    adquirente: 'BACEN_DIRETO',
    valorTotal: 170.0,
    splitProdutor: 150.0,
    taxaDisk: 20.0,
    taxaMdr: 1.68,
    parcelas: 1,
    nsu: 'NSU-PIX-1289',
    status: 'PROCESSANDO',
    data: '28/09/2026 15:31',
  },
  {
    id: 'pay-int-004',
    pedidoNumero: 'PED-20260928-9B3C8E4D',
    compradorNome: 'Juliana Beatriz Neves',
    compradorDocumento: '456.789.012-33',
    metodo: 'CARTAO_CREDITO',
    adquirente: 'STONE',
    valorTotal: 420.0,
    splitProdutor: 380.0,
    taxaDisk: 40.0,
    taxaMdr: 11.25,
    parcelas: 2,
    nsu: 'NSU-CARD-7732',
    status: 'RECUSADA',
    data: '28/09/2026 15:25',
  },
  {
    id: 'pay-int-005',
    pedidoNumero: 'PED-20260928-1F8E2A7B',
    compradorNome: 'Rodrigo Medeiros Lima',
    compradorDocumento: '567.890.123-44',
    metodo: 'CARTAO_CREDITO',
    adquirente: 'REDE',
    valorTotal: 890.0,
    splitProdutor: 800.0,
    taxaDisk: 90.0,
    taxaMdr: 24.83,
    parcelas: 6,
    nsu: 'NSU-CARD-9912',
    status: 'APROVADA',
    data: '28/09/2026 15:18',
  },
];

const INITIAL_CONCILIACOES = [
  {
    id: 'conc-001',
    adquirente: 'CIELO',
    dataReferencia: '28/09/2026',
    transacoes: 1420,
    valorBruto: 458920.0,
    taxaMdr: 11473.0,
    valorLiquido: 447447.0,
    status: 'CONCILIADO',
    divergencias: 0,
  },
  {
    id: 'conc-002',
    adquirente: 'STONE',
    dataReferencia: '28/09/2026',
    transacoes: 895,
    valorBruto: 289450.0,
    taxaMdr: 6946.8,
    valorLiquido: 282503.2,
    status: 'CONCILIADO',
    divergencias: 0,
  },
  {
    id: 'conc-003',
    adquirente: 'REDE',
    dataReferencia: '27/09/2026',
    transacoes: 610,
    valorBruto: 198200.0,
    taxaMdr: 5153.2,
    valorLiquido: 193046.8,
    status: 'COM_DIVERGENCIA',
    divergencias: 2,
  },
  {
    id: 'conc-004',
    adquirente: 'BACEN_DIRETO',
    dataReferencia: '28/09/2026',
    transacoes: 3840,
    valorBruto: 742180.0,
    taxaMdr: 7347.58,
    valorLiquido: 734832.42,
    status: 'CONCILIADO',
    divergencias: 0,
  },
];

export default function PagamentosPage() {
  const [activeTab, setActiveTab] = useState<'intencoes' | 'simulador' | 'conciliacao' | 'webhooks'>('intencoes');
  const [intents, setIntents] = useState<MockIntent[]>(INITIAL_INTENTS);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [metodoFilter, setMetodoFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado do Simulador
  const [simValor, setSimValor] = useState<number>(250);
  const [simMetodo, setSimMetodo] = useState<'PIX' | 'CARTAO_CREDITO'>('PIX');
  const [simAdquirente, setSimAdquirente] = useState<string>('BACEN_DIRETO');
  const [simQrCode, setSimQrCode] = useState<string | null>(null);
  const [simMsg, setSimMsg] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGerarSimulacao = () => {
    if (simMetodo === 'PIX') {
      const code = `00020101021226580014br.gov.bcb.pix0136pix@diskingressos.com.br520400005303986540${simValor.toFixed(2)}5802BR5913DISKINGRESSOS6008CURITIBA62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setSimQrCode(code);
      setSimMsg('Cobrança PIX gerada com sucesso! Válida por 15 minutos.');
    } else {
      setSimQrCode(null);
      setSimMsg(`Transação de Cartão de Crédito aprovada instantaneamente na adquirente ${simAdquirente}! Taxa MDR calculada e split emitido.`);
    }
  };

  const handleSimularWebhookAprovacao = (intentId: string) => {
    setIntents((prev) =>
      prev.map((i) => (i.id === intentId ? { ...i, status: 'APROVADA' as const } : i)),
    );
    setSimMsg(`Webhook de pagamento aprovado processado com sucesso para a intenção ${intentId}! Ledger e Outbox sincronizados.`);
  };

  const filteredIntents = intents.filter((item) => {
    if (statusFilter !== 'TODOS' && item.status !== statusFilter) return false;
    if (metodoFilter !== 'TODOS' && item.metodo !== metodoFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        item.compradorNome.toLowerCase().includes(term) ||
        item.compradorDocumento.includes(term) ||
        item.pedidoNumero.toLowerCase().includes(term) ||
        item.nsu.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link href="/financeiro" className="hover:text-emerald-400 transition-colors">
              Financeiro
            </Link>
            <span>/</span>
            <span className="text-emerald-400">Núcleo de Pagamentos & Adquirentes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-emerald-400" />
            Núcleo de Pagamentos & Conciliação de Adquirentes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Motor transacional desacoplado, orquestração de Intenções de Pagamento, PIX direto do Banco Central e conciliação multi-adquirente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            EDDIE 11.29.3 — PRODUÇÃO
          </span>
          <button
            onClick={() => {
              setSimMsg('Sincronização em tempo real realizada com sucesso!');
              setTimeout(() => setSimMsg(null), 3000);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar Status
          </button>
        </div>
      </div>

      {simMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{simMsg}</span>
          </div>
          <button onClick={() => setSimMsg(null)} className="text-xs text-emerald-400 underline ml-4">
            Fechar
          </button>
        </div>
      )}

      {/* KPIs Consolidados em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Volume Total Processado</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">R$ 8.420.950,00</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+14.8% no fechamento do mês</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Taxa de Aprovação Global</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">94.8%</div>
          <div className="text-xs text-slate-400 mt-2">
            Otimizado via roteamento inteligente
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>PIX Direto (Bacen / PSP)</span>
            <QrCode className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">R$ 4.884.150,00</div>
          <div className="text-xs text-cyan-400 mt-2">
            58% do share transacional (Zero MDR Adquirente)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Cartões de Crédito (MDR Médio)</span>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">2.18%</div>
          <div className="text-xs text-amber-400 mt-2">
            Cielo (52%) | Stone (31%) | Rede (17%)
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('intencoes')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'intencoes'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="h-4 w-4" />
          Intenções de Pagamento (PaymentIntent)
        </button>

        <button
          onClick={() => setActiveTab('simulador')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'simulador'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="h-4 w-4" />
          Simulador Transacional (PIX & Cartão)
        </button>

        <button
          onClick={() => setActiveTab('conciliacao')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'conciliacao'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Conciliação de Adquirentes
        </button>
      </div>

      {/* CONTEÚDO DA ABA: INTENÇÕES DE PAGAMENTO */}
      {activeTab === 'intencoes' && (
        <div className="space-y-4">
          {/* Filtros e Barra de Busca */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por comprador, CPF, pedido ou NSU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="APROVADA">Aprovada</option>
                <option value="PROCESSANDO">Processando</option>
                <option value="RECUSADA">Recusada</option>
              </select>

              <select
                value={metodoFilter}
                onChange={(e) => setMetodoFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="TODOS">Todos os Métodos</option>
                <option value="PIX">PIX Direto</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              </select>
            </div>
          </div>

          {/* Tabela de Intenções de Pagamento */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Pedido / Intenção</th>
                  <th className="py-3.5 px-4">Comprador</th>
                  <th className="py-3.5 px-4">Método / Adquirente</th>
                  <th className="py-3.5 px-4 text-right">Valor Bruto</th>
                  <th className="py-3.5 px-4 text-right">Split Produtor</th>
                  <th className="py-3.5 px-4 text-right">Taxa Disk</th>
                  <th className="py-3.5 px-4 text-right">MDR Adquirente</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIntents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      Nenhuma intenção de pagamento encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredIntents.map((intent) => (
                    <tr key={intent.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{intent.pedidoNumero}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{intent.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{intent.compradorNome}</div>
                        <div className="text-[11px] text-slate-500">{intent.compradorDocumento}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          {intent.metodo === 'PIX' ? (
                            <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                          <span>{intent.metodo === 'PIX' ? 'PIX' : `Cartão (${intent.parcelas}x)`}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{intent.adquirente} • {intent.nsu}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        R$ {intent.valorTotal.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-medium">
                        R$ {intent.splitProdutor.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-cyan-400 font-medium">
                        R$ {intent.taxaDisk.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-400 font-mono">
                        R$ {intent.taxaMdr.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            intent.status === 'APROVADA'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : intent.status === 'PROCESSANDO'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {intent.status === 'APROVADA' && <CheckCircle2 className="h-3 w-3" />}
                          {intent.status === 'PROCESSANDO' && <Clock className="h-3 w-3" />}
                          {intent.status === 'RECUSADA' && <AlertCircle className="h-3 w-3" />}
                          {intent.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{intent.data}</td>
                      <td className="py-3.5 px-4 text-center">
                        {intent.status === 'PROCESSANDO' ? (
                          <button
                            onClick={() => handleSimularWebhookAprovacao(intent.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors shadow-sm"
                          >
                            Aprovar Webhook
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Conciliado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: SIMULADOR TRANSAÇÃO */}
      {activeTab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              Simulador Transacional em Tempo Real
            </h2>
            <p className="text-xs text-slate-400">
              Teste o motor de pagamentos emitindo cobranças dinâmicas PIX ou simulando autorizações de cartão com cálculo de MDR e emissão de eventos Outbox.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Valor da Compra (R$)
                </label>
                <input
                  type="number"
                  value={simValor}
                  onChange={(e) => setSimValor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Método de Pagamento
                  </label>
                  <select
                    value={simMetodo}
                    onChange={(e) => setSimMetodo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PIX">PIX Direto (BACEN / PSP)</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Adquirente / Rota
                  </label>
                  <select
                    value={simAdquirente}
                    onChange={(e) => setSimAdquirente(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BACEN_DIRETO">BACEN Direto (PSP DiskIngressos)</option>
                    <option value="CIELO">Cielo Gateway 3.0</option>
                    <option value="STONE">Stone Pagamentos</option>
                    <option value="REDE">Rede Adquirente</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGerarSimulacao}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Executar Simulação de Pagamento
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center items-center text-center space-y-4">
            {simQrCode ? (
              <div className="space-y-4 w-full max-w-md">
                <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                  <div className="w-44 h-44 bg-slate-900 rounded-xl flex items-center justify-center p-3 text-white">
                    <QrCode className="w-full h-full text-slate-100" />
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  QR Code dinâmico gerado com valor exato de <strong className="text-emerald-400">R$ {simValor.toFixed(2)}</strong>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-left">
                  <span className="font-mono text-xs text-slate-300 truncate max-w-[280px]">
                    {simQrCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(simQrCode, 'sim')}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-300"
                    title="Copiar código PIX"
                  >
                    {copiedId === 'sim' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 space-y-3">
                <CreditCard className="h-12 w-12 text-slate-600 mx-auto" />
                <div className="text-slate-400 text-sm font-medium">
                  Selecione os parâmetros ao lado e dispare a simulação para visualizar o payload e status da transação.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: CONCILIAÇÃO DE ADQUIRENTES */}
      {activeTab === 'conciliacao' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Lotes de Conciliação Financeira de Adquirentes</h3>
              <p className="text-xs text-slate-400">
                Auditoria automática entre as transações de cartão/PIX capturadas no checkout e o extrato bancário de liquidação.
              </p>
            </div>
            <button
              onClick={() => {
                setSimMsg('Novo lote de conciliação processado e auditado com 100% de conferência!');
                setTimeout(() => setSimMsg(null), 3500);
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importar Extrato EDI / CNAB
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Adquirente / PSP</th>
                  <th className="py-3.5 px-4">Data Referência</th>
                  <th className="py-3.5 px-4 text-center">Transações</th>
                  <th className="py-3.5 px-4 text-right">Volume Bruto</th>
                  <th className="py-3.5 px-4 text-right">Taxas MDR Retidas</th>
                  <th className="py-3.5 px-4 text-right">Líquido Depositado</th>
                  <th className="py-3.5 px-4 text-center">Status Conciliação</th>
                  <th className="py-3.5 px-4 text-center">Divergências</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_CONCILIACOES.map((conc) => (
                  <tr key={conc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-emerald-400" />
                      <span>{conc.adquirente}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{conc.dataReferencia}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{conc.transacoes}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      R$ {conc.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-400 font-mono">
                      R$ {conc.taxaMdr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                      R$ {conc.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          conc.status === 'CONCILIADO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {conc.status === 'CONCILIADO' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {conc.status === 'CONCILIADO' ? 'Conciliado' : 'Com Divergência'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {conc.divergencias === 0 ? (
                        <span className="text-emerald-400 font-medium">0</span>
                      ) : (
                        <span className="text-rose-400 font-bold underline cursor-pointer">
                          {conc.divergencias} pendentes
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
