'use client';

import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { useAuthSession } from '../../components/AuthSessionContext';

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

export default function RecursosHumanosPage() {
  const { evento } = useProducerEvent();
  const { currentUser } = useAuthSession();

  const [activeTab, setActiveTab] = useState<'visao' | 'colaboradores' | 'ponto' | 'geofences' | 'equipes' | 'folha' | 'aprovacoes' | 'auditoria'>('visao');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDepto, setFiltroDepto] = useState('ALL');
  const [modalPontoAberto, setModalPontoAberto] = useState(false);
  const [sucessoPonto, setSucessoPonto] = useState<string | null>(null);

  // Filtro de colaboradores
  const colaboradoresFiltrados = colaboradoresIniciais.filter(c => {
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
    const nsr = 10456 + Math.floor(Math.random() * 100);
    const hash = 'a9f2' + Math.random().toString(16).substring(2, 10) + '...portaria671';
    setSucessoPonto(`Ponto registrado com sucesso! NSR: ${nsr} • Hash SHA-256: ${hash}`);
    setTimeout(() => {
      setModalPontoAberto(false);
      setSucessoPonto(null);
    }, 2500);
  };

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

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('visao')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'visao'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Visão Geral RH</span>
        </button>

        <button
          onClick={() => setActiveTab('colaboradores')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'colaboradores'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Colaboradores &amp; Cargos</span>
        </button>

        <button
          onClick={() => setActiveTab('ponto')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'ponto'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Ponto &amp; Jornada (REP-P)</span>
        </button>

        <button
          onClick={() => setActiveTab('geofences')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'geofences'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Cercas Virtuais (Geofences)</span>
        </button>

        <button
          onClick={() => setActiveTab('equipes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'equipes'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Equipes por Evento (DRE)</span>
        </button>

        <button
          onClick={() => setActiveTab('folha')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'folha'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Folha &amp; Benefícios</span>
        </button>

        <button
          onClick={() => setActiveTab('aprovacoes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'aprovacoes'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Aprovações RH (3)</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'auditoria'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoria &amp; LGPD</span>
        </button>
      </div>

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
                onClick={() => alert('Formulário de Admissão Digital aberto: insira os dados do colaborador.')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
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
                          onClick={() => alert(`Dossiê do Colaborador: ${c.nome}\nMatrícula: ${c.matricula}\nContrato com assinatura digital SHA-256 ativo.`)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
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
                  {registrosPontoMock.map((r) => (
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
              onClick={() => alert('Modal para cadastrar novo local de evento ou sede com geofence.')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Cerca Virtual</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geofencesMock.map((g) => (
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
              onClick={() => alert('Exportando relatório de custos de pessoal por evento para o Financeiro/DRE...')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Exportar para DRE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {staffEventosMock.map((stf) => (
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
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Fechamento da Folha Mensal &amp; Benefícios</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provisões de 13º e férias, teto legal de 6% para Vale-Transporte e integração direta com a Fila PIX da Tesouraria.
              </p>
            </div>

            <button
              onClick={() => alert('Remessa de Pagamento enviada para aprovação na Tesouraria (Fila PIX em lote)!')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Gerar Remessa PIX Tesouraria</span>
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
            <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Ajuste de Ponto
                  </span>
                  <span className="text-xs font-bold text-white">Mariana Duarte &bull; 02/10/2026</span>
                </div>
                <p className="text-xs text-slate-400">Esquecimento de registro de saída &bull; Horário correto: 18:05 &bull; Justificativa: Atendimento de emergência</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert('Ajuste de ponto aprovado! O espelho foi recalculado com NSR de homologação.')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Aprovar Ajuste
                </button>
              </div>
            </div>

            <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    Solicitação de Férias
                  </span>
                  <span className="text-xs font-bold text-white">Lucas Ferreira dos Santos &bull; 20 dias + 10 dias abono</span>
                </div>
                <p className="text-xs text-slate-400">Período: 15/11/2026 a 04/12/2026 &bull; Saldo aquisitivo: 30 dias &bull; Gestor direto aprovou</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert('Férias homologadas! Programação enviada ao Financeiro para pagamento de 1/3 legal.')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Homologar Férias
                </button>
              </div>
            </div>

            <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    Reembolso de Despesa
                  </span>
                  <span className="text-xs font-bold text-white">Carlos Mendes &bull; R$ 340,00</span>
                </div>
                <p className="text-xs text-slate-400">Transporte e alimentação em operação de bilheteria &bull; 2 cupons fiscais anexos</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert('Reembolso validado! Encaminhado para a esteira de pagamento da Tesouraria.')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Autorizar Reembolso
                </button>
              </div>
            </div>
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

      {/* MODAL SIMULADOR DISK PONTO (PORTARIA 671 MTE) */}
      {modalPontoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Disk Ponto (Simulador APK)</h3>
              </div>
              <button
                onClick={() => setModalPontoAberto(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Colaborador:</span>
                <strong className="text-white">Karine Santos (Supervisora RH)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Localização GPS:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Sede Disk Curitiba (-25.4284, -49.2733)</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Precisão:</span>
                <span className="text-emerald-400 font-bold">11 metros (Dentro do raio de 150m ✓)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-sky-400 font-bold">Portaria 671 MTE REP-P Homologado</span>
              </div>
            </div>

            {sucessoPonto ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center space-y-1">
                <div>✓ {sucessoPonto}</div>
                <div className="text-[11px] text-slate-400 font-normal">Sincronizado instantaneamente com o Core RH &amp; Financeiro</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleConfirmarPonto('ENTRADA')}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex flex-col items-center gap-1 shadow-md shadow-emerald-600/20"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  <span>Entrada (08:00)</span>
                </button>

                <button
                  onClick={() => handleConfirmarPonto('INTERVALO_INICIO')}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex flex-col items-center gap-1"
                >
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Início Intervalo</span>
                </button>

                <button
                  onClick={() => handleConfirmarPonto('INTERVALO_FIM')}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex flex-col items-center gap-1"
                >
                  <Clock className="w-5 h-5 text-sky-400" />
                  <span>Fim Intervalo</span>
                </button>

                <button
                  onClick={() => handleConfirmarPonto('SAIDA')}
                  className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex flex-col items-center gap-1 shadow-md shadow-purple-600/20"
                >
                  <ArrowUpRight className="w-5 h-5 rotate-90" />
                  <span>Saída (18:00)</span>
                </button>
              </div>
            )}

            <div className="text-center text-[10px] text-slate-500">
              Disk Ponto Mobile v2.2 &bull; Certificação Portaria 671 MTE &bull; Criptografia AES-256
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
