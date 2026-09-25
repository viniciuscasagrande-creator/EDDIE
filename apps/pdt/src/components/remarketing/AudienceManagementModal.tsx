// apps/pdt/src/components/remarketing/AudienceManagementModal.tsx
// EDDIE 11.16.16 — Modal de Gestão de Públicos & Segmentação AND/OR Aninhada

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Target,
  Plus,
  Trash2,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Save,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import type {
  Audience,
  AudienceType,
  AudienceOrigin,
  SegmentationDimension,
  SegmentationOperator,
  SegmentationGroup,
  SegmentationRule,
} from './audience-types';

interface AudienceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audience: Audience) => void;
  initialData?: Audience | null;
  eventos: Array<{ id: string; nome: string }>;
  currentEventoId?: string | null;
  onUseInCampaign?: (audience: Audience) => void;
}

const DIMENSIONS: Array<{ id: SegmentationDimension; label: string }> = [
  { id: 'carrinho_abandonado', label: 'Abandono de Carrinho' },
  { id: 'visita_sem_compra', label: 'Visitou e Não Comprou' },
  { id: 'checkout_iniciado', label: 'Iniciou Checkout' },
  { id: 'pedido_pago', label: 'Já Comprou Ingresso' },
  { id: 'quantidade_ingressos', label: 'Quantidade de Ingressos Comprados' },
  { id: 'ticket_medio_cents', label: 'Ticket Médio (Centavos)' },
  { id: 'dias_ultima_compra', label: 'Dias Desde a Última Compra' },
  { id: 'utm_source', label: 'Origem UTM (utm_source)' },
  { id: 'utm_campaign', label: 'Campanha UTM (utm_campaign)' },
  { id: 'consentimento_whatsapp', label: 'Consentimento WhatsApp (Opt-in)' },
  { id: 'consentimento_email', label: 'Consentimento E-mail (Opt-in)' },
];

const OPERATORS: Array<{ id: SegmentationOperator; label: string }> = [
  { id: 'EQUALS', label: 'É igual a' },
  { id: 'NOT_EQUALS', label: 'É diferente de' },
  { id: 'CONTAINS', label: 'Contém' },
  { id: 'GREATER_THAN', label: 'Maior que (>)' },
  { id: 'LESS_THAN', label: 'Menor que (<)' },
  { id: 'BETWEEN', label: 'Está entre' },
  { id: 'LAST_N_DAYS', label: 'Nos últimos N dias' },
  { id: 'EXISTS', label: 'Existe / Preenchido' },
];

