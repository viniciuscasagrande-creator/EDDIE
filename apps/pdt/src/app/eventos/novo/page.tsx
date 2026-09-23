'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building,
  Ticket,
  Percent,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Save,
} from 'lucide-react';
import { useProducerEvent } from '../../../components/ProducerEventContext';

const STEPS = [
  'Dados Básicos',
  'Produtor',
  'Local',
  'Datas & Sessões',
  'Setores & Capacidade',
  'Lotes & Preços',
  'Cortesias & Regras',
  'Condição Comercial',
  'Revisão',
  'Publicação',
] as const;

export default function NovoEventoPage() {
  const router = useRouter();
  const { produtorId, recarregarEventos } = useProducerEvent();
  const [currentStep, setCurrentStep] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Form State
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: 'SHOW',
    classificacaoEtaria: '16',
    produtorId: produtorId || '',
    localNome: '',
    localCidade: 'Curitiba',
    localUf: 'PR',
    localCapacidade: 5000,
    inicioEm: '',
    fimEm: '',
    aberturaPortas: '',
    setorNome: 'Pista Geral',
    setorCapacidade: 3000,
    loteNome: '1º Lote',
    loteModalidade: 'INTEIRA',
    precoFace: 120,
    loteQuantidade: 1000,
    limiteCortesias: 150,
    politicaCancelamento: 'Até 7 dias após a compra nos termos do Art. 49 do CDC',
  });

  useEffect(() => {
    if (produtorId && !form.produtorId) {
      setForm((f) => ({ ...f, produtorId }));
    }
  }, [produtorId]);

  const updateField = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleNext = () => {
    setErro('');
    if (currentStep === 1 && !form.nome.trim()) {
      setErro('Informe o nome do evento.');
      return;
    }
    if (currentStep === 3 && !form.localNome.trim()) {
      setErro('Informe o nome do local do evento.');
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setErro('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalizar = async (publicarAgora: boolean) => {
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao || undefined,
        categoria: form.categoria,
        classificacaoEtaria: form.classificacaoEtaria,
        produtorId: form.produtorId || produtorId,
        publicarAgora,
      };

      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-produtor-id': form.produtorId || produtorId,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Erro ${res.status} ao cadastrar evento.`);
      }

      const eventoCriado = await res.json();
      setSucesso(true);
      await recarregarEventos();

      setTimeout(() => {
        router.push(`/eventos/${eventoCriado.id || ''}/dashboard`);
      }, 1500);
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar evento.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Voltar para Todos os Eventos
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">Cadastro de Novo Evento</h1>
          <p className="text-sm text-slate-400">
            Fluxo operacional guiado para criação, configuração e publicação do evento.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
            Etapa {currentStep} de {STEPS.length}
          </span>
          <div className="text-sm font-semibold text-white">{STEPS[currentStep - 1]}</div>
        </div>
      </div>

      {/* Stepper Wizard Progress (Sem scroll horizontal) */}
      <div className="w-full pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          {STEPS.map((stepName, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div
                key={stepName}
                onClick={() => {
                  if (stepNum <= currentStep) setCurrentStep(stepNum);
                }}
                className={`flex flex-col items-center cursor-pointer group p-1.5 rounded-lg border border-slate-800/60 bg-slate-900/40 transition hover:bg-slate-800/40 ${
                  stepNum > currentStep ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition ${
                    isCurrent
                      ? 'bg-sky-500 text-white ring-2 ring-sky-500/20'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={13} /> : stepNum}
                </div>
                <span
                  className={`text-[10px] mt-1 text-center truncate max-w-full leading-tight ${
                    isCurrent ? 'text-sky-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {stepName}
                </span>
                <div
                  className={`h-0.5 w-full mt-1.5 rounded-full ${
                    isCompleted ? 'bg-emerald-500/60' : isCurrent ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Error / Success Feedback */}
      {erro && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={18} />
          Evento cadastrado com sucesso! Redirecionando para o Modo Evento...
        </div>
      )}

      {/* Wizard Content Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#121620] p-6 lg:p-8 min-h-[380px]">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="text-sky-400" size={20} /> 1. Dados Básicos do Evento
            </h2>
            <p className="text-xs text-slate-400">
              Nome público, categoria e informações que identificam o evento no Storefront e PDT.
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Evento *
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder="Ex: Turnê Acústica 2027 - Curitiba"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => updateField('categoria', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="SHOW">Show / Festival</option>
                  <option value="TEATRO">Teatro / Espetáculo</option>
                  <option value="ESPORTE">Evento Esportivo</option>
                  <option value="CONGRESSO">Congresso / Corporativo</option>
                  <option value="GASTRONOMIA">Gastronomia / Feira</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Classificação Etária
                </label>
                <select
                  value={form.classificacaoEtaria}
                  onChange={(e) => updateField('classificacaoEtaria', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="LIVRE">Livre para todos os públicos</option>
                  <option value="12">12 anos</option>
                  <option value="14">14 anos</option>
                  <option value="16">16 anos</option>
                  <option value="18">18 anos</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição do Evento
                </label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => updateField('descricao', e.target.value)}
                  placeholder="Sinopse, atrações principais e detalhes gerais para o público..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="text-sky-400" size={20} /> 2. Produtor Responsável
            </h2>
            <p className="text-xs text-slate-400">
              O evento fica vinculado ao produtor ativo para fins contratuais, repasse e auditoria.
            </p>
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 mt-4 space-y-3">
              <div className="text-xs text-slate-400">Produtor Selecionado no Contexto:</div>
              <div className="text-base font-bold text-white font-mono">{form.produtorId || 'Produtor Padrão DiskIngressos'}</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Produtor validado e habilitado para criação de eventos.
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="text-sky-400" size={20} /> 3. Local do Evento
            </h2>
            <p className="text-xs text-slate-400">
              Defina o local, cidade, estado e capacidade física total do espaço.
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Local / Arena / Teatro *
                </label>
                <input
                  value={form.localNome}
                  onChange={(e) => updateField('localNome', e.target.value)}
                  placeholder="Ex: Teatro Positivo, Arena da Baixada, Ópera de Arame"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cidade</label>
                <input
                  value={form.localCidade}
                  onChange={(e) => updateField('localCidade', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">UF</label>
                <input
                  value={form.localUf}
                  onChange={(e) => updateField('localUf', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Capacidade Máxima do Local
                </label>
                <input
                  type="number"
                  value={form.localCapacidade}
                  onChange={(e) => updateField('localCapacidade', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="text-sky-400" size={20} /> 4. Datas e Sessões
            </h2>
            <p className="text-xs text-slate-400">
              Configure a primeira sessão oficial do evento com horários de abertura e término.
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Abertura dos Portões
                </label>
                <input
                  type="datetime-local"
                  value={form.aberturaPortas}
                  onChange={(e) => updateField('aberturaPortas', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Início do Espetáculo / Show *
                </label>
                <input
                  type="datetime-local"
                  value={form.inicioEm}
                  onChange={(e) => updateField('inicioEm', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Previsão de Término</label>
                <input
                  type="datetime-local"
                  value={form.fimEm}
                  onChange={(e) => updateField('fimEm', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="text-sky-400" size={20} /> 5. Setores e Capacidade
            </h2>
            <p className="text-xs text-slate-400">
              Defina os setores físicos da sessão e os limites de capacidade de cada um.
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome do Setor</label>
                <input
                  value={form.setorNome}
                  onChange={(e) => updateField('setorNome', e.target.value)}
                  placeholder="Ex: Pista Premium, Camarote, Balcão Nobre"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Capacidade do Setor
                </label>
                <input
                  type="number"
                  value={form.setorCapacidade}
                  onChange={(e) => updateField('setorCapacidade', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="text-sky-400" size={20} /> 6. Lotes, Ingressos e Preços
            </h2>
            <p className="text-xs text-slate-400">
              O preço de face é definido pelo produtor; a taxa Disk será aplicada automaticamente sobre o valor.
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Identificação do Lote</label>
                <input
                  value={form.loteNome}
                  onChange={(e) => updateField('loteNome', e.target.value)}
                  placeholder="Ex: 1º Lote, Lote Promocional"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Modalidade</label>
                <select
                  value={form.loteModalidade}
                  onChange={(e) => updateField('loteModalidade', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="INTEIRA">Inteira</option>
                  <option value="MEIA_ENTRADA">Meia-Entrada (Lei Federal)</option>
                  <option value="SOLIDARIO">Ingresso Solidário (Doação 1kg)</option>
                  <option value="PROMO">Promocional Parcerias</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preço de Face (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.precoFace}
                  onChange={(e) => updateField('precoFace', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="text-sky-400" size={20} /> 7. Cortesias e Regras Operacionais
            </h2>
            <p className="text-xs text-slate-400">
              Limites de cortesias autorizadas para o evento e regras de cancelamento.
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cota Máxima de Cortesias
                </label>
                <input
                  type="number"
                  value={form.limiteCortesias}
                  onChange={(e) => updateField('limiteCortesias', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Política de Cancelamento e Estorno
                </label>
                <input
                  value={form.politicaCancelamento}
                  onChange={(e) => updateField('politicaCancelamento', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Percent className="text-sky-400" size={20} /> 8. Condição Comercial do Evento
            </h2>
            <p className="text-xs text-slate-400">
              Taxa DiskIngressos por evento. Sem condição aprovada, a venda não é aberta.
            </p>
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Regra Comercial do Produtor:</span>
                <span className="text-sky-300 font-semibold">Aprovada & Vigente</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Modelo de Taxa:</span>
                <span className="text-white font-medium">Percentual / Híbrida conforme contrato</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Prazo de Repasse:</span>
                <span className="text-white font-medium">D+2 após o evento</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                A condição será congelada no pedido como snapshot imutável para contabilidade e repasse.
              </p>
            </div>
          </div>
        )}

        {currentStep === 9 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="text-sky-400" size={20} /> 9. Revisão do Evento
            </h2>
            <p className="text-xs text-slate-400">
              Confira os dados consolidados antes de gravar ou publicar.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                <div className="text-slate-400 font-semibold uppercase">Dados Gerais</div>
                <div><b className="text-white">Nome:</b> <span className="text-slate-300">{form.nome}</span></div>
                <div><b className="text-white">Categoria:</b> <span className="text-slate-300">{form.categoria}</span></div>
                <div><b className="text-white">Classificação:</b> <span className="text-slate-300">{form.classificacaoEtaria} anos</span></div>
                <div><b className="text-white">Local:</b> <span className="text-slate-300">{form.localNome || 'A definir'} ({form.localCidade}-{form.localUf})</span></div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                <div className="text-slate-400 font-semibold uppercase">Ingressos & Lotes</div>
                <div><b className="text-white">Setor:</b> <span className="text-slate-300">{form.setorNome} ({form.setorCapacidade} lugares)</span></div>
                <div><b className="text-white">Lote:</b> <span className="text-slate-300">{form.loteNome} ({form.loteModalidade})</span></div>
                <div><b className="text-white">Preço Face:</b> <span className="text-sky-300 font-bold">R$ {Number(form.precoFace).toFixed(2)}</span></div>
                <div><b className="text-white">Limite Cortesias:</b> <span className="text-slate-300">{form.limiteCortesias}</span></div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 10 && (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 grid place-items-center mx-auto">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Pronto para Concluir</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Você pode salvar o evento como rascunho no painel ou publicá-lo diretamente para iniciar a operação.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <button
                disabled={salvando}
                onClick={() => handleFinalizar(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition disabled:opacity-50"
              >
                <Save size={16} /> Salvar como Rascunho
              </button>
              <button
                disabled={salvando}
                onClick={() => handleFinalizar(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-8 py-3 text-sm font-semibold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
              >
                {salvando ? 'Processando...' : 'Publicar Evento Agora'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      {currentStep < 10 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:border-slate-600 transition disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition"
          >
            Próximo <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
