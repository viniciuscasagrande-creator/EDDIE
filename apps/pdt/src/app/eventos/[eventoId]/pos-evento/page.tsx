'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Send,
  MessageSquare,
  FileText,
  Filter,
  Eye,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Download,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  Lock,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Mail,
  Share2,
} from 'lucide-react';
import {
  fetchResumoOperacional,
  fetchPublicoValidado,
  fetchElegibilidadeLgpd,
  fetchTabelaPrecos,
  fetchModelosPesquisa,
  fetchResultadosCampanha,
  fetchHistoricoPublico,
  fetchParceirosComparecimento,
  fetchRelatorioExecutivoDossie,
  type ResumoOperacionalPosEvento,
  type ParticipanteValidadoItem,
  type DetalheElegibilidadeLgpd,
  type ItemTabelaPreco,
  type ModeloPesquisaTemplate,
  type RelatorioCampanhaResultados,
  type PerfilPublicoGrafo,
  type ComparecimentoParceiroItem,
  type RelatorioExecutivoPosEventoDossie,
  type CanalComunicacao,
} from '../../../../lib/pos-evento-client';

export default function PosEventoPage() {
  const params = useParams();
  const eventoId = (params?.['eventoId'] as string) || '11111111-1111-1111-1111-111111111111';

  // Estados principais da página
  const [resumo, setResumo] = useState<ResumoOperacionalPosEvento | null>(null);
  const [publico, setPublico] = useState<ParticipanteValidadoItem[]>([]);
  const [elegibilidade, setElegibilidade] = useState<DetalheElegibilidadeLgpd | null>(null);
  const [precos, setPrecos] = useState<ItemTabelaPreco[]>([]);
  const [modelos, setModelos] = useState<ModeloPesquisaTemplate[]>([]);
  const [resultadosCampanha, setResultadosCampanha] = useState<RelatorioCampanhaResultados | null>(null);
  const [historicoPublico, setHistoricoPublico] = useState<PerfilPublicoGrafo | null>(null);
  const [parceiros, setParceiros] = useState<ComparecimentoParceiroItem[]>([]);
  const [dossie, setDossie] = useState<RelatorioExecutivoPosEventoDossie | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de controle de UI
  const [canalSelecionado, setCanalSelecionado] = useState<CanalComunicacao>('WHATSAPP');
  const [publicoSelecionadoCount, setPublicoSelecionadoCount] = useState<number>(8000);
  const [modeloSelecionado, setModeloSelecionado] = useState<string>('SATISFACAO_GERAL');
  const [filtroSetor, setFiltroSetor] = useState<string>('TODOS');
  const [filtroApenasElegiveis, setFiltroApenasElegiveis] = useState<boolean>(false);
  const [pesquisaCriada, setPesquisaCriada] = useState<boolean>(true);
  const [campanhaEnviada, setCampanhaEnviada] = useState<boolean>(true);
  const [mostrarPreviaModal, setMostrarPreviaModal] = useState<boolean>(false);
  const [modalFeedbackSucesso, setModalFeedbackSucesso] = useState<string | null>(null);
  const [visaoIsolamentoProdutor, setVisaoIsolamentoProdutor] = useState<boolean>(false);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resResumo, resPub, resEleg, resPrecos, resMod, resCamp, resHist, resParc, resDos] =
          await Promise.all([
            fetchResumoOperacional(eventoId),
            fetchPublicoValidado(eventoId),
            fetchElegibilidadeLgpd(eventoId),
            fetchTabelaPrecos(),
            fetchModelosPesquisa(),
            fetchResultadosCampanha('camp_exemplo'),
            fetchHistoricoPublico('perf-maria-silva', visaoIsolamentoProdutor ? 'prod-t4f' : undefined),
            fetchParceirosComparecimento(eventoId),
            fetchRelatorioExecutivoDossie(eventoId),
          ]);

        setResumo(resResumo);
        setPublico(resPub);
        setElegibilidade(resEleg);
        setPrecos(resPrecos);
        setModelos(resMod);
        setResultadosCampanha(resCamp);
        setHistoricoPublico(resHist);
        setParceiros(resParc);
        setDossie(resDos);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [eventoId, visaoIsolamentoProdutor]);

  // Cálculos dinâmicos da campanha
  const precoAtual = precos.find((p) => p.canal === canalSelecionado)?.custoUnitario || 0.5;
  const custoEstimado = Number((publicoSelecionadoCount * precoAtual).toFixed(2));
  const requerAprovacao = custoEstimado > 5000.0;

  // Filtragem local da tabela de público
  const publicoFiltrado = publico.filter((p) => {
    if (filtroSetor !== 'TODOS' && p.setorNome !== filtroSetor) return false;
    if (filtroApenasElegiveis && !p.elegivelComunicacao) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 text-slate-100 font-sans">
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO OPERACIONAL (Sem gráfico decorativo no topo)                  */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">
                EDDIE 11.29.5
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 size={12} /> {resumo?.statusEvento || 'ENCERRADO'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">PÓS-EVENTO & HISTÓRICO DO PÚBLICO</h1>
            <p className="text-sm text-slate-400">
              {resumo?.eventoNome || 'Festival Exemplo 2026'} &bull; {resumo?.dataEvento || '28 de setembro de 2026'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setModalFeedbackSucesso('Dossiê Pós-Evento consolidado e vinculado ao Fechamento do Evento (EDDIE 11.24)!');
                setTimeout(() => setModalFeedbackSucesso(null), 4000);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download size={14} /> Exportar Dossiê Pós-Evento
            </button>
          </div>
        </div>

        {/* Métrica Operacional Direta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
          <div className="bg-[#161d2d] border border-slate-800/80 rounded-lg p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ingressos Vendidos</span>
            <div className="text-xl font-bold text-white mt-1">
              {(resumo?.ingressosVendidos || 12842).toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-500">Total de vendas confirmadas</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800/80 rounded-lg p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ingressos Emitidos</span>
            <div className="text-xl font-bold text-slate-200 mt-1">
              {(resumo?.ingressosEmitidos || 11934).toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-500">QR Codes gerados no app</span>
          </div>

          <div className="bg-[#161d2d] border border-sky-900/60 rounded-lg p-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-sky-500" />
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} /> Acessos Validados
            </span>
            <div className="text-xl font-black text-white mt-1">
              {(resumo?.acessosValidados || 10716).toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-sky-300/80">Presença real na portaria (89.8%)</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800/80 rounded-lg p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pessoas Identificadas</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(resumo?.pessoasIdentificadas || 9847).toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-500">Titulares com dados nominais</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800/80 rounded-lg p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Contatos Elegíveis</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {(resumo?.contatosElegiveis || 8921).toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-500">Consentimento LGPD válido</span>
          </div>
        </div>
      </div>

      {modalFeedbackSucesso && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{modalFeedbackSucesso}</span>
          </div>
          <button onClick={() => setModalFeedbackSucesso(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PÚBLICO VALIDADO (Origem: Ingresso + Check-in Válido + Evento)           */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="text-lg font-bold text-white">Público Validado na Portaria</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Origem estrita: <strong>Ingresso + Check-in Válido na Portaria</strong> (Não baseado em simples pedido pago). Comprador ≠ Participante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroSetor}
              onChange={(e) => setFiltroSetor(e.target.value)}
              className="bg-[#1a2133] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="TODOS">Todos os Setores</option>
              <option value="Área VIP Premium">Área VIP Premium</option>
              <option value="Pista">Pista</option>
              <option value="Camarote Prime">Camarote Prime</option>
            </select>

            <button
              onClick={() => setFiltroApenasElegiveis(!filtroApenasElegiveis)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                filtroApenasElegiveis
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                  : 'bg-[#1a2133] border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filtroApenasElegiveis ? '✓ Apenas Elegíveis LGPD' : 'Filtrar Elegíveis LGPD'}
            </button>
          </div>
        </div>

        {/* Tabela Operacional de Ingressos vs Participantes */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161d2d] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Ingresso</th>
                <th className="py-2.5 px-3">Participante / Titular</th>
                <th className="py-2.5 px-3">Comprador Original</th>
                <th className="py-2.5 px-3">Check-in Portaria</th>
                <th className="py-2.5 px-3">Setor / Lote</th>
                <th className="py-2.5 px-3">Canal / Parceiro</th>
                <th className="py-2.5 px-3 text-right">Elegibilidade LGPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {publicoFiltrado.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    <div className="font-semibold text-white">{p.numeroIngresso}</div>
                    <span className="text-[10px] text-slate-500">{p.id}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    {p.identificacaoIndividual ? (
                      <div>
                        <span className="font-semibold text-slate-100">{p.nome}</span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          {p.telefone && <span>{p.telefone}</span>}
                          {p.email && <span>&bull; {p.email}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[11px]">
                        <AlertCircle size={12} className="text-amber-500" />
                        <span>Titular não informado (Sem identidade inventada)</span>
                      </div>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-300">
                    {p.compradorOriginalNome || 'Mesmo do titular'}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 size={13} /> {p.checkinPortaria}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {p.checkinAt ? new Date(p.checkinAt).toLocaleTimeString('pt-BR') : '19:42'}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-300">
                    <div>{p.setorNome}</div>
                    <span className="text-[10px] text-slate-500">{p.loteNome}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="text-slate-300">{p.canalVenda}</span>
                    {p.parceiroNome && (
                      <div className="text-[10px] text-sky-400 flex items-center gap-1">
                        <Building2 size={10} /> {p.parceiroNome}
                      </div>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {p.elegivelComunicacao ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[11px] font-semibold">
                        <Check size={11} /> Elegível WhatsApp
                      </span>
                    ) : (
                      <span
                        title={p.motivoNaoElegivel}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px]"
                      >
                        <Lock size={11} /> Inelegível: {p.bloqueado ? 'Opt-Out' : 'Sem aceite'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ELEGIBILIDADE LGPD & CENTRAL DE CONSENTIMENTOS                         */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-lg font-bold text-white">Elegibilidade & Governança LGPD</h2>
          </div>
          <span className="text-xs text-slate-400">Verificação obrigatória antes de qualquer disparo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-[#161d2d] border border-slate-800 p-4 rounded-lg">
            <span className="text-xs text-slate-400">Público Validado</span>
            <div className="text-2xl font-bold text-white mt-1">10.716</div>
            <span className="text-[11px] text-slate-500">100% passaram pela portaria</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800 p-4 rounded-lg">
            <span className="text-xs text-slate-400">Identificado Nominalmente</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">9.847</div>
            <span className="text-[11px] text-slate-500">Titular individualizado</span>
          </div>

          <div className="bg-[#161d2d] border border-emerald-900/60 p-4 rounded-lg">
            <span className="text-xs text-emerald-400 font-semibold">Elegível para Esta Ação</span>
            <div className="text-2xl font-black text-emerald-300 mt-1">8.921</div>
            <span className="text-[11px] text-emerald-400/80">Consentimento ativo + Sem bloqueio</span>
          </div>

          <div className="bg-[#161d2d] border border-rose-950 p-4 rounded-lg">
            <span className="text-xs text-rose-400 font-semibold">Não Elegíveis</span>
            <div className="text-2xl font-bold text-rose-300 mt-1">926</div>
            <span className="text-[11px] text-rose-400/80">Bloqueados por conformidade</span>
          </div>
        </div>

        {/* Motivos de Não Elegibilidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="bg-[#141a27] border border-slate-800/80 rounded-lg p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Detalhamento de Bloqueios e Inelegibilidade
            </h4>
            <div className="flex flex-col gap-2.5">
              {elegibilidade?.motivosNaoElegibilidade.map((m: { motivo: string; quantidade: number; percentual: number }, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                  <span className="text-slate-400 max-w-[70%]">{m.motivo}</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-200">{m.quantidade}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({m.percentual}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141a27] border border-slate-800/80 rounded-lg p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Capacidade por Canal Permitido
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {elegibilidade?.canaisPermitidos.map((c: { canal: CanalComunicacao; elegiveis: number; bloqueados: number; semConsentimento: number }) => (
                <div key={c.canal} className="bg-[#182030] p-3 rounded border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{c.canal}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{(c.elegiveis).toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Bloqueios: <span className="text-rose-400">{c.bloqueados}</span> | Sem aceite:{' '}
                    <span className="text-slate-500">{c.semConsentimento}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEGMENTAÇÃO & CRIADOR DE PÚBLICO                                       */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="text-lg font-bold text-white">Segmentação de Público</h2>
          </div>
          <span className="text-xs text-slate-400">Públicos inteligentes para relacionamento e remarketing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-lg bg-[#161d2d] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Compareceu ao Festival</h4>
                <span className="text-xs text-emerald-400 font-mono font-semibold">10.716</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Filtro padrão: passou pela portaria principal ou lateral com leitura confirmada.
              </p>
            </div>
            <button
              onClick={() => {
                setPublicoSelecionadoCount(10716);
                setModalFeedbackSucesso('Segmento "Compareceu ao Festival" aplicado como base de disparo.');
              }}
              className="mt-3 text-xs py-1.5 px-3 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 transition text-center"
            >
              Usar este Público
            </button>
          </div>

          <div className="p-4 rounded-lg bg-[#161d2d] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Público das Agências Parceiras</h4>
                <span className="text-xs text-sky-400 font-mono font-semibold">1.800</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Vindos de operadores de turismo e agências (11.29.4) validados no check-in.
              </p>
            </div>
            <button
              onClick={() => {
                setPublicoSelecionadoCount(1800);
                setModalFeedbackSucesso('Segmento "Público das Agências Parceiras" selecionado.');
              }}
              className="mt-3 text-xs py-1.5 px-3 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 transition text-center"
            >
              Usar este Público
            </button>
          </div>

          <div className="p-4 rounded-lg bg-[#161d2d] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Recorrentes (≥ 3 eventos)</h4>
                <span className="text-xs text-amber-400 font-mono font-semibold">3.420</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Frequentadores assíduos identificados pelo histórico longitudinal de relacionamento.
              </p>
            </div>
            <button
              onClick={() => {
                setPublicoSelecionadoCount(3420);
                setModalFeedbackSucesso('Segmento "Recorrentes (≥ 3 eventos)" selecionado.');
              }}
              className="mt-3 text-xs py-1.5 px-3 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 transition text-center"
            >
              Usar este Público
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PESQUISA PÓS-EVENTO (Modelos Prontos & Perguntas)                       */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h2 className="text-lg font-bold text-white">Pesquisa Pós-Evento</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Modelo:</span>
            <select
              value={modeloSelecionado}
              onChange={(e) => setModeloSelecionado(e.target.value)}
              className="bg-[#1a2133] border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {modelos.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Perguntas Configuradas do Modelo Selecionado */}
        <div className="mt-5 bg-[#141a27] border border-slate-800/80 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {modelos.find((m) => m.codigo === modeloSelecionado)?.nome || 'Satisfação Geral'}
              </h3>
              <p className="text-xs text-slate-400">
                {modelos.find((m) => m.codigo === modeloSelecionado)?.descricao}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Status: Publicada & Pronta para Disparo
            </span>
          </div>

          <div className="space-y-3">
            {modelos
              .find((m) => m.codigo === modeloSelecionado)
              ?.perguntas.map((p: any) => (
                <div
                  key={p.ordem}
                  className="flex items-center justify-between p-3 rounded bg-[#182030] border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[11px]">
                      {p.ordem}
                    </span>
                    <span className="text-slate-200 font-medium">{p.enunciado}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {p.tipo === 'RATING_1_5' ? '1 a 5 Estrelas' : p.tipo === 'SIM_TALVEZ_NAO' ? 'Sim / Não' : 'Texto Livre'}
                    </span>
                    {p.obrigatoria && (
                      <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded">
                        Obrigatória
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. COMUNICAÇÃO: WHATSAPP, ESTIMATIVA DE CUSTO, APROVAÇÃO E PRÉVIA         */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              5
            </span>
            <h2 className="text-lg font-bold text-white">Comunicação & Disparo</h2>
          </div>
          <span className="text-xs text-slate-400">Precificação transparente e controle orçamentário</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          {/* Coluna 1 e 2: Parâmetros Comerciais */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {precos.map((p) => (
                <button
                  key={p.canal}
                  onClick={() => setCanalSelecionado(p.canal)}
                  className={`p-3.5 rounded-lg border text-left transition ${
                    canalSelecionado === p.canal
                      ? 'bg-sky-950/60 border-sky-500 text-white shadow-sm'
                      : 'bg-[#161d2d] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{p.canal}</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      R$ {p.custoUnitario.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{p.descricao}</p>
                </button>
              ))}
            </div>

            {/* Painel de Estimativa */}
            <div className="bg-[#161d2d] border border-slate-800 rounded-lg p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase">Público Elegível</span>
                  <div className="text-lg font-bold text-white mt-0.5">8.921</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase">Selecionados</span>
                  <div className="text-lg font-bold text-sky-400 mt-0.5">
                    {publicoSelecionadoCount.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase">Valor por Envio</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                    R$ {precoAtual.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase">Custo Estimado</span>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono">
                    R$ {custoEstimado.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>

              {requerAprovacao ? (
                <div className="mt-4 p-3 bg-amber-950/60 border border-amber-600/50 rounded-lg text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                  <span>
                    Campanhas com custo superior a <strong>R$ 5.000,00</strong> exigem aprovação da Diretoria antes do disparo.
                  </span>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Valor aprovado dentro da alçada operacional do evento.</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setMostrarPreviaModal(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Eye size={14} /> Prévia da Mensagem
                </button>

                <button
                  onClick={() => {
                    setModalFeedbackSucesso('Campanha disparada com sucesso para 8.000 destinatários!');
                  }}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md"
                >
                  <Send size={14} /> Confirmar & Disparar Campanha
                </button>
              </div>
            </div>
          </div>

          {/* Coluna 3: Prévia Interativa do WhatsApp */}
          <div className="bg-[#141a27] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-emerald-400" /> Prévia no Smartphone
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono">
                  WhatsApp Oficial
                </span>
              </div>

              {/* Bolha de Mensagem WhatsApp */}
              <div className="mt-4 bg-[#0c1815] border border-emerald-900/60 p-4 rounded-xl text-xs space-y-2.5 text-slate-200 shadow-inner">
                <p className="font-semibold text-white">Olá, Maria!</p>
                <p>
                  Obrigado por participar do <strong>Festival Exemplo 2026</strong>!
                </p>
                <p className="text-slate-300">
                  Queremos muito saber como foi sua experiência para tornarmos a próxima edição ainda mais inesquecível.
                </p>
                <div className="pt-2">
                  <div className="p-2.5 bg-[#122e23] border border-emerald-600/40 rounded-lg text-center font-bold text-emerald-300 hover:bg-emerald-800/40 cursor-pointer transition">
                    ★ RESPONDER PESQUISA (1 MIN)
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 text-right">10:30 &bull; Enviado pelo DiskIngressos</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-4 text-center">
              Variáveis dinâmicas como <code>&#123;&#123;nome&#125;&#125;</code> são substituídas automaticamente por titular.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. RESULTADOS DA CAMPANHA & FEEDBACKS                                     */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              6
            </span>
            <h2 className="text-lg font-bold text-white">Resultados da Campanha & Pesquisa</h2>
          </div>
          <span className="text-xs text-slate-400">Métricas pós-disparo com funil e sentiment analysis</span>
        </div>

        {/* Funil de Entrega e Respostas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">
          <div className="bg-[#161d2d] border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase">Enviados</span>
            <div className="text-lg font-bold text-white mt-0.5">8.000</div>
          </div>
          <div className="bg-[#161d2d] border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase">Entregues</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">7.721</div>
            <span className="text-[10px] text-slate-500">96.5%</span>
          </div>
          <div className="bg-[#161d2d] border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase">Falhas</span>
            <div className="text-lg font-bold text-rose-400 mt-0.5">279</div>
            <span className="text-[10px] text-slate-500">3.5%</span>
          </div>
          <div className="bg-[#161d2d] border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase">Visualizados</span>
            <div className="text-lg font-bold text-sky-400 mt-0.5">6.304</div>
            <span className="text-[10px] text-slate-500">81.6%</span>
          </div>
          <div className="bg-[#161d2d] border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase">Cliques</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">3.850</div>
            <span className="text-[10px] text-slate-500">49.9%</span>
          </div>
          <div className="bg-[#161d2d] border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 uppercase">Iniciadas</span>
            <div className="text-lg font-bold text-purple-400 mt-0.5">3.126</div>
          </div>
          <div className="bg-[#161d2d] border border-emerald-900/60 p-3 rounded-lg text-center">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase">Concluídas</span>
            <div className="text-lg font-black text-emerald-300 mt-0.5">2.842</div>
            <span className="text-[10px] text-emerald-400/80">35.5% conversão</span>
          </div>
        </div>

        {/* Avaliações de Satisfação */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-[#161d2d] border border-slate-800 p-4 rounded-lg">
            <span className="text-xs text-slate-400">Satisfação Geral</span>
            <div className="text-3xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              4.6 <Star size={20} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-500">Base: 2.842 respondentes</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800 p-4 rounded-lg">
            <span className="text-xs text-slate-400">Organização & Equipe</span>
            <div className="text-3xl font-black text-slate-100 mt-1">4.4 / 5</div>
            <span className="text-[11px] text-slate-500">88% notas 4 e 5</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800 p-4 rounded-lg">
            <span className="text-xs text-slate-400">Acesso & Portaria</span>
            <div className="text-3xl font-black text-slate-100 mt-1">3.8 / 5</div>
            <span className="text-[11px] text-amber-400">Ponto de atenção em horários de pico</span>
          </div>

          <div className="bg-[#161d2d] border border-slate-800 p-4 rounded-lg">
            <span className="text-xs text-slate-400">Estrutura & Limpeza</span>
            <div className="text-3xl font-black text-slate-100 mt-1">4.2 / 5</div>
            <span className="text-[11px] text-slate-500">Avaliação positiva</span>
          </div>
        </div>

        {/* Classificação Inteligente de Comentários */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="bg-[#141a27] border border-slate-800/80 rounded-lg p-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ThumbsUp size={14} /> Principais Elogios & Temas Fortes
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Atendimento cordial e ágil da equipe de recepção</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Qualidade e fidelidade do som no palco principal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Pontualidade nos horários do line-up</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#141a27] border border-slate-800/80 rounded-lg p-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ThumbsDown size={14} /> Pontos Recorrentes de Atenção
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">
                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                <span>Filas no bar da pista durante os intervalos</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                <span>Sinalização do estacionamento lateral</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle size={13} className="text-amber-400 shrink-0" />
                <span>Manutenção dos banheiros químicos no setor pista após as 22h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. HISTÓRICO DO PÚBLICO & GRAFO DE RELACIONAMENTO (Com Isolamento)        */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
              7
            </span>
            <h2 className="text-lg font-bold text-white">Histórico do Público & Relacionamento</h2>
          </div>

          {/* Toggle de Isolamento de Produtor vs Plataforma */}
          <div className="flex items-center gap-2 bg-[#161d2d] p-1.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400">Visão:</span>
            <button
              onClick={() => setVisaoIsolamentoProdutor(false)}
              className={`px-2 py-1 text-xs rounded transition ${
                !visaoIsolamentoProdutor ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DiskIngressos (Global)
            </button>
            <button
              onClick={() => setVisaoIsolamentoProdutor(true)}
              className={`px-2 py-1 text-xs rounded transition ${
                visaoIsolamentoProdutor ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Produtor (Isolado)
            </button>
          </div>
        </div>

        {/* Exemplo de Perfil Unificado com Grafo de Relacionamento */}
        {historicoPublico && (
          <div className="mt-5 bg-[#141a27] border border-slate-800/80 rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">
                  Perfil Unificado & Histórico de Relacionamento
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{historicoPublico.nome}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                  <span>CPF: {historicoPublico.documentoMascarado}</span>
                  <span>&bull;</span>
                  <span>{historicoPublico.emailMascarado}</span>
                  <span>&bull;</span>
                  <span>{historicoPublico.telefoneMascarado}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-[#182030] p-2 rounded border border-slate-800">
                  <div className="text-sm font-bold text-white">{historicoPublico.totalEventosComprados}</div>
                  <div className="text-[10px] text-slate-400">Comprados</div>
                </div>
                <div className="bg-[#182030] p-2 rounded border border-slate-800">
                  <div className="text-sm font-bold text-emerald-400">{historicoPublico.totalEventosFrequentados}</div>
                  <div className="text-[10px] text-slate-400">Frequentados</div>
                </div>
                <div className="bg-[#182030] p-2 rounded border border-slate-800">
                  <div className="text-sm font-bold text-amber-400">{historicoPublico.totalIngressos}</div>
                  <div className="text-[10px] text-slate-400">Ingressos</div>
                </div>
                <div className="bg-[#182030] p-2 rounded border border-slate-800">
                  <div className="text-sm font-bold text-sky-400">{historicoPublico.taxaComparecimentoHistoricaPct}%</div>
                  <div className="text-[10px] text-slate-400">Presença</div>
                </div>
              </div>
            </div>

            {/* Grafo Temporal de Eventos */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Jornada Longitudinal de Eventos
              </h4>

              {historicoPublico.historicoEventos.map((ev: any) => (
                <div
                  key={ev.eventoId}
                  className="bg-[#182030] border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{ev.eventoNome}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({ev.dataEvento})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {ev.comprou && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                          Comprou ✓
                        </span>
                      )}
                      {ev.compareceu ? (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300">
                          Compareceu ✓
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                          Não compareceu ✕
                        </span>
                      )}
                      {ev.recebeuCampanha && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                          Recebeu Campanha
                        </span>
                      )}
                      {ev.respondeuPesquisa && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                          Respondeu Pesquisa
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
                    {ev.acoes.map((a: any, i: number) => (
                      <div key={i} className="text-[11px]">
                        <span className="text-slate-500">{a.data}:</span> {a.descricao}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 9. INTEGRAÇÃO COM DISTRIBUIÇÃO & PARCEIROS (EDDIE 11.29.4)                  */}
      {/* ========================================================================= */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              8
            </span>
            <h2 className="text-lg font-bold text-white">Comparecimento por Parceiro de Distribuição</h2>
          </div>
          <span className="text-xs text-slate-400">Aproveitamento da 11.29.4: Avaliação por presença real</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161d2d] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Parceiro / Canal</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3 text-center">Vendidos</th>
                <th className="py-2.5 px-3 text-center">Emitidos</th>
                <th className="py-2.5 px-3 text-center">Compareceram</th>
                <th className="py-2.5 px-3 text-center">Não Compareceram</th>
                <th className="py-2.5 px-3 text-right">Taxa de Presença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {parceiros.map((p) => (
                <tr key={p.parceiroId} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                    <Building2 size={13} className="text-sky-400" />
                    {p.parceiroNome}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{p.tipoParceiro}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-200">{p.ingressosVendidos}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{p.ingressosEmitidos}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-semibold">{p.compareceram}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-400">{p.naoCompareceram}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                      {p.taxaComparecimentoPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
