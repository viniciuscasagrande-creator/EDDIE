'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  QrCode,
  Smartphone,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Send,
  Building,
  HeartPulse,
  BadgeCheck,
  ExternalLink,
  ShieldAlert,
  X,
  Layers,
  GraduationCap,
  HardHat,
  SmartphoneNfc,
  Settings,
  Lock,
  CreditCard,
  Utensils,
  ShoppingCart,
  Car,
  Copy,
  Sliders,
  Ticket,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { useAuthSession } from '../../components/AuthSessionContext';
import { ModuleNavigation, type ModuleNavigationItem } from '../../components/navigation/ModuleNavigation';

// --- TIPOS DE ABAS DO MENU HIERÁRQUICO V2.1 ---
export type RHTab =
  | 'visao'
  | 'aprovacoes'
  | 'pessoas'
  | 'dp'
  | 'ponto'
  | 'talentos'
  | 'seguranca'
  | 'eventos'
  | 'portais'
  | 'administracao';

// --- MOCK DATA ---
interface Colaborador {
  id: string;
  matricula: string;
  nome: string;
  cargo: string;
  departamento: string;
  tipoContrato: 'CLT' | 'PJ' | 'TEMPORARIO' | 'ESTAGIO';
  salario: number;
  admissao: string;
  status: 'ATIVO' | 'FERIAS' | 'AFASTADO' | 'DESLIGADO';
  geofenceAutorizada: string;
  avatar: string;
  email: string;
  bancoHoras: string;
  asoValidade: string;
}

const colaboradoresIniciais: Colaborador[] = [
  {
    id: 'colab-001',
    matricula: 'DK-1042',
    nome: 'Karine Santos',
    cargo: 'Supervisora Financeira & RH',
    departamento: 'Controladoria & RH',
    tipoContrato: 'CLT',
    salario: 8400.0,
    admissao: '12/03/2021',
    status: 'ATIVO',
    geofenceAutorizada: 'Sede DiskIngressos Curitiba (150m)',
    avatar: 'KS',
    email: 'karine@diskingressos.com.br',
    bancoHoras: '+14h 20m',
    asoValidade: '15/11/2026',
  },
  {
    id: 'colab-002',
    matricula: 'DK-1088',
    nome: 'Lucas Ferreira dos Santos',
    cargo: 'Coordenador Operacional de Eventos',
    departamento: 'Operações & Portaria',
    tipoContrato: 'CLT',
    salario: 6200.0,
    admissao: '05/08/2022',
    status: 'ATIVO',
    geofenceAutorizada: 'Ligga Arena (300m)',
    avatar: 'LF',
    email: 'lucas.santos@diskingressos.com.br',
    bancoHoras: '+28h 40m',
    asoValidade: '20/12/2026',
  },
  {
    id: 'colab-003',
    matricula: 'DK-1102',
    nome: 'Mariana Duarte Souza',
    cargo: 'Analista de Departamento Pessoal',
    departamento: 'Recursos Humanos',
    tipoContrato: 'CLT',
    salario: 4800.0,
    admissao: '10/01/2023',
    status: 'ATIVO',
    geofenceAutorizada: 'Sede DiskIngressos Curitiba (150m)',
    avatar: 'MD',
    email: 'mariana.duarte@diskingressos.com.br',
    bancoHoras: '+04h 15m',
    asoValidade: '08/04/2027',
  },
  {
    id: 'colab-004',
    matricula: 'DK-2015',
    nome: 'Rafael Albuquerque Lima',
    cargo: 'Operador de Catraca & Credenciamento',
    departamento: 'Staff de Eventos',
    tipoContrato: 'TEMPORARIO',
    salario: 2400.0,
    admissao: '01/09/2026',
    status: 'ATIVO',
    geofenceAutorizada: 'Ligga Arena (300m)',
    avatar: 'RA',
    email: 'rafael.albuquerque@staff.diskingressos.com.br',
    bancoHoras: '+08h 00m',
    asoValidade: '01/09/2027',
  },
  {
    id: 'colab-005',
    matricula: 'DK-2019',
    nome: 'Beatriz Almeida Rocha',
    cargo: 'Líder de Atendimento & Bilheteria',
    departamento: 'Bilheteria & SAC',
    tipoContrato: 'CLT',
    salario: 4200.0,
    admissao: '15/05/2023',
    status: 'FERIAS',
    geofenceAutorizada: 'Pedreira Paulo Leminski (400m)',
    avatar: 'BA',
    email: 'beatriz.almeida@diskingressos.com.br',
    bancoHoras: '00h 00m',
    asoValidade: '15/05/2027',
  },
];

interface RegistroPontoSimulado {
  id: string;
  nsr: number;
  colaborador: string;
  matricula: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'INICIO_INTERVALO' | 'FIM_INTERVALO';
  timestamp: string;
  localizacao: string;
  dentroGeofence: boolean;
  distanciaMetros: number;
  hashSHA256: string;
  dispositivo: string;
}

const registrosPontoMock: RegistroPontoSimulado[] = [
  {
    id: 'rep-99120',
    nsr: 48921,
    colaborador: 'Karine Santos',
    matricula: 'DK-1042',
    tipo: 'ENTRADA',
    timestamp: '05/10/2026 08:02:14',
    localizacao: 'Sede DiskIngressos Curitiba',
    dentroGeofence: true,
    distanciaMetros: 12,
    hashSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    dispositivo: 'Disk Ponto App v2.4 (Android)',
  },
  {
    id: 'rep-99121',
    nsr: 48922,
    colaborador: 'Mariana Duarte Souza',
    matricula: 'DK-1102',
    tipo: 'ENTRADA',
    timestamp: '05/10/2026 08:15:33',
    localizacao: 'Sede DiskIngressos Curitiba',
    dentroGeofence: true,
    distanciaMetros: 24,
    hashSHA256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    dispositivo: 'Disk Ponto App v2.4 (iOS)',
  },
  {
    id: 'rep-99122',
    nsr: 48923,
    colaborador: 'Lucas Ferreira dos Santos',
    matricula: 'DK-1088',
    tipo: 'ENTRADA',
    timestamp: '05/10/2026 08:30:05',
    localizacao: 'Ligga Arena (Arena da Baixada)',
    dentroGeofence: true,
    distanciaMetros: 45,
    hashSHA256: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    dispositivo: 'Disk Ponto Totem REP-P #01',
  },
  {
    id: 'rep-99123',
    nsr: 48924,
    colaborador: 'Rafael Albuquerque Lima',
    matricula: 'DK-2015',
    tipo: 'ENTRADA',
    timestamp: '05/10/2026 09:00:18',
    localizacao: 'Ligga Arena (Arena da Baixada)',
    dentroGeofence: true,
    distanciaMetros: 38,
    hashSHA256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    dispositivo: 'Disk Ponto Totem REP-P #02',
  },
];

interface GeofenceItem {
  id: string;
  nome: string;
  endereco: string;
  tipo: 'SEDE' | 'ARENA' | 'TEATRO' | 'ESPACO_ABERTO';
  latitude: number;
  longitude: number;
  raioMetros: number;
  colaboradoresAtivos: number;
  eventoVinculado?: string;
}

const geofencesMock: GeofenceItem[] = [
  {
    id: 'geo-01',
    nome: 'Sede Corporativa DiskIngressos',
    endereco: 'Rua Visconde de Nácar, 1440 - Curitiba, PR',
    tipo: 'SEDE',
    latitude: -25.4312,
    longitude: -49.2785,
    raioMetros: 150,
    colaboradoresAtivos: 22,
  },
  {
    id: 'geo-02',
    nome: 'Ligga Arena (Arena da Baixada)',
    endereco: 'Rua Buenos Aires, 1260 - Curitiba, PR',
    tipo: 'ARENA',
    latitude: -25.4484,
    longitude: -49.277,
    raioMetros: 300,
    colaboradoresAtivos: 14,
    eventoVinculado: 'Festival DiskIngressos Live 2026',
  },
  {
    id: 'geo-03',
    nome: 'Pedreira Paulo Leminski',
    endereco: 'Rua João Gava, 970 - Curitiba, PR',
    tipo: 'ESPACO_ABERTO',
    latitude: -25.3855,
    longitude: -49.2778,
    raioMetros: 400,
    colaboradoresAtivos: 6,
    eventoVinculado: 'Turnê Nacional Rock Fest 2026',
  },
  {
    id: 'geo-04',
    nome: 'Teatro Positivo Grande Auditório',
    endereco: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300 - Curitiba, PR',
    tipo: 'TEATRO',
    latitude: -25.4489,
    longitude: -49.3582,
    raioMetros: 200,
    colaboradoresAtivos: 0,
  },
];

interface StaffEvento {
  id: string;
  evento: string;
  data: string;
  local: string;
  coordenador: string;
  totalColaboradores: number;
  custoTotalPessoal: number;
  statusDRE: 'APROPRIADO_DRE' | 'PENDENTE_CONCILIACAO';
}

const staffEventosMock: StaffEvento[] = [
  {
    id: 'staff-ev-01',
    evento: 'Festival DiskIngressos Live 2026',
    data: '15/11/2026',
    local: 'Ligga Arena',
    coordenador: 'Lucas Ferreira dos Santos',
    totalColaboradores: 48,
    custoTotalPessoal: 54600.0,
    statusDRE: 'APROPRIADO_DRE',
  },
  {
    id: 'staff-ev-02',
    evento: 'Turnê Nacional Rock Fest 2026',
    data: '05/12/2026',
    local: 'Pedreira Paulo Leminski',
    coordenador: 'Lucas Ferreira dos Santos',
    totalColaboradores: 32,
    custoTotalPessoal: 29900.0,
    statusDRE: 'PENDENTE_CONCILIACAO',
  },
];

interface SolicitacaoAprovacao {
  id: string;
  colaborador: string;
  tipo: 'FERIAS' | 'HORA_EXTRA' | 'AJUSTE_PONTO' | 'REEMBOLSO';
  descricao: string;
  data: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  solicitante: string;
  valorOuHoras: string;
}

