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
} from 'lucide-react';
import { useAuthSession } from '../../../components/AuthSessionContext';

interface Conta {
  id: string;
  bancoCodigo: string;
  bancoNome: string;
  agencia: string;
  conta: string;
  tipo: string;
  saldoReal: number;
  saldoDisponivel: number;
  saldoBloqueado: number;
  status: string;
}

interface Lote {
  id: string;
  bancoCodigo: string;
  layout: string;
  sequencial: number;
  totalItens: number;
  valorTotal: number;
  status: string;
  sha256: string;
  dataGeracao: string;
}

interface PixPayoutItem {
  id: string;
  e2eId: string;
  produtorNome: string;
  eventoNome: string;
  valor: number;
  chavePix: string;
  tipoChave: string;
  status: string;
  dataHora: string;
  comprovante: string;
}

const mockContas: Conta[] = [
  {
    id: 'cta-itau-principal',
    bancoCodigo: '341',
    bancoNome: 'Itaú Unibanco S.A.',
    agencia: '0450',
    conta: '88410-3',
    tipo: 'CORRENTE',
    saldoReal: 5450000.0,
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
    saldoReal: 2800000.0,
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
    saldoReal: 10000000.0,
    saldoDisponivel: 10000000.0,
    saldoBloqueado: 0.0,
    status: 'ATIVA',
  },
];

const mockLotes: Lote[] = [
  {
    id: 'rem-341-1001',
    bancoCodigo: '341',
    layout: 'CNAB_240',
    sequencial: 1001,
    totalItens: 24,
    valorTotal: 1750000.0,
    status: 'PROCESSADA_TOTAL',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    dataGeracao: '28/09/2026 09:30',
  },
  {
    id: 'rem-237-1002',
    bancoCodigo: '237',
    layout: 'CNAB_400',
    sequencial: 1002,
    totalItens: 8,
    valorTotal: 480000.0,
    status: 'ENVIADA',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    dataGeracao: '28/09/2026 10:15',
  },
];

const mockPix: PixPayoutItem[] = [
  {
    id: 'pix-pay-1',
    e2eId: 'E3410000020260928120001882947118',
    produtorNome: 'Live Nation Brasil Produções',
    eventoNome: 'Festival DiskIngressos Live 2026',
    valor: 85000.0,
    chavePix: 'financeiro@livenation.com.br',
    tipoChave: 'EMAIL',
    status: 'LIQUIDADO',
    dataHora: '28/09/2026 10:28',
    comprovante: 'AUTH-SPI-9941829-BACEN-OK',
  },
  {
    id: 'pix-pay-2',
    e2eId: 'E3410000020260928120001882947119',
    produtorNome: 'Opus Entretenimento e Eventos',
    eventoNome: 'Turnê Nacional Rock Fest 2026',
    valor: 140000.0,
    chavePix: '98.765.432/0001-10',
    tipoChave: 'CNPJ',
    status: 'LIQUIDADO',
    dataHora: '28/09/2026 10:35',
    comprovante: 'AUTH-SPI-9941830-BACEN-OK',
  },
];

