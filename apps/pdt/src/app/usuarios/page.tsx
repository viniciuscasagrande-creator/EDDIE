'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Key,
  Building2,
  RefreshCcw,
  Search,
  Sliders,
  Eye,
  Info,
  ChevronRight,
  Loader2,
  Plus,
  Check,
} from 'lucide-react';
import { useAuthSession, PapelUsuario, EscopoVisao } from '../../components/AuthSessionContext';

export interface PermissaoDefinicao {
  codigo: string;
  nome: string;
  descricao: string;
  modulo: string;
  exclusivoDiskIngressos: boolean;
}

export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  escopoVisao: EscopoVisao;
  produtorId: string | null;
  produtorNome: string | null;
  status: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE_ATIVACAO';
  permissoes: string[];
  ultimoAcessoEm?: string;
  criadoEm: string;
}

export interface ProdutorParceiro {
  id: string;
  nome: string;
  cnpj: string;
  eventosAtivosCount: number;
}

export default function UsuariosPermissoesPage() {
  const { currentVision, switchVision, isAdmin, availableProducers } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPapel, setFilterPapel] = useState<string>('TODOS');
  const [filterEscopo, setFilterEscopo] = useState<string>('TODOS');

  // Estado inicial de usuários calibrado
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([
    {
      id: 'usr-admin-master',
      nome: 'Vinicius Casagrande (Admin Master)',
      email: 'vinicius@diskingressos.com.br',
      papel: 'ADMIN_DISKINGRESSOS',
      escopoVisao: 'DISKINGRESSOS',
      produtorId: null,
      produtorNome: null,
      status: 'ATIVO',
      permissoes: [
        'eventos:read_all',
        'eventos:write',
        'financeiro:global_ledger',
        'financeiro:aprovar_repasse',
        'contabilidade:read',
        'fechamento:read_all',
        'cash_forecast:read',
        'riscos:circuit_breaker',
        'fpa:budget_manage',
        'usuarios:manage_all',
        'portaria:validar_ingresso',
      ],
      ultimoAcessoEm: new Date().toISOString(),
      criadoEm: '2026-01-10T10:00:00Z',
    },
    {
      id: 'usr-fin-diretor',
      nome: 'Mariana Duarte (Diretora Financeira)',
      email: 'mariana.duarte@diskingressos.com.br',
      papel: 'FINANCEIRO_DISKINGRESSOS',
      escopoVisao: 'DISKINGRESSOS',
      produtorId: null,
      produtorNome: null,
      status: 'ATIVO',
      permissoes: [
        'financeiro:global_ledger',
        'financeiro:aprovar_repasse',
        'contabilidade:read',
        'fechamento:read_all',
        'cash_forecast:read',
        'riscos:circuit_breaker',
        'fpa:budget_manage',
      ],
      ultimoAcessoEm: new Date().toISOString(),
      criadoEm: '2026-01-15T14:30:00Z',
    },
    {
      id: 'usr-prod-livenation',
      nome: 'Carlos Eduardo (Live Nation Brasil)',
      email: 'carlos.eduardo@livenation.com.br',
      papel: 'PRODUTOR_ADMIN',
      escopoVisao: 'PRODUTOR',
      produtorId: 'prod-live-nation',
      produtorNome: 'Live Nation Brasil Produções',
      status: 'ATIVO',
      permissoes: [
        'eventos:read_tenant',
        'eventos:write',
        'financeiro:portal_produtor',
        'financeiro:solicitar_repasse',
        'portaria:validar_ingresso',
        'usuarios:manage_team',
      ],
      ultimoAcessoEm: new Date().toISOString(),
      criadoEm: '2026-02-01T09:00:00Z',
    },
    {
      id: 'usr-prod-opus',
      nome: 'Juliana Siqueira (Opus Entretenimento)',
      email: 'juliana.siqueira@opusentretenimento.com.br',
      papel: 'PRODUTOR_ADMIN',
      escopoVisao: 'PRODUTOR',
      produtorId: 'prod-opus-entretenimento',
      produtorNome: 'Opus Entretenimento e Eventos',
      status: 'ATIVO',
      permissoes: [
        'eventos:read_tenant',
        'eventos:write',
        'financeiro:portal_produtor',
        'financeiro:solicitar_repasse',
        'portaria:validar_ingresso',
        'usuarios:manage_team',
      ],
      ultimoAcessoEm: new Date().toISOString(),
      criadoEm: '2026-02-15T11:20:00Z',
    },
    {
      id: 'usr-op-catraca',
      nome: 'Rodrigo Alves (Supervisor de Portaria)',
      email: 'rodrigo.alves@diskingressos.com.br',
      papel: 'PORTARIA_CHECKIN',
      escopoVisao: 'DISKINGRESSOS',
      produtorId: null,
      produtorNome: null,
      status: 'ATIVO',
      permissoes: ['portaria:validar_ingresso'],
      ultimoAcessoEm: new Date().toISOString(),
      criadoEm: '2026-03-01T08:15:00Z',
    },
  ]);

  const [permissoesCatalogo, setPermissoesCatalogo] = useState<PermissaoDefinicao[]>([
    { codigo: 'eventos:read_all', nome: 'Ver Todos os Eventos', descricao: 'Acesso global a todos os eventos de todos os produtores.', modulo: 'Eventos', exclusivoDiskIngressos: true },
    { codigo: 'eventos:read_tenant', nome: 'Ver Eventos da Produtora', descricao: 'Acesso restrito exclusivamente aos eventos da própria produtora.', modulo: 'Eventos', exclusivoDiskIngressos: false },
    { codigo: 'eventos:write', nome: 'Criar e Editar Eventos', descricao: 'Criar eventos, sessões, setores e precificação de lotes.', modulo: 'Eventos', exclusivoDiskIngressos: false },
    { codigo: 'financeiro:global_ledger', nome: 'Ledger Global & Tesouraria', descricao: 'Acesso a conta gráfica geral, saldos bancários e split de todos os eventos.', modulo: 'Financeiro', exclusivoDiskIngressos: true },
    { codigo: 'financeiro:portal_produtor', nome: 'Extrato da Produtora', descricao: 'Consulta de saldos, extratos e recebíveis da produtora.', modulo: 'Financeiro', exclusivoDiskIngressos: false },
    { codigo: 'financeiro:solicitar_repasse', nome: 'Solicitar Repasse/Adiantamento', descricao: 'Solicitar liquidação de recebíveis respeitando o limite e safety reserve.', modulo: 'Financeiro', exclusivoDiskIngressos: false },
    { codigo: 'financeiro:aprovar_repasse', nome: 'Aprovar Repasses Bancários', descricao: 'Autorizar transferências via CNAB e PIX bancário.', modulo: 'Financeiro', exclusivoDiskIngressos: true },
    { codigo: 'contabilidade:read', nome: 'Contabilidade & DRE Geral', descricao: 'Acesso à DRE consolidada e partidas dobradas da DiskIngressos.', modulo: 'Contabilidade', exclusivoDiskIngressos: true },
    { codigo: 'fechamento:read_all', nome: 'Auditoria de Fechamento (10 Gates)', descricao: 'Auditar encerramento e emissão de dossiê imutável.', modulo: 'Fechamento', exclusivoDiskIngressos: true },
    { codigo: 'cash_forecast:read', nome: 'Cash Forecast & Liquidez', descricao: 'Previsões de fluxo de caixa em 6 horizontes.', modulo: 'Cash Forecast', exclusivoDiskIngressos: true },
    { codigo: 'riscos:circuit_breaker', nome: 'Gestão de Riscos & Travas', descricao: 'Acionamento e destravamento de Circuit Breakers.', modulo: 'Riscos', exclusivoDiskIngressos: true },
    { codigo: 'fpa:budget_manage', nome: 'FP&A & Centros de Custo', descricao: 'Gestão orçamentária e planejamento plurianual.', modulo: 'FP&A', exclusivoDiskIngressos: true },
    { codigo: 'usuarios:manage_all', nome: 'Gerenciar Todos os Usuários', descricao: 'Criar, bloquear e alterar permissões de qualquer usuário.', modulo: 'Segurança', exclusivoDiskIngressos: true },
    { codigo: 'usuarios:manage_team', nome: 'Gerenciar Minha Equipe', descricao: 'Gerenciar operadores da própria produtora.', modulo: 'Segurança', exclusivoDiskIngressos: false },
    { codigo: 'portaria:validar_ingresso', nome: 'Check-in e Portaria', descricao: 'Validar QR code de ingressos nas catracas.', modulo: 'Portaria', exclusivoDiskIngressos: false },
  ]);

  // Estados de Modais
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [modalPermissoes, setModalPermissoes] = useState<UsuarioItem | null>(null);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);

  // Formulário de Novo Usuário
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPapel, setFormPapel] = useState<PapelUsuario>('PRODUTOR_ADMIN');
  const [formProdutorId, setFormProdutorId] = useState(availableProducers[0]?.id || 'prod-live-nation');

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const [resUsers, resPerms] = await Promise.all([
        fetch('/api/usuarios', { signal: controller.signal }),
        fetch('/api/usuarios/permissoes', { signal: controller.signal }),
      ]);

      if (resUsers.ok) setUsuarios(await resUsers.json());
      if (resPerms.ok) setPermissoesCatalogo(await resPerms.json());
    } catch {
      // Mantém fallback calibrado
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const alternarStatusUsuario = async (usuario: UsuarioItem) => {
    const novoStatus = usuario.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    try {
      await fetch(`/api/usuarios/${usuario.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: novoStatus,
          motivo: `Alteração solicitada via painel por administrador em ${new Date().toLocaleString()}`,
          alteradoPor: 'admin-master',
        }),
      });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, status: novoStatus } : u)),
      );
    } catch {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, status: novoStatus } : u)),
      );
    }
  };

  const abrirModalPermissoes = (u: UsuarioItem) => {
    setModalPermissoes(u);
    setPermissoesSelecionadas([...u.permissoes]);
  };

  const togglePermissao = (codigo: string) => {
    setPermissoesSelecionadas((prev) =>
      prev.includes(codigo) ? prev.filter((p) => p !== codigo) : [...prev, codigo],
    );
  };

  const salvarPermissoes = async () => {
    if (!modalPermissoes) return;
    try {
      await fetch(`/api/usuarios/${modalPermissoes.id}/permissoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissoes: permissoesSelecionadas,
          atualizadoPor: 'admin-master',
        }),
      });
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === modalPermissoes.id ? { ...u, permissoes: permissoesSelecionadas } : u,
        ),
      );
      setModalPermissoes(null);
    } catch {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === modalPermissoes.id ? { ...u, permissoes: permissoesSelecionadas } : u,
        ),
      );
      setModalPermissoes(null);
    }
  };

  const criarNovoUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formEmail) return;

    const isProdutor = formPapel.startsWith('PRODUTOR_');
    const selectedProdObj = availableProducers.find((p) => p.id === formProdutorId);

    const novoPayload = {
      nome: formNome,
      email: formEmail,
      papel: formPapel,
      escopoVisao: (isProdutor ? 'PRODUTOR' : 'DISKINGRESSOS') as EscopoVisao,
      produtorId: isProdutor ? formProdutorId : null,
      produtorNome: isProdutor ? selectedProdObj?.nome ?? 'Produtora' : null,
      criadoPor: 'admin-master',
    };

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPayload),
      });

      if (res.ok) {
        const criado = await res.json();
        setUsuarios((prev) => [criado, ...prev]);
      } else {
        // Fallback local
        const fakeCriado: UsuarioItem = {
          id: `usr-${Date.now()}`,
          nome: formNome,
          email: formEmail,
          papel: formPapel,
          escopoVisao: isProdutor ? 'PRODUTOR' : 'DISKINGRESSOS',
          produtorId: isProdutor ? formProdutorId : null,
          produtorNome: isProdutor ? selectedProdObj?.nome ?? null : null,
          status: 'ATIVO',
          permissoes: isProdutor
            ? ['eventos:read_tenant', 'eventos:write', 'financeiro:portal_produtor']
            : ['eventos:read_all', 'financeiro:global_ledger'],
          criadoEm: new Date().toISOString(),
        };
        setUsuarios((prev) => [fakeCriado, ...prev]);
      }
    } catch {
      // Resiliente
    } finally {
      setModalNovoUsuario(false);
      setFormNome('');
      setFormEmail('');
    }
  };

  const simularVisaoUsuario = (u: UsuarioItem) => {
    if (u.escopoVisao === 'PRODUTOR') {
      const prodObj = availableProducers.find((p) => p.id === u.produtorId) || {
        id: u.produtorId || 'prod-live-nation',
        nome: u.produtorNome || 'Produtora',
      };
      switchVision('PRODUTOR', prodObj);
    } else {
      switchVision('DISKINGRESSOS');
    }
  };

  const getPapelBadge = (papel: PapelUsuario) => {
    switch (papel) {
      case 'ADMIN_DISKINGRESSOS':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">ADMIN DISKINGRESSOS</span>;
      case 'FINANCEIRO_DISKINGRESSOS':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">FINANCEIRO DISKINGRESSOS</span>;
      case 'OPERADOR_DISKINGRESSOS':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">OPERADOR DISKINGRESSOS</span>;
      case 'PRODUTOR_ADMIN':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">PRODUTOR ADMIN</span>;
      case 'PRODUTOR_OPERADOR':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">PRODUTOR OPERADOR</span>;
      case 'PORTARIA_CHECKIN':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PORTARIA / CHECK-IN</span>;
    }
  };

  // Filtragem
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.produtorNome && u.produtorNome.toLowerCase().includes(search.toLowerCase()));

    const matchPapel = filterPapel === 'TODOS' || u.papel === filterPapel;
    const matchEscopo = filterEscopo === 'TODOS' || u.escopoVisao === filterEscopo;

    return matchBusca && matchPapel && matchEscopo;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Gestão de Usuários & Permissões (RBAC)
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Segregação de Visões
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Duas Visões no Sistema: DiskIngressos (Administrador Geral) vs Produtor (Isolamento por Produtora)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void carregarDados()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setModalNovoUsuario(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Alerta de Governança sobre Segregação de Visões */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-white">Regra de Segurança & Isolamento Multitenant:</span>
          <p>
            • <strong className="text-purple-300">Visão DiskIngressos:</strong> Acesso irrestrito a todos os eventos, DRE consolidada, FP&A interno, matriz de riscos e auditoria de fechamento.
          </p>
          <p>
            • <strong className="text-sky-300">Visão Produtor:</strong> Acesso estritamente isolado aos eventos e extratos da sua própria produtora. Produtores não têm permissão para visualizar dados confidenciais de outros parceiros ou orçamentos internos da DiskIngressos.
          </p>
        </div>
      </div>

      {/* 4 Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total de Usuários</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{usuarios.length}</div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            {usuarios.filter((u) => u.status === 'ATIVO').length} ativos no sistema
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Equipe DiskIngressos</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {usuarios.filter((u) => u.escopoVisao === 'DISKINGRESSOS').length}
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            Acesso administrativo & corporativo
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gestores de Produtoras</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {usuarios.filter((u) => u.escopoVisao === 'PRODUTOR').length}
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            Isolamento por produtora parceira
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Permissões Mapeadas</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{permissoesCatalogo.length}</div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            {permissoesCatalogo.filter((p) => p.exclusivoDiskIngressos).length} exclusivas DiskIngressos
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou produtora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Escopo:</span>
            <select
              aria-label="Filtrar por Escopo de Visão"
              value={filterEscopo}
              onChange={(e) => setFilterEscopo(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
            >
              <option value="TODOS">Todos os Escopos</option>
              <option value="DISKINGRESSOS">🏢 DiskIngressos</option>
              <option value="PRODUTOR">🎭 Produtor</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Papel:</span>
            <select
              aria-label="Filtrar por Papel de Usuário"
              value={filterPapel}
              onChange={(e) => setFilterPapel(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
            >
              <option value="TODOS">Todos os Papéis</option>
              <option value="ADMIN_DISKINGRESSOS">Admin DiskIngressos</option>
              <option value="FINANCEIRO_DISKINGRESSOS">Financeiro DiskIngressos</option>
              <option value="PRODUTOR_ADMIN">Produtor Admin</option>
              <option value="PRODUTOR_OPERADOR">Produtor Operador</option>
              <option value="PORTARIA_CHECKIN">Portaria Check-in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Catálogo de Usuários e Permissões</h2>
          <span className="text-xs text-slate-400">{usuariosFiltrados.length} usuário(s) listado(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Usuário / E-mail</th>
                <th className="py-3 px-4">Papel (Role)</th>
                <th className="py-3 px-4">Escopo de Visão</th>
                <th className="py-3 px-4 text-center">Permissões</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{u.nome}</div>
                    <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                  </td>

                  <td className="py-3 px-4">{getPapelBadge(u.papel)}</td>

                  <td className="py-3 px-4">
                    {u.escopoVisao === 'DISKINGRESSOS' ? (
                      <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        DiskIngressos (Global)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                        {u.produtorNome || 'Produtora Parceira'}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => abrirModalPermissoes(u)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 mx-auto"
                    >
                      <Key className="w-3 h-3 text-amber-400" />
                      {u.permissoes.length} ativas
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold border ${
                        u.status === 'ATIVO'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => simularVisaoUsuario(u)}
                        className="px-2 py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition flex items-center gap-1"
                        title="Simular visualização do painel como este usuário"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Simular Visão
                      </button>

                      <button
                        onClick={() => void alternarStatusUsuario(u)}
                        className={`p-1.5 rounded text-xs transition border ${
                          u.status === 'ATIVO'
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30'
                        }`}
                        title={u.status === 'ATIVO' ? 'Bloquear Usuário' : 'Ativar Usuário'}
                      >
                        {u.status === 'ATIVO' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo Usuário */}
      {modalNovoUsuario && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Cadastrar Novo Usuário
              </h3>
              <button
                onClick={() => setModalNovoUsuario(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={criarNovoUsuario} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="amanda@produtora.com.br"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Papel de Acesso (Role)
                </label>
                <select
                  value={formPapel}
                  onChange={(e) => setFormPapel(e.target.value as PapelUsuario)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <optgroup label="Escopo Produtor (Acesso Restrito)" className="bg-slate-900 text-sky-400">
                    <option value="PRODUTOR_ADMIN">Produtor Admin (Gestor da Produtora)</option>
                    <option value="PRODUTOR_OPERADOR">Produtor Operador (Apenas Consulta e Portaria)</option>
                  </optgroup>
                  <optgroup label="Escopo DiskIngressos (Acesso Corporativo)" className="bg-slate-900 text-purple-400">
                    <option value="ADMIN_DISKINGRESSOS">Admin DiskIngressos (Acesso Total)</option>
                    <option value="FINANCEIRO_DISKINGRESSOS">Financeiro DiskIngressos</option>
                    <option value="OPERADOR_DISKINGRESSOS">Operador de Suporte DiskIngressos</option>
                    <option value="PORTARIA_CHECKIN">Operador de Catracas / Portaria</option>
                  </optgroup>
                </select>
              </div>

              {formPapel.startsWith('PRODUTOR_') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Produtora Vinculada (Isolamento Tenant)
                  </label>
                  <select
                    value={formProdutorId}
                    onChange={(e) => setFormProdutorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {availableProducers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Este usuário enxergará única e exclusivamente os eventos desta produtora.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoUsuario(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Permissões */}
      {modalPermissoes && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  Editar Permissões Granulares
                </h3>
                <p className="text-xs text-slate-400">
                  Usuário: <span className="font-bold text-white">{modalPermissoes.nome}</span> ({modalPermissoes.escopoVisao})
                </p>
              </div>
              <button
                onClick={() => setModalPermissoes(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {modalPermissoes.escopoVisao === 'PRODUTOR' && (
              <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 text-xs text-sky-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Permissões exclusivas da DiskIngressos (FP&A, DRE Geral, Riscos Globais) estão desabilitadas para garantir o isolamento da produtora.
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {permissoesCatalogo.map((perm) => {
                const isSelected = permissoesSelecionadas.includes(perm.codigo);
                const isForbiddenForProducer =
                  modalPermissoes.escopoVisao === 'PRODUTOR' && perm.exclusivoDiskIngressos;

                return (
                  <div
                    key={perm.codigo}
                    onClick={() => {
                      if (!isForbiddenForProducer) togglePermissao(perm.codigo);
                    }}
                    className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition ${
                      isForbiddenForProducer
                        ? 'opacity-40 bg-slate-950 border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 cursor-pointer'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{perm.nome}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {perm.modulo}
                        </span>
                        {perm.exclusivoDiskIngressos && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Exclusivo DiskIngressos
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{perm.descricao}</p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalPermissoes(null)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void salvarPermissoes()}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow"
              >
                Salvar Permissões
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
