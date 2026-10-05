'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { useProducerEvent } from '../../../../components/ProducerEventContext';

interface ColaboradorEvento {
  id: string;
  matricula: string;
  nome: string;
  funcao: string;
  tipo: 'CLT' | 'TEMPORARIO' | 'FREELANCER';
  statusPonto: 'PRESENTE' | 'INTERVALO' | 'AUSENTE';
  horaEntrada: string;
  geofenceValidado: boolean;
  diaria: number;
  horasExtras: number;
  totalCusto: number;
}

const mockEquipeEvento: ColaboradorEvento[] = [
  {
    id: 'colab-1',
    matricula: 'DISK-00104',
    nome: 'Carlos Eduardo Mendes',
    funcao: 'Coordenador Operacional da Arena',
    tipo: 'CLT',
    statusPonto: 'PRESENTE',
    horaEntrada: '14:02',
    geofenceValidado: true,
    diaria: 450,
    horasExtras: 90,
    totalCusto: 540,
  },
  {
    id: 'colab-2',
    matricula: 'DISK-00122',
    nome: 'Mariana Silveira',
    funcao: 'Supervisora de Catracas & Portaria',
    tipo: 'CLT',
    statusPonto: 'PRESENTE',
    horaEntrada: '14:15',
    geofenceValidado: true,
    diaria: 380,
    horasExtras: 60,
    totalCusto: 440,
  },
  {
    id: 'colab-3',
    matricula: 'DISK-00155',
    nome: 'Felipe Rocha',
    funcao: 'Operador de Catraca Portão A',
    tipo: 'TEMPORARIO',
    statusPonto: 'PRESENTE',
    horaEntrada: '14:30',
    geofenceValidado: true,
    diaria: 220,
    horasExtras: 0,
    totalCusto: 220,
  },
  {
    id: 'colab-4',
    matricula: 'DISK-00156',
    nome: 'Juliana Costa',
    funcao: 'Operadora de Caixa & Bilheteria',
    tipo: 'FREELANCER',
    statusPonto: 'PRESENTE',
    horaEntrada: '14:28',
    geofenceValidado: true,
    diaria: 250,
    horasExtras: 35,
    totalCusto: 285,
  },
  {
    id: 'colab-5',
    matricula: 'DISK-00189',
    nome: 'Rodrigo Antunes',
    funcao: 'Fiscal de Pista & Acesso VIP',
    tipo: 'FREELANCER',
    statusPonto: 'AUSENTE',
    horaEntrada: '--:--',
    geofenceValidado: false,
    diaria: 200,
    horasExtras: 0,
    totalCusto: 200,
  },
];

export default function EventoRHPage() {
  const params = useParams();
  const eventoId = (params?.eventoId as string) || 'evento-operacao';
  const { evento } = useProducerEvent();

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('ALL');

  const equipeFiltrada = mockEquipeEvento.filter((c) => {
    const matchBusca =
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.funcao.toLowerCase().includes(busca.toLowerCase()) ||
      c.matricula.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'ALL' || c.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const totalCustoEquipe = mockEquipeEvento.reduce((acc, curr) => acc + curr.totalCusto, 0);
  const totalPresentes = mockEquipeEvento.filter((c) => c.statusPonto === 'PRESENTE').length;

  return (
    <div className="space-y-6">
      {/* 1. HEADER DO MÓDULO NO EVENTO */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Equipes &amp; Escalas do Evento</span>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                {eventoId}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Gestão de Equipe, Ponto &amp; Custos DRE
            </h1>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Controle de presença em tempo real na arena via aplicativo <b>Disk Ponto (Portaria 671 MTE)</b> com geolocalização e apropriação dos custos de pessoal diretamente no DRE deste evento.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/rh"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Painel Central RH</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPIS RÁPIDOS DA EQUIPE NO EVENTO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Equipe Escalada</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{mockEquipeEvento.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Colaboradores &amp; Freelancers</div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Presentes no Evento</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{totalPresentes}</div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1">
            {((totalPresentes / mockEquipeEvento.length) * 100).toFixed(0)}% de Quórum
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Geofence Arena</span>
            <MapPin className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-black text-purple-400 truncate">Ativo • 300m</div>
          <div className="text-[11px] text-slate-400 mt-1">Arena da Baixada</div>
        </div>

        <div className="bg-[#111827] rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Custo Staff DRE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            R$ {totalCustoEquipe.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Apropriado no Fechamento</div>
        </div>
      </div>

      {/* 3. LISTAGEM DA EQUIPE DO EVENTO */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador ou função..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="CLT">CLT</option>
              <option value="TEMPORARIO">Temporário</option>
              <option value="FREELANCER">Freelancer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Colaborador</th>
                <th className="p-3.5">Função no Evento</th>
                <th className="p-3.5">Contrato</th>
                <th className="p-3.5">Status Ponto</th>
                <th className="p-3.5">Geofence Arena</th>
                <th className="p-3.5 text-right">Diária + Extras</th>
                <th className="p-3.5 text-right">Custo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {equipeFiltrada.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-medium text-white">
                    <div className="font-semibold">{item.nome}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.matricula}</div>
                  </td>
                  <td className="p-3.5 text-slate-300">{item.funcao}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.tipo}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {item.statusPonto === 'PRESENTE' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Entrada {item.horaEntrada}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Não Registrou
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {item.geofenceValidado ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <MapPin className="w-3 h-3" />
                        Validado na Arena
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Pendente</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-mono">
                    R$ {item.diaria} + R$ {item.horasExtras}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-white">
                    R$ {item.totalCusto.toLocaleString('pt-BR')},00
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