export default function TesourariaPage() {
  const { isAdmin } = useAuthSession();
  const [activeTab, setActiveTab] = useState<'contas' | 'cnab' | 'pix'>('contas');
  const [showNovoPixModal, setShowNovoPixModal] = useState(false);
  const [pixSucessoMsg, setPixSucessoMsg] = useState<string | null>(null);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalSaldoReal = mockContas.reduce((acc, c) => acc + c.saldoReal, 0);
  const totalSaldoDisponivel = mockContas.reduce((acc, c) => acc + c.saldoDisponivel, 0);
  const totalSaldoBloqueado = mockContas.reduce((acc, c) => acc + c.saldoBloqueado, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Landmark className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Tesouraria & Banking Engine OS
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  EDDIE 11.25
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Liquidação Bancária, Remessas e Retornos CNAB 240/400 e PIX Direto SPI/DICT
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNovoPixModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow transition"
          >
            <Zap className="w-4 h-4" />
            Novo PIX Payout
          </button>
        </div>
      </div>

      {pixSucessoMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pixSucessoMsg}</span>
          </div>
          <button onClick={() => setPixSucessoMsg(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Regra de Ouro da Tesouraria */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-white">Regra Inviolável de Tesouraria EDDIE 11.25:</span>
          <p className="text-slate-400">
            <strong className="text-emerald-300">Saldo Bancário Real ≠ Saldo do Ledger ≠ Saldo Disponível ≠ Valor em Liquidação.</strong>
            {' '}A conciliação bancária 1:1 valida cada lançamento do extrato contra o hash SHA-256 do lote CNAB ou EndToEndId do PIX SPI.
          </p>
        </div>
      </div>

      {/* KPIs da Tesouraria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Saldo Bancário Total (Real)</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatBRL(totalSaldoReal)}</div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            Soma consolidada de 3 contas corporativas
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Saldo Disponível para Repasse</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatBRL(totalSaldoDisponivel)}</div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            Descontadas reservas legais e garantias
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Reserva Retida / Bloqueada</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{formatBRL(totalSaldoBloqueado)}</div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            Garantia contra Chargebacks & CDC (R$ 450k)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('contas')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'contas'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏦 Contas Bancárias Corporativas
        </button>
        <button
          onClick={() => setActiveTab('cnab')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'cnab'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📄 Lotes CNAB 240 / 400
        </button>
        <button
          onClick={() => setActiveTab('pix')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'pix'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚡ PIX Payouts Instantâneos
        </button>
      </div>

      {/* Conteúdo da Tab */}
      {activeTab === 'contas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockContas.map((c) => (
            <div key={c.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{c.bancoNome}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Banco {c.bancoCodigo} • Ag: {c.agencia} • C/C: {c.conta}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {c.status}
                </span>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo da Conta:</span>
                  <span className="text-white font-semibold">{c.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Saldo Real:</span>
                  <span className="text-white font-mono font-semibold">{formatBRL(c.saldoReal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Disponível p/ Saque:</span>
                  <span className="text-emerald-400 font-mono font-semibold">{formatBRL(c.saldoDisponivel)}</span>
                </div>
                {c.saldoBloqueado > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bloqueado / Garantia:</span>
                    <span className="text-amber-400 font-mono font-semibold">{formatBRL(c.saldoBloqueado)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cnab' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Lotes de Remessa Bancária CNAB</h3>
              <p className="text-xs text-slate-400">Arquivos enviados aos bancos para liquidação em lote</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Lote / NSR</th>
                  <th className="py-3 px-4">Banco & Layout</th>
                  <th className="py-3 px-4">Qtd Itens</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4">Hash SHA-256</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 text-xs">
                {mockLotes.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {l.id} <span className="text-slate-500">(NSR #{l.sequencial})</span>
                    </td>
                    <td className="py-3 px-4">
                      Banco {l.bancoCodigo} • <span className="font-mono text-sky-400">{l.layout}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{l.totalItens} pagamentos</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      {formatBRL(l.valorTotal)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                      {l.sha256}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pix' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Repasses PIX Direto (SPI / DICT)</h3>
              <p className="text-xs text-slate-400">Liquidação instantânea com confirmação de autenticação BACEN</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">EndToEndId / Comprovante</th>
                  <th className="py-3 px-4">Produtor Favorecido</th>
                  <th className="py-3 px-4">Chave PIX</th>
                  <th className="py-3 px-4">Valor Liquidado</th>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 text-xs">
                {mockPix.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono text-white text-[11px]">{p.e2eId}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{p.comprovante}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.produtorNome}</div>
                      <div className="text-slate-400 text-[11px]">{p.eventoNome}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {p.chavePix} <span className="text-[9px] text-sky-400">({p.tipoChave})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {formatBRL(p.valor)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{p.dataHora}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal PIX */}
      {showNovoPixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Executar PIX Payout Instantâneo
            </h3>
            <p className="text-xs text-slate-400">
              O valor será debitado imediatamente da conta corrente principal e liquidado via SPI.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Produtora de Destino</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none">
                  <option>Live Nation Brasil Produções</option>
                  <option>Opus Entretenimento e Eventos</option>
                  <option>Time For Fun / T4F</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Chave PIX</label>
                <input
                  type="text"
                  defaultValue="financeiro@livenation.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Valor do Repasse (R$)</label>
                <input
                  type="number"
                  defaultValue="25000"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowNovoPixModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowNovoPixModal(false);
                  setPixSucessoMsg('PIX Payout de R$ 25.000,00 liquidado com sucesso via SPI Bacen!');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                Confirmar e Liquidar PIX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
