'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { useAuthSession } from '../../components/AuthSessionContext';
import { ModuleNavigation, type ModuleNavigationItem } from '../../components/navigation/ModuleNavigation';

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
    salario: 8400.00,
    admissao: '12/03/2021',
    status: 'ATIVO',
    geofenceAutorizada: 'Sede DiskIngressos Curitiba (150m)',
    avatar: 'KS',
    email: 'karine@diskingressos.com.br',
    bancoHoras: '+14h 20m',
    asoValidade: '15/11/2026'
  },
  {
    id: 'colab-002',
    matricula: 'DK-1088',
    nome: 'Lucas Ferreira dos Santos',
    cargo: 'Coordenador Operacional de Eventos',
    departamento: 'Operações & Portaria',
    tipoContrato: 'CLT',
    salario: 6200.00,
    admissao: '05/08/2022',
    status: 'ATIVO',
    geofenceAutorizada: 'Ligga Arena (300m)',
    avatar: 'LF',
    email: 'lucas.santos@diskingressos.com.br',
    bancoHoras: '+28h 40m',
    asoValidade: '20/12/2026'
  },
  {
    id: 'colab-003',
    matricula: 'DK-1102',
    nome: 'Mariana Duarte Souza',
    cargo: 'Analista de Departamento Pessoal',
    departamento: 'Recursos Humanos',
    tipoContrato: 'CLT',
    salario: 4800.00,
    admissao: '10/01/2023',
    status: 'ATIVO',
    geofenceAutorizada: 'Sede DiskIngressos Curitiba (150m)',
    avatar: 'MD',
    email: 'mariana.duarte@diskingressos.com.br',
    bancoHoras: '+06h 15m',
    asoValidade: '10/01/2027'
  },
  {
    id: 'colab-004',
    matricula: 'DK-1150',
    nome: 'Carlos Eduardo Mendes',
    cargo: 'Líder de Bilheteria e Caixa',
    departamento: 'Operações de Campo',
    tipoContrato: 'CLT',
    salario: 3900.00,
    admissao: '15/06/2023',
    status: 'ATIVO',
    geofenceAutorizada: 'Pedreira Paulo Leminski (300m)',
    avatar: 'CE',
    email: 'carlos.mendes@diskingressos.com.br',
    bancoHoras: '+18h 50m',
    asoValidade: '14/06/2027'
  },
  {
    id: 'colab-005',
    matricula: 'DK-1201',
    nome: 'Beatriz Almeida Rocha',
    cargo: 'Supervisora de Atendimento SAC',
    departamento: 'Atendimento & SAC',
    tipoContrato: 'CLT',
    salario: 4500.00,
    admissao: '03/04/2024',
    status: 'FERIAS',
    geofenceAutorizada: 'Sede DiskIngressos Curitiba (150m)',
    avatar: 'BA',
    email: 'beatriz.rocha@diskingressos.com.br',
    bancoHoras: '-02h 10m',
    asoValidade: '03/04/2027'
  },
  {
    id: 'colab-006',
    matricula: 'DK-TMP-401',
    nome: 'Rafael Nogueira Lima',
    cargo: 'Operador de Catraca / Check-in',
    departamento: 'Staff de Eventos',
    tipoContrato: 'TEMPORARIO',
    salario: 220.00, // diária
    admissao: '01/10/2026',
    status: 'ATIVO',
    geofenceAutorizada: 'Festival Disk Live (300m)',
    avatar: 'RN',
    email: 'rafael.temporario@diskingressos.com.br',
    bancoHoras: '00h 00m',
    asoValidade: '30/10/2026'
  }
];

interface RegistroPontoSimulado {
  id: string;
  nsr: number;
  colaboradorNome: string;
  cargo: string;
  tipo: 'ENTRADA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM' | 'SAIDA';
  dataHora: string;
  geofenceNome: string;
  precisaoMetros: number;
  distanciaMetros: number;
  dentroGeofence: boolean;
  modo: string;
  hashIntegridade: string;
}