const solicitacoesIniciais: SolicitacaoAprovacao[] = [
  {
    id: 'sol-01',
    colaborador: 'Mariana Duarte Souza',
    tipo: 'HORA_EXTRA',
    descricao: 'Fechamento de folha de pagamento competência 09/2026',
    data: '03/10/2026',
    status: 'PENDENTE',
    solicitante: 'Karine Santos (Supervisora)',
    valorOuHoras: '+4 horas extras 100%',
  },
  {
    id: 'sol-02',
    colaborador: 'Rafael Albuquerque Lima',
    tipo: 'AJUSTE_PONTO',
    descricao: 'Esquecimento de batida de retorno de intervalo durante ensaio de portaria',
    data: '04/10/2026',
    status: 'PENDENTE',
    solicitante: 'Lucas Ferreira dos Santos (Coord. Eventos)',
    valorOuHoras: 'Retorno 13:30',
  },
  {
    id: 'sol-03',
    colaborador: 'Lucas Ferreira dos Santos',
    tipo: 'FERIAS',
    descricao: 'Período aquisitivo 2024/2025 - 15 dias após o Festival Live 2026',
    data: '01/10/2026',
    status: 'APROVADO',
    solicitante: 'Diretoria de Operações',
    valorOuHoras: '01/12/2026 a 15/12/2026',
  },
];

// --- ESTRUTURA DOS 10 GRUPOS DO MENU HIERÁRQUICO V2.1 ---
interface RHMenuGroupConfig {
  id: RHTab;
  label: string;
  icon: React.ElementType;
  badge: string;
  subItems: { label: string; actionDesc: string }[];
}

const RH_MENU_GROUPS: RHMenuGroupConfig[] = [
  {
    id: 'visao',
    label: '1. Visão Geral RH',
    icon: Award,
    badge: '42 Ativos',
    subItems: [
      { label: 'Dashboard Executivo RH', actionDesc: 'Visão holística de equipe e custos' },
      { label: 'Jornada do Colaborador', actionDesc: 'Da admissão à folha de pagamento' },
      { label: 'Alertas & SLA DP', actionDesc: 'Prazos legais e conformidade MTE' },
    ],
  },
  {
    id: 'aprovacoes',
    label: '2. Central de Aprovações',
    icon: CheckCircle2,
    badge: 'SoD Ativo',
    subItems: [
      { label: 'Férias & Licenças', actionDesc: 'Aprovação de escalas com alçada SoD' },
      { label: 'Horas Extras & Adicionais', actionDesc: 'Validação de jornada extraordinária' },
      { label: 'Ajustes de Batidas REP-P', actionDesc: 'Auditoria de marcações manuais' },
    ],
  },
  {
    id: 'pessoas',
    label: '3. Pessoas e Estrutura',
    icon: Users,
    badge: 'Organograma',
    subItems: [
      { label: 'Colaboradores & Cargos', actionDesc: 'Gestão completa do quadro de pessoal' },
      { label: 'Admissão Digital', actionDesc: 'Esteira de onboarding e documentos' },
      { label: 'Organograma & Departamentos', actionDesc: 'Centros de custo e hierarquia' },
    ],
  },
  {
    id: 'dp',
    label: '4. Departamento Pessoal',
    icon: DollarSign,
    badge: 'R$ 164.820',
    subItems: [
      { label: 'Folha de Pagamento Integrada', actionDesc: 'Cálculo de proventos e encargos' },
      { label: 'Benefícios (VR/VA/VT/Saúde)', actionDesc: 'Gestão de convênios e vales' },
      { label: 'Remessa PIX Tesouraria', actionDesc: 'Liquidação bancária via EDDIE 11.25' },
    ],
  },
  {
    id: 'ponto',
    label: '5. Ponto e Jornada',
    icon: Clock,
    badge: 'Portaria 671',
    subItems: [
      { label: 'Disk Ponto REP-P 671 MTE', actionDesc: 'Registro eletrônico de ponto móvel' },
      { label: 'Espelho de Batidas & NSR', actionDesc: 'Comprovante assinado com SHA-256' },
      { label: 'Cercas Virtuais (Geofences)', actionDesc: 'Validação por GPS em Arenas' },
      { label: 'Banco de Horas em Tempo Real', actionDesc: 'Saldo de compensação e escalas' },
    ],
  },
  {
    id: 'talentos',
    label: '6. Talentos e Desenvolvimento',
    icon: TrendingUp,
    badge: '94% Score',
    subItems: [
      { label: 'Avaliação de Desempenho 360°', actionDesc: 'Ciclos de competência e metas' },
      { label: 'Treinamentos de Campo', actionDesc: 'Segurança, catracas e atendimento' },
      { label: 'Plano de Carreira & Sucessão', actionDesc: 'Trilhas de evolução interna' },
    ],
  },
  {
    id: 'seguranca',
    label: '7. Saúde e Segurança',
    icon: HeartPulse,
    badge: 'NR-7 / NR-6',
    subItems: [
      { label: 'Medicina Ocupacional (ASO)', actionDesc: 'Controle de exames periódicos' },
      { label: 'Gestão de EPIs para Eventos', actionDesc: 'Ficha de entrega e assinatura' },
      { label: 'CIPA & Segurança do Trabalho', actionDesc: 'Prevenção de acidentes em arenas' },
    ],
  },
  {
    id: 'eventos',
    label: '8. Eventos e Custos',
    icon: Briefcase,
    badge: 'DRE Integrado',
    subItems: [
      { label: 'Staff por Evento & Arenas', actionDesc: 'Alocação de coordenadores e apoio' },
      { label: 'Apropriação Contábil no DRE', actionDesc: 'Lançamento de custos no Ledger' },
      { label: 'Credenciamento & Portaria', actionDesc: 'Crachás e controle de acesso' },
    ],
  },
  {
    id: 'portais',
    label: '9. Portais e Gestão',
    icon: Smartphone,
    badge: 'Autoatendimento',
    subItems: [
      { label: 'Portal do Colaborador (PWA)', actionDesc: 'Holerite e espelho no celular' },
      { label: 'Portal do Gestor / Produtor', actionDesc: 'Aprovação de escalas e turnos' },
      { label: 'Simulador Mobile de Ponto', actionDesc: 'Totem e APK REP-P de campo' },
    ],
  },
  {
    id: 'administracao',
    label: '10. Administração do RH',
    icon: ShieldCheck,
    badge: 'Audit & LGPD',
    subItems: [
      { label: 'Parâmetros REP-P 671 MTE', actionDesc: 'Regras de tolerância e NSR' },
      { label: 'Auditoria Imutável SHA-256', actionDesc: 'Trilha de logs contra fraudes' },
      { label: 'Conformidade LGPD & eSocial', actionDesc: 'Consentimentos e transmissões' },
    ],
  },
];

// --- TIPOS E DADOS DE BENEFÍCIOS & CAJU WALLETS (EDDIE 11.39) ---
export interface ColaboradorCajuConfig {
  colaboradorId: string;
  nome: string;
  matricula: string;
  tipoContrato: string;
  salario: number;
  verbaTotalMensal: number;
  saldoRefeicao: number;
  saldoAlimentacao: number;
  saldoMobilidade: number;
  saldoCultura: number;
  saldoLivre: number;
  cajuEmployeeId: string;
}

export interface PedidoBeneficioOperadora {
  id: string;
  fornecedorNome: string;
  cnpj: string;
  tipoIntegracao: string;
  qtdVidas: number;
  valorTotal: number;
  status: 'AGUARDANDO_APROVACAO_FINANCEIRA' | 'APROVADO_FINANCEIRO';
  codigoPix: string;
  codigoBarras: string;
  batchId: string;
  idempotencyKey: string;
  aprovadoEm?: string;
  aprovadoPor?: string;
}

const cajuConfigsIniciais: ColaboradorCajuConfig[] = [
  {
    colaboradorId: 'colab-001',
    nome: 'Karine Santos',
    matricula: 'DK-1042',
    tipoContrato: 'CLT',
    salario: 8400.0,
    verbaTotalMensal: 1650.0,
    saldoRefeicao: 850.0,
    saldoAlimentacao: 500.0,
    saldoMobilidade: 300.0,
    saldoCultura: 0.0,
    saldoLivre: 0.0,
    cajuEmployeeId: 'caju_emp_dk1042',
  },
  {
    colaboradorId: 'colab-002',
    nome: 'Lucas Ferreira dos Santos',
    matricula: 'DK-1088',
    tipoContrato: 'CLT',
    salario: 6200.0,
    verbaTotalMensal: 1400.0,
    saldoRefeicao: 700.0,
    saldoAlimentacao: 400.0,
    saldoMobilidade: 300.0,
    saldoCultura: 0.0,
    saldoLivre: 0.0,
    cajuEmployeeId: 'caju_emp_dk1088',
  },
  {
    colaboradorId: 'colab-003',
    nome: 'Mariana Duarte Souza',
    matricula: 'DK-1102',
    tipoContrato: 'CLT',
    salario: 4800.0,
    verbaTotalMensal: 1200.0,
    saldoRefeicao: 600.0,
    saldoAlimentacao: 400.0,
    saldoMobilidade: 200.0,
    saldoCultura: 0.0,
    saldoLivre: 0.0,
    cajuEmployeeId: 'caju_emp_dk1102',
  },
  {
    colaboradorId: 'colab-004',
    nome: 'Rafael Albuquerque Lima',
    matricula: 'DK-2015',
    tipoContrato: 'CLT',
    salario: 3900.0,
    verbaTotalMensal: 1100.0,
    saldoRefeicao: 550.0,
    saldoAlimentacao: 350.0,
    saldoMobilidade: 200.0,
    saldoCultura: 0.0,
    saldoLivre: 0.0,
    cajuEmployeeId: 'caju_emp_dk2015',
  },
];

