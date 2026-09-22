'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Headphones,
  Search,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldAlert,
  PlusCircle,
  RefreshCcw,
  Sparkles,
  Ticket,
  ChevronRight,
  Filter,
  Loader2,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';

interface Mensagem {
  id: string;
  autorTipo: string;
  autorNome: string;
  conteudo: string;
  createdAt: string;
}

interface Chamado {
  id: string;
  compradorNome: string;
  compradorCpf: string;
  compradorEmail: string;
  compradorTelefone: string;
  pedidoId?: string | null;
  assunto: string;
  categoria: string;
  status: 'aberto' | 'em_atendimento' | 'aguardando_cliente' | 'resolvido' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  agenteResponsavel?: string | null;
  slaHoras: number;
  slaLimiteEm: string;
  createdAt: string;
  mensagens: Mensagem[];
}

export default function SacPage() {
  const { api } = useProducerEvent();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [chamadoAtivo, setChamadoAtivo] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Central de Consulta Rápida (CPF, Pedido, Nome, Telefone)
  const [busca, setBusca] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);

  // Envio de Mensagem / Resposta
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Modal Novo Chamado
  const [modalNovo, setModalNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [pedidoId, setPedidoId] = useState('');
  const [assunto, setAssunto] = useState('');
  const [categoria, setCategoria] = useState('duvida');
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [mensagemInicial, setMensagemInicial] = useState('');

  const carregarChamados = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(`${api}/sac/chamados`, { signal: controller.signal });
      if (!res.ok) {
        if (res.status === 503) throw new Error('API Offline (503). Backend SAC não conectado.');
        throw new Error('Não foi possível carregar os chamados.');
      }
      const data = await res.json();
      const lista: Chamado[] = Array.isArray(data) ? data : (data.items || []);
      setChamados(lista);
      setChamadoAtivo((atual) => (atual ? (lista.find((c) => c.id === atual.id) || atual) : (lista[0] ?? null)));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Tempo limite ao carregar chamados.');
      } else {
        setError(err instanceof Error ? err.message : 'Falha na comunicação.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void carregarChamados();
  }, [carregarChamados]);

  // Consulta Rápida por CPF, Pedido, Nome, Telefone
  const executarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || busca.trim().length < 2) return;
    setBuscando(true);
    try {
      const res = await fetch(`${api}/sac/consultar?q=${encodeURIComponent(busca.trim())}`);
      if (!res.ok) throw new Error('Erro na consulta rápida.');
      const data = await res.json();
      setResultadoConsulta(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao consultar comprador.');
    } finally {
      setBuscando(false);
    }
  };

  // Enviar Mensagem no Chamado Ativo
  const enviarResposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !chamadoAtivo || !novaMensagem.trim()) return;
    setEnviando(true);
    try {
      const res = await fetch(`${api}/sac/chamados/${chamadoAtivo.id}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autorTipo: 'agente',
          autorNome: 'Atendente SAC',
          conteudo: novaMensagem.trim(),
        }),
      });
      if (!res.ok) throw new Error('Falha ao enviar mensagem.');
      setNovaMensagem('');
      await carregarChamados();
      // Recarrega o chamado ativo
      const cRes = await fetch(`${api}/sac/chamados/${chamadoAtivo.id}`);
      if (cRes.ok) setChamadoAtivo(await cRes.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao responder.');
    } finally {
      setEnviando(false);
    }
  };

  // Mudar Status do Chamado
  const alterarStatus = async (novoStatus: string) => {
    if (!api || !chamadoAtivo) return;
    try {
      const res = await fetch(`${api}/sac/chamados/${chamadoAtivo.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: novoStatus,
          agenteResponsavel: 'Atendente SAC',
          solucao: novoStatus === 'resolvido' ? 'Atendimento finalizado com sucesso' : undefined,
        }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar status.');
      await carregarChamados();
      const cRes = await fetch(`${api}/sac/chamados/${chamadoAtivo.id}`);
      if (cRes.ok) setChamadoAtivo(await cRes.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar status.');
    }
  };

  // Criar Chamado
  const submeterChamado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    try {
      const res = await fetch(`${api}/sac/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compradorNome: nome,
          compradorCpf: cpf,
          compradorEmail: email,
          compradorTelefone: telefone,
          pedidoId: pedidoId.trim() || undefined,
          assunto,
          categoria,
          prioridade,
          mensagemInicial,
        }),
      });
      if (!res.ok) throw new Error('Falha ao abrir chamado.');
      setModalNovo(false);
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setPedidoId('');
      setAssunto('');
      setMensagemInicial('');
      await carregarChamados();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao abrir chamado.');
    }
  };

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => filtroStatus === 'todos' || c.status === filtroStatus);
  }, [chamados, filtroStatus]);

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-[.18em]">
            <Headphones size={15} /> Atendimento ao Comprador Final (SAC)
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Central Operacional SAC</h1>
          <p className="text-slate-400 text-sm mt-1">
            Consulta Completa do comprador por CPF, pedido, telefone ou nome, gestão de tickets ITIL com SLA e triagem de estornos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void carregarChamados()}
            className="p-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            title="Atualizar"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => setModalNovo(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
          >
            <PlusCircle size={15} /> Abrir Chamado
          </button>
        </div>
      </header>

      {/* Central de Consulta Rápida */}
      <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-sky-500/20 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Sparkles size={16} /> Consulta Instantânea de Comprador
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Localize o comprador em segundos por <b>CPF (apenas números ou formatado)</b>, <b>Código do Pedido</b>, <b>Nome</b> ou <b>Telefone</b>.
          </p>

          <form onSubmit={executarConsulta} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Digite CPF, nº do pedido, nome ou celular..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-sky-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={buscando}
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {buscando ? 'Consultando...' : 'Buscar Comprador'}
            </button>
          </form>
        </div>

        {/* Resultado da Consulta Completa */}
        {resultadoConsulta && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 animate-fadeIn">
            {resultadoConsulta.encontrado ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                    <User size={15} /> Dados Cadastrais
                  </div>
                  <div className="text-sm font-bold text-white">{resultadoConsulta.comprador?.nome}</div>
                  <div className="text-xs text-slate-400">CPF: {resultadoConsulta.comprador?.cpf}</div>
                  <div className="text-xs text-slate-400">E-mail: {resultadoConsulta.comprador?.email}</div>
                  <div className="text-xs text-slate-400">Tel: {resultadoConsulta.comprador?.telefone}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Ticket size={15} /> Chamados & Histórico
                  </div>
                  <div className="text-2xl font-black text-white">{resultadoConsulta.comprador?.totalChamados}</div>
                  <div className="text-xs text-slate-400">
                    Chamados em aberto: <b>{resultadoConsulta.comprador?.chamadosAbertos}</b>
                  </div>
                  <div className="text-xs text-slate-400">
                    Estornos vinculados: <b>{resultadoConsulta.estornos?.length || 0}</b>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ações Rápidas</div>
                    <p className="text-xs text-slate-400 mt-1">Inicie um atendimento direto para este comprador.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (resultadoConsulta.comprador) {
                        setNome(resultadoConsulta.comprador.nome);
                        setCpf(resultadoConsulta.comprador.cpf);
                        setEmail(resultadoConsulta.comprador.email);
                        setTelefone(resultadoConsulta.comprador.telefone);
                        setModalNovo(true);
                      }
                    }}
                    className="w-full mt-3 py-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-bold transition"
                  >
                    Abrir Chamado p/ este Comprador
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                Nenhum comprador ou chamado encontrado com o termo "{busca}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Painel Operacional de Tickets (Grid com Lista e Thread de Atendimento) */}
      <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 items-start">
        {/* Lista de Chamados */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[750px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-sky-400" /> Fila de Chamados
            </h2>
            <div className="flex gap-1">
              {['todos', 'aberto', 'em_atendimento', 'resolvido'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                    filtroStatus === st
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-sky-400" />
                <span>Carregando fila...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center space-y-2">
                <div className="text-xs text-rose-400">{error}</div>
                <button
                  type="button"
                  onClick={() => carregarChamados()}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30 hover:bg-rose-500/30 transition inline-flex items-center gap-1.5"
                >
                  <RefreshCcw size={12} />
                  <span>Tentar novamente</span>
                </button>
              </div>
            ) : chamadosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Nenhum chamado encontrado.</div>
            ) : (
              chamadosFiltrados.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setChamadoAtivo(item)}
                  className={`p-4 cursor-pointer transition ${
                    chamadoAtivo?.id === item.id
                      ? 'bg-sky-500/10 border-l-4 border-sky-400'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{item.compradorNome}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        item.prioridade === 'urgente'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : item.prioridade === 'alta'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.prioridade}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1 truncate">{item.assunto}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thread do Chamado Ativo */}
        {chamadoAtivo ? (
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[750px]">
            {/* Topo do Ticket */}
            <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-400 font-bold">SAC-{chamadoAtivo.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-bold">{chamadoAtivo.assunto}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Comprador: <b>{chamadoAtivo.compradorNome}</b></span>
                  <span>CPF: <b>{chamadoAtivo.compradorCpf}</b></span>
                  <span>SLA Limite: <b>{new Date(chamadoAtivo.slaLimiteEm).toLocaleString('pt-BR')}</b></span>
                </div>
              </div>

              {/* Botões de Ação de Status */}
              <div className="flex items-center gap-2">
                {chamadoAtivo.status !== 'resolvido' ? (
                  <>
                    <button
                      onClick={() => alterarStatus('em_atendimento')}
                      className="px-3 py-1.5 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-300 text-xs font-semibold hover:bg-sky-600/30 transition"
                    >
                      Em Atendimento
                    </button>
                    <button
                      onClick={() => alterarStatus('resolvido')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 size={14} /> Resolver Ticket
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ✓ Ticket Resolvido
                  </span>
                )}
              </div>
            </div>

            {/* Mensagens do Ticket */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chamadoAtivo.mensagens?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${
                    msg.autorTipo === 'agente' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-300">{msg.autorNome}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.autorTipo === 'agente'
                        ? 'bg-sky-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.conteudo}
                  </div>
                </div>
              ))}
            </div>

            {/* Campo de Resposta */}
            <form onSubmit={enviarResposta} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                placeholder="Digite a resposta para o comprador..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={enviando || !novaMensagem.trim()}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                <Send size={14} /> Enviar
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-16 text-center text-slate-500 text-sm">
            Selecione um chamado na lista para iniciar o atendimento.
          </div>
        )}
      </div>

      {/* Modal de Abertura de Chamado */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle size={18} className="text-sky-400" /> Abertura de Novo Chamado SAC
            </h3>
            <p className="text-xs text-slate-400">
              Cadastre a solicitação com cálculo automático de SLA de acordo com a prioridade selecionada.
            </p>

            <form onSubmit={submeterChamado} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Nome do Comprador</span>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">CPF</span>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">E-mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="comprador@email.com"
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Telefone / WhatsApp</span>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(41) 99999-9999"
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Categoria</span>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="duvida">Dúvida Geral</option>
                    <option value="cancelamento">Cancelamento / Estorno</option>
                    <option value="ingresso">Ingresso / Troca de Titular</option>
                    <option value="pagamento">Pagamento / Pix</option>
                    <option value="outro">Outro</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Prioridade & SLA</span>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as any)}
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="baixa">Baixa (24h)</option>
                    <option value="media">Média (24h)</option>
                    <option value="alta">Alta (12h)</option>
                    <option value="urgente">Urgente P1 (4h)</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400">Nº Pedido (Opcional)</span>
                  <input
                    type="text"
                    value={pedidoId}
                    onChange={(e) => setPedidoId(e.target.value)}
                    placeholder="UUID do pedido"
                    className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-slate-400">Assunto Resumido</span>
                <input
                  type="text"
                  required
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Não recebi o ingresso por e-mail após pagamento Pix"
                  className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-400">Mensagem / Relato do Comprador</span>
                <textarea
                  rows={4}
                  required
                  value={mensagemInicial}
                  onChange={(e) => setMensagemInicial(e.target.value)}
                  placeholder="Descreva detalhadamente o ocorrido..."
                  className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-sky-500"
                />
              </label>

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
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
                >
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