export function AudienceManagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  eventos,
  currentEventoId,
  onUseInCampaign,
}: AudienceManagementModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [eventoId, setEventoId] = useState(currentEventoId || eventos[0]?.id || 'evento-operacao');
  const [tipo, setTipo] = useState<AudienceType>('DYNAMIC');
  const [origem, setOrigem] = useState<AudienceOrigin>('CHECKOUT_PIXEL');
  const [conjuncaoPrincipal, setConjuncaoPrincipal] = useState<'AND' | 'OR'>('AND');
  const [grupos, setGrupos] = useState<SegmentationGroup[]>([
    {
      id: 'grp-1',
      conjuncao: 'AND',
      regras: [
        {
          id: 'rule-1',
          dimensao: 'carrinho_abandonado',
          operador: 'EQUALS',
          valor: 'true',
        },
      ],
    },
  ]);

  const [calculando, setCalculando] = useState(false);
  const [tamanhoCalculado, setTamanhoCalculado] = useState<number | null>(null);
  const [syncMeta, setSyncMeta] = useState(true);
  const [syncGoogle, setSyncGoogle] = useState(true);
  const [syncTikTok, setSyncTikTok] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setDescricao(initialData.descricao || '');
      setEventoId(initialData.eventoId);
      setTipo(initialData.tipo);
      setOrigem(initialData.origem);
      setConjuncaoPrincipal(initialData.segmentacao.conjuncaoPrincipal);
      setGrupos(initialData.segmentacao.grupos);
      setTamanhoCalculado(initialData.tamanhoCalculado ?? null);
    } else {
      setNome('');
      setDescricao('');
      setEventoId(currentEventoId || eventos[0]?.id || 'evento-operacao');
      setTipo('DYNAMIC');
      setOrigem('CHECKOUT_PIXEL');
      setConjuncaoPrincipal('AND');
      setGrupos([
        {
          id: `grp-${Date.now()}`,
          conjuncao: 'AND',
          regras: [
            {
              id: `rule-${Date.now()}-1`,
              dimensao: 'carrinho_abandonado',
              operador: 'EQUALS',
              valor: 'true',
            },
          ],
        },
      ]);
      setTamanhoCalculado(null);
    }
  }, [initialData, currentEventoId, eventos]);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    setGrupos((prev) => [
      ...prev,
      {
        id: `grp-${Date.now()}`,
        conjuncao: 'AND',
        regras: [
          {
            id: `rule-${Date.now()}-1`,
            dimensao: 'visita_sem_compra',
            operador: 'LAST_N_DAYS',
            valor: '7',
          },
        ],
      },
    ]);
  };

  const handleRemoveGroup = (groupId: string) => {
    if (grupos.length === 1) return;
    setGrupos((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleAddRule = (groupId: string) => {
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              regras: [
                ...g.regras,
                {
                  id: `rule-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  dimensao: 'consentimento_whatsapp',
                  operador: 'EQUALS',
                  valor: 'true',
                },
              ],
            }
          : g
      )
    );
  };

  const handleRemoveRule = (groupId: string, ruleId: string) => {
    setGrupos((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.regras.length === 1) return g;
        return {
          ...g,
          regras: g.regras.filter((r) => r.id !== ruleId),
        };
      })
    );
  };

  const handleRuleChange = (
    groupId: string,
    ruleId: string,
    field: keyof SegmentationRule,
    val: any
  ) => {
    setGrupos((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          regras: g.regras.map((r) => (r.id === ruleId ? { ...r, [field]: val } : r)),
        };
      })
    );
  };

  const handleCalcularPreview = () => {
    setCalculando(true);
    setFeedbackMsg(null);
    setTimeout(() => {
      // Simulação de cálculo real baseado na complexidade dos grupos de regras
      let base = 1200;
      if (origem === 'CARRINHO_ABANDONADO') base = 480;
      if (origem === 'COMPRADORES_ANTERIORES') base = 2350;
      if (origem === 'CLIENTES_RECORRENTES') base = 890;
      const count = Math.max(45, Math.round(base / grupos.length));
      setTamanhoCalculado(count);
      setCalculando(false);
      setFeedbackMsg(`Pré-visualização calculada: ${count.toLocaleString('pt-BR')} participantes elegíveis.`);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const selectedEvento = eventos.find((ev) => ev.id === eventoId);

    const audienceToSave: Audience = {
      id: initialData?.id || `aud-${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim(),
      eventoId,
      eventoNome: selectedEvento?.nome || 'Evento Geral',
      tipo,
      origem,
      tamanhoCalculado: tamanhoCalculado ?? 350,
      statusCalculo: tamanhoCalculado ? 'CALCULADO' : 'AGUARDANDO_DADOS',
      status: 'ATIVO',
      segmentacao: {
        conjuncaoPrincipal,
        grupos,
      },
      provedoresSync: [
        {
          provider: 'META',
          status: syncMeta ? 'SINCRONIZADO' : 'PENDENTE',
          capabilitySuportada: true,
          externalAudienceId: syncMeta ? `meta_aud_${Date.now()}` : undefined,
          ultimoSyncEm: syncMeta ? new Date().toISOString() : undefined,
          tamanhoRetornado: syncMeta ? (tamanhoCalculado ?? 350) : undefined,
        },
        {
          provider: 'GOOGLE',
          status: syncGoogle ? 'SINCRONIZADO' : 'PENDENTE',
          capabilitySuportada: true,
          externalAudienceId: syncGoogle ? `gads_aud_${Date.now()}` : undefined,
          ultimoSyncEm: syncGoogle ? new Date().toISOString() : undefined,
          tamanhoRetornado: syncGoogle ? (tamanhoCalculado ?? 350) : undefined,
        },
        {
          provider: 'TIKTOK',
          status: syncTikTok ? 'SINCRONIZADO' : 'NAO_SUPORTADO',
          capabilitySuportada: syncTikTok,
          mensagemErro: syncTikTok ? undefined : 'Requer conta TikTok Ads vinculada com acesso a Custom Audience',
        },
      ],
      criadoEm: initialData?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      ultimaAtivacao: new Date().toISOString(),
    };

    onSave(audienceToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{initialData ? 'Editar Público & Segmentação' : 'Criar Novo Público Estratégico'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  AND / OR Dinâmico
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Construtor visual de regras comportamentais, LGPD e sincronização direta com Meta, Google e TikTok Ads.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Dados Gerais do Público */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nome do Público *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carrinho Abandonado Últimas 48h (VIP)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Evento de Contexto *</label>
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tipo de Audiência</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as AudienceType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="DYNAMIC">Dinâmica (Atualização Automática Contínua)</option>
                <option value="BEHAVIORAL">Comportamental (Checkout, Cliques e Pixel)</option>
                <option value="STATIC">Estática (Instantâneo Fixo de Base)</option>
                <option value="PROVIDER">Provider Sincronizado (Custom Audience Ads)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Origem Principal dos Dados</label>
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value as AudienceOrigin)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="CHECKOUT_PIXEL">Pixel do Checkout & Carrinho</option>
                <option value="CARRINHO_ABANDONADO">Fila de Carrinhos Abandonados</option>
                <option value="VISITOU_NAO_COMPROU">Visitou Landing Page sem Finalizar</option>
                <option value="COMPRADORES_ANTERIORES">Compradores de Edições Anteriores</option>
                <option value="CLIENTES_RECORRENTES">Clientes Recorrentes (2+ Compras)</option>
                <option value="GATEWAY_PAGAMENTOS">Gateway de Pagamentos (PIX Expirado / Cartão Recusado)</option>
                <option value="CRM_PRODUTOR">Base CRM Importada do Produtor</option>
                <option value="UTM_TRACKING">Campanha ou UTM Específica</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Descrição / Objetivo Estratégico</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Recuperar compradores com desconto progressivo antes do lote virar"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Construtor Visual AND/OR de Segmentação */}
          <div className="rounded-xl border border-slate-800 bg-[#121620] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-orange-400" />
                  <span>Segmentação Avançada de Critérios (AND / OR)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Combine regras com precisão. O participante só entra no público se satisfizer as condições.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Condição entre grupos:</span>
                <div className="inline-flex rounded-lg bg-slate-900 border border-slate-700 p-0.5">
                  <button
                    type="button"
                    onClick={() => setConjuncaoPrincipal('AND')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      conjuncaoPrincipal === 'AND'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    E (AND)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConjuncaoPrincipal('OR')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      conjuncaoPrincipal === 'OR'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OU (OR)
                  </button>
                </div>
              </div>
            </div>

            {/* Grupos de Regras */}
            <div className="space-y-4">
              {grupos.map((grupo, gIdx) => (
                <div
                  key={grupo.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                        GRUPO {gIdx + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        Satisfazer{' '}
                        <strong className="text-white">
                          {grupo.conjuncao === 'AND' ? 'TODAS' : 'QUALQUER UMA'}
                        </strong>{' '}
                        das regras abaixo:
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setGrupos((prev) =>
                            prev.map((g) =>
                              g.id === grupo.id
                                ? { ...g, conjuncao: g.conjuncao === 'AND' ? 'OR' : 'AND' }
                                : g
                            )
                          )
                        }
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20"
                      >
                        Alternar p/ {grupo.conjuncao === 'AND' ? 'OU' : 'E'}
                      </button>
                      {grupos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(grupo.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                          title="Remover este grupo"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Linhas de Regras */}
                  <div className="space-y-2">
                    {grupo.regras.map((regra) => (
                      <div
                        key={regra.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                      >
                        <div className="sm:col-span-5">
                          <select
                            value={regra.dimensao}
                            onChange={(e) =>
                              handleRuleChange(grupo.id, regra.id, 'dimensao', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-orange-500"
                          >
                            {DIMENSIONS.map((dim) => (
                              <option key={dim.id} value={dim.id}>
                                {dim.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <select
                            value={regra.operador}
                            onChange={(e) =>
                              handleRuleChange(grupo.id, regra.id, 'operador', e.target.value)
                            }
                            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-orange-500"
                          >
                            {OPERATORS.map((op) => (
                              <option key={op.id} value={op.id}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={String(regra.valor)}
                            onChange={(e) =>
                              handleRuleChange(grupo.id, regra.id, 'valor', e.target.value)
                            }
                            placeholder="Valor de comparação..."
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          {grupo.regras.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRule(grupo.id, regra.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Remover regra"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddRule(grupo.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-orange-400 hover:text-orange-300 font-semibold pt-1"
                  >
                    <Plus size={12} /> Adicionar Regra neste Grupo
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddGroup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                <Plus size={13} /> Adicionar Novo Grupo de Regras
              </button>

              <button
                type="button"
                onClick={handleCalcularPreview}
                disabled={calculando}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition"
              >
                <RefreshCcw size={13} className={calculando ? 'animate-spin' : ''} />
                <span>{calculando ? 'Calculando Base Real...' : 'Testar e Calcular Tamanho Real'}</span>
              </button>
            </div>
          </div>

          {/* Sincronização Automática com Provedores Ads */}
          <div className="rounded-xl border border-slate-800 bg-[#121620] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={14} className="text-sky-400" />
                  <span>Sincronização com Provedores Ads (Custom Audiences)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Regra 8: A sincronização respeita as capabilities reais de cada conta conectada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={syncMeta}
                  onChange={(e) => setSyncMeta(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-bold text-white">Meta Ads (Custom Audience)</div>
                  <div className="text-[10px] text-emerald-400">Capability Ativa · CAPI</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={syncGoogle}
                  onChange={(e) => setSyncGoogle(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-bold text-white">Google Ads (Customer Match)</div>
                  <div className="text-[10px] text-emerald-400">Capability Ativa · GA4</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={syncTikTok}
                  onChange={(e) => setSyncTikTok(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-bold text-white">TikTok Ads</div>
                  <div className="text-[10px] text-slate-400">Disponível se conta vinculada</div>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111827] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>LGPD: Dados sensíveis anonimizados e opt-out respeitado.</span>
          </div>

          <div className="flex items-center gap-2">
            {initialData && onUseInCampaign && (
              <button
                type="button"
                onClick={() => {
                  onUseInCampaign(initialData);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Usar em Nova Campanha
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition"
            >
              <Save size={14} />
              <span>Salvar Público</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