const pedidosBeneficiosIniciais: PedidoBeneficioOperadora[] = [
  {
    id: 'ped-caju-1026',
    fornecedorNome: 'Caju Benefícios S.A.',
    cnpj: '33.221.849/0001-49',
    tipoIntegracao: 'API REST Automática',
    qtdVidas: 4,
    valorTotal: 5178.57,
    status: 'AGUARDANDO_APROVACAO_FINANCEIRA',
    codigoPix: '00020126580014BR.GOV.BCB.PIX0136e92b8d01-9a74-4b52-b883-93821034f82a5204000053039865405178.575802BR5916CAJU BENEFICIOS6009SAO PAULO62070503***630489AB',
    codigoBarras: '34191.79001 01043.510047 91020.150008 4 98760000517857',
    batchId: 'recarga-caju-2026-10-batch-01',
    idempotencyKey: 'idemp-caju-2026-10-7fa91c',
  },
  {
    id: 'ped-sulamerica-1026',
    fornecedorNome: 'SulAmérica Saúde S.A.',
    cnpj: '01.685.053/0001-56',
    tipoIntegracao: 'Arquivo EDI / REST',
    qtdVidas: 4,
    valorTotal: 1920.00,
    status: 'AGUARDANDO_APROVACAO_FINANCEIRA',
    codigoPix: '00020126580014BR.GOV.BCB.PIX0136a11c9e04-7b12-4c81-8124-74910238491a5204000053039865401920.005802BR5916SULAMERICA SAUDE6009RIO DE JANEIRO62070503***630441BC',
    codigoBarras: '23793.38128 60032.190412 81000.412003 1 98760000192000',
    batchId: 'fatura-sulamerica-2026-10-001',
    idempotencyKey: 'idemp-sulamerica-2026-10-82a10',
  },
];

