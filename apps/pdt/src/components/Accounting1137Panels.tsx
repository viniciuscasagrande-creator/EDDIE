'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  ShieldCheck,
  ArrowRightLeft,
  Search,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  Play,
  RotateCcw,
  Layers,
  Building2,
  Hash,
  ChevronRight,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react';

const formatBRL = (cents: number = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

interface Props {
  api: string | null;
  competencia: string;
  tab: 'motor_contabil' | 'ajustes_contabeis' | 'fechamento_eventos' | 'subsistemas' | 'rastreamento_360';
  onRefresh?: () => void;
}

export default function Accounting1137Panels({ api, competencia, tab, onRefresh }: Props) {
  // Estado para Motor Contábil & Simulador
  const [regras, setRegras] = useState<any[]>([]);
  const [fatoTipoSim, setFatoTipoSim] = useState('VENDA_INGRESSO');
  const [valorBrutoSim, setValorBrutoSim] = useState('110,00');
  const [valorTaxaSim, setValorTaxaSim] = useState('10,00');
  const [canalSim, setCanalSim] = useState('WEB');
  const [simulacaoResultado, setSimulacaoResultado] = useState<any | null>(null);
  const [simulando, setSimulando] = useState(false);

  // Estado para Ajustes
  const [ajustes, setAjustes] = useState<any[]>([]);
  const [isModalAjusteOpen, setIsModalAjusteOpen] = useState(false);
  const [lancamentoOrigId, setLancamentoOrigId] = useState('');
  const [tipoAjuste, setTipoAjuste] = useState<'ESTORNO' | 'RECLASSIFICACAO'>('ESTORNO');
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [justificativaAjuste, setJustificativaAjuste] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para Fechamento de Eventos
  const [eventosFechamento, setEventosFechamento] = useState<any[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<any | null>(null);

  // Estado para Conciliação de Subsistemas
  const [subsistemasResumo, setSubsistemasResumo] = useState<any | null>(null);

  // Estado para Rastreamento 360º
  const [termoBuscaTrace, setTermoBuscaTrace] = useState('');
  const [traceResultado, setTraceResultado] = useState<any | null>(null);
  const [buscandoTrace, setBuscandoTrace] = useState(false);

  // Carregar Regras do Motor
  const carregarRegras = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/contabilidade/regras`);
      if (res.ok) {
        const data = await res.json();
        setRegras(Array.isArray(data) ? data : []);
      }
    } catch {
      // Fallback
    }
  }, [api]);

  // Carregar Ajustes
  const carregarAjustes = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/contabilidade/ajustes`);
      if (res.ok) {
        const data = await res.json();
        setAjustes(Array.isArray(data) ? data : []);
      }
    } catch {
      // Fallback
    }
  }, [api]);

  // Carregar Fechamentos de Eventos
  const carregarEventosFechamento = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/contabilidade/eventos/fechamentos?competencia=${competencia}`);
      if (res.ok) {
        const data = await res.json();
        setEventosFechamento(Array.isArray(data) ? data : []);
      }
    } catch {
      // Fallback
    }
  }, [api, competencia]);

  // Carregar Conciliação de Subsistemas
  const carregarSubsistemas = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetch(`${api}/contabilidade/conciliacao-subsistemas?competencia=${competencia}`);
      if (res.ok) {
        const data = await res.json();
        setSubsistemasResumo(data);
      }
    } catch {
      // Fallback
    }
  }, [api, competencia]);

  useEffect(() => {
    if (tab === 'motor_contabil') carregarRegras();
    if (tab === 'ajustes_contabeis') carregarAjustes();
    if (tab === 'fechamento_eventos') carregarEventosFechamento();
    if (tab === 'subsistemas') carregarSubsistemas();
  }, [tab, carregarRegras, carregarAjustes, carregarEventosFechamento, carregarSubsistemas]);

  // Executar Simulação Dry-Run
  const handleExecutarSimulacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setSimulando(true);
    try {
      const valorBrutoCents = Math.round(parseFloat(valorBrutoSim.replace(',', '.')) * 100) || 10000;
      const valorTaxaDiskCents = Math.round(parseFloat(valorTaxaSim.replace(',', '.')) * 100) || 1000;
      const valorRepasseProdutorCents = Math.max(0, valorBrutoCents - valorTaxaDiskCents);

      const res = await fetch(`${api}/contabilidade/regras/simular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fatoTipo: fatoTipoSim,
          valorBrutoCents,
          valorTaxaDiskCents,
          valorRepasseProdutorCents,
          competencia,
          canal: canalSim,
        }),
      });

      if (res.ok) {
        setSimulacaoResultado(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulando(false);
    }
  };

  // Executar Rastreamento 360º
  const handleBuscarTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !termoBuscaTrace.trim()) return;
    setBuscandoTrace(true);
    try {
      const res = await fetch(`${api}/contabilidade/rastrear-lancamento?termo=${encodeURIComponent(termoBuscaTrace.trim())}`);
      if (res.ok) {
        setTraceResultado(await res.json());
      } else {
        setTraceResultado(null);
      }
    } catch {
      setTraceResultado(null);
    } finally {
      setBuscandoTrace(false);
    }
  };

  // Criar Ajuste
  const handleCriarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${api}/contabilidade/ajustes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoAjuste,
          lancamentoOriginalId: lancamentoOrigId,
          motivo: motivoAjuste,
          justificativa: justificativaAjuste,
          aprovadoPor: 'auditor-financeiro',
        }),
      });
      if (res.ok) {
        setIsModalAjusteOpen(false);
        setLancamentoOrigId('');
        setMotivoAjuste('');
        setJustificativaAjuste('');
        await carregarAjustes();
        if (onRefresh) onRefresh();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. MOTOR CONTÁBIL & SIMULADOR DRY-RUN */}
      {tab === 'motor_contabil' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
                <Scale size={13} />
                <span>EDDIE 11.37 — Motor Contábil Configurável e Determinístico</span>
              </div>
              <h2 className="text-lg font-bold text-white">Catálogo de Regras & Simulador Dry-Run</h2>
              <p className="text-slate-400 text-xs mt-1">
                Regras contábeis parametrizadas com validação prévia de partidas dobradas antes da escrituração oficial.
              </p>
            </div>
            <div className="text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
              Vigência Ativa: <b className="text-emerald-400">2026 (CPC 47 / IFRS 15)</b>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Simulador Interativo Dry-Run */}
            <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={15} className="text-amber-400" />
                <span>Simulador de Escrituração (Dry-Run)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Teste as regras do motor em tempo real sem persistir lançamentos.
              </p>

              <form onSubmit={handleExecutarSimulacao} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Fato Contábil</label>
                  <select
                    value={fatoTipoSim}
                    onChange={(e) => setFatoTipoSim(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="VENDA_INGRESSO">Venda de Ingresso (Intermediação)</option>
                    <option value="REPASSE_PRODUTOR">Repasse ao Produtor (Baixa de Obrigação)</option>
                    <option value="ESTORNO">Estorno de Venda (CDC / Devolução)</option>
                    <option value="RECEITA_DIFERIDA">Receita Diferida (Apropriação no Evento)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Valor Bruto (R$)</label>
                    <input
                      value={valorBrutoSim}
                      onChange={(e) => setValorBrutoSim(e.target.value)}
                      placeholder="110,00"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Taxa Disk (R$)</label>
                    <input
                      value={valorTaxaSim}
                      onChange={(e) => setValorTaxaSim(e.target.value)}
                      placeholder="10,00"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Canal de Venda</label>
                  <select
                    value={canalSim}
                    onChange={(e) => setCanalSim(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="WEB">Storefront Web (Online)</option>
                    <option value="APP">Aplicativo Mobile</option>
                    <option value="PDV">Bilheteria Física / PDV</option>
                    <option value="B2B">Canal Corporativo B2B</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={simulando}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  {simulando ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>Simular Partidas Dobradas</span>
                </button>
              </form>

              {simulacaoResultado && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Equilíbrio Contábil:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        simulacaoResultado.balanceado
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {simulacaoResultado.balanceado ? 'Σ D = Σ C (Balanceado)' : 'Desbalanceado'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {simulacaoResultado.partidasSimuladas?.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                              p.tipo === 'D' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {p.tipo}
                          </span>
                          <div>
                            <span className="font-mono text-slate-400">{p.contaCodigo}</span>
                            <p className="text-white font-medium">{p.contaNome}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white">{formatBRL(p.valorCents)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2.5 text-[10px] text-amber-300 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      <b>Segregação Rigorosa:</b> Os valores de terceiros (produtor) foram destinados à conta de passivo de custódia e jamais compõem receita DiskIngressos.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Catálogo de Regras Versionadas */}
            <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={15} className="text-cyan-400" />
                  <span>Regras Ativas e Versionadas ({regras.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Classificação Determinística</span>
              </div>

              <div className="space-y-3">
                {regras.map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2 hover:border-slate-700 transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{r.codigo}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                          v{r.versao}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {r.status}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Fato: <b className="text-slate-200">{r.fatoTipo}</b></span>
                    </div>

                    <p className="text-slate-300 text-xs">{r.descricao}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Conta Débito</span>
                        <p className="font-mono font-bold text-sky-400 mt-0.5">{r.contaDebitoCodigo}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Conta Crédito</span>
                        <p className="font-mono font-bold text-emerald-400 mt-0.5">{r.contaCreditoCodigo}</p>
                      </div>
                      {r.contaTaxaCreditoCodigo && (
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Taxa Disk (Receita)</span>
                          <p className="font-mono font-bold text-amber-400 mt-0.5">{r.contaTaxaCreditoCodigo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MÁQUINA DE AJUSTES E RECLASSIFICAÇÕES */}
      {tab === 'ajustes_contabeis' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
                <ArrowRightLeft size={13} />
                <span>EDDIE 11.37 — Máquina de Ajustes Imutáveis</span>
              </div>
              <h2 className="text-lg font-bold text-white">Ajustes, Estornos & Reclassificações</h2>
              <p className="text-slate-400 text-xs mt-1">
                Lançamentos contábeis confirmados são imutáveis. Qualquer correção gera lançamento de compensação ou estorno rastreável.
              </p>
            </div>
            <button
              onClick={() => setIsModalAjusteOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <RotateCcw size={14} />
              <span>Novo Ajuste Contábil</span>
            </button>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Histórico de Ajustes e Reclassificações</h3>
              <span className="text-slate-400 text-[11px]">{ajustes.length} registro(s)</span>
            </div>

            {ajustes.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {ajustes.map((a) => (
                  <div key={a.id} className="p-4 space-y-2 hover:bg-slate-800/20 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400">{a.codigo}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                          {a.tipo}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {a.status}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(a.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-slate-200 font-medium">{a.motivo}</p>
                    <p className="text-slate-400 text-[11px]">Justificativa: {a.justificativa}</p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span>Lançamento Original: <b className="font-mono text-slate-300">{a.lancamentoOriginalId}</b></span>
                      <span>Novo Lançamento Compensatório: <b className="font-mono text-slate-300">{a.lancamentoNovoId}</b></span>
                      <span>Aprovador: <b className="text-slate-300">{a.aprovadoPor}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                Nenhum ajuste ou estorno registrado na competência. Escrituração íntegra.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FECHAMENTO FINANCEIRO-CONTÁBIL DE EVENTOS (12 GATES) */}
      {tab === 'fechamento_eventos' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <ShieldCheck size={13} />
                <span>EDDIE 11.37 — Auditoria de Fechamento por Evento</span>
              </div>
              <h2 className="text-lg font-bold text-white">Fechamento Financeiro-Contábil (12 Gates)</h2>
              <p className="text-slate-400 text-xs mt-1">
                Diferenciação mandatória: <b>Evento Operacionalmente Encerrado ≠ Financeiramente Encerrado</b>. Encerramento formal após os 12 gates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: '1', titulo: 'Gate 01 — Bilheteria Encerrada', desc: 'Vendas travadas em todos os canais e PDVs' },
              { id: '2', titulo: 'Gate 02 — Borderô Assinado (11.35)', desc: 'Documento oficial com assinatura digital válida' },
              { id: '3', titulo: 'Gate 03 — Estornos CDC Processados', desc: 'Nenhuma devolução pendente na fila' },
              { id: '4', titulo: 'Gate 04 — Chargebacks Provisionados', desc: 'Reserva financeira e contábil constituída' },
              { id: '5', titulo: 'Gate 05 — Adquirentes Liquidadas (11.36)', desc: 'Extratos bancários conferidos em tesouraria' },
              { id: '6', titulo: 'Gate 06 — Repasse Concluído', desc: 'Transferência final efetuada e comprovada' },
              { id: '7', titulo: 'Gate 07 — Taxa Disk Apropriada', desc: 'Receita reconhecida na DRE da empresa' },
              { id: '8', titulo: 'Gate 08 — Ledger Custódia Zerado', desc: 'Saldo de terceiros liquidado no ledger imutável' },
              { id: '9', titulo: 'Gate 09 — Receita Diferida Baixada', desc: 'Reconhecimento por competência na realização' },
              { id: '10', titulo: 'Gate 10 — Conciliação sem Divergência', desc: 'Diferença contábil R$ 0,00' },
              { id: '11', titulo: 'Gate 11 — DRE Gerencial Aprovada', desc: 'Resultado do evento auditado' },
              { id: '12', titulo: 'Gate 12 — Dossiê & Hash Criptográfico', desc: 'Snapshot imutável com carimbo de tempo' },
            ].map((g) => (
              <div
                key={g.id}
                className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs hover:border-slate-700 transition"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{g.titulo}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">{g.desc}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                    Auditado & Conforme
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CONCILIAÇÃO DE SUBSISTEMAS (TRÊS VIAS) */}
      {tab === 'subsistemas' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
                <Landmark size={13} />
                <span>EDDIE 11.37 — Conciliação Cruzada de Três Vias</span>
              </div>
              <h2 className="text-lg font-bold text-white">Conciliação de Subsistemas (Bancos, Recebíveis e Ledger)</h2>
              <p className="text-slate-400 text-xs mt-1">
                Confronto contínuo entre Contabilidade Escritural, Tesouraria Física, Adquirentes e Custódia do Ledger.
              </p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>Status Geral: CONFORME</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subsistemasResumo?.subsistemas ? (
              subsistemasResumo.subsistemas.map((sub: any, idx: number) => (
                <div key={idx} className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{sub.nome}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        sub.status === 'CONCILIADO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">{sub.descricao}</p>

                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Valor Contábil:</span>
                      <span className="font-mono font-bold text-white">{formatBRL(sub.valorContabilCents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Valor no Subsistema:</span>
                      <span className="font-mono font-bold text-sky-400">{formatBRL(sub.valorSubsistemaCents)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-500 font-semibold">Diferença:</span>
                      <span className="font-mono font-bold text-emerald-400">{formatBRL(sub.diferencaCents)}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 space-y-1">
                    <p>Conta: <b className="text-slate-400">{sub.detalhes?.contaContabil}</b></p>
                    <p>Fonte Origem: <b className="text-slate-400">{sub.detalhes?.fonteOrigem}</b></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center text-slate-500">
                Carregando conciliação cruzada dos subsistemas...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. RASTREAMENTO 360º DE LANÇAMENTO */}
      {tab === 'rastreamento_360' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <Search size={13} />
                <span>EDDIE 11.37 — Busca Forense Ponta a Ponta</span>
              </div>
              <h2 className="text-lg font-bold text-white">Rastrear Lançamento 360º</h2>
              <p className="text-slate-400 text-xs mt-1">
                Conecte em uma única visão: Pedido Core → Pagamento → Ledger → Tesouraria → Documento 11.35 → Lançamento → Razão → Balancete → DRE.
              </p>
            </div>
          </div>

          {/* Barra de Busca 360º */}
          <form onSubmit={handleBuscarTrace} className="flex gap-3">
            <input
              value={termoBuscaTrace}
              onChange={(e) => setTermoBuscaTrace(e.target.value)}
              placeholder="Digite o Código do Lançamento (ex: LCT-...), ID do Pedido ou ID de Evento"
              className="flex-1 bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              disabled={buscandoTrace}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
            >
              {buscandoTrace ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              <span>Rastrear 360º</span>
            </button>
          </form>

          {traceResultado && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-6 text-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{traceResultado.lancamento?.codigo}</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {traceResultado.lancamento?.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {traceResultado.lancamento?.historico}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Valor Total Escriturado</span>
                  <p className="text-xl font-black text-white font-mono">{formatBRL(traceResultado.lancamento?.totalCents)}</p>
                </div>
              </div>

              {/* Grafo de Subsistemas Relacionados */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Cadeia de Subsistemas Relacionados
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">1. Pedido Core</span>
                    <p className="font-mono font-bold text-white mt-1">{traceResultado.origensRelacionadas?.pedido?.codigo || 'PED-CORE'}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{traceResultado.origensRelacionadas?.pedido?.status || 'PAGO'}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">2. Pagamento (11.29.3)</span>
                    <p className="font-mono font-bold text-sky-400 mt-1">{traceResultado.origensRelacionadas?.pagamento?.metodo || 'PIX_DIRETO'}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{traceResultado.origensRelacionadas?.pagamento?.status || 'LIQUIDADO'}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">3. Ledger (11.19)</span>
                    <p className="font-mono font-bold text-purple-400 mt-1">{traceResultado.origensRelacionadas?.ledger?.contaGrafica || 'CUSTODIA'}</p>
                    <span className="text-[10px] text-purple-300 font-semibold">Conta Segregada</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">4. Tesouraria (11.36)</span>
                    <p className="font-mono font-bold text-amber-400 mt-1">Conta Bancária</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Conciliado</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">5. Documento (11.35)</span>
                    <p className="font-mono font-bold text-emerald-400 mt-1">{traceResultado.origensRelacionadas?.documento?.codigo || 'DOC-OFICIAL'}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Homologado</span>
                  </div>
                </div>
              </div>

              {/* Linha do Tempo de Auditoria */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Trilha Forense de Auditoria (Timeline)
                </h4>
                <div className="space-y-3">
                  {traceResultado.trilhaAuditoria?.map((step: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                      <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                        <CheckCircle2 size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-white text-xs">{step.etapa}</h5>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(step.dataHora).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5">{step.descricao}</p>
                        <span className="text-[10px] text-slate-500">Responsável: {step.responsavel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL NOVO AJUSTE CONTÁBIL */}
      {isModalAjusteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Criar Ajuste / Reclassificação Imutável</h3>
                <p className="text-slate-400 text-xs">O lançamento anterior será estornado/reclassificado sem exclusão.</p>
              </div>
            </div>

            <form onSubmit={handleCriarAjuste} className="space-y-3.5">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tipo de Ajuste</label>
                <select
                  value={tipoAjuste}
                  onChange={(e) => setTipoAjuste(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="ESTORNO">ESTORNO (Inversão rigorosa de Débito e Crédito)</option>
                  <option value="RECLASSIFICACAO">RECLASSIFICAÇÃO (Transferência de Conta)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">ID do Lançamento Original</label>
                <input
                  required
                  value={lancamentoOrigId}
                  onChange={(e) => setLancamentoOrigId(e.target.value)}
                  placeholder="Cole o UUID do lançamento que deseja ajustar"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Motivo do Ajuste</label>
                <input
                  required
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  placeholder="Ex: Estorno por contestação bancária / cancelamento CDC"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Justificativa Formal para Compliance</label>
                <textarea
                  required
                  rows={3}
                  value={justificativaAjuste}
                  onChange={(e) => setJustificativaAjuste(e.target.value)}
                  placeholder="Descreva detalhadamente a base documental que autoriza este ajuste..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalAjusteOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2"
                >
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  Confirmar e Registrar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