const registrosPontoMock: RegistroPontoSimulado[] = [
  {
    id: 'pnt-8801',
    nsr: 10452,
    colaboradorNome: 'Karine Santos',
    cargo: 'Supervisora Financeira & RH',
    tipo: 'ENTRADA',
    dataHora: '05/10/2026 08:02:14',
    geofenceNome: 'Sede DiskIngressos Curitiba',
    precisaoMetros: 12,
    distanciaMetros: 34,
    dentroGeofence: true,
    modo: 'REP-P Online (Disk Ponto APK)',
    hashIntegridade: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'pnt-8802',
    nsr: 10453,
    colaboradorNome: 'Lucas Ferreira dos Santos',
    cargo: 'Coordenador Operacional de Eventos',
    tipo: 'ENTRADA',
    dataHora: '05/10/2026 08:14:30',
    geofenceNome: 'Ligga Arena (Arena da Baixada)',
    precisaoMetros: 9,
    distanciaMetros: 82,
    dentroGeofence: true,
    modo: 'REP-P Online (Disk Ponto APK)',
    hashIntegridade: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  },
  {
    id: 'pnt-8803',
    nsr: 10454,
    colaboradorNome: 'Mariana Duarte Souza',
    cargo: 'Analista de Departamento Pessoal',
    tipo: 'ENTRADA',
    dataHora: '05/10/2026 08:29:55',
    geofenceNome: 'Sede DiskIngressos Curitiba',
    precisaoMetros: 14,
    distanciaMetros: 48,
    dentroGeofence: true,
    modo: 'REP-P Online (Disk Ponto APK)',
    hashIntegridade: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
  },
  {
    id: 'pnt-8804',
    nsr: 10455,
    colaboradorNome: 'Carlos Eduardo Mendes',
    cargo: 'Líder de Bilheteria e Caixa',
    tipo: 'ENTRADA',
    dataHora: '05/10/2026 08:35:10',
    geofenceNome: 'Pedreira Paulo Leminski',
    precisaoMetros: 8,
    distanciaMetros: 110,
    dentroGeofence: true,
    modo: 'REP-P Online (Disk Ponto APK)',
    hashIntegridade: 'b5a2c9b149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44'
  }
];

interface GeofenceItem {
  id: string;
  nome: string;
  tipo: 'SEDE' | 'ARENA' | 'TEATRO' | 'ESPACO_ABERTO';
  latitude: number;
  longitude: number;
  raioMetros: number;
  endereco: string;
  eventoVinculado: string;
  colaboradoresAtivos: number;
}

const geofencesMock: GeofenceItem[] = [
  {
    id: 'geo-01',
    nome: 'Sede Administrativa DiskIngressos',
    tipo: 'SEDE',
    latitude: -25.4284,
    longitude: -49.2733,
    raioMetros: 150,
    endereco: 'Rua Marechal Deodoro, 630 - Centro, Curitiba/PR',
    eventoVinculado: 'Geral Corporativo',
    colaboradoresAtivos: 18
  },
  {
    id: 'geo-02',
    nome: 'Ligga Arena (Club Athletico Paranaense)',
    tipo: 'ARENA',
    latitude: -25.4484,
    longitude: -49.2771,
    raioMetros: 300,
    endereco: 'Rua Buenos Aires, 1260 - Água Verde, Curitiba/PR',
    eventoVinculado: 'Festival DiskIngressos Live 2026',
    colaboradoresAtivos: 14
  },
  {
    id: 'geo-03',
    nome: 'Pedreira Paulo Leminski & Ópera de Arame',
    tipo: 'ESPACO_ABERTO',
    latitude: -25.3857,
    longitude: -49.2789,
    raioMetros: 350,
    endereco: 'Rua João Gava, 970 - Abranches, Curitiba/PR',
    eventoVinculado: 'Turnê Nacional Rock Fest 2026',
    colaboradoresAtivos: 8
  },
  {
    id: 'geo-04',
    nome: 'Teatro Positivo Grande Auditório',
    tipo: 'TEATRO',
    latitude: -25.4468,
    longitude: -49.3582,
    raioMetros: 200,
    endereco: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300 - Curitiba/PR',
    eventoVinculado: 'Show Artista A - Acústico',
    colaboradoresAtivos: 2
  }
];

interface StaffEvento {
  id: string;
  eventoNome: string;
  local: string;
  data: string;
  totalPessoas: number;
  custoClt: number;
  custoFreelancers: number;
  horasExtrasEstimadas: number;
  custoTotalPessoal: number;
  statusDRE: 'PREVISTO' | 'EM_APROPRIACAO' | 'APROPRIADO_DRE';
}