export default function RecursosHumanosPage() {
  const { eventoId, evento } = useProducerEvent();
  const { currentUser, isAdmin } = useAuthSession();

  // Tab ativa inicial (sem quebrar SSR)
  const [activeTab, setActiveTab] = useState<RHTab>('visao');

  // Recupera e sincroniza tab a partir da URL no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t) {
        if (t === 'colaboradores') setActiveTab('pessoas');
        else if (t === 'geofences') setActiveTab('ponto');
        else if (t === 'folha') setActiveTab('dp');
        else if (t === 'equipes') setActiveTab('eventos');
        else if (t === 'auditoria') setActiveTab('administracao');
        else setActiveTab(t as RHTab);
      }
    }
  }, []);

  // Persistência de expansão dos grupos no localStorage conforme RH_DISK_V2_1_MENU_HIERARQUICO.md:
  // "Os grupos são expansíveis e preservam as rotas/telas funcionais já implementadas na V2.
  //  O grupo que contém a tela ativa é aberto automaticamente. O estado de expansão continua persistido no navegador."
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('rh_v21_expanded_groups');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      visao: true,
      aprovacoes: true,
      pessoas: true,
      dp: true,
      ponto: true,
      talentos: false,
      seguranca: false,
      eventos: true,
      portais: false,
      administracao: false,
    };
  });

  const toggleGroup = (groupId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rh_v21_expanded_groups', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Garante que o grupo da tela ativa é aberto automaticamente
  useEffect(() => {
    if (activeTab) {
      setExpandedGroups((prev) => {
        if (prev[activeTab]) return prev;
        const next = { ...prev, [activeTab]: true };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('rh_v21_expanded_groups', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
    }
  }, [activeTab]);

  // Função central de navegação com atualização limpa de URL
  const handleSelectTab = (tabId: RHTab) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Estados principais
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(colaboradoresIniciais);
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPontoSimulado[]>(registrosPontoMock);
  const [geofences, setGeofences] = useState<GeofenceItem[]>(geofencesMock);
  const [staffEventos, setStaffEventos] = useState<StaffEvento[]>(staffEventosMock);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAprovacao[]>(solicitacoesIniciais);

  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDepto, setFiltroDepto] = useState('ALL');

  // Estados dos Modais Interativos
  const [modalPontoAberto, setModalPontoAberto] = useState(false);
  const [pontoColaboradorId, setPontoColaboradorId] = useState('colab-001');
  const [sucessoPonto, setSucessoPonto] = useState<string | null>(null);

  const [modalNovoColaborador, setModalNovoColaborador] = useState(false);
  const [novoColabForm, setNovoColabForm] = useState({
    nome: '',
    cargo: '',
    departamento: 'Staff de Eventos',
    tipoContrato: 'CLT' as 'CLT' | 'PJ' | 'TEMPORARIO' | 'ESTAGIO',
    salario: '',
    geofenceAutorizada: 'Ligga Arena (Arena da Baixada)',
    email: '',
  });

  const [modalNovaGeofence, setModalNovaGeofence] = useState(false);
  const [novaGeofenceForm, setNovaGeofenceForm] = useState({
    nome: '',
    endereco: '',
    tipo: 'ARENA' as 'SEDE' | 'ARENA' | 'TEATRO' | 'ESPACO_ABERTO',
    raioMetros: '200',
    eventoVinculado: 'Festival DiskIngressos Live 2026',
  });

  const [colaboradorDossie, setColaboradorDossie] = useState<Colaborador | null>(null);
  const [modalRemessaPix, setModalRemessaPix] = useState(false);
  const [remessaPixStatus, setRemessaPixStatus] = useState<'PENDENTE' | 'ENVIADO'>('PENDENTE');
  const [modalExportarDre, setModalExportarDre] = useState(false);
  const [dreExportado, setDreExportado] = useState(false);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMensagem(msg);
    setTimeout(() => {
      setToastMensagem(null);
    }, 4000);
  };

  // --- ESTADOS DE BENEFÍCIOS & CAJU WALLETS (EDDIE 11.39) ---
  const [cajuConfigs, setCajuConfigs] = useState<ColaboradorCajuConfig[]>(cajuConfigsIniciais);
  const [selectedCajuColabId, setSelectedCajuColabId] = useState('colab-001');
  const [pedidosBeneficios, setPedidosBeneficios] = useState<PedidoBeneficioOperadora[]>(pedidosBeneficiosIniciais);
  const [competenciaBeneficio, setCompetenciaBeneficio] = useState('10/2026');
  const [diasUteisBeneficio, setDiasUteisBeneficio] = useState(21);
  const [deduzirFaltasPonto, setDeduzirFaltasPonto] = useState(true);

  const [modalConfigCaju, setModalConfigCaju] = useState(false);
  const [cajuEditForm, setCajuEditForm] = useState({
    colaboradorId: 'colab-001',
    verbaTotalMensal: 1650,
    saldoRefeicao: 850,
    saldoAlimentacao: 500,
    saldoMobilidade: 300,
    saldoCultura: 0,
    saldoLivre: 0,
  });

  const [modalDossieBeneficio, setModalDossieBeneficio] = useState<PedidoBeneficioOperadora | null>(null);

  // Colaborador Caju selecionado para visualização
  const currentCajuConfig = cajuConfigs.find((c) => c.colaboradorId === selectedCajuColabId) || cajuConfigs[0];
  const somaBolsosCurrent =
    currentCajuConfig.saldoRefeicao +
    currentCajuConfig.saldoAlimentacao +
    currentCajuConfig.saldoMobilidade +
    currentCajuConfig.saldoCultura +
    currentCajuConfig.saldoLivre;
  const difCurrent = Math.round((somaBolsosCurrent - currentCajuConfig.verbaTotalMensal) * 100) / 100;

  // Cálculo dinâmico do lote de compra de benefícios com dedução de ponto e teto 6% VT
  const itensCalculoBeneficios = cajuConfigs.map((colab) => {
    let faltas = 0;
    if (deduzirFaltasPonto) {
      if (colab.colaboradorId === 'colab-002') faltas = 1; // Lucas Ferreira: 1 falta
      if (colab.colaboradorId === 'colab-004') faltas = 2; // Rafael Albuquerque: 2 faltas
    }
    const diasEfetivos = Math.max(0, diasUteisBeneficio - faltas);
    const diariaCaju = diasUteisBeneficio > 0 ? colab.verbaTotalMensal / diasUteisBeneficio : 0;
    const recargaCaju =
      diasEfetivos < diasUteisBeneficio
        ? Math.round(diariaCaju * diasEfetivos * 100) / 100
        : colab.verbaTotalMensal;

    const mobilidadeDiaria = diasUteisBeneficio > 0 ? colab.saldoMobilidade / diasUteisBeneficio : 0;
    const mobilidadeEfetiva =
      diasEfetivos < diasUteisBeneficio
        ? Math.round(mobilidadeDiaria * diasEfetivos * 100) / 100
        : colab.saldoMobilidade;
    const tetoVT6 = Math.round(colab.salario * 0.06 * 100) / 100;
    const descontoVT = Math.round(Math.min(tetoVT6, mobilidadeEfetiva) * 100) / 100;
    const custoEmpresaCaju = Math.round(Math.max(0, recargaCaju - descontoVT) * 100) / 100;

    return {
      ...colab,
      faltas,
      diasEfetivos,
      recargaCaju,
      descontoVT,
      custoEmpresaCaju,
      saudeMensal: 480.0,
      saudeCoparticipacao: 48.0,
      saudeCustoEmpresa: 432.0,
    };
  });

  const totalRecargaCaju = itensCalculoBeneficios.reduce((acc, i) => acc + i.recargaCaju, 0);
  const totalDescontoVTCaju = itensCalculoBeneficios.reduce((acc, i) => acc + i.descontoVT, 0);
  const totalCustoEmpresaCaju = itensCalculoBeneficios.reduce((acc, i) => acc + i.custoEmpresaCaju, 0);
  const totalSaude = itensCalculoBeneficios.length * 480.0;
  const totalCoparticipacaoSaude = itensCalculoBeneficios.length * 48.0;
  const totalCustoEmpresaSaude = totalSaude - totalCoparticipacaoSaude;

  const totalGeralRecargas = totalRecargaCaju + totalSaude;
  const totalGeralDescontos = totalDescontoVTCaju + totalCoparticipacaoSaude;
  const totalGeralCustoEmpresa = totalCustoEmpresaCaju + totalCustoEmpresaSaude;

  const handleOpenEditCaju = (colabId: string) => {
    const colab = cajuConfigs.find((c) => c.colaboradorId === colabId);
    if (!colab) return;
    setCajuEditForm({
      colaboradorId: colab.colaboradorId,
      verbaTotalMensal: colab.verbaTotalMensal,
      saldoRefeicao: colab.saldoRefeicao,
      saldoAlimentacao: colab.saldoAlimentacao,
      saldoMobilidade: colab.saldoMobilidade,
      saldoCultura: colab.saldoCultura,
      saldoLivre: colab.saldoLivre,
    });
    setModalConfigCaju(true);
  };

  const handleSaveCajuBolsos = () => {
    const soma =
      cajuEditForm.saldoRefeicao +
      cajuEditForm.saldoAlimentacao +
      cajuEditForm.saldoMobilidade +
      cajuEditForm.saldoCultura +
      cajuEditForm.saldoLivre;
    const dif = Math.round((soma - cajuEditForm.verbaTotalMensal) * 100) / 100;
    if (Math.abs(dif) > 0.01) {
      showToast(`Erro: A soma dos bolsos (R$ ${soma.toFixed(2)}) difere da verba em R$ ${dif.toFixed(2)}.`);
      return;
    }

    setCajuConfigs((prev) =>
      prev.map((c) =>
        c.colaboradorId === cajuEditForm.colaboradorId
          ? {
              ...c,
              verbaTotalMensal: cajuEditForm.verbaTotalMensal,
              saldoRefeicao: cajuEditForm.saldoRefeicao,
              saldoAlimentacao: cajuEditForm.saldoAlimentacao,
              saldoMobilidade: cajuEditForm.saldoMobilidade,
              saldoCultura: cajuEditForm.saldoCultura,
              saldoLivre: cajuEditForm.saldoLivre,
            }
          : c,
      ),
    );
    setModalConfigCaju(false);
    const colabNome = cajuConfigs.find((c) => c.colaboradorId === cajuEditForm.colaboradorId)?.nome || 'Colaborador';
    showToast(`Bolsos Caju de ${colabNome} configurados e calibrados com 100% de precisão!`);
  };

  const handleAprovarPedidoBeneficio = (pedidoId: string) => {
    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
    setPedidosBeneficios((prev) =>
      prev.map((p) =>
        p.id === pedidoId
          ? {
              ...p,
              status: 'APROVADO_FINANCEIRO',
              aprovadoEm: agora,
              aprovadoPor: 'Diretoria de RH (Karine Santos)',
            }
          : p,
      ),
    );
    const ped = pedidosBeneficios.find((p) => p.id === pedidoId);
    showToast(`Pedido ${ped?.fornecedorNome || ''} APROVADO! Integrado à Tesouraria via PIX Direto.`);
    if (modalDossieBeneficio && modalDossieBeneficio.id === pedidoId) {
      setModalDossieBeneficio({
        ...modalDossieBeneficio,
        status: 'APROVADO_FINANCEIRO',
        aprovadoEm: agora,
        aprovadoPor: 'Diretoria de RH (Karine Santos)',
      });
    }
  };

  // Funções de Registro e Modais
  const handleRegistrarBatida = (tipo: 'ENTRADA' | 'SAIDA' | 'INICIO_INTERVALO' | 'FIM_INTERVALO') => {
    const colab = colaboradores.find((c) => c.id === pontoColaboradorId) || colaboradores[0];
    const nsr = registrosPonto.length > 0 ? Math.max(...registrosPonto.map((r) => r.nsr)) + 1 : 48925;
    const now = new Date();
    const ts = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    const mockHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const novoRegistro: RegistroPontoSimulado = {
      id: `rep-${Date.now()}`,
      nsr,
      colaborador: colab.nome,
      matricula: colab.matricula,
      tipo,
      timestamp: ts,
      localizacao: colab.geofenceAutorizada.split(' (')[0],
      dentroGeofence: true,
      distanciaMetros: Math.floor(Math.random() * 45) + 5,
      hashSHA256: mockHash,
      dispositivo: 'Disk Ponto Mobile REP-P 671 MTE',
    };

    setRegistrosPonto((prev) => [novoRegistro, ...prev]);
    setSucessoPonto(`Ponto (${tipo}) registrado com sucesso! NSR: #${nsr} | Geofence Válida.`);
    showToast(`Batida de ponto (${tipo}) registrada para ${colab.nome} (NSR #${nsr})`);

    setTimeout(() => {
      setSucessoPonto(null);
      setModalPontoAberto(false);
    }, 2200);
  };

  const handleSalvarNovoColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoColabForm.nome.trim() || !novoColabForm.cargo.trim()) {
      showToast('Por favor, informe o nome e o cargo do colaborador.');
      return;
    }

    const initials =
      novoColabForm.nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || 'DK';

    const novoColab: Colaborador = {
      id: `colab-${Date.now()}`,
      matricula: `DK-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: novoColabForm.nome.trim(),
      cargo: novoColabForm.cargo.trim(),
      departamento: novoColabForm.departamento,
      tipoContrato: novoColabForm.tipoContrato,
      salario: parseFloat(novoColabForm.salario) || 3200.0,
      admissao: new Date().toLocaleDateString('pt-BR'),
      status: 'ATIVO',
      geofenceAutorizada: novoColabForm.geofenceAutorizada,
      avatar: initials,
      email: novoColabForm.email || `${novoColabForm.nome.toLowerCase().replace(/\s+/g, '.')}@diskingressos.com.br`,
      bancoHoras: '00h 00m',
      asoValidade: '05/10/2027',
    };

    setColaboradores((prev) => [novoColab, ...prev]);
    setModalNovoColaborador(false);
    setNovoColabForm({
      nome: '',
      cargo: '',
      departamento: 'Staff de Eventos',
      tipoContrato: 'CLT',
      salario: '',
      geofenceAutorizada: 'Ligga Arena (Arena da Baixada)',
      email: '',
    });
    showToast(`Colaborador ${novoColab.nome} (${novoColab.matricula}) cadastrado com sucesso!`);
  };

  const handleSalvarNovaGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaGeofenceForm.nome.trim()) {
      showToast('Por favor, informe o nome do local da cerca.');
      return;
    }

    const nova: GeofenceItem = {
      id: `geo-${Date.now()}`,
      nome: novaGeofenceForm.nome.trim(),
      endereco: novaGeofenceForm.endereco.trim() || 'Curitiba, PR',
      tipo: novaGeofenceForm.tipo,
      latitude: -25.4284 + (Math.random() - 0.5) * 0.05,
      longitude: -49.2733 + (Math.random() - 0.5) * 0.05,
      raioMetros: parseInt(novaGeofenceForm.raioMetros) || 200,
      colaboradoresAtivos: 0,
      eventoVinculado: novaGeofenceForm.eventoVinculado,
    };

    setGeofences((prev) => [nova, ...prev]);
    setModalNovaGeofence(false);
    setNovaGeofenceForm({
      nome: '',
      endereco: '',
      tipo: 'ARENA',
      raioMetros: '200',
      eventoVinculado: 'Festival DiskIngressos Live 2026',
    });
    showToast(`Cerca virtual "${nova.nome}" criada com sucesso!`);
  };

  const handleAprovarSolicitacao = (id: string, status: 'APROVADO' | 'REJEITADO') => {
    setSolicitacoes((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    showToast(status === 'APROVADO' ? 'Solicitação aprovada e homologada com sucesso!' : 'Solicitação rejeitada com justificativa.');
  };

  const pendentesAprovacao = solicitacoes.filter((s) => s.status === 'PENDENTE').length;

  const colaboradoresFiltrados = colaboradores.filter((c) => {
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepto = filtroDepto === 'ALL' || c.departamento.includes(filtroDepto);
    return matchesSearch && matchesDepto;
  });

  // Itens para o componente oficial ModuleNavigation (grade responsiva superior)
  const navItems: ModuleNavigationItem[] = [
    { id: 'visao', label: '1. Visão Geral', icon: <Award className="w-4 h-4" /> },
    { id: 'aprovacoes', label: '2. Aprovações', icon: <CheckCircle2 className="w-4 h-4" />, badge: pendentesAprovacao > 0 ? `${pendentesAprovacao}` : undefined },
    { id: 'pessoas', label: '3. Pessoas', icon: <Users className="w-4 h-4" />, badge: colaboradores.length },
    { id: 'dp', label: '4. Dep. Pessoal', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'ponto', label: '5. Ponto REP-P', icon: <Clock className="w-4 h-4" />, badge: `${registrosPonto.length}` },
    { id: 'talentos', label: '6. Talentos', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'seguranca', label: '7. Segurança', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'eventos', label: '8. Eventos/DRE', icon: <Briefcase className="w-4 h-4" />, badge: staffEventos.length },
    { id: 'portais', label: '9. Portais', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'administracao', label: '10. Administração', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. HERO HEADER DO MÓDULO OFICIAL */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>RH Disk V2.1 • Módulo Oficial</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                Portaria 671 MTE (REP-P)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                Integrado ao Módulo Financeiro
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Recursos Humanos, Ponto &amp; Equipes
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Gestão completa de colaboradores, ponto eletrônico com validação por cerca virtual em arenas, folha de pagamento integrada à Tesouraria e apropriação direta de custos de pessoal no DRE dos Eventos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setModalPontoAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Bater Ponto (Simulador MTE)</span>
            </button>

            <button
              type="button"
              onClick={() => setModalNovoColaborador(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>+ Novo Colaborador</span>
            </button>

            <button
              type="button"
              onClick={() => setModalNovaGeofence(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>+ Nova Cerca Virtual</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPIS GLOBAIS DE RH & FOLHA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Colaboradores Ativos</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{colaboradores.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{colaboradores.filter((c) => c.tipoContrato === 'CLT').length} CLT &bull; {colaboradores.filter((c) => c.tipoContrato !== 'CLT').length} Outros</span>
            <span className="text-emerald-400 font-bold">100% Homologado</span>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Batidas no REP-P</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{registrosPonto.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Geofence validado</span>
            <span className="text-sky-400 font-bold">Portaria 671</span>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Aprovações Pendentes</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendentesAprovacao}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Segregação de Funções</span>
            <span className="text-amber-400 font-bold">SoD Ativo</span>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff Eventos (DRE)</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">
            R$ {staffEventos.reduce((a, b) => a + b.custoTotalPessoal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Apropriado no Ledger</span>
            <span className="text-purple-400 font-bold">{staffEventos.length} Eventos</span>
          </div>
        </div>
      </div>

      {/* 3. NAVEGAÇÃO DE TOPO RESPONSIVA DO MÓDULO (IGUAL AOS DEMAIS MÓDULOS DO EDDIE) */}
      <ModuleNavigation
        items={navItems}
        activeItem={activeTab}
        onSelect={(tabId) => handleSelectTab(tabId as RHTab)}
        ariaLabel="Navegação dos 10 Grupos de Recursos Humanos"
      />

      {/* 4. LAYOUT PRINCIPAL: MENU HIERÁRQUICO EXPANSÍVEL (V2.1) + CONTEÚDO ATIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: MENU HIERÁRQUICO EXPANSÍVEL (CONFORME RH_DISK_V2_1_MENU_HIERARQUICO.md) */}
        <aside className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Menu Hierárquico RH V2.1
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              10 Grupos
            </span>
          </div>

          <nav className="space-y-1" aria-label="Menu Hierárquico dos Grupos de RH">
            {RH_MENU_GROUPS.map((group) => {
              const Icon = group.icon;
              const isSelected = activeTab === group.id;
              const isExpanded = Boolean(expandedGroups[group.id]);

              return (
                <div key={group.id} className="rounded-xl border border-transparent transition-all">
                  {/* Linha do Grupo (Expansível / Clicável) */}
                  <div
                    onClick={() => handleSelectTab(group.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{group.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {group.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleGroup(group.id, e)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded transition cursor-pointer"
                        title={isExpanded ? 'Recolher grupo' : 'Expandir grupo'}
                        aria-label={isExpanded ? 'Recolher grupo' : 'Expandir grupo'}
                      >
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-0 text-emerald-400' : '-rotate-90 text-slate-400'}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Sub-itens do Grupo (Exibidos se isExpanded for true) */}
                  {isExpanded && (
                    <div className="ml-6 pl-2.5 my-1 space-y-1 border-l border-emerald-900/60">
                      {group.subItems.map((sub, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectTab(group.id)}
                          className="group flex flex-col p-1.5 rounded-lg hover:bg-slate-800/40 transition cursor-pointer"
                        >
                          <span className={`text-[11px] font-medium transition ${isSelected ? 'text-emerald-400 font-semibold' : 'text-slate-400 group-hover:text-white'}`}>
                            &bull; {sub.label}
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-300 pl-2">
                            {sub.actionDesc}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Persistência no navegador</span>
            <span className="text-emerald-400 font-mono">Ativo (Local)</span>
          </div>
        </aside>

        {/* COLUNA DIREITA: CONTEÚDO ATIVO DA TELA SELECIONADA */}
        <main className="lg:col-span-8 space-y-6">

          {/* -------------------------------------------------------- */}
          {/* TAB 1: 1. VISÃO GERAL RH                                 */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'visao' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Jornada Operacional do Colaborador</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Fluxo Integrado
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fluxo ponta a ponta: Admissão Digital &rarr; Cerca Virtual em Arena &rarr; Registro REP-P &rarr; DRE do Evento &rarr; Remessa PIX Tesouraria.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Admissões &amp; Onboarding Digital</div>
                      <div className="text-[11px] text-slate-400">2 contratos aguardando assinatura eletrônica com SHA-256</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('pessoas')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Ver Equipe</span> &rarr;
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Ponto Eletrônico em Arenas (REP-P 671 MTE)</div>
                      <div className="text-[11px] text-slate-400">4 cercas ativas com tolerância de geolocalização e geração de NSR</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('ponto')}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <span>Ver Ponto</span> &rarr;
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Apropriação Contábil de Staff no DRE</div>
                      <div className="text-[11px] text-slate-400">R$ 84.500,00 apropriados nos eventos do Ledger Financeiro</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('eventos')}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <span>Ver DRE</span> &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Central de Ações Rápidas */}
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Ações Rápidas do RH Disk</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPontoAberto(true)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="text-xs font-bold text-white">Simulador REP-P</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Testar batida com GPS</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalNovoColaborador(true)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-sky-500/50 hover:bg-sky-950/20 text-left transition cursor-pointer"
                  >
                    <UserPlus className="w-5 h-5 text-sky-400 mb-2" />
                    <div className="text-xs font-bold text-white">Admissão Digital</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Cadastrar novo staff</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalNovaGeofence(true)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition cursor-pointer"
                  >
                    <MapPin className="w-5 h-5 text-purple-400 mb-2" />
                    <div className="text-xs font-bold text-white">Cerca Virtual</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Nova arena/local</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 2: 2. CENTRAL DE APROVAÇÕES (SOD)                    */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'aprovacoes' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      <span>Central de Aprovações e Alçadas (SoD)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Segregação de funções: Solicitações de horas extras, férias e ajustes de batidas requerem aprovação formal da supervisão antes de impactar a folha.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {pendentesAprovacao} Pendentes
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {solicitacoes.map((sol) => (
                    <div
                      key={sol.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{sol.colaborador}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              sol.tipo === 'HORA_EXTRA'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : sol.tipo === 'FERIAS'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {sol.tipo}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sol.status === 'APROVADO'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : sol.status === 'REJEITADO'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {sol.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{sol.descricao}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>Solicitante: {sol.solicitante}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-emerald-400">{sol.valorOuHoras}</span>
                        </div>
                      </div>

                      {sol.status === 'PENDENTE' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAprovarSolicitacao(sol.id, 'APROVADO')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAprovarSolicitacao(sol.id, 'REJEITADO')}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-bold transition cursor-pointer"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 3: 3. PESSOAS E ESTRUTURA                            */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'pessoas' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <span>Colaboradores &amp; Estrutura Organizacional</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {colaboradoresFiltrados.length} colaboradores listados no quadro
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalNovoColaborador(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Colaborador</span>
                  </button>
                </div>

                {/* Filtro e Busca */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, matrícula ou cargo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <select
                    value={filtroDepto}
                    onChange={(e) => setFiltroDepto(e.target.value)}
                    className="w-full sm:w-56 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="ALL">Todos os Departamentos</option>
                    <option value="Controladoria">Controladoria &amp; RH</option>
                    <option value="Operações">Operações &amp; Portaria</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Staff de Eventos">Staff de Eventos</option>
                    <option value="Bilheteria">Bilheteria &amp; SAC</option>
                  </select>
                </div>

                {/* Tabela de Colaboradores */}
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Colaborador</th>
                        <th className="p-3">Cargo / Depto</th>
                        <th className="p-3">Contrato</th>
                        <th className="p-3">Salário</th>
                        <th className="p-3">Cerca Alocada</th>
                        <th className="p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {colaboradoresFiltrados.map((colab) => (
                        <tr key={colab.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-xs">
                                {colab.avatar}
                              </div>
                              <div>
                                <div className="font-bold text-white">{colab.nome}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{colab.matricula}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-200">{colab.cargo}</div>
                            <div className="text-[10px] text-slate-400">{colab.departamento}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {colab.tipoContrato}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-emerald-400 font-semibold">
                            R$ {colab.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-[11px] text-slate-300">
                            {colab.geofenceAutorizada}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setColaboradorDossie(colab)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Dossiê
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 4: 4. DEPARTAMENTO PESSOAL & FOLHA                   */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'dp' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span>Folha de Pagamento &amp; Remessas PIX Tesouraria</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Competência 10/2026 &bull; Total bruto: R$ 164.820,00 &bull; Integração direta com a Tesouraria (EDDIE 11.25)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalRemessaPix(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Remessa PIX Tesouraria</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Proventos CLT</div>
                    <div className="text-lg font-black text-white mt-1">R$ 138.420,00</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">34 colaboradores CLT</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Staff Temporário de Arenas</div>
                    <div className="text-lg font-black text-sky-400 mt-1">R$ 26.400,00</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">8 colaboradores temporários</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Status Remessa Bancária</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">
                      {remessaPixStatus === 'ENVIADO' ? 'Enviada (PIX)' : 'Aguardando Disparo'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tesouraria EDDIE 11.25</div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* SUÍTE DE GESTÃO E COMPRA DE BENEFÍCIOS (EDDIE 11.39)      */}
                {/* ======================================================== */}
                <div className="pt-6 border-t border-slate-800 space-y-6">
                  {/* Header da Seção de Benefícios */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#E63888]/20 text-[#E63888] flex items-center justify-center font-black text-xs border border-[#E63888]/30">
                          C
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Gestão de Benefícios Flexíveis &amp; Caju Wallets</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E63888]/10 text-[#E63888] border border-[#E63888]/30 font-semibold normal-case">
                            Multi-Bolsos PAT/CLT
                          </span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Calibração de bolsos com validação matemática em tempo real, dedução de faltas do Disk Ponto e faturamento direto com a Tesouraria (EDDIE 11.25).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCaju(selectedCajuColabId)}
                        className="px-3.5 py-2 rounded-xl bg-[#E63888] hover:bg-[#d42c7a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#E63888]/20 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Configurar Bolsos Caju</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. PAINEL INTERATIVO DE BOLSOS CAJU (CAJU WALLETS OS) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#171f33] to-[#0f172a] border border-slate-700/70 shadow-xl space-y-5">
                    {/* Seletor de Colaborador */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#E63888]" />
                        <span className="text-xs font-bold text-slate-200">Colaborador em Análise:</span>
                        <div className="flex flex-wrap gap-1.5 ml-2">
                          {cajuConfigs.map((colab) => (
                            <button
                              key={colab.colaboradorId}
                              type="button"
                              onClick={() => setSelectedCajuColabId(colab.colaboradorId)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                selectedCajuColabId === colab.colaboradorId
                                  ? 'bg-[#E63888] text-white font-bold shadow-md shadow-[#E63888]/30'
                                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <span>{colab.nome.split(' ')[0]}</span>
                              <span className="text-[10px] opacity-70">({colab.matricula})</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Verba Mensal Total:</span>
                        <span className="text-sm font-black text-white font-mono">
                          R$ {currentCajuConfig.verbaTotalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          100% Subsidiado
                        </span>
                      </div>
                    </div>

                    {/* Os 5 Bolsos Caju */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {/* Bolso Refeição */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#E63888]/50 transition group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5 text-[#E63888]" />
                            <span>Refeição (PAT)</span>
                          </span>
                        </div>
                        <div className="text-base font-black text-white font-mono">
                          R$ {currentCajuConfig.saldoRefeicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Restaurantes e praças de alimentação (Isento de encargos)
                        </div>
                      </div>

                      {/* Bolso Alimentação */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 transition">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
                            <span>Alimentação (PAT)</span>
                          </span>
                        </div>
                        <div className="text-base font-black text-white font-mono">
                          R$ {currentCajuConfig.saldoAlimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Supermercados, hortifrutis e padarias (Isento PAT)
                        </div>
                      </div>

                      {/* Bolso Mobilidade */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-sky-400" />
                            <span>Mobilidade (VT)</span>
                          </span>
                        </div>
                        <div className="text-base font-black text-white font-mono">
                          R$ {currentCajuConfig.saldoMobilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Transporte e apps (Desconto CLT até teto 6%)
                        </div>
                      </div>

                      {/* Bolso Cultura */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Ticket className="w-3.5 h-3.5 text-purple-400" />
                            <span>Cultura</span>
                          </span>
                        </div>
                        <div className="text-base font-black text-white font-mono">
                          R$ {currentCajuConfig.saldoCultura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Livrarias, cinemas, teatros e shows DiskIngressos
                        </div>
                      </div>

                      {/* Bolso Livre */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Livre (Premiações)</span>
                          </span>
                        </div>
                        <div className="text-base font-black text-white font-mono">
                          R$ {currentCajuConfig.saldoLivre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Bonificações corporativas (Incide IRRF eSocial)
                        </div>
                      </div>
                    </div>

                    {/* Barra de Distribuição Visual Proporcional dos Bolsos */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Distribuição Proporcional da Verba Caju:</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[#E63888]">
                            <span className="w-2 h-2 rounded-full bg-[#E63888]" />
                            <span>Refeição {currentCajuConfig.verbaTotalMensal > 0 ? Math.round((currentCajuConfig.saldoRefeicao / currentCajuConfig.verbaTotalMensal) * 100) : 0}%</span>
                          </span>
                          <span className="flex items-center gap-1 text-orange-400">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            <span>Alimentação {currentCajuConfig.verbaTotalMensal > 0 ? Math.round((currentCajuConfig.saldoAlimentacao / currentCajuConfig.verbaTotalMensal) * 100) : 0}%</span>
                          </span>
                          <span className="flex items-center gap-1 text-sky-400">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            <span>Mobilidade {currentCajuConfig.verbaTotalMensal > 0 ? Math.round((currentCajuConfig.saldoMobilidade / currentCajuConfig.verbaTotalMensal) * 100) : 0}%</span>
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                        <div
                          style={{
                            width: `${currentCajuConfig.verbaTotalMensal > 0 ? (currentCajuConfig.saldoRefeicao / currentCajuConfig.verbaTotalMensal) * 100 : 0}%`,
                          }}
                          className="bg-[#E63888] h-full transition-all"
                          title="Refeição"
                        />
                        <div
                          style={{
                            width: `${currentCajuConfig.verbaTotalMensal > 0 ? (currentCajuConfig.saldoAlimentacao / currentCajuConfig.verbaTotalMensal) * 100 : 0}%`,
                          }}
                          className="bg-orange-400 h-full transition-all"
                          title="Alimentação"
                        />
                        <div
                          style={{
                            width: `${currentCajuConfig.verbaTotalMensal > 0 ? (currentCajuConfig.saldoMobilidade / currentCajuConfig.verbaTotalMensal) * 100 : 0}%`,
                          }}
                          className="bg-sky-400 h-full transition-all"
                          title="Mobilidade"
                        />
                        <div
                          style={{
                            width: `${currentCajuConfig.verbaTotalMensal > 0 ? (currentCajuConfig.saldoCultura / currentCajuConfig.verbaTotalMensal) * 100 : 0}%`,
                          }}
                          className="bg-purple-400 h-full transition-all"
                          title="Cultura"
                        />
                        <div
                          style={{
                            width: `${currentCajuConfig.verbaTotalMensal > 0 ? (currentCajuConfig.saldoLivre / currentCajuConfig.verbaTotalMensal) * 100 : 0}%`,
                          }}
                          className="bg-emerald-400 h-full transition-all"
                          title="Livre"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <div className="flex items-center gap-1.5">
                          {difCurrent === 0 ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Validação Matemática Perfeita (Soma dos bolsos = R$ {somaBolsosCurrent.toFixed(2)})</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Divergência de R$ {difCurrent.toFixed(2)} entre a soma e a verba!</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[10px]">
                            Caju ID: {currentCajuConfig.cajuEmployeeId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditCaju(currentCajuConfig.colaboradorId)}
                            className="text-[#E63888] hover:underline font-bold text-xs cursor-pointer"
                          >
                            Editar bolsos deste colaborador &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. CENTRAL DE COMPRA MENSAL & DEDUÇÃO DE FALTAS DO PONTO */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-400" />
                          <span>Simulador de Compra Mensal &amp; Dedução do Disk Ponto</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          O motor subtrai automaticamente faltas não justificadas registradas no REP-P e aplica o teto legal de 6% do VT CLT.
                        </p>
                      </div>

                      {/* Controles de Simulação */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-400">Comp:</span>
                          <input
                            type="text"
                            value={competenciaBeneficio}
                            onChange={(e) => setCompetenciaBeneficio(e.target.value)}
                            className="bg-transparent text-white font-mono font-bold w-16 outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                          <span className="text-slate-400">Dias Úteis:</span>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={diasUteisBeneficio}
                            onChange={(e) => setDiasUteisBeneficio(Number(e.target.value) || 21)}
                            className="bg-transparent text-white font-mono font-bold w-10 outline-none"
                          />
                        </div>

                        <label className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200 cursor-pointer hover:border-slate-600 transition">
                          <input
                            type="checkbox"
                            checked={deduzirFaltasPonto}
                            onChange={(e) => setDeduzirFaltasPonto(e.target.checked)}
                            className="rounded border-slate-700 text-[#E63888] focus:ring-[#E63888] cursor-pointer"
                          />
                          <span className="font-semibold text-sky-400">Deduzir Faltas do Ponto</span>
                        </label>
                      </div>
                    </div>

                    {/* Resumo Consolidado do Lote de Benefícios */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Vidas Ativas no Lote</div>
                        <div className="text-lg font-black text-white mt-1">4 Beneficiários</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Colaboradores CLT Ativos</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Recarga Bruta Total</div>
                        <div className="text-lg font-black text-[#E63888] font-mono mt-1">
                          R$ {totalGeralRecargas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Caju (Flex) + SulAmérica</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Descontos em Folha CLT</div>
                        <div className="text-lg font-black text-amber-400 font-mono mt-1">
                          R$ {totalGeralDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Teto 6% VT + Coparticipação Saúde</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Custo Líquido Empresa</div>
                        <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                          R$ {totalGeralCustoEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Lançamento DRE Operacional</div>
                      </div>
                    </div>

                    {/* Tabela de Cálculo por Colaborador */}
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Colaborador / Matrícula</th>
                            <th className="p-3">Salário Base</th>
                            <th className="p-3">Dias Efetivos (REP-P)</th>
                            <th className="p-3">Recarga Caju Bruta</th>
                            <th className="p-3">Desconto VT (Teto 6%)</th>
                            <th className="p-3">Plano SulAmérica</th>
                            <th className="p-3">Custo Líquido Empresa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {itensCalculoBeneficios.map((item) => (
                            <tr key={item.colaboradorId} className="hover:bg-slate-900/50 transition">
                              <td className="p-3">
                                <div className="font-bold text-white">{item.nome}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{item.matricula} &bull; {item.tipoContrato}</div>
                              </td>
                              <td className="p-3 font-mono text-slate-300">
                                R$ {item.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-white">
                                  {item.diasEfetivos} de {diasUteisBeneficio} dias
                                </div>
                                {item.faltas > 0 ? (
                                  <div className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>-{item.faltas} falta(s) deduzida(s) no ponto</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-emerald-400 font-medium">100% de assiduidade</div>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-[#E63888]">
                                R$ {item.recargaCaju.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-3 font-mono text-amber-400 font-medium">
                                -R$ {item.descontoVT.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                <span className="block text-[9px] text-slate-500 font-sans">
                                  (teto 6%: R$ {(item.salario * 0.06).toFixed(2)})
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="font-mono text-white">R$ 480,00</div>
                                <div className="text-[10px] text-slate-400">Desc: R$ 48,00 (10%)</div>
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400">
                                R$ {(item.custoEmpresaCaju + item.saudeCustoEmpresa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Cards de Pedidos para Operadoras (Caju & SulAmérica) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {pedidosBeneficios.map((pedido) => (
                        <div
                          key={pedido.id}
                          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {pedido.fornecedorNome.includes('Caju') ? (
                                <div className="w-8 h-8 rounded-xl bg-[#E63888]/20 text-[#E63888] font-black text-sm flex items-center justify-center border border-[#E63888]/30">
                                  C
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center border border-blue-500/30">
                                  S
                                </div>
                              )}
                              <div>
                                <h5 className="text-xs font-bold text-white">{pedido.fornecedorNome}</h5>
                                <p className="text-[10px] text-slate-400 font-mono">CNPJ: {pedido.cnpj}</p>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                pedido.status === 'APROVADO_FINANCEIRO'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {pedido.status === 'APROVADO_FINANCEIRO'
                                ? '✓ Aprovado Financeiro'
                                : 'Aguardando Aprovação'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <div className="text-[10px] text-slate-400">Total do Lote:</div>
                              <div className="text-base font-black text-white font-mono">
                                R$ {pedido.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400">Integração:</div>
                              <div className="text-xs font-semibold text-slate-300">{pedido.tipoIntegracao}</div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setModalDossieBeneficio(pedido)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-[#E63888]" />
                              <span>Ver Fatura / PIX</span>
                            </button>

                            {pedido.status !== 'APROVADO_FINANCEIRO' ? (
                              <button
                                type="button"
                                onClick={() => handleAprovarPedidoBeneficio(pedido.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#E63888] hover:bg-[#d42c7a] text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-[#E63888]/20 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar Lote Financeiro</span>
                              </button>
                            ) : (
                              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Integrado à Tesouraria</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* -------------------------------------------------------- */}
          {/* TAB 5: 5. PONTO E JORNADA (REP-P 671 MTE)                */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'ponto' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-sky-400" />
                      <span>Disk Ponto Eletrônico (REP-P Portaria 671 MTE)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Registro de Ponto Eletrônico em Programa (REP-P) com comprovante assinado digitalmente com SHA-256 e validação por cerca virtual.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalPontoAberto(true)}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Abrir Simulador REP-P</span>
                  </button>
                </div>

                {/* Tabela de Batidas */}
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">NSR / Horário</th>
                        <th className="p-3">Colaborador</th>
                        <th className="p-3">Tipo Batida</th>
                        <th className="p-3">Localização / Geofence</th>
                        <th className="p-3">Assinatura SHA-256</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {registrosPonto.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3">
                            <div className="font-mono font-bold text-sky-400">NSR #{reg.nsr}</div>
                            <div className="text-[10px] text-slate-400">{reg.timestamp}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{reg.colaborador}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{reg.matricula}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                              {reg.tipo}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="text-white flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{reg.localizacao}</span>
                            </div>
                            <div className="text-[10px] text-emerald-400">
                              Dentro da cerca ({reg.distanciaMetros}m do centro)
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={reg.hashSHA256}>
                            {reg.hashSHA256}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Seção de Cercas Virtuais */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Cercas Virtuais Cadastradas ({geofences.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setModalNovaGeofence(true)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      + Nova Cerca
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {geofences.map((geo) => (
                      <div key={geo.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{geo.nome}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {geo.raioMetros}m tolerância
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{geo.endereco}</div>
                        {geo.eventoVinculado && (
                          <div className="text-[10px] text-purple-400 font-semibold pt-1">
                            Vinculado: {geo.eventoVinculado}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 6: 6. TALENTOS E DESENVOLVIMENTO                     */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'talentos' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>Talentos, Treinamentos &amp; Desenvolvimento</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Ciclo 2026/2
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Matriz de capacitação para arenas, segurança de portaria, prevenção a fraudes de bilhetagem e planos de carreira internos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs font-bold text-white">Treinamento Portaria &amp; Catracas</div>
                    <div className="text-[11px] text-slate-400 mt-1">Conformidade e resolução de ingressos com QR Code dinâmico</div>
                    <div className="text-xs font-bold text-emerald-400 mt-3">100% Concluído (42 staffs)</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs font-bold text-white">Prevenção a Fraudes &amp; Antifraude</div>
                    <div className="text-[11px] text-slate-400 mt-1">Protocolo operacional EDDIE 11.34 e identificação de repasses</div>
                    <div className="text-xs font-bold text-sky-400 mt-3">95% Concluído (40 staffs)</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-xs font-bold text-white">Atendimento SAC &amp; Resolução VIP</div>
                    <div className="text-[11px] text-slate-400 mt-1">Boas práticas de acolhimento em camarotes e pista premium</div>
                    <div className="text-xs font-bold text-purple-400 mt-3">88% Concluído (37 staffs)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 7: 7. SAÚDE E SEGURANÇA (NR-7 / NR-6)                */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-400" />
                    <span>Saúde Ocupacional &amp; Segurança do Trabalho</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    100% ASO Vigente
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Conformidade obrigatória com as NRs do Ministério do Trabalho: PCMSO (NR-7), Ficha de Entrega de EPIs para montagem e desmontagem de arenas (NR-6) e CIPA.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-amber-400" />
                      <span>EPIs de Operação em Arenas</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                      <li>&bull; Protetor auricular tipo concha com redução de ruído (pista/palco)</li>
                      <li>&bull; Colete refletivo de identificação operacional DiskIngressos</li>
                      <li>&bull; Rádio comunicador profissional homologado pela Anatel</li>
                      <li>&bull; Calçado de segurança antiderrapante para áreas úmidas</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Controle de Exames (ASO NR-7)</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Todos os 42 colaboradores possuem ASO admissional/periódico vigente e apto para trabalho diurno e noturno em grandes eventos.
                    </p>
                    <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                      Próxima renovação em lote: Novembro/2026
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 8: 8. EVENTOS E CUSTOS (DRE)                         */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'eventos' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      <span>Equipes por Evento &amp; Apropriação Contábil no DRE</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Alocação de coordenadores e staffs de arena com débito automático no centro de custos do evento.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalExportarDre(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Apropriar Custos no DRE</span>
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {staffEventos.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-white">{ev.evento}</div>
                        <div className="text-xs text-slate-400">
                          {ev.data} &bull; {ev.local} &bull; Coordenação: {ev.coordenador}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {ev.totalColaboradores} colaboradores escalados
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-purple-400 font-mono">
                          R$ {ev.custoTotalPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {ev.statusDRE}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 9: 9. PORTAIS E GESTÃO                               */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'portais' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-sky-400" />
                    <span>Portais de Autoatendimento &amp; Gestão Móvel</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    PWA Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Canais de acesso móvel: Portal do Colaborador (espelho de ponto e comprovantes assinados) e Totem de Ponto em Arenas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <SmartphoneNfc className="w-4 h-4 text-emerald-400" />
                      <span>App Colaborador DiskIngressos</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Disponível em PWA e APK com suporte a geolocalização offline, registro com biometria facial e espelho em tempo real.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalPontoAberto(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition mt-2 cursor-pointer"
                    >
                      Abrir Simulador do App
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-sky-400" />
                      <span>Totem Fixo REP-P de Arena</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Totem instalado nos portões de acesso de staff da Ligga Arena e Pedreira Paulo Leminski para batidas de alta velocidade.
                    </p>
                    <div className="text-[11px] text-sky-400 font-mono pt-1">
                      Conexão: 5G Redundante com Fallback Offline
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 10: 10. ADMINISTRAÇÃO DO RH                          */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'administracao' && (
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Administração Legal, Parâmetros REP-P &amp; LGPD</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Portaria 671 MTE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Parâmetros de conformidade trabalhista, geração de comprovantes imutáveis com SHA-256 e trilha de auditoria para o Ministério do Trabalho e eSocial.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Número Sequencial de Registro (NSR)</div>
                      <div className="text-[11px] text-slate-400">Contador estritamente crescente e inviolável por empresa</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      NSR #{registrosPonto.length > 0 ? Math.max(...registrosPonto.map((r) => r.nsr)) : 48924}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Assinatura Digital dos Registros</div>
                      <div className="text-[11px] text-slate-400">Algoritmo SHA-256 aplicado a cada evento de entrada e saída</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-sky-400">SHA-256 Ativo</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Conformidade LGPD &amp; Retenção</div>
                      <div className="text-[11px] text-slate-400">Dados biométricos e de GPS retidos sob estrita finalidade trabalhista</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-400">Auditoria OK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SIMULADOR DISK PONTO (REP-P 671 MTE)            */}
      {/* ======================================================== */}
      {modalPontoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Simulador REP-P 671 MTE</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPontoAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sucessoPonto ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p>{sucessoPonto}</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Selecione o Colaborador
                  </label>
                  <select
                    value={pontoColaboradorId}
                    onChange={(e) => setPontoColaboradorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                  >
                    {colaboradores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.matricula}) &bull; {c.cargo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Status do GPS:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Dentro da Cerca Autorizada
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tolerância máxima: 300m &bull; Precisão do GPS: &plusmn;4m
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRegistrarBatida('ENTRADA')}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegistrarBatida('INICIO_INTERVALO')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition cursor-pointer"
                  >
                    Início Intervalo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegistrarBatida('FIM_INTERVALO')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs transition cursor-pointer"
                  >
                    Retorno Intervalo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegistrarBatida('SAIDA')}
                    className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Saída
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADMISSÃO DIGITAL (+ NOVO COLABORADOR)           */}
      {/* ======================================================== */}
      {modalNovoColaborador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Admissão Digital de Colaborador</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoColaborador(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoColaborador} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={novoColabForm.nome}
                  onChange={(e) => setNovoColabForm({ ...novoColabForm, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Coordenador de Portaria"
                    value={novoColabForm.cargo}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, cargo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Departamento</label>
                  <select
                    value={novoColabForm.departamento}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, departamento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                  >
                    <option value="Staff de Eventos">Staff de Eventos</option>
                    <option value="Operações & Portaria">Operações &amp; Portaria</option>
                    <option value="Controladoria & RH">Controladoria &amp; RH</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Bilheteria & SAC">Bilheteria &amp; SAC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo de Contrato</label>
                  <select
                    value={novoColabForm.tipoContrato}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, tipoContrato: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                  >
                    <option value="CLT">CLT (Mensalista)</option>
                    <option value="TEMPORARIO">Temporário (Arena)</option>
                    <option value="PJ">PJ (Prestador)</option>
                    <option value="ESTAGIO">Estágio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Salário / Diária (R$)</label>
                  <input
                    type="number"
                    placeholder="3200.00"
                    value={novoColabForm.salario}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, salario: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Cerca Virtual de Ponto</label>
                <select
                  value={novoColabForm.geofenceAutorizada}
                  onChange={(e) => setNovoColabForm({ ...novoColabForm, geofenceAutorizada: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                >
                  <option value="Ligga Arena (Arena da Baixada)">Ligga Arena (Arena da Baixada)</option>
                  <option value="Sede DiskIngressos Curitiba (150m)">Sede DiskIngressos Curitiba</option>
                  <option value="Pedreira Paulo Leminski (400m)">Pedreira Paulo Leminski</option>
                  <option value="Teatro Positivo Grande Auditório (200m)">Teatro Positivo</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoColaborador(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition cursor-pointer"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: NOVA CERCA VIRTUAL (GEOFENCE)                   */}
      {/* ======================================================== */}
      {modalNovaGeofence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Nova Cerca Virtual para Arenas</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovaGeofence(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaGeofence} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome do Local</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Estádio Couto Pereira"
                  value={novaGeofenceForm.nome}
                  onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Rua Ubaldino do Amaral, 37 - Curitiba, PR"
                  value={novaGeofenceForm.endereco}
                  onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, endereco: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo de Local</label>
                  <select
                    value={novaGeofenceForm.tipo}
                    onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                  >
                    <option value="ARENA">Arena / Estádio</option>
                    <option value="ESPACO_ABERTO">Espaço Aberto / Parque</option>
                    <option value="TEATRO">Teatro / Auditório</option>
                    <option value="SEDE">Sede Corporativa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Raio de Tolerância (m)</label>
                  <input
                    type="number"
                    value={novaGeofenceForm.raioMetros}
                    onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, raioMetros: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovaGeofence(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold transition cursor-pointer"
                >
                  Criar Cerca Virtual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DOSSIÊ DO COLABORADOR                           */}
      {/* ======================================================== */}
      {colaboradorDossie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Dossiê Digital do Colaborador</h3>
              </div>
              <button
                type="button"
                onClick={() => setColaboradorDossie(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  {colaboradorDossie.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{colaboradorDossie.nome}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Matrícula: {colaboradorDossie.matricula} &bull; Admissão: {colaboradorDossie.admissao}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Cargo &amp; Depto</div>
                  <div className="font-semibold text-white mt-0.5">{colaboradorDossie.cargo}</div>
                  <div className="text-[10px] text-emerald-400">{colaboradorDossie.departamento}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Salário &amp; Contrato</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    R$ {colaboradorDossie.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400">{colaboradorDossie.tipoContrato}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Assinatura Digital do Contrato</div>
                <div className="font-mono text-[10px] text-slate-300 break-all">
                  SHA-256: 8f4a3c2e1b0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                  Validade ASO: {colaboradorDossie.asoValidade} &bull; Banco de Horas: {colaboradorDossie.bancoHoras}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setColaboradorDossie(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REMESSA PIX FOLHA TESOURARIA                    */}
      {/* ======================================================== */}
      {modalRemessaPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Disparar Remessa PIX Tesouraria</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRemessaPix(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                A remessa da folha será enviada para o módulo de <strong>Tesouraria &amp; Bancos (EDDIE 11.25)</strong> para liquidação instantânea via PIX Direto nos bancos cadastrados.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Colaboradores:</span>
                  <span className="text-white">42 beneficiários</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Competência:</span>
                  <span className="text-white">10/2026</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800 text-sm font-bold">
                  <span className="text-white">Total Líquido:</span>
                  <span className="text-emerald-400">R$ 164.820,00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalRemessaPix(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemessaPixStatus('ENVIADO');
                  setModalRemessaPix(false);
                  showToast('Remessa de R$ 164.820,00 enviada para Tesouraria via PIX Direto!');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar Envio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: APROPRIAÇÃO CONTÁBIL DRE                        */}
      {/* ======================================================== */}
      {modalExportarDre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Apropriar Custos no DRE do Evento</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalExportarDre(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Esta ação lançará automaticamente os custos operacionais de pessoal nas contas contábeis do <strong>Módulo Contabilidade (EDDIE 11.21)</strong> e no Ledger Imutável.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                {staffEventos.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{s.evento}:</span>
                    <span className="text-purple-400 font-bold font-mono">
                      R$ {s.custoTotalPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                  <span className="text-white">Total Apropriado:</span>
                  <span className="text-emerald-400 font-black">
                    R$ {staffEventos.reduce((a, b) => a + b.custoTotalPessoal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalExportarDre(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDreExportado(true);
                  setStaffEventos((prev) => prev.map((s) => ({ ...s, statusDRE: 'APROPRIADO_DRE' })));
                  setModalExportarDre(false);
                  showToast('Custos de pessoal apropriados com sucesso no DRE dos Eventos!');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar no Ledger DRE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: CONFIGURAÇÃO DE BOLSOS CAJU (CAJU WALLETS)       */}
      {/* ======================================================== */}
      {modalConfigCaju && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E63888] text-white flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configurar Bolsos Caju Benefícios</h3>
                  <p className="text-[10px] text-slate-400">Validação matemática e compliance PAT / Lei do Vale-Transporte</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalConfigCaju(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Colaborador</label>
                <select
                  value={cajuEditForm.colaboradorId}
                  onChange={(e) => {
                    const c = cajuConfigs.find((col) => col.colaboradorId === e.target.value);
                    if (c) {
                      setCajuEditForm({
                        colaboradorId: c.colaboradorId,
                        verbaTotalMensal: c.verbaTotalMensal,
                        saldoRefeicao: c.saldoRefeicao,
                        saldoAlimentacao: c.saldoAlimentacao,
                        saldoMobilidade: c.saldoMobilidade,
                        saldoCultura: c.saldoCultura,
                        saldoLivre: c.saldoLivre,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                >
                  {cajuConfigs.map((col) => (
                    <option key={col.colaboradorId} value={col.colaboradorId}>
                      {col.nome} ({col.matricula}) — Salário: R$ {col.salario.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Verba Total Mensal Disponibilizada (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cajuEditForm.verbaTotalMensal}
                  onChange={(e) =>
                    setCajuEditForm({
                      ...cajuEditForm,
                      verbaTotalMensal: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold outline-none focus:border-[#E63888]"
                />
              </div>

              {/* 5 Bolsos */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Alocação por Bolsos</span>
                  <span className="text-[#E63888] font-normal normal-case text-[10px]">
                    Multi-Bolsos Cartão Elo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-[#E63888]" />
                      <span>Refeição (PAT)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cajuEditForm.saldoRefeicao}
                      onChange={(e) =>
                        setCajuEditForm({
                          ...cajuEditForm,
                          saldoRefeicao: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none focus:border-[#E63888]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3 text-orange-400" />
                      <span>Alimentação (PAT)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cajuEditForm.saldoAlimentacao}
                      onChange={(e) =>
                        setCajuEditForm({
                          ...cajuEditForm,
                          saldoAlimentacao: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Car className="w-3 h-3 text-sky-400" />
                      <span>Mobilidade (VT)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cajuEditForm.saldoMobilidade}
                      onChange={(e) =>
                        setCajuEditForm({
                          ...cajuEditForm,
                          saldoMobilidade: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-purple-400" />
                      <span>Cultura</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cajuEditForm.saldoCultura}
                      onChange={(e) =>
                        setCajuEditForm({
                          ...cajuEditForm,
                          saldoCultura: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>Livre / Premiações (Incide IRRF)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cajuEditForm.saldoLivre}
                    onChange={(e) =>
                      setCajuEditForm({
                        ...cajuEditForm,
                        saldoLivre: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Medidor Matemático em Tempo Real */}
              {(() => {
                const soma =
                  cajuEditForm.saldoRefeicao +
                  cajuEditForm.saldoAlimentacao +
                  cajuEditForm.saldoMobilidade +
                  cajuEditForm.saldoCultura +
                  cajuEditForm.saldoLivre;
                const dif = Math.round((soma - cajuEditForm.verbaTotalMensal) * 100) / 100;
                const valido = Math.abs(dif) <= 0.01;

                return (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      valido
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {valido ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">
                        {valido
                          ? 'Validação Matemática Aprovada (100% da verba alocada)'
                          : `Divergência de Alocação: ${dif > 0 ? '+' : ''}R$ ${dif.toFixed(2)}`}
                      </div>
                      <div className="text-[11px] opacity-90">
                        Soma dos Bolsos: <span className="font-mono font-bold">R$ {soma.toFixed(2)}</span> &bull; Verba Total: <span className="font-mono font-bold">R$ {cajuEditForm.verbaTotalMensal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalConfigCaju(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCajuBolsos}
                className="px-4 py-2 rounded-xl bg-[#E63888] hover:bg-[#d42c7a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#E63888]/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Bolsos Caju</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: FATURA E DOSSIÊ FINANCEIRO DO PEDIDO DE BENEFÍCIOS */}
      {/* ======================================================== */}
      {modalDossieBeneficio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#E63888]" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Fatura &amp; Dossiê de Recarga de Benefícios
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {modalDossieBeneficio.fornecedorNome} &bull; Competência {competenciaBeneficio}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDossieBeneficio(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Fornecedor:</span>
                  <span className="font-bold text-white">{modalDossieBeneficio.fornecedorNome}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>CNPJ da Operadora:</span>
                  <span className="font-mono text-slate-300">{modalDossieBeneficio.cnpj}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Qtd de Vidas Recarregadas:</span>
                  <span className="font-bold text-white">{modalDossieBeneficio.qtdVidas} colaboradores</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Chave de Idempotência:</span>
                  <span className="font-mono text-[10px] text-sky-400">{modalDossieBeneficio.idempotencyKey}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                  <span className="text-white">Valor Total Faturado:</span>
                  <span className="text-lg font-black text-[#E63888] font-mono">
                    R$ {modalDossieBeneficio.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* PIX Copia e Cola */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PIX Copia e Cola (Banco Central)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(modalDossieBeneficio.codigoPix);
                        showToast('Código PIX Copia e Cola copiado para a área de transferência!');
                      }
                    }}
                    className="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar PIX</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all">
                  {modalDossieBeneficio.codigoPix}
                </div>
              </div>

              {/* Código de Barras Boleto */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                    <span>Linha Digitável do Boleto Bancário</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(modalDossieBeneficio.codigoBarras);
                        showToast('Código de Barras copiado!');
                      }
                    }}
                    className="text-[10px] text-sky-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  {modalDossieBeneficio.codigoBarras}
                </div>
              </div>

              {/* Status do Pedido */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-xs">Status da Integração:</span>
                {modalDossieBeneficio.status === 'APROVADO_FINANCEIRO' ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovado Financeiro ({modalDossieBeneficio.aprovadoPor || 'Tesouraria'})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Aguardando Aprovação Financeira</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalDossieBeneficio(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Fechar
              </button>
              {modalDossieBeneficio.status !== 'APROVADO_FINANCEIRO' && (
                <button
                  type="button"
                  onClick={() => handleAprovarPedidoBeneficio(modalDossieBeneficio.id)}
                  className="px-4 py-2 rounded-xl bg-[#E63888] hover:bg-[#d42c7a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#E63888]/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar e Integrar à Tesouraria</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FLOATING TOAST NOTIFICATION                             */}
      {/* ======================================================== */}
      {toastMensagem && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMensagem}</span>
        </div>
      )}
    </div>
  );
}
