'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type PapelUsuario =
  | 'ADMIN_DISKINGRESSOS'
  | 'OPERADOR_DISKINGRESSOS'
  | 'FINANCEIRO_DISKINGRESSOS'
  | 'PRODUTOR_ADMIN'
  | 'PRODUTOR_OPERADOR'
  | 'PORTARIA_CHECKIN';

export type EscopoVisao = 'DISKINGRESSOS' | 'PRODUTOR';
export type EnterpriseWorkspace = 'ALL' | 'CORPORATE' | 'PRODUCER' | 'OPERATIONS' | 'INTELLIGENCE';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  escopoVisao: EscopoVisao;
  produtorId: string | null;
  produtorNome: string | null;
  permissoes: string[];
}

export interface ProdutorOpcao {
  id: string;
  nome: string;
}

export interface AuthSessionContextValue {
  currentUser: UsuarioSessao;
  currentVision: EscopoVisao;
  selectedProducer: ProdutorOpcao | null;
  availableProducers: ProdutorOpcao[];
  workspace: EnterpriseWorkspace;
  setWorkspace: (ws: EnterpriseWorkspace) => void;
  switchVision: (vision: EscopoVisao, producer?: ProdutorOpcao) => void;
  hasPermission: (permission: string) => boolean;
  isRouteAllowed: (pathname: string) => boolean;
  isAdmin: boolean;
  isProducer: boolean;
}

const DEFAULT_ADMIN_USER: UsuarioSessao = {
  id: 'usr-admin-master',
  nome: 'Vinicius Casagrande (Admin Master)',
  email: 'vinicius@diskingressos.com.br',
  papel: 'ADMIN_DISKINGRESSOS',
  escopoVisao: 'DISKINGRESSOS',
  produtorId: null,
  produtorNome: null,
  permissoes: [
    'eventos:read_all',
    'eventos:write',
    'financeiro:global_ledger',
    'financeiro:aprovar_repasse',
    'financeiro:portal_produtor',
    'contabilidade:read',
    'fechamento:read_all',
    'cash_forecast:read',
    'riscos:circuit_breaker',
    'fpa:budget_manage',
    'usuarios:manage_all',
    'portaria:validar_ingresso',
  ],
};

const DEFAULT_PRODUCER_USER: UsuarioSessao = {
  id: 'usr-prod-livenation',
  nome: 'Carlos Eduardo (Live Nation)',
  email: 'carlos.eduardo@livenation.com.br',
  papel: 'PRODUTOR_ADMIN',
  escopoVisao: 'PRODUTOR',
  produtorId: 'prod-live-nation',
  produtorNome: 'Live Nation Brasil Produções',
  permissoes: [
    'eventos:read_tenant',
    'eventos:write',
    'financeiro:portal_produtor',
    'financeiro:solicitar_repasse',
    'portaria:validar_ingresso',
    'usuarios:manage_team',
  ],
};

const AVAILABLE_PRODUCERS: ProdutorOpcao[] = [
  { id: 'prod-live-nation', nome: 'Live Nation Brasil Produções' },
  { id: 'prod-opus-entretenimento', nome: 'Opus Entretenimento e Eventos' },
  { id: 'prod-t4f', nome: 'Time For Fun / T4F' },
  { id: 'prod-festival-verao', nome: 'Festival de Verão Produções' },
];

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [currentVision, setCurrentVision] = useState<EscopoVisao>('DISKINGRESSOS');
  const [currentUser, setCurrentUser] = useState<UsuarioSessao>(DEFAULT_ADMIN_USER);
  const [selectedProducer, setSelectedProducer] = useState<ProdutorOpcao | null>(null);
  const [workspace, setWorkspaceState] = useState<EnterpriseWorkspace>('ALL');

  // Inicializa a sessão a partir do localStorage
  useEffect(() => {
    try {
      const savedVision = localStorage.getItem('diskingressos_auth_vision') as EscopoVisao | null;
      const savedProdId = localStorage.getItem('diskingressos_auth_producer_id');
      const savedWs = localStorage.getItem('diskingressos_auth_workspace') as EnterpriseWorkspace | null;

      if (savedWs) setWorkspaceState(savedWs);

      if (savedVision === 'PRODUTOR') {
        const prod = AVAILABLE_PRODUCERS.find((p) => p.id === savedProdId) || AVAILABLE_PRODUCERS[0]!;
        setCurrentVision('PRODUTOR');
        setSelectedProducer(prod);
        setCurrentUser({
          ...DEFAULT_PRODUCER_USER,
          produtorId: prod.id,
          produtorNome: prod.nome,
        });
      }
    } catch {}
  }, []);

  const setWorkspace = useCallback((ws: EnterpriseWorkspace) => {
    setWorkspaceState(ws);
    try {
      localStorage.setItem('diskingressos_auth_workspace', ws);
    } catch {}
  }, []);

  const switchVision = useCallback((vision: EscopoVisao, producer?: ProdutorOpcao) => {
    if (vision === 'PRODUTOR') {
      const prod = producer || selectedProducer || AVAILABLE_PRODUCERS[0]!;
      setCurrentVision('PRODUTOR');
      setSelectedProducer(prod);
      setCurrentUser({
        ...DEFAULT_PRODUCER_USER,
        id: `usr-sim-${prod.id}`,
        nome: `Gestor (${prod.nome.split(' ')[0]})`,
        produtorId: prod.id,
        produtorNome: prod.nome,
      });

      try {
        localStorage.setItem('diskingressos_auth_vision', 'PRODUTOR');
        localStorage.setItem('diskingressos_auth_producer_id', prod.id);
      } catch {}
    } else {
      setCurrentVision('DISKINGRESSOS');
      setSelectedProducer(null);
      setCurrentUser(DEFAULT_ADMIN_USER);

      try {
        localStorage.setItem('diskingressos_auth_vision', 'DISKINGRESSOS');
        localStorage.removeItem('diskingressos_auth_producer_id');
      } catch {}
    }
  }, [selectedProducer]);

  const hasPermission = useCallback(
    (permission: string) => {
      return currentUser.permissoes.includes(permission);
    },
    [currentUser],
  );

  const isRouteAllowed = useCallback(
    (pathname: string) => {
      // Se for visão DiskIngressos (Admin Master), tem acesso total
      if (currentVision === 'DISKINGRESSOS') return true;

      // Se for visão do Produtor, bloqueia módulos corporativos internos da DiskIngressos
      const restrictedPrefixes = [
        '/contabilidade',
        '/financeiro/fpa',
        '/financeiro/riscos',
        '/financeiro/liquidez',
        '/financeiro/control-tower',
        '/financeiro/conciliacao',
        '/fechamento',
        '/operacao',
        '/automacoes',
        '/comercial',
      ];

      return !restrictedPrefixes.some((prefix) => pathname.startsWith(prefix));
    },
    [currentVision],
  );

  const value = useMemo(
    () => ({
      currentUser,
      currentVision,
      selectedProducer,
      availableProducers: AVAILABLE_PRODUCERS,
      workspace,
      setWorkspace,
      switchVision,
      hasPermission,
      isRouteAllowed,
      isAdmin: currentVision === 'DISKINGRESSOS',
      isProducer: currentVision === 'PRODUTOR',
    }),
    [currentUser, currentVision, selectedProducer, workspace, setWorkspace, switchVision, hasPermission, isRouteAllowed],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error('useAuthSession deve ser utilizado dentro de um AuthSessionProvider');
  }
  return ctx;
}
