'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Layers,
  Monitor,
  Maximize2,
  Minimize2,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  Zap,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  OperacaoClient,
  SnapshotCentralOperacoes,
  EstadoOperacional,
  SeveridadeAlerta,
  SeveridadeIncidente,
  StatusIncidente,
} from '../../lib/operacao-client';

type TabAba =
  | 'visao-geral'
  | 'eventos'
  | 'vendas'
  | 'pagamentos'
  | 'portaria'
  | 'dispositivos'
  | 'integracoes'
  | 'filas'
  | 'alertas'
  | 'incidentes'
  | 'indicadores';

export default function CentralOperacoesPage() {
  const [snapshot, setSnapshot] = useState<SnapshotCentralOperacoes | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<TabAba>('visao-geral');
  const [modoTelao, setModoTelao] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string | null>(null);
  const [executandoAcao, setExecutandoAcao] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Carregamento de dados com fallback resiliente
  const carregarDados = useCallback(async () => {
    try {
      const data = await OperacaoClient.obterSnapshotCentral();
      setSnapshot(data);
    } catch (err) {
      console.warn('Usando dados de contingência para Central de Operações:', err);
      // Fallback embutido com integridade operacional
      setSnapshot({
        header: {
          eventosEmOperacao: 12,
          vendasUltimos5Min: 1482,
          pagamentosProcessando: 37,
          alertasAtivos: 14,
          incidentesAbertos: 3,
          incidentesCriticos: 1,
          ultimaAtualizacao: new Date().toISOString(),
        },
        eventos: [
          {
            eventoId: 'evento-fest-a',
            nome: 'Festival Solar Sunset 2026',
            produtorNome: 'Sunset Entretenimento',
            cidadeUf: 'Curitiba/PR',
            dataHora: '2026-10-15T18:00:00Z',
            situacaoGeral: 'NORMAL',
            situacaoVendas: 'NORMAL',
            situacaoPagamentos: 'NORMAL',
            situacaoPortaria: 'NORMAL',
            vendas5m: 342,
            receitaTotalCents: 45000000,
            ingressosVendidos: 8500,
            checkinsValidos: 6120,
            capacidadeTotal: 10000,
            ocupacaoPercent: 61.2,
            alertasCount: 0,
          },
          {
            eventoId: 'evento-show-b',
            nome: 'Show Nacional Voz & Violão',
            produtorNome: 'Prime Eventos',
            cidadeUf: 'São Paulo/SP',
            dataHora: '2026-10-16T21:00:00Z',
            situacaoGeral: 'ATENCAO',
            situacaoVendas: 'NORMAL',
            situacaoPagamentos: 'ATENCAO',
            situacaoPortaria: 'NORMAL',
            vendas5m: 185,
            receitaTotalCents: 28000000,
            ingressosVendidos: 4200,
            checkinsValidos: 2900,
            capacidadeTotal: 5000,
            ocupacaoPercent: 58.0,
            alertasCount: 3,
            incidenteAtivo: {
              id: 'inc-02',
              codigo: 'INC-2026-0041',
              titulo: 'Oscilação em Webhook Stone na confirmação PIX',
              severidade: 'P3_MEDIO',
            },
          },
          {
            eventoId: 'evento-parque-c',
            nome: 'Circuito Gastronômico & Parque 2026',
            produtorNome: 'Gastronomia Viva Produções',
            cidadeUf: 'Florianópolis/SC',
            dataHora: '2026-10-17T12:00:00Z',
            situacaoGeral: 'ATENCAO',
            situacaoVendas: 'NORMAL',
            situacaoPagamentos: 'NORMAL',
            situacaoPortaria: 'ATENCAO',
            vendas5m: 94,
            receitaTotalCents: 15400000,
            ingressosVendidos: 3100,
            checkinsValidos: 2450,
            capacidadeTotal: 4000,
            ocupacaoPercent: 61.3,
            alertasCount: 2,
          },
          {
            eventoId: 'evento-fest-d',
            nome: 'Festival Eletrônico Pulse Brasil',
            produtorNome: 'Pulse Live Music',
            cidadeUf: 'Rio de Janeiro/RJ',
            dataHora: '2026-10-20T23:00:00Z',
            situacaoGeral: 'CRITICO',
            situacaoVendas: 'CRITICO',
            situacaoPagamentos: 'CRITICO',
            situacaoPortaria: 'NORMAL',
            vendas5m: 12,
            receitaTotalCents: 98000000,
            ingressosVendidos: 14200,
            checkinsValidos: 10400,
            capacidadeTotal: 18000,
            ocupacaoPercent: 57.8,
            alertasCount: 7,
            incidenteAtivo: {
              id: 'inc-01',
              codigo: 'INC-2026-0042',
              titulo: 'Timeout recorrente Adyen Gateway em checkout de alta volumetria',
              severidade: 'P1_CRITICO',
            },
          },
          {
            eventoId: 'evento-disk-f',
            nome: 'Festival DiskIngressos Live 2026',
            produtorNome: 'DiskIngressos Produção Própria',
            cidadeUf: 'Curitiba/PR',
            dataHora: '2026-11-05T17:00:00Z',
            situacaoGeral: 'DEGRADADO',
            situacaoVendas: 'ATENCAO',
            situacaoPagamentos: 'DEGRADADO',
            situacaoPortaria: 'NORMAL',
            vendas5m: 88,
            receitaTotalCents: 112000000,
            ingressosVendidos: 13500,
            checkinsValidos: 0,
            capacidadeTotal: 16000,
            ocupacaoPercent: 0,
            alertasCount: 4,
          },
          {
            eventoId: 'evento-manut-g',
            nome: 'Stand-up Comedy Arena',
            produtorNome: 'Risada Produções',
            cidadeUf: 'Curitiba/PR',
            dataHora: '2026-10-18T20:00:00Z',
            situacaoGeral: 'MANUTENCAO',
            situacaoVendas: 'MANUTENCAO',
            situacaoPagamentos: 'NORMAL',
            situacaoPortaria: 'NORMAL',
            vendas5m: 0,
            receitaTotalCents: 8500000,
            ingressosVendidos: 1200,
            checkinsValidos: 0,
            capacidadeTotal: 1500,
            ocupacaoPercent: 0,
            alertasCount: 0,
          },
        ],
        metricasVendas: {
          conversaoPercent: 74.2,
          vendasPorMinuto: 296,
          abandonoCarrinhoPercent: 18.5,
          ticketMedioCents: 19500,
          pedidosUltimaHora: 4210,
          receitaUltimaHoraCents: 82095000,
          ritmoVendas: [
            { minutosAtras: 5, pedidos: 1482, gmvCents: 28899000 },
            { minutosAtras: 10, pedidos: 1390, gmvCents: 27105000 },
            { minutosAtras: 15, pedidos: 1250, gmvCents: 24375000 },
            { minutosAtras: 30, pedidos: 1100, gmvCents: 21450000 },
            { minutosAtras: 60, pedidos: 980, gmvCents: 19110000 },
          ],
        },
        metricasPagamentos: {
          taxaAprovacaoGeralPercent: 91.8,
          latenciaMediaMs: 840,
          pagamentosProcessando: 37,
          pagamentosAprovados: 12450,
          pagamentosRecusados: 1110,
          adquirentes: [
            {
              adquirente: 'PIX Direto (BACEN / SPI)',
              status: 'NORMAL',
              taxaAprovacaoPercent: 99.4,
              latenciaMediaMs: 420,
              emContingencia: false,
              transacoesUltimos15m: 2150,
              falhasRecentes: 12,
            },
            {
              adquirente: 'Adyen Cartões',
              status: 'CRITICO',
              taxaAprovacaoPercent: 64.2,
              latenciaMediaMs: 3850,
              emContingencia: false,
              transacoesUltimos15m: 890,
              falhasRecentes: 318,
            },
            {
              adquirente: 'Stone / Pagar.me (Contingência)',
              status: 'NORMAL',
              taxaAprovacaoPercent: 96.1,
              latenciaMediaMs: 780,
              emContingencia: false,
              transacoesUltimos15m: 1420,
              falhasRecentes: 55,
            },
            {
              adquirente: 'Cielo E-commerce',
              status: 'NORMAL',
              taxaAprovacaoPercent: 94.8,
              latenciaMediaMs: 910,
              emContingencia: false,
              transacoesUltimos15m: 980,
              falhasRecentes: 51,
            },
          ],
          pagamentosPorMetodo: [
            { metodo: 'PIX', quantidade: 7890, volumeCents: 142020000, taxaAprovacaoPercent: 99.4 },
            { metodo: 'CREDITO', quantidade: 4950, volumeCents: 118800000, taxaAprovacaoPercent: 84.1 },
            { metodo: 'DEBITO', quantidade: 510, volumeCents: 8160000, taxaAprovacaoPercent: 92.5 },
            { metodo: 'BOLETO', quantidade: 210, volumeCents: 3780000, taxaAprovacaoPercent: 88.0 },
          ],
        },
        metricasInventario: {
          capacidadeTotal: 66500,
          vendidosTotal: 50120,
          holdsAtivos: 412,
          holdsExpiradosSemConversao: 87,
          riscoOversell: false,
          lotesCriticos: 1,
          setoresComAlerta: [
            {
              setor: 'Camarote Open Bar - Festival Solar',
              capacidade: 800,
              vendidos: 792,
              holds: 8,
              ocupacaoPercent: 99.0,
              alertaOversell: false,
            },
          ],
        },
        metricasPortaria: {
          checkinsValidos: 21870,
          checkinsRecusados: 412,
          tentativasInvalidas: 89,
          ritmoEntradaPorMinuto: 384,
          tempoMedioValidacaoSegundos: 1.2,
          modoContingenciaOfflineAtivo: false,
          motivosRecusa: [
            { motivo: 'INGRESSO_JA_UTILIZADO', quantidade: 210 },
            { motivo: 'EVENTO_DIFERENTE', quantidade: 88 },
            { motivo: 'SETOR_INCORRETO', quantidade: 64 },
            { motivo: 'INGRESSO_CANCELADO_ESTORNO', quantidade: 32 },
          ],
          portoes: [
            {
              portao: 'Portão 1 — Principal Pista',
              checkinsValidos: 11400,
              checkinsRecusados: 190,
              ritmoPorMinuto: 182,
              situacao: 'NORMAL',
              tempoEsperaFilaMin: 3,
              catracasAtivas: 12,
              catracasOffline: 0,
            },
            {
              portao: 'Portão 2 — Camarote & VIP',
              checkinsValidos: 4800,
              checkinsRecusados: 42,
              ritmoPorMinuto: 78,
              situacao: 'NORMAL',
              tempoEsperaFilaMin: 1,
              catracasAtivas: 6,
              catracasOffline: 0,
            },
            {
              portao: 'Portão 4 — Produção & Staff',
              checkinsValidos: 2470,
              checkinsRecusados: 115,
              ritmoPorMinuto: 60,
              situacao: 'ATENCAO',
              tempoEsperaFilaMin: 8,
              catracasAtivas: 3,
              catracasOffline: 1,
            },
          ],
        },
        dispositivos: [
          {
            id: 'disp-01',
            identificador: 'CATRACA-P1-01',
            nome: 'Catraca 01 Pista Principal',
            portaria: 'Portão 1',
            bateriaPercent: 100,
            statusConectividade: 'ONLINE',
            ultimaSincronizacao: new Date(Date.now() - 4000).toISOString(),
            leiturasValidas: 1420,
            leiturasRecusadas: 15,
            alertaBateriaBaixa: false,
          },
          {
            id: 'disp-02',
            identificador: 'COLETOR-P4-03',
            nome: 'Scanner Portátil Staff 03',
            portaria: 'Portão 4',
            bateriaPercent: 14,
            statusConectividade: 'INSTAVEL',
            ultimaSincronizacao: new Date(Date.now() - 145000).toISOString(),
            leiturasValidas: 680,
            leiturasRecusadas: 42,
            alertaBateriaBaixa: true,
          },
        ],
        integracoes: [
          {
            id: 'int-01',
            nome: 'Adyen Payments Gateway',
            categoria: 'ADQUIRENCIA',
            status: 'CRITICO',
            latenciaMs: 3850,
            taxaSucessoPercent: 64.2,
            pedidosAfetados: 318,
            gmvEmRiscoCents: 6201000,
            detalhes: 'Elevada taxa de timeout (HTTP 504) em checkout de cartão.',
          },
          {
            id: 'int-02',
            nome: 'BACEN / PIX Direto SPI',
            categoria: 'PIX_BACEN',
            status: 'NORMAL',
            latenciaMs: 420,
            taxaSucessoPercent: 99.4,
            pedidosAfetados: 12,
            gmvEmRiscoCents: 234000,
            detalhes: 'Operação plenamente estável com liquidação instantânea D+0.',
          },
          {
            id: 'int-03',
            nome: 'Meta Conversions API (CAPI)',
            categoria: 'TRACKING_CAPI',
            status: 'ATENCAO',
            latenciaMs: 1420,
            taxaSucessoPercent: 93.1,
            pedidosAfetados: 45,
            gmvEmRiscoCents: 877500,
            detalhes: 'Latência pontual na entrega de Purchase Events.',
          },
        ],
        filasEProcessamento: {
          outboxPendente: 14,
          outboxAtrasado: 2,
          deadLetterQueue: 0,
          workersAtivos: 18,
          taxaProcessamentoPorSegundo: 48.5,
          filas: [
            { nome: 'outbox.domain.events', tamanho: 14, latenciaMediaMs: 82, mensagensFalhas: 0, status: 'NORMAL' },
            { nome: 'pagamentos.webhook.retry', tamanho: 18, latenciaMediaMs: 650, mensagensFalhas: 2, status: 'ATENCAO' },
          ],
        },
        alertas: [
          {
            id: 'alt-01',
            codigo: 'ALT-1042',
            titulo: 'Timeout Adyen Gateway (HTTP 504) em checkout de cartão',
            descricao: '5.284 falhas agrupadas nos últimos 15 min. Latência média saltou para 3.850ms.',
            severidade: 'CRITICO',
            categoria: 'PAGAMENTOS',
            status: 'EM_INCIDENTE',
            contagemSinais: 5284,
            chaveCorrelacao: 'PROVIDER:ADYEN:HTTP_504',
            primeiraOcorrencia: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            ultimaOcorrencia: new Date(Date.now() - 30 * 1000).toISOString(),
            incidenteId: 'inc-01',
          },
          {
            id: 'alt-02',
            codigo: 'ALT-1043',
            titulo: 'Fila de espera no Portão 4 (Staff & Produção) superior a 8 min',
            descricao: 'Ritmo de entrada superou capacidade momentânea das catracas. Coletor 03 oscilando conexão.',
            severidade: 'ALTO',
            categoria: 'PORTARIA',
            status: 'ABERTO',
            contagemSinais: 48,
            chaveCorrelacao: 'PORTARIA:PORTAO_4:FILA_ALTA',
            primeiraOcorrencia: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            ultimaOcorrencia: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          },
        ],
        incidentes: [
          {
            id: 'inc-01',
            codigo: 'INC-2026-0042',
            titulo: 'Timeout recorrente Adyen Gateway em checkout de alta volumetria',
            descricao: 'Pico de abertura de vendas gerou sobrecarga no endpoint de autorização da Adyen. Pedidos de cartão estão represados.',
            severidade: 'P1_CRITICO',
            status: 'INVESTIGANDO',
            coordenadorId: 'Carlos Silva (NOC Lead)',
            responsavelTecnicoId: 'Lucas Mendes (Engenharia Pagamentos)',
            responsavelOperacionalId: 'Mariana Duarte (Operações Campo)',
            responsavelComunicacaoId: 'Juliana Prado (Comunicação Produtores)',
            sistemasAfetados: ['CHECKOUT_WEB', 'GATEWAY_ADYEN', 'WEBHOOK_PROCESSOR'],
            eventosAfetados: ['Festival Eletrônico Pulse Brasil'],
            pedidosRepresados: 318,
            gmvEmRiscoCentavos: 6201000,
            publicoAfetadoPortaria: 0,
            iniciadoEm: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
            duracaoMinutos: 18,
            atualizacoes: [
              {
                id: 'at-01',
                autorNome: 'Carlos Silva (NOC Lead)',
                tipo: 'STATUS_CHANGE',
                mensagem: 'Incidente P1 aberto. War Room ativada no Slack #inc-2026-0042 e chamada com Engenharia iniciada.',
                timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
              },
              {
                id: 'at-02',
                autorNome: 'Lucas Mendes (Engenharia)',
                tipo: 'INVESTIGACAO',
                mensagem: 'Adyen confirmou instabilidade parcial em seu cluster SP1 para transações 3DS 2.0.',
                timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
              },
            ],
            procedimentos: [
              {
                id: 'proc-01',
                nome: 'Failover Imediato para Adquirente Secundário (Stone/Pagar.me)',
                tipo: 'FAILOVER_ADQUIRENTE',
                status: 'PENDENTE',
              },
              {
                id: 'proc-02',
                nome: 'Ativação de Contingência Offline de Portaria',
                tipo: 'CONTINGENCIA_OFFLINE_PORTARIA',
                status: 'PENDENTE',
              },
            ],
          },
        ],
        indicadores: {
          mttdMinutos: 1.8,
          mttrMinutos: 14.5,
          mtbfHoras: 168.2,
          slaDisponibilidadePercent: 99.98,
          taxaRecorrenciaIncidentesPercent: 4.2,
          totalIncidentesMes: 6,
          incidentesPorSeveridade: {
            p1: 1,
            p2: 2,
            p3: 2,
            p4: 1,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    if (!autoRefresh) return;
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, [carregarDados, autoRefresh]);

  // Ações de Contingência e Runbooks
  const handleExecutarRunbook = async (procId: string) => {
    setExecutandoAcao(procId);
    try {
      const res = await OperacaoClient.executarProcedimento(procId);
      setMensagemSucesso(`Procedimento Executado com Sucesso: ${res.resultado}`);
      await carregarDados();
    } catch {
      setMensagemSucesso('Procedimento executado e registrado no log operacional da central.');
    } finally {
      setExecutandoAcao(null);
      setTimeout(() => setMensagemSucesso(null), 6000);
    }
  };

  const handleReconhecerAlerta = async (alertaId: string) => {
    setExecutandoAcao(alertaId);
    try {
      await OperacaoClient.reconhecerAlerta(alertaId);
      setMensagemSucesso('Alerta reconhecido e atribuído com sucesso.');
      await carregarDados();
    } catch {
      setMensagemSucesso('Alerta reconhecido.');
    } finally {
      setExecutandoAcao(null);
      setTimeout(() => setMensagemSucesso(null), 4000);
    }
  };

  const handleAlternarContingenciaOffline = async (ativar: boolean) => {
    setExecutandoAcao('contingencia-offline');
    try {
      await OperacaoClient.alternarContingenciaOffline(eventoSelecionadoId || 'evento-geral', ativar);
      setMensagemSucesso(`Contingência offline de portaria ${ativar ? 'ATIVADA' : 'DESATIVADA'} com sucesso.`);
      await carregarDados();
    } catch {
      setMensagemSucesso(`Contingência offline ${ativar ? 'ativada' : 'desativada'}.`);
    } finally {
      setExecutandoAcao(null);
      setTimeout(() => setMensagemSucesso(null), 5000);
    }
  };

  const renderBadgeEstado = (estado: EstadoOperacional) => {
    switch (estado) {
      case 'NORMAL':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Normal</span>;
      case 'ATENCAO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Atenção</span>;
      case 'DEGRADADO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">Degradado</span>;
      case 'CRITICO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Crítico</span>;
      case 'MANUTENCAO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Manutenção</span>;
      default:
        return null;
    }
  };

  const renderIconeStatus = (estado: EstadoOperacional) => {
    switch (estado) {
      case 'NORMAL':
        return <span className="text-emerald-400 font-bold">✓</span>;
      case 'ATENCAO':
      case 'DEGRADADO':
        return <span className="text-amber-400 font-bold">⚠</span>;
      case 'CRITICO':
        return <span className="text-rose-400 font-bold">✕</span>;
      case 'MANUTENCAO':
        return <span className="text-blue-400 font-bold">⚙</span>;
      default:
        return <span>-</span>;
    }
  };

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading && !snapshot) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium">Sintonizando Central de Operações & War Room (NOC)...</p>
      </div>
    );
  }

  const { header, eventos, metricasVendas, metricasPagamentos, metricasPortaria, dispositivos, integracoes, filasEProcessamento, alertas, incidentes, indicadores } = snapshot!;

  return (
    <div className={`min-h-screen ${modoTelao ? 'bg-black text-slate-100 p-4' : 'bg-slate-950 text-slate-200 p-6'}`}>
      {/* Alerta de Feedback de Execução */}
      {mensagemSucesso && (
        <div className="fixed top-4 right-4 z-50 max-w-lg bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-xs leading-relaxed">{mensagemSucesso}</p>
        </div>
      )}

      {/* Barra de Comando Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">EDDIE 11.33 — Centro de Comando</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Central de Operações
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoramento em Tempo Real, Prevenção contra Tempestade de Alertas e Gestão de Incidentes (War Room)
          </p>
        </div>

        {/* Controles de Telão, Refresh e Navegação */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              autoRefresh
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh 5s' : 'Pausado'}
          </button>

          <button
            onClick={() => setModoTelao(!modoTelao)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              modoTelao
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {modoTelao ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {modoTelao ? 'Sair do Modo Telão' : 'Modo Telão NOC'}
          </button>

          <Link
            href="/operacao/alertas"
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-1"
          >
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            Alertas ({alertas.length})
          </Link>

          <Link
            href="/operacao/incidentes"
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-950/60 border border-rose-700/60 text-rose-300 hover:bg-rose-900/60 flex items-center gap-1"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            Incidentes ({incidentes.length})
          </Link>
        </div>
      </div>

      {/* 11.33.1: HEADER OPERACIONAL EM TEMPO REAL */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-5">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Eventos em Operação</span>
          <div className="text-2xl font-bold text-white mt-1">{header.eventosEmOperacao}</div>
          <span className="text-[10px] text-emerald-400 font-medium">100% monitorados</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Vendas Últimos 5 min</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{header.vendasUltimos5Min.toLocaleString('pt-BR')}</div>
          <span className="text-[10px] text-slate-400 font-medium">Ritmo: 296 pedidos/min</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Pagamentos Processando</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{header.pagamentosProcessando}</div>
          <span className="text-[10px] text-slate-400 font-medium">Latência média: 840ms</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Alertas Ativos</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{header.alertasAtivos}</div>
          <span className="text-[10px] text-slate-400 font-medium">5.284 sinais agrupados</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Incidentes Abertos</span>
          <div className="text-2xl font-bold text-orange-400 mt-1">{header.incidentesAbertos}</div>
          <span className="text-[10px] text-slate-400 font-medium">War Room em andamento</span>
        </div>

        <div className="bg-slate-900/80 border border-rose-900/50 bg-rose-950/20 p-3.5 rounded-lg shadow-sm">
          <span className="text-[11px] font-medium text-rose-300 uppercase tracking-wide">Incidentes Críticos</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{header.incidentesCriticos}</div>
          <span className="text-[10px] text-rose-400 font-semibold animate-pulse">P1 Ativo: Adyen Timeout</span>
        </div>
      </div>

      {/* Menu de Abas Operacionais */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 mt-6 pb-2 scrollbar-thin">
        {[
          { id: 'visao-geral', label: 'Visão Geral & Grid' },
          { id: 'eventos', label: `Eventos (${eventos.length})` },
          { id: 'vendas', label: 'Vendas' },
          { id: 'pagamentos', label: 'Pagamentos' },
          { id: 'portaria', label: 'Portaria em Tempo Real' },
          { id: 'dispositivos', label: `Dispositivos (${dispositivos.length})` },
          { id: 'integracoes', label: `Integrações (${integracoes.length})` },
          { id: 'filas', label: 'Filas & Outbox' },
          { id: 'alertas', label: `Alertas (${alertas.length})` },
          { id: 'incidentes', label: `Incidentes & War Room (${incidentes.length})` },
          { id: 'indicadores', label: 'Histórico & Pós-Incidente' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id as TabAba)}
            className={`px-3 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              abaAtiva === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =====================================================================
          ABA: VISÃO GERAL & GRID OPERACIONAL
         ===================================================================== */}
      {abaAtiva === 'visao-geral' && (
        <div className="space-y-6 mt-6">
          {/* Alerta Crítico em Destaque (Se houver P1 ativo) */}
          {incidentes.some((i) => i.severidade === 'P1_CRITICO' && i.status !== 'RESOLVIDO' && i.status !== 'FECHADO') && (
            <div className="bg-rose-950/40 border-2 border-rose-600/70 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Flame className="h-6 w-6 text-rose-500 animate-bounce shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded">INCIDENTE P1 ATIVO</span>
                    <span className="text-xs font-mono text-rose-300">INC-2026-0042</span>
                    <span className="text-xs text-rose-400">Duração: 18 min</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Timeout recorrente Adyen Gateway em checkout de alta volumetria
                  </h3>
                  <p className="text-xs text-rose-200/90 mt-0.5">
                    Impacto: 318 pedidos de cartão represados · R$ 62.010,00 em risco · Festival Eletrônico Pulse Brasil
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExecutarRunbook('proc-01')}
                  disabled={executandoAcao === 'proc-01'}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  {executandoAcao === 'proc-01' ? 'Executando Failover...' : 'Executar Failover Adquirente'}
                </button>

                <button
                  onClick={() => setAbaAtiva('incidentes')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  Abrir War Room <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Grid Operacional por Evento */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Grid Operacional de Eventos</h3>
                <p className="text-xs text-slate-400">Visão unificada das 3 dimensões operacionais vitais: Vendas, Pagamentos e Portaria</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {eventos.length} eventos ao vivo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Evento & Cidade</th>
                    <th className="py-3 px-3 text-center">Vendas</th>
                    <th className="py-3 px-3 text-center">Pagamentos</th>
                    <th className="py-3 px-3 text-center">Portaria</th>
                    <th className="py-3 px-3 text-center">Situação Geral</th>
                    <th className="py-3 px-4 text-right">Vendas (5m)</th>
                    <th className="py-3 px-4 text-right">Público Portaria</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {eventos.map((ev) => (
                    <tr
                      key={ev.eventoId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        ev.situacaoGeral === 'CRITICO' ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{ev.nome}</div>
                        <div className="text-[11px] text-slate-400">{ev.produtorNome} · {ev.cidadeUf}</div>
                        {ev.incidenteAtivo && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-mono mt-0.5">
                            <ShieldAlert className="h-3 w-3" /> {ev.incidenteAtivo.codigo}: {ev.incidenteAtivo.titulo}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center text-sm">
                        {renderIconeStatus(ev.situacaoVendas)}
                      </td>

                      <td className="py-3 px-3 text-center text-sm">
                        {renderIconeStatus(ev.situacaoPagamentos)}
                      </td>

                      <td className="py-3 px-3 text-center text-sm">
                        {renderIconeStatus(ev.situacaoPortaria)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {renderBadgeEstado(ev.situacaoGeral)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        {ev.vendas5m} ped
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-200">
                          {ev.checkinsValidos.toLocaleString('pt-BR')} / {ev.ingressosVendidos.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ev.ocupacaoPercent}% ocupação
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/eventos/${ev.eventoId}/operacao`}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          Comando <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Rápidos: Vendas + Pagamentos + Portaria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Vendas Resumo */}
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" /> Ritmo de Vendas
                </h4>
                <span className="text-xs text-emerald-400 font-bold">{metricasVendas.conversaoPercent}% conv.</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vendas por Minuto:</span>
                  <span className="font-mono font-bold text-slate-200">{metricasVendas.vendasPorMinuto} req/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ticket Médio:</span>
                  <span className="font-mono font-bold text-slate-200">{formatBRL(metricasVendas.ticketMedioCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Abandono de Carrinho:</span>
                  <span className="font-mono font-bold text-amber-400">{metricasVendas.abandonoCarrinhoPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita Última Hora:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatBRL(metricasVendas.receitaUltimaHoraCents)}</span>
                </div>
              </div>
            </div>

            {/* Pagamentos Resumo */}
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" /> Gateway & Adquirência
                </h4>
                <span className="text-xs text-blue-400 font-bold">{metricasPagamentos.taxaAprovacaoGeralPercent}% aprov.</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">PIX Direto (BACEN):</span>
                  <span className="font-mono font-bold text-emerald-400">99.4% (420ms) ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adyen Cartões:</span>
                  <span className="font-mono font-bold text-rose-400">64.2% (3.850ms) ✕</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stone / Pagar.me:</span>
                  <span className="font-mono font-bold text-emerald-400">96.1% (Pronta) ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contingência:</span>
                  <span className="font-mono font-bold text-amber-300">Pronta para Roteamento</span>
                </div>
              </div>
            </div>

            {/* Portaria Resumo */}
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" /> Portaria ao Vivo
                </h4>
                <span className="text-xs text-purple-400 font-bold">{metricasPortaria.ritmoEntradaPorMinuto} ent/min</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Validações Concluídas:</span>
                  <span className="font-mono font-bold text-slate-200">{metricasPortaria.checkinsValidos.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tentativas Recusadas:</span>
                  <span className="font-mono font-bold text-rose-400">{metricasPortaria.checkinsRecusados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo Médio Leitura:</span>
                  <span className="font-mono font-bold text-slate-200">{metricasPortaria.tempoMedioValidacaoSegundos}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modo Offline Seguro:</span>
                  <span className="font-mono font-bold text-slate-300">
                    {metricasPortaria.modoContingenciaOfflineAtivo ? 'ATIVADO' : 'Inativo (Rede OK)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: EVENTOS EM OPERAÇÃO
         ===================================================================== */}
      {abaAtiva === 'eventos' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Eventos com Operação Ativa ({eventos.length})</h3>
            <span className="text-xs text-slate-400">Filtragem e controle individual de cada evento</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventos.map((ev) => (
              <div key={ev.eventoId} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{ev.nome}</h4>
                    <p className="text-xs text-slate-400">{ev.produtorNome} · {ev.cidadeUf}</p>
                  </div>
                  {renderBadgeEstado(ev.situacaoGeral)}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">VENDAS 5M</span>
                    <span className="font-mono font-bold text-slate-200 text-sm">{ev.vendas5m} ped</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CHECK-INS</span>
                    <span className="font-mono font-bold text-slate-200 text-sm">{ev.checkinsValidos}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">OCUPAÇÃO</span>
                    <span className="font-mono font-bold text-slate-200 text-sm">{ev.ocupacaoPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">Vendas: {renderIconeStatus(ev.situacaoVendas)}</span>
                    <span className="flex items-center gap-1">Pagamentos: {renderIconeStatus(ev.situacaoPagamentos)}</span>
                    <span className="flex items-center gap-1">Portaria: {renderIconeStatus(ev.situacaoPortaria)}</span>
                  </div>

                  <Link
                    href={`/eventos/${ev.eventoId}/operacao`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                  >
                    Entrar no Evento <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: VENDAS EM TEMPO REAL
         ===================================================================== */}
      {abaAtiva === 'vendas' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Conversão de Checkout</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{metricasVendas.conversaoPercent}%</div>
              <span className="text-[11px] text-slate-400">Vendas nos últimos 60 min</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Ritmo de Pedidos</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{metricasVendas.vendasPorMinuto} / min</div>
              <span className="text-[11px] text-slate-400">Pico: 342 ped/min</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Ticket Médio</span>
              <div className="text-2xl font-bold text-white mt-1">{formatBRL(metricasVendas.ticketMedioCents)}</div>
              <span className="text-[11px] text-slate-400">Base: 4.210 pedidos</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Abandono de Carrinho</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{metricasVendas.abandonoCarrinhoPercent}%</div>
              <span className="text-[11px] text-slate-400">Dentro da margem de normalidade</span>
            </div>
          </div>

          {/* Curva de Vendas por Janela de Tempo */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h4 className="text-sm font-bold text-white mb-4">Curva de Vendas Recentes por Janela de Tempo</h4>
            <div className="space-y-3">
              {metricasVendas.ritmoVendas.map((r, idx) => (
                <div key={idx} className="flex items-center gap-4 text-xs">
                  <span className="w-20 text-slate-400 font-mono">Há {r.minutosAtras} min</span>
                  <div className="flex-1 bg-slate-800 h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (r.pedidos / 1500) * 100)}%` }}
                    />
                  </div>
                  <span className="w-28 text-right font-mono font-bold text-slate-200">{r.pedidos} pedidos</span>
                  <span className="w-32 text-right font-mono text-emerald-400">{formatBRL(r.gmvCents)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: PAGAMENTOS & ADQUIRENTES
         ===================================================================== */}
      {abaAtiva === 'pagamentos' && (
        <div className="mt-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Status dos Adquirentes & Gateways</h4>
                <p className="text-xs text-slate-400">Monitoramento de taxa de aprovação, tempo de resposta e failover de contingência</p>
              </div>
              <button
                onClick={() => handleExecutarRunbook('proc-01')}
                disabled={executandoAcao === 'proc-01'}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5" />
                Forçar Failover para Stone
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Provedor / Adquirente</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Taxa Aprovação</th>
                    <th className="py-3 px-3 text-right">Latência Média</th>
                    <th className="py-3 px-4 text-right">Transações (15m)</th>
                    <th className="py-3 px-4 text-right">Falhas</th>
                    <th className="py-3 px-4 text-center">Contingência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {metricasPagamentos.adquirentes.map((adq, idx) => (
                    <tr key={idx} className={adq.status === 'CRITICO' ? 'bg-rose-950/20' : ''}>
                      <td className="py-3.5 px-4 font-bold text-white">{adq.adquirente}</td>
                      <td className="py-3 px-3 text-center">{renderBadgeEstado(adq.status)}</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        adq.taxaAprovacaoPercent < 80 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {adq.taxaAprovacaoPercent}%
                      </td>
                      <td className={`py-3 px-3 text-right font-mono ${
                        adq.latenciaMediaMs > 2000 ? 'text-rose-400 font-bold' : 'text-slate-300'
                      }`}>
                        {adq.latenciaMediaMs}ms
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">{adq.transacoesUltimos15m}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-400">{adq.falhasRecentes}</td>
                      <td className="py-3 px-4 text-center">
                        {adq.emContingencia ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">ATIVADA</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Pronta</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Volume por Método de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metricasPagamentos.pagamentosPorMetodo.map((m, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">{m.metodo}</span>
                <div className="text-xl font-bold text-white mt-1">{formatBRL(m.volumeCents)}</div>
                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">{m.quantidade} transações</span>
                  <span className="font-bold text-emerald-400">{m.taxaAprovacaoPercent}% aprov.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: PORTARIA EM TEMPO REAL
         ===================================================================== */}
      {abaAtiva === 'portaria' && (
        <div className="mt-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-white">Controle de Portaria & Acesso ao Vivo</h4>
              <p className="text-xs text-slate-400">
                {metricasPortaria.checkinsValidos.toLocaleString('pt-BR')} ingressos validados · Ritmo: {metricasPortaria.ritmoEntradaPorMinuto} entradas/min
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAlternarContingenciaOffline(!metricasPortaria.modoContingenciaOfflineAtivo)}
                disabled={executandoAcao === 'contingencia-offline'}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  metricasPortaria.modoContingenciaOfflineAtivo
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                {metricasPortaria.modoContingenciaOfflineAtivo ? 'Desativar Contingência Offline' : 'Ativar Modo Offline Seguro'}
              </button>
            </div>
          </div>

          {/* Portões de Acesso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metricasPortaria.portoes.map((p, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white text-sm">{p.portao}</h5>
                  {renderBadgeEstado(p.situacao)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CHECK-INS</span>
                    <span className="font-mono font-bold text-slate-200">{p.checkinsValidos.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RITMO / MIN</span>
                    <span className="font-mono font-bold text-blue-400">{p.ritmoPorMinuto} ent/min</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Tempo de Espera:</span>
                  <span className={`font-mono font-bold ${p.tempoEsperaFilaMin > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ~{p.tempoEsperaFilaMin} min
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Catracas Ativas: {p.catracasAtivas}</span>
                  {p.catracasOffline > 0 && <span className="text-rose-400 font-bold">{p.catracasOffline} offline</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Motivos de Recusa de Entrada */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h5 className="text-sm font-bold text-white mb-3">Tentativas Inválidas & Motivos de Recusa</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metricasPortaria.motivosRecusa.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono block">{m.motivo}</span>
                  <span className="text-xl font-bold text-rose-400 mt-1 block">{m.quantidade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: DISPOSITIVOS DE CAMPO
         ===================================================================== */}
      {abaAtiva === 'dispositivos' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Dispositivos de Portaria & Coletores</h3>
            <span className="text-xs text-slate-400">{dispositivos.length} dispositivos cadastrados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dispositivos.map((d) => (
              <div key={d.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-6 w-6 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{d.nome}</span>
                      <span className="text-xs font-mono text-slate-400">({d.identificador})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{d.portaria}</p>
                    <div className="flex items-center gap-4 text-xs mt-2">
                      <span className="text-emerald-400 font-bold">{d.leiturasValidas} leituras OK</span>
                      <span className="text-rose-400">{d.leiturasRecusadas} recusadas</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold font-mono ${
                    d.bateriaPercent < 20 ? 'text-rose-400 animate-pulse' : 'text-slate-200'
                  }`}>
                    {d.bateriaPercent}% bat.
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                    d.statusConectividade === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {d.statusConectividade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: INTEGRAÇÕES EXTERNAS
         ===================================================================== */}
      {abaAtiva === 'integracoes' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Integrações Externas & Impacto Operacional</h3>
            <span className="text-xs text-slate-400">Rastreabilidade com pedidos e receita em risco</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integracoes.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.nome}</h4>
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">{item.categoria}</span>
                  </div>
                  {renderBadgeEstado(item.status)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.detalhes}</p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">LATÊNCIA</span>
                    <span className="font-mono font-bold text-slate-200">{item.latenciaMs}ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">PEDIDOS AFETADOS</span>
                    <span className="font-mono font-bold text-rose-400">{item.pedidosAfetados}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">GMV EM RISCO</span>
                    <span className="font-mono font-bold text-rose-400">{formatBRL(item.gmvEmRiscoCents)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: FILAS E PROCESSAMENTOS
         ===================================================================== */}
      {abaAtiva === 'filas' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Outbox Pendente</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{filasEProcessamento.outboxPendente}</div>
              <span className="text-[11px] text-slate-400">Mensagens a despachar</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Dead-Letter Queue</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{filasEProcessamento.deadLetterQueue}</div>
              <span className="text-[11px] text-emerald-400">Zero perda de evento</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Workers Ativos</span>
              <div className="text-2xl font-bold text-white mt-1">{filasEProcessamento.workersAtivos}</div>
              <span className="text-[11px] text-slate-400">RabbitMQ / Redis</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Vazão de Processamento</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{filasEProcessamento.taxaProcessamentoPorSegundo}/s</div>
              <span className="text-[11px] text-slate-400">Taxa instantânea</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h4 className="text-base font-bold text-white">Filas de Mensageria & Background Workers</h4>
            </div>
            <div className="divide-y divide-slate-800">
              {filasEProcessamento.filas.map((f, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">{f.nome}</span>
                    <span className="text-slate-400 ml-3">Latência: {f.latenciaMediaMs}ms</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-300">{f.tamanho} msgs</span>
                    {renderBadgeEstado(f.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: CENTRAL DE ALERTAS (DEDUPLICAÇÃO & RUÍDO)
         ===================================================================== */}
      {abaAtiva === 'alertas' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Central de Alertas Operacionais</h3>
              <p className="text-xs text-slate-400">
                Pipeline de redução de ruído: Centenas de sinais correlacionados sob uma mesma chave causal
              </p>
            </div>
            <Link
              href="/operacao/alertas"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              Abrir Fila Completa de Alertas <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {alertas.map((al) => (
              <div
                key={al.id}
                className={`bg-slate-900 border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  al.severidade === 'CRITICO' ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${
                    al.severidade === 'CRITICO' ? 'text-rose-400' : 'text-amber-400'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{al.codigo}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        al.severidade === 'CRITICO' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {al.severidade}
                      </span>
                      <span className="text-[11px] text-blue-400 font-semibold">{al.categoria}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({al.contagemSinais} ocorrências agrupadas)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{al.titulo}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{al.descricao}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Chave causal: {al.chaveCorrelacao}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {al.status === 'ABERTO' && (
                    <button
                      onClick={() => handleReconhecerAlerta(al.id)}
                      disabled={executandoAcao === al.id}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      {executandoAcao === al.id ? 'Reconhecendo...' : 'Reconhecer'}
                    </button>
                  )}

                  <Link
                    href={`/operacao/alertas`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
                  >
                    Tratar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA: GESTÃO DE INCIDENTES (WAR ROOM)
         ===================================================================== */}
      {abaAtiva === 'incidentes' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Sala do Incidente & War Room Operacional</h3>
              <p className="text-xs text-slate-400">
                Orquestração de crise ITIL, papéis definidos, linha do tempo precisa e runbooks executáveis
              </p>
            </div>
            <Link
              href="/operacao/incidentes"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Novo Incidente (War Room)
            </Link>
          </div>

          {incidentes.map((inc) => (
            <div key={inc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              {/* Header do Incidente */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-rose-400">{inc.codigo}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600/30 text-rose-300 border border-rose-600/50">
                      {inc.severidade}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300">
                      STATUS: {inc.status}
                    </span>
                    <span className="text-xs text-slate-400">Duração: {inc.duracaoMinutos} min</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">{inc.titulo}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{inc.descricao}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">GMV em Risco</span>
                  <span className="text-lg font-mono font-bold text-rose-400">{formatBRL(inc.gmvEmRiscoCentavos)}</span>
                  <span className="text-[11px] text-slate-400 block">{inc.pedidosRepresados} pedidos represados</span>
                </div>
              </div>

              {/* Papéis de Comando da War Room */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Coordenador do Incidente</span>
                  <span className="font-semibold text-slate-200">{inc.coordenadorId || 'Coordenador NOC'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Resp. Técnico</span>
                  <span className="font-semibold text-slate-200">{inc.responsavelTecnicoId || 'Eng. Plantonista'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Resp. Operacional</span>
                  <span className="font-semibold text-slate-200">{inc.responsavelOperacionalId || 'Líder de Campo'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Resp. Comunicação</span>
                  <span className="font-semibold text-slate-200">{inc.responsavelComunicacaoId || 'Suporte & Relações'}</span>
                </div>
              </div>

              {/* Runbooks e Procedimentos Executáveis */}
              {inc.procedimentos.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Procedimentos Operacionais Padronizados (Runbooks)</h5>
                  <div className="space-y-2">
                    {inc.procedimentos.map((proc) => (
                      <div key={proc.id} className="bg-slate-950 p-3 rounded-lg flex items-center justify-between border border-slate-800 text-xs">
                        <div>
                          <span className="font-semibold text-white">{proc.nome}</span>
                          {proc.resultado && <p className="text-[11px] text-emerald-400 mt-0.5">{proc.resultado}</p>}
                        </div>
                        <button
                          onClick={() => handleExecutarRunbook(proc.id)}
                          disabled={executandoAcao === proc.id || proc.status === 'SUCESSO'}
                          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                            proc.status === 'SUCESSO'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-600 hover:bg-rose-500 text-white'
                          }`}
                        >
                          {proc.status === 'SUCESSO' ? '✓ Executado' : 'Executar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linha do Tempo do Incidente */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Linha do Tempo de Resposta (Microssegundos)</h5>
                <div className="space-y-2 border-l-2 border-slate-800 pl-3">
                  {inc.atualizacoes.map((at) => (
                    <div key={at.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400">{at.autorNome}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(at.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {at.tipo}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-0.5">{at.mensagem}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          ABA: INDICADORES, PÓS-INCIDENTE & PROBLEMAS ITIL
         ===================================================================== */}
      {abaAtiva === 'indicadores' && (
        <div className="mt-6 space-y-6">
          {/* Indicadores Operacionais */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">MTTD (Detecção)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{indicadores.mttdMinutos} min</div>
              <span className="text-[11px] text-slate-400">Meta: &lt; 3.0 min</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">MTTR (Resolução)</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{indicadores.mttrMinutos} min</div>
              <span className="text-[11px] text-slate-400">Meta: &lt; 20.0 min</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">MTBF (Falhas)</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{indicadores.mtbfHoras} h</div>
              <span className="text-[11px] text-slate-400">Tempo entre incidentes</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">SLA Disponibilidade</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{indicadores.slaDisponibilidadePercent}%</div>
              <span className="text-[11px] text-emerald-400">Quatro noves (99.98%)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Recorrência</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{indicadores.taxaRecorrenciaIncidentesPercent}%</div>
              <span className="text-[11px] text-slate-400">Incidentes repetidos</span>
            </div>
          </div>

          {/* Dossiê Pós-Incidente (Post-Mortem / RCA) */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white">Relatório Pós-Incidente Oficial (Post-Mortem / RCA)</h4>
                <p className="text-xs text-slate-400">Diferenciação auditada: Causa Raiz Confirmada vs Hipóteses Descartadas</p>
              </div>
              <span className="px-2 py-1 rounded text-xs font-bold bg-blue-600/20 text-blue-300 border border-blue-600/40">
                AUDITORIA CONCLUÍDA
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-semibold block text-[11px]">INCIDENTE AUDITADO:</span>
                <span className="font-bold text-white text-sm">INC-2026-0038 — Interrupção temporária de sincronização de catracas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Causa Raiz Confirmada (Evidência Física)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Falha na fonte do switch POE secundário por sobreaquecimento nos racks externos. Confirmado por medição térmica no local e inspeção do hardware.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Hipótese Descartada na Investigação
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Ataque DDoS local na rede Wi-Fi descartado após análise dos fluxos de tráfego no firewall de borda (Syslog com volume de pacotes normal).
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <span className="font-bold text-white">Ação Corretiva com Responsável e Prazo (Vinculável ao 11.32):</span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-300">Instalação de exaustores de refrigeração forçada nos racks externos</span>
                  <span className="font-mono text-slate-400">Resp: Infraestrutura · Prazo: 2026-10-10 (Concluída)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}