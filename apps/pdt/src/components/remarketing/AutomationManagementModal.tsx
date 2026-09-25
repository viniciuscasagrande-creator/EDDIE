// apps/pdt/src/components/remarketing/AutomationManagementModal.tsx
// EDDIE 11.16.16 — Modal de Gestão da Central de Automações

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Workflow,
  Plus,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import type { AutomationRule } from './journey-types';

interface AutomationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: AutomationRule) => void;
  initialData?: AutomationRule | null;
  eventos: Array<{ id: string; nome: string }>;
  currentEventoId?: string | null;
}

export function AutomationManagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  eventos,
  currentEventoId,
}: AutomationManagementModalProps) {
  const [nome, setNome] = useState('');
  const [eventoId, setEventoId] = useState(currentEventoId || eventos[0]?.id || 'evento-operacao');
  const [gatilho, setGatilho] = useState('Carrinho Abandonado (15 min)');
  const [publicoAlvo, setPublicoAlvo] = useState('Visitantes com Carrinho Pendente');
  const [canais, setCanais] = useState<string[]>(['WhatsApp 1-Clique', 'E-mail']);
  const [frequencyCapTexto, setFrequencyCapTexto] = useState('Máx. 1 msg/dia, 2/semana');
  const [consentimentoExigido, setConsentimentoExigido] = useState(true);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setEventoId(initialData.eventoId);
      setGatilho(initialData.gatilho);
      setPublicoAlvo(initialData.publicoAlvo);
      setCanais(initialData.canais);
      setFrequencyCapTexto(initialData.frequencyCapTexto);
      setConsentimentoExigido(initialData.consentimentoExigido);
    } else {
      setNome('');
      setEventoId(currentEventoId || eventos[0]?.id || 'evento-operacao');
      setGatilho('Carrinho Abandonado (15 min)');
      setPublicoAlvo('Visitantes com Carrinho Pendente');
      setCanais(['WhatsApp 1-Clique', 'E-mail']);
      setFrequencyCapTexto('Máx. 1 msg/dia, 2/semana');
      setConsentimentoExigido(true);
    }
  }, [initialData, currentEventoId, eventos]);

  if (!isOpen) return null;

  const handleToggleCanal = (canal: string) => {
    setCanais((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const selectedEvento = eventos.find((ev) => ev.id === eventoId);

    const ruleToSave: AutomationRule = {
      id: initialData?.id || `aut-${Date.now()}`,
      nome: nome.trim(),
      eventoId,
      eventoNome: selectedEvento?.nome || 'Evento Geral',
      gatilho,
      publicoAlvo,
      canais,
      status: initialData?.status || 'ATIVA',
      execucoes: initialData?.execucoes || 1420,
      conversoes: initialData?.conversoes || 312,
      taxaConversao: initialData?.taxaConversao || '21.9%',
      receitaRecuperadaCents: initialData?.receitaRecuperadaCents || 6240000,
      frequencyCapTexto,
      consentimentoExigido,
      criadoEm: initialData?.criadoEm || new Date().toISOString(),
      ultimaExecucaoEm: new Date().toISOString(),
    };

    onSave(ruleToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Workflow size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Editar Regra de Automação' : 'Criar Nova Automação'}
              </h2>
              <p className="text-xs text-slate-400">
                Gatilhos operacionais, validação de canais, templates e frequency cap por comprador.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Nome da Automação *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Alerta de Virada de Lote D-2 para Carrinhos"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Evento Alvo *</label>
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Gatilho de Disparo</label>
              <select
                value={gatilho}
                onChange={(e) => setGatilho(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Carrinho Abandonado (15 min)">Carrinho Abandonado (15 min)</option>
                <option value="PIX Gerado e Não Pago (10 min antes)">PIX Gerado e Não Pago (10 min antes)</option>
                <option value="Virada de Lote D-2 (48h antes)">Virada de Lote D-2 (48h antes)</option>
                <option value="Visitou e Não Comprou (3 dias)">Visitou e Não Comprou (3 dias)</option>
                <option value="Tentativa de Cartão Recusada">Tentativa de Cartão Recusada (Antifraude)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Público-Alvo Vinculado</label>
            <input
              type="text"
              value={publicoAlvo}
              onChange={(e) => setPublicoAlvo(e.target.value)}
              placeholder="Ex: Abandonadores Recorrentes ou Compradores VIP"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="font-semibold text-slate-300 block">Canais Ativos de Disparo</label>
            <div className="flex flex-wrap gap-2">
              {[
                'WhatsApp 1-Clique',
                'E-mail',
                'Meta Ads CAPI',
                'Google Ads Retargeting',
                'SMS Transacional',
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleToggleCanal(c)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    canais.includes(c)
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Frequency Cap (Limite)</label>
              <input
                type="text"
                value={frequencyCapTexto}
                onChange={(e) => setFrequencyCapTexto(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentimentoExigido}
                  onChange={(e) => setConsentimentoExigido(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                />
                <span className="text-[11px] text-slate-300">
                  Exigir opt-in ativo LGPD antes do envio
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Validação de templates homologados ativa.</span>
          </div>
          <div className="flex items-center gap-2">
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
              <span>Salvar Automação</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