const staffEventosMock: StaffEvento[] = [
  {
    id: 'stf-01',
    eventoNome: 'Festival DiskIngressos Live 2026',
    local: 'Ligga Arena - Curitiba',
    data: '10/10/2026 a 12/10/2026',
    totalPessoas: 48,
    custoClt: 14200.00,
    custoFreelancers: 26400.00,
    horasExtrasEstimadas: 3800.00,
    custoTotalPessoal: 44400.00,
    statusDRE: 'EM_APROPRIACAO'
  },
  {
    id: 'stf-02',
    eventoNome: 'Turnê Nacional Rock Fest 2026',
    local: 'Pedreira Paulo Leminski',
    data: '24/10/2026',
    totalPessoas: 32,
    custoClt: 9800.00,
    custoFreelancers: 18200.00,
    horasExtrasEstimadas: 2400.00,
    custoTotalPessoal: 30400.00,
    statusDRE: 'PREVISTO'
  },
  {
    id: 'stf-03',
    eventoNome: 'Show Artista A - Acústico',
    local: 'Teatro Positivo',
    data: '02/10/2026',
    totalPessoas: 12,
    custoClt: 4100.00,
    custoFreelancers: 4800.00,
    horasExtrasEstimadas: 800.00,
    custoTotalPessoal: 9700.00,
    statusDRE: 'APROPRIADO_DRE'
  }
];

interface SolicitacaoAprovacao {
  id: string;
  tipo: string;
  tipoBadge: string;
  titulo: string;
  detalhe: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
}

const solicitacoesIniciais: SolicitacaoAprovacao[] = [
  {
    id: 'sol-01',
    tipo: 'Ajuste de Ponto',
    tipoBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    titulo: 'Mariana Duarte • 02/10/2026',
    detalhe: 'Esquecimento de registro de saída • Horário correto: 18:05 • Justificativa: Atendimento de emergência',
    status: 'PENDENTE',
  },
  {
    id: 'sol-02',
    tipo: 'Solicitação de Férias',
    tipoBadge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    titulo: 'Lucas Ferreira dos Santos • 20 dias + 10 dias abono',
    detalhe: 'Período: 15/11/2026 a 04/12/2026 • Saldo aquisitivo: 30 dias • Gestor direto aprovou',
    status: 'PENDENTE',
  },
  {
    id: 'sol-03',
    tipo: 'Reembolso de Despesa',
    tipoBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    titulo: 'Carlos Mendes • R$ 340,00',
    detalhe: 'Transporte e alimentação em operação de bilheteria • 2 cupons fiscais anexos',
    status: 'PENDENTE',
  },
];

function RecursosHumanosContent() {
  const { evento } = useProducerEvent();
  const { currentUser } = useAuthSession();

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'visao' | 'colaboradores' | 'ponto' | 'geofences' | 'equipes' | 'folha' | 'aprovacoes' | 'auditoria' | null;

  const [activeTab, setActiveTab] = useState<'visao' | 'colaboradores' | 'ponto' | 'geofences' | 'equipes' | 'folha' | 'aprovacoes' | 'auditoria'>(tabParam || 'visao');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Estados principais
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(colaboradoresIniciais);
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPontoSimulado[]>(registrosPontoMock);
  const [geofences, setGeofences] = useState<GeofenceItem[]>(geofencesMock);
  const [staffEventos, setStaffEventos] = useState<StaffEvento[]>(staffEventosMock);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAprovacao[]>(solicitacoesIniciais);

  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDepto, setFiltroDepto] = useState('ALL');

  // Estados dos Modais
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

  // Filtro de colaboradores
  const colaboradoresFiltrados = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepto = filtroDepto === 'ALL' || c.departamento.includes(filtroDepto);
    return matchesSearch && matchesDepto;
  });

  const handleSimularPonto = () => {
    setModalPontoAberto(true);
    setSucessoPonto(null);
  };

  const handleConfirmarPonto = (tipo: 'ENTRADA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM' | 'SAIDA') => {
    const colab = colaboradores.find(c => c.id === pontoColaboradorId) || colaboradores[0]!;
    const nsr = 10456 + Math.floor(Math.random() * 500);
    const hash = 'a9f2' + Math.random().toString(16).substring(2, 10) + '...' + colab.matricula.toLowerCase();
    const now = new Date();
    const dataHoraStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');

    const novoRegistro: RegistroPontoSimulado = {
      id: `pnt-${Date.now()}`,
      nsr,
      colaboradorNome: colab.nome,
      cargo: colab.cargo,
      tipo,
      dataHora: dataHoraStr,
      geofenceNome: colab.geofenceAutorizada || 'Sede DiskIngressos Curitiba',
      precisaoMetros: 10,
      distanciaMetros: 25,
      dentroGeofence: true,
      modo: 'REP-P Online (Disk Ponto APK)',
      hashIntegridade: hash,
    };

    setRegistrosPonto(prev => [novoRegistro, ...prev]);
    setSucessoPonto(`Ponto registrado com sucesso! NSR: ${nsr} • Hash SHA-256: ${hash}`);
    showToast(`Batida de ponto (${tipo}) registrada para ${colab.nome} com sucesso!`);
    setTimeout(() => {
      setModalPontoAberto(false);
      setSucessoPonto(null);
    }, 2200);
  };

  const handleSalvarNovoColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoColabForm.nome.trim() || !novoColabForm.cargo.trim()) {
      alert('Por favor, informe o nome completo e cargo do colaborador.');
      return;
    }

    const initials = novoColabForm.nome
      .trim()
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
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

    setColaboradores(prev => [novoColab, ...prev]);
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
      alert('Por favor, informe o nome do local da cerca.');
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

    setGeofences(prev => [nova, ...prev]);
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
    setSolicitacoes(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
    showToast(status === 'APROVADO' ? 'Solicitação aprovada e homologada com sucesso!' : 'Solicitação rejeitada com justificativa.');
  };

  const pendentesAprovacao = solicitacoes.filter(s => s.status === 'PENDENTE').length;

  const navItems: ModuleNavigationItem[] = [
    { id: 'visao', label: 'Visão Geral RH', icon: <Award className="w-4 h-4" /> },
    { id: 'colaboradores', label: 'Colaboradores & Cargos', icon: <Users className="w-4 h-4" />, badge: colaboradores.length },
    { id: 'ponto', label: 'Ponto & Jornada (REP-P)', icon: <Clock className="w-4 h-4" />, badge: `${registrosPonto.length} Batidas` },
    { id: 'geofences', label: 'Cercas Virtuais (Geofences)', icon: <MapPin className="w-4 h-4" />, badge: geofences.length },
    { id: 'equipes', label: 'Equipes por Evento (DRE)', icon: <Briefcase className="w-4 h-4" />, badge: staffEventos.length },
    { id: 'folha', label: 'Folha & Benefícios', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'aprovacoes', label: 'Central de Aprovações (SoD)', icon: <CheckCircle2 className="w-4 h-4" />, badge: pendentesAprovacao > 0 ? `${pendentesAprovacao} Pendentes` : '0' },
    { id: 'auditoria', label: 'Auditoria & LGPD', icon: <ShieldCheck className="w-4 h-4" />, badge: 'SHA-256' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>RH Disk &amp; Gestão de Pessoas</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                Portaria 671 MTE (REP-P)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                Geofence &amp; Cercas Virtuais
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                DRE por Evento
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Recursos Humanos &amp; Disk Ponto
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Jornada funcional completa: admissão digital, espelho de ponto Portaria 671 MTE com validação de cerca virtual, gestão de férias, folha mensal e apropriação dos custos de equipes e freelancers no DRE de cada evento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimularPonto}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simular Disk Ponto (APK)</span>
              </button>
              <button
                onClick={() => alert('Sincronização com eSocial e Conectores de Folha realizada com sucesso!')}
                className="text-xs px-3 py-2 rounded-xl font-medium border transition bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 flex items-center gap-1.5"
                title="Sincronizar eventos periódicos eSocial S-1200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>eSocial S-1200</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Motor de Ponto Online • Servidor UTC-3</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS (8 KPIs EXECUTIVOS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Colaboradores</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">42</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>34 CLT &bull; 8 Temporários</span>
            <span className="text-emerald-400 font-bold">100% Ativos</span>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Presentes no Ponto</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">38</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Geofence validado</span>
            <span className="text-sky-400 font-bold">90,5% Escala</span>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Banco de Horas</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">+184h</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Competência 10/2026</span>
            <span className="text-amber-400 font-bold">Média +4,3h</span>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800 hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Custos Staff Eventos</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">R$ 84.500</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Apropriado no DRE</span>
            <span className="text-purple-400 font-bold">3 Eventos</span>
          </div>
        </div>
      </div>

      {/* 3. NAVEGAÇÃO RESPONSIVA DO MÓDULO (IGUAL AOS DEMAIS MÓDULOS DO EDDIE) */}
      <ModuleNavigation
        items={navItems}
        activeItem={activeTab}
        onSelect={(tabId) => {
          setActiveTab(tabId as any);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            window.history.replaceState({}, '', url.toString());
          }
        }}
        ariaLabel="Navegação de Recursos Humanos e Ponto"
      />

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === 'visao' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Resumo da Jornada */}
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" />
                  <span>Jornada Operacional do Colaborador</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Fluxo integrado: Admissão &rarr; Ponto &rarr; Evento &rarr; DRE &rarr; Folha</p>
                
                <div className="mt-5 space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Admissões em Aberto</div>
                      <div className="text-[11px] text-slate-400">2 candidatos na esteira de assinatura digital</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Admissão</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Férias Próximas (30 dias)</div>
                      <div className="text-[11px] text-slate-400">Beatriz Almeida (em gozo) &bull; Lucas Santos (agendado)</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">Férias</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Exames Ocupacionais (ASO)</div>
                      <div className="text-[11px] text-slate-400">100% de conformidade com NR-07 e NR-09</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ASO Vigente</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Segregação de Funções (SoD)</span>
                <span className="text-emerald-400 font-bold">100% Homologado</span>
              </div>
            </div>

            {/* Alocação em Eventos */}
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  <span>Mão de Obra Alocada em Eventos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Apropriação de custos diretos de bilheteria e portaria</p>

                <div className="mt-5 space-y-3">
                  {staffEventosMock.map(ev => (
                    <div key={ev.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[200px]">{ev.eventoNome}</div>
                        <div className="text-[11px] text-slate-400">{ev.totalPessoas} colaboradores &bull; {ev.local}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-purple-400">R$ {ev.custoTotalPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          ev.statusDRE === 'APROPRIADO_DRE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {ev.statusDRE}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Pessoal Eventos Mês</span>
                <span className="text-purple-400 font-bold">R$ 84.500,00</span>
              </div>
            </div>

            {/* Ponto Portaria 671 */}
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  <span>Aplicativo Disk Ponto (REP-P)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Conformidade estrita Portaria 671 MTE e cerca virtual</p>

                <div className="mt-5 space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>Cercas Virtuais Homologadas</span>
                      <span className="text-emerald-400">4 Unidades</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Raio de 150m a 350m com tolerância por Haversine</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>Assinatura Digital &amp; NSR</span>
                      <span className="text-sky-400">100% Criptografado</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Hash SHA-256 gerado atomicamente em cada marcação</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>Fila Offline com Sincronização</span>
                      <span className="text-emerald-400">Zero Duplicidade</span>
                    </div>
                    <div className="text-[11px] text-slate-400">UUID idempotente gravado no aparelho do colaborador</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={handleSimularPonto}
                  className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Abrir Terminal de Registro</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: COLABORADORES */}
      {activeTab === 'colaboradores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, cargo ou matrícula..."
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroDepto}
                onChange={(e) => setFiltroDepto(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todos os Departamentos</option>
                <option value="Controladoria">Controladoria &amp; RH</option>
                <option value="Operações">Operações &amp; Portaria</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Atendimento">Atendimento &amp; SAC</option>
                <option value="Staff">Staff de Eventos</option>
              </select>

              <button
                type="button"
                onClick={() => setModalNovoColaborador(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Colaborador</span>
              </button>
            </div>
          </div>

          <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Cargo &bull; Depto</th>
                    <th className="py-3 px-4">Tipo Contrato</th>
                    <th className="py-3 px-4">Salário / Diária</th>
                    <th className="py-3 px-4">Banco de Horas</th>
                    <th className="py-3 px-4">Cerca Autorizada</th>
                    <th className="py-3 px-4">ASO</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {colaboradoresFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center shrink-0">
                            {c.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-white">{c.nome}</div>
                            <div className="text-[11px] text-slate-400">{c.matricula} &bull; {c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{c.cargo}</div>
                        <div className="text-[11px] text-slate-400">{c.departamento}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.tipoContrato === 'CLT'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {c.tipoContrato}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        R$ {c.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {c.bancoHoras}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-300">
                        {c.geofenceAutorizada}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {c.asoValidade}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.status === 'ATIVO'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setColaboradorDossie(c)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
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

      {/* TAB 3: PONTO & JORNADA (REP-P) */}
      {activeTab === 'ponto' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Espelho de Ponto Oficial • Portaria 671 MTE</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registrador Eletrônico de Ponto via Programa (REP-P) com comprovante assinado e identificador NSR único.
              </p>
            </div>

            <button
              onClick={handleSimularPonto}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Bater Ponto Agora</span>
            </button>
          </div>

          <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">NSR</th>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Tipo Batida</th>
                    <th className="py-3 px-4">Data / Hora Exata</th>
                    <th className="py-3 px-4">Cerca Virtual Validada</th>
                    <th className="py-3 px-4">Precisão GPS</th>
                    <th className="py-3 px-4">Status Geofence</th>
                    <th className="py-3 px-4">Hash Integridade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {registrosPonto.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">
                        #{r.nsr}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {r.colaboradorNome}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {r.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {r.dataHora}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {r.geofenceNome}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {r.precisaoMetros}m ({r.distanciaMetros}m do centro)
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Dentro do Raio</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={r.hashIntegridade}>
                        {r.hashIntegridade.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GEOFENCES */}
      {activeTab === 'geofences' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Cercas Virtuais (Geofences Autorizadas)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Raios geográficos em metros onde a marcação de ponto do colaborador ou staff de evento é autorizada sem justificativa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalNovaGeofence(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Cerca Virtual</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geofences.map((g) => (
              <div key={g.id} className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {g.tipo}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      Raio: {g.raioMetros} metros
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{g.nome}</h4>
                  <p className="text-xs text-slate-400">{g.endereco}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Evento: <strong className="text-white">{g.eventoVinculado}</strong>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {g.colaboradoresAtivos} colaboradores hoje
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EQUIPES POR EVENTO (DRE) */}
      {activeTab === 'equipes' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <span>Apropriação de Pessoal no DRE dos Eventos</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cálculo de custos operacionais de mão de obra (CLT, freelancers, horas extras, alimentação e transporte) integrados diretamente ao fechamento contábil.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalExportarDre(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>{dreExportado ? 'DRE Apropriado ✓' : 'Exportar para DRE'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {staffEventos.map((stf) => (
              <div key={stf.id} className="bg-[#111827] rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{stf.eventoNome}</h4>
                    <div className="text-xs text-slate-400">{stf.local} &bull; {stf.data}</div>
                  </div>
                  <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                    stf.statusDRE === 'APROPRIADO_DRE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {stf.statusDRE}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Mão de Obra CLT</span>
                    <strong className="text-white font-mono text-sm">R$ {stf.custoClt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Freelancers / Diárias</span>
                    <strong className="text-white font-mono text-sm">R$ {stf.custoFreelancers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Horas Extras</span>
                    <strong className="text-amber-400 font-mono text-sm">R$ {stf.horasExtrasEstimadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Custo Total de Pessoal</span>
                    <strong className="text-purple-400 font-mono text-sm">R$ {stf.custoTotalPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FOLHA & BENEFÍCIOS */}
      {activeTab === 'folha' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Fechamento da Folha Mensal &amp; Benefícios</span>
                </h3>
                {remessaPixStatus === 'ENVIADO' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LOTE PIX ENVIADO À TESOURARIA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Provisões de 13º e férias, teto legal de 6% para Vale-Transporte e integração direta com a Fila PIX da Tesouraria.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalRemessaPix(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{remessaPixStatus === 'ENVIADO' ? 'Reenviar Lote PIX' : 'Gerar Remessa PIX Tesouraria'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Proventos Brutos</span>
              <div className="text-2xl font-black text-white">R$ 196.400,00</div>
              <p className="text-[11px] text-slate-400 mt-2">Salários base + Horas Extras (50% e 100%) + Adicionais Noturnos</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-slate-800 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Benefícios Concedidos</span>
              <div className="text-2xl font-black text-sky-400">R$ 38.250,00</div>
              <p className="text-[11px] text-slate-400 mt-2">Vale Refeição (VR), Vale Alimentação (VA), Combustível e VT (6% legal)</p>
            </div>

            <div className="bg-[#111827] rounded-xl border border-slate-800 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Líquido a Pagar (Tesouraria)</span>
              <div className="text-2xl font-black text-emerald-400">R$ 164.820,00</div>
              <p className="text-[11px] text-slate-400 mt-2">Previsão de liquidação via PIX no dia 05 do mês subsequente</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: APROVAÇÕES RH */}
      {activeTab === 'aprovacoes' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              <span>Central de Aprovações de RH (SoD &amp; Alçadas)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Solicitações que exigem validação do Gestor e homologação do RH antes do fechamento do espelho de ponto.
            </p>
          </div>

          <div className="space-y-3">
            {solicitacoes.map((sol) => (
              <div
                key={sol.id}
                className="bg-[#111827] rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sol.tipoBadge}`}>
                      {sol.tipo}
                    </span>
                    <span className="text-xs font-bold text-white">{sol.titulo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sol.status === 'APROVADO'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sol.status === 'REJEITADO'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sol.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{sol.detalhe}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sol.status === 'PENDENTE' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAprovarSolicitacao(sol.id, 'APROVADO')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAprovarSolicitacao(sol.id, 'REJEITADO')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {sol.status === 'APROVADO' ? '✓ Homologado no sistema' : '✕ Rejeitado com justificativa'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUDITORIA & LGPD */}
      {activeTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Trilha Imutável de Auditoria &amp; Privacidade LGPD</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro à prova de adulteração de todas as consultas, alterações salariais, marcações de ponto e downloads de documentos sensíveis.
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">[2026-10-05 11:30:12 UTC-3]</span>
                <span className="text-white ml-2">CADASTRO_COLABORADOR: Lucas Ferreira dos Santos</span>
                <span className="text-slate-500 ml-2">&bull; Usuário: Karine Santos (usr-disk-01)</span>
              </div>
              <span className="text-[10px] text-slate-400">IP: 187.55.120.44</span>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sky-400 font-bold">[2026-10-05 08:35:10 UTC-3]</span>
                <span className="text-white ml-2">REGISTRO_PONTO: NSR #10455 (Pedreira Leminski)</span>
                <span className="text-slate-500 ml-2">&bull; Colaborador: Carlos Mendes (DK-1150)</span>
              </div>
              <span className="text-[10px] text-slate-400">Hash: b5a2c9b...</span>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-purple-400 font-bold">[2026-10-05 08:00:00 UTC-3]</span>
                <span className="text-white ml-2">APROPRIACAO_DRE_STAFF: Festival DiskIngressos Live 2026</span>
                <span className="text-slate-500 ml-2">&bull; Total: R$ 44.400,00</span>
              </div>
              <span className="text-[10px] text-slate-400">DRE Ledger Integrado</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: SIMULADOR DISK PONTO MOBILE (PORTARIA 671 MTE)  */}
      {/* ======================================================== */}
      {modalPontoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Disk Ponto (Simulador APK Nativo)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPontoAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Colaborador:</label>
                <select
                  value={pontoColaboradorId}
                  onChange={(e) => setPontoColaboradorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none cursor-pointer"
                >
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.cargo} ({c.matricula})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Localização GPS:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>-25.4284, -49.2733</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cerca Autorizada:</span>
                  <span className="text-white font-medium truncate max-w-[200px]">
                    {colaboradores.find(c => c.id === pontoColaboradorId)?.geofenceAutorizada || 'Sede Disk Curitiba'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Precisão GPS:</span>
                  <span className="text-emerald-400 font-bold">10 metros (Dentro do Raio ✓)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Homologação MTE:</span>
                  <span className="text-sky-400 font-bold">Portaria 671/2021 (REP-P Certificado)</span>
                </div>
              </div>

              {sucessoPonto ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center space-y-1">
                  <div>✓ {sucessoPonto}</div>
                  <div className="text-[11px] text-slate-400 font-normal">Sincronizado instantaneamente com o Espelho de Ponto &amp; DRE</div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clique na Ação de Batida:</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleConfirmarPonto('ENTRADA')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Entrada Turno</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmarPonto('INTERVALO_INICIO')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Início Intervalo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmarPonto('INTERVALO_FIM')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Fim Intervalo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmarPonto('SAIDA')}
                      className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 rotate-90" />
                      <span>Saída Turno</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Disk Ponto Mobile v2.4 &bull; Portaria 671 MTE &bull; Assinatura SHA-256 Imutável
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADMISSÃO DIGITAL / NOVO COLABORADOR            */}
      {/* ======================================================== */}
      {modalNovoColaborador && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Admissão Digital de Colaborador</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoColaborador(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoColaborador} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva Castro"
                  value={novoColabForm.nome}
                  onChange={(e) => setNovoColabForm({ ...novoColabForm, nome: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Operadora de Catraca"
                    value={novoColabForm.cargo}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, cargo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Departamento</label>
                  <select
                    value={novoColabForm.departamento}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, departamento: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Staff de Eventos">Staff de Eventos</option>
                    <option value="Atendimento & SAC">Atendimento &amp; SAC</option>
                    <option value="Operação & NOC">Operação &amp; NOC</option>
                    <option value="Tecnologia & Produto">Tecnologia &amp; Produto</option>
                    <option value="Diretoria Executiva">Diretoria Executiva</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Contrato</label>
                  <select
                    value={novoColabForm.tipoContrato}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, tipoContrato: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="CLT">CLT (Mensal)</option>
                    <option value="PJ">PJ (Prestador)</option>
                    <option value="TEMPORARIO">Temporário (Diária)</option>
                    <option value="ESTAGIO">Estágio</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Salário Base / Diária (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 2800"
                    value={novoColabForm.salario}
                    onChange={(e) => setNovoColabForm({ ...novoColabForm, salario: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cerca Virtual Autorizada (Geofence)</label>
                <select
                  value={novoColabForm.geofenceAutorizada}
                  onChange={(e) => setNovoColabForm({ ...novoColabForm, geofenceAutorizada: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  {geofences.map(g => (
                    <option key={g.id} value={`${g.nome} (${g.raioMetros}m)`}>{g.nome} ({g.raioMetros}m)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  placeholder="nome.sobrenome@diskingressos.com.br"
                  value={novoColabForm.email}
                  onChange={(e) => setNovoColabForm({ ...novoColabForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoColaborador(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Admissão &amp; Emitir Contrato</span>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Nova Cerca Virtual (Geofence)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovaGeofence(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaGeofence} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Local / Arena *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teatro Guaíra"
                  value={novaGeofenceForm.nome}
                  onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, nome: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Rua XV de Novembro, 971 - Centro, Curitiba/PR"
                  value={novaGeofenceForm.endereco}
                  onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, endereco: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Local</label>
                  <select
                    value={novaGeofenceForm.tipo}
                    onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, tipo: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="ARENA">Arena de Show</option>
                    <option value="TEATRO">Teatro / Auditório</option>
                    <option value="ESPACO_ABERTO">Espaço Aberto / Festival</option>
                    <option value="SEDE">Sede Administrativa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Raio de Tolerância (m)</label>
                  <input
                    type="number"
                    placeholder="Ex: 200"
                    value={novaGeofenceForm.raioMetros}
                    onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, raioMetros: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Evento Vinculado</label>
                <input
                  type="text"
                  placeholder="Ex: Festival DiskIngressos Live 2026"
                  value={novaGeofenceForm.eventoVinculado}
                  onChange={(e) => setNovaGeofenceForm({ ...novaGeofenceForm, eventoVinculado: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovaGeofence(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salvar Cerca Virtual</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DOSSIÊ COMPLETO DO COLABORADOR                 */}
      {/* ======================================================== */}
      {colaboradorDossie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center border border-emerald-500/30">
                  {colaboradorDossie.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{colaboradorDossie.nome}</h3>
                  <div className="text-xs text-slate-400">{colaboradorDossie.matricula} &bull; {colaboradorDossie.cargo}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setColaboradorDossie(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Departamento</span>
                <div className="text-white font-semibold">{colaboradorDossie.departamento}</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Regime Contratual</span>
                <div className="text-white font-semibold">{colaboradorDossie.tipoContrato} &bull; R$ {colaboradorDossie.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Banco de Horas</span>
                <div className="text-emerald-400 font-bold">{colaboradorDossie.bancoHoras}</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Validade ASO</span>
                <div className="text-sky-400 font-semibold">{colaboradorDossie.asoValidade} (Apto ✓)</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-semibold">Cerca Virtual Autorizada:</div>
              <div className="text-white font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{colaboradorDossie.geofenceAutorizada}</span>
              </div>
              <div className="text-slate-400 font-semibold pt-1">Assinatura Digital do Contrato:</div>
              <div className="font-mono text-[11px] text-emerald-400 bg-black/40 p-2 rounded border border-slate-800 break-all">
                sha256:{colaboradorDossie.matricula.toLowerCase()}-e9b3a41c28f9d417e4867efdc4fb8a04
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setColaboradorDossie(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Fechar Dossiê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REMESSA PIX FOLHA TESOURARIA                   */}
      {/* ======================================================== */}
      {modalRemessaPix && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Remessa PIX Folha (Tesouraria)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRemessaPix(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Envio do lote consolidado da folha de pagamento para liquidação automática via <b>PIX Direto (EDDIE 11.25)</b>.</p>
              
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Colaboradores:</span>
                  <strong className="text-white">{colaboradores.length} contas bancárias</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Proventos Brutos:</span>
                  <span className="text-white">R$ 196.400,00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Descontos Legais &amp; Benefícios:</span>
                  <span className="text-amber-400">- R$ 31.580,00</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="text-white font-bold">Líquido a Pagar:</span>
                  <span className="text-emerald-400 font-black">R$ 164.820,00</span>
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
                  showToast('Remessa PIX de R$ 164.820,00 enviada à Tesouraria com sucesso!');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Envio para Tesouraria</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: EXPORTAR CUSTOS DE STAFF PARA DRE              */}
      {/* ======================================================== */}
      {modalExportarDre && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-purple-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Apropriação Contábil no DRE</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalExportarDre(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Os custos de mão de obra direta (CLT, freelancers, alimentação e transporte) serão apropriados nas contas de despesa do DRE de cada evento no módulo <b>Contabilidade (EDDIE 11.21)</b>.</p>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                {staffEventos.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[200px]">{s.eventoNome}:</span>
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
                  setStaffEventos(prev => prev.map(s => ({ ...s, statusDRE: 'APROPRIADO_DRE' })));
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

export default function RecursosHumanosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Carregando Recursos Humanos &amp; Disk Ponto...</div>}>
      <RecursosHumanosContent />
    </Suspense>
  );
}

