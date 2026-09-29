'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileCheck,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Lock,
  Unlock,
  FolderOpen,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  UserCheck,
  Building,
  Key,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { useProducerEvent } from '../../components/ProducerEventContext';
import { useAuthSession } from '../../components/AuthSessionContext';

// Interfaces estruturadas
interface DocumentoItem {
  id: string;
  codigo: string;
  tipo: string;
  titulo: string;
  produtorNome: string;
  eventoNome: string;
  situacao: string;
  sensibilidade: string;
  versao: number;
  origemDescricao: string;
  hashOriginal: string;
  hashFinal?: string;
  regraFinanceiraUltimoAssinante: boolean;
  ordemAssinatura: string;
  dataCriacao: string;
  metadados?: Record<string, any>;
  signatarios: Array<{
    id: string;
    nome: string;
    email: string;
    papel: string;
    ordem: number;
    status: 'PENDENTE' | 'ASSINADO' | 'RECUSADO';
    assinadoEm?: string;
  }>;
}

interface ContratoItem {
  id: string;
  codigo: string;
  produtorNome: string;
  empresaContratante: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  taxaDiskPercentual: number;
  prazoRepasseDias: number;
  antecipacaoPermitida: boolean;
  taxaAntecipacaoPercentual: number;
  status: string;
  aditivos: Array<{
    codigo: string;
    numeroSequencial: number;
    dataVigencia: string;
    taxaDiskPercentualNova: number;
    prazoRepasseDiasNovo: number;
    justificativa: string;
    status: string;
  }>;
}

const SECOES_17_DOSSIE = [
  '01. Cadastro',
  '02. Contratos',
  '03. Condições Comerciais',
  '04. Documentação do Produtor',
  '05. Inventário',
  '06. Vendas',
  '07. Pagamentos',
  '08. Portaria',
  '09. Financeiro',
  '10. Repasses',
  '11. Borderôs',
  '12. Contabilidade',
  '13. Marketing',
  '14. Pós-Evento',
  '15. Incidentes',
  '16. Auditoria',
  '17. Fechamento',
];

export default function DocumentosPage() {
  const { eventoId, evento } = useProducerEvent();
  const { currentUser, isProducer } = useAuthSession();

  // Modo: Disk Interno ou Produtor
  const [modoProdutor, setModoProdutor] = useState<boolean>(isProducer);
  const [abaAtiva, setAbaAtiva] = useState<string>('visao-geral');

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');

  // Modais e Estados Selecionados
  const [documentoVisualizando, setDocumentoVisualizando] = useState<DocumentoItem | null>(null);
  const [marcaDaguaAtiva, setMarcaDaguaAtiva] = useState(true);
  const [modalCertificado, setModalCertificado] = useState<DocumentoItem | null>(null);
  const [modalNovoDoc, setModalNovoDoc] = useState(false);
  const [modalDivergencia, setModalDivergencia] = useState(false);
  const [secaoDossieSelecionada, setSecaoDossieSelecionada] = useState<number>(1);
  const [sucessoFeedback, setSucessoFeedback] = useState<string | null>(null);

  // Dados mockados iniciais ricos representando o Core
  const [documentos, setDocumentos] = useState<DocumentoItem[]>([
    {
      id: 'doc-1',
      codigo: 'CTR-2026-001842',
      tipo: 'CONTRATO',
      titulo: 'Contrato Comercial de Bilhetagem Exclusiva — T4F Entretenimento',
      produtorNome: 'T4F Entretenimento S.A.',
      eventoNome: 'Turnê Nacional Rock Fest 2026',
      situacao: 'VIGENTE',
      sensibilidade: 'CONTRATUAL',
      versao: 1,
      origemDescricao: 'Acordo Comercial B2B Homologado',
      hashOriginal: '4f29a08e1378f8cb0804d306dc901962ab8f885dfef3e8b010c71a3de92f1559',
      hashFinal: '99e69efcf04746f3458bf59cf21f37b1341c3e3a987d60913e174fe92348aa21',
      regraFinanceiraUltimoAssinante: false,
      ordemAssinatura: 'SEQUENCIAL',
      dataCriacao: '2026-01-15T14:30:00Z',
      metadados: {
        taxaDiskPercentual: 12.0,
        prazoRepasseDias: 7,
        antecipacaoPermitida: true,
        taxaAntecipacaoPercentual: 1.8,
      },
      signatarios: [
        { id: 'sig-1', nome: 'Carlos Eduardo Diretor', email: 'carlos@t4f.com.br', papel: 'PRODUTOR', ordem: 1, status: 'ASSINADO', assinadoEm: '2026-01-16T10:20:00Z' },
        { id: 'sig-2', nome: 'Roberto Disk CEO', email: 'roberto@diskingressos.com.br', papel: 'DIRETORIA_DISK', ordem: 2, status: 'ASSINADO', assinadoEm: '2026-01-16T16:45:00Z' },
      ],
    },
    {
      id: 'doc-2',
      codigo: 'REP-2026-003821',
      tipo: 'SOLICITACAO_REPASSE',
      titulo: 'Solicitação de Repasse R$ 82.500,00 — Festival DiskIngressos Live 2026',
      produtorNome: 'Time For Fun Entretenimento',
      eventoNome: 'Festival DiskIngressos Live 2026',
      situacao: 'AGUARDANDO_ASSINATURA',
      sensibilidade: 'FINANCEIRO',
      versao: 1,
      origemDescricao: 'Operação de Repasse ID rep-88291 no Ledger',
      hashOriginal: '7d3a019efbc4510294719bca03f484820199eab56102919484aa928173618193',
      regraFinanceiraUltimoAssinante: true,
      ordemAssinatura: 'SEQUENCIAL',
      dataCriacao: '2026-09-28T09:15:00Z',
      metadados: {
        repasseId: 'rep-88291',
        valorFormatado: 'R$ 82.500,00',
        valorCentavos: 8250000,
        chavePix: 'financeiro@t4f.com.br',
        dataPrevista: '2026-10-02',
      },
      signatarios: [
        { id: 'sig-3', nome: 'Gestor Financeiro Produtora', email: 'gestor@t4f.com.br', papel: 'PRODUTOR', ordem: 1, status: 'PENDENTE' },
        { id: 'sig-4', nome: 'Controlador Financeiro Disk', email: 'controladoria@diskingressos.com.br', papel: 'FINANCEIRO_DISK', ordem: 2, status: 'PENDENTE' },
      ],
    },
    {
      id: 'doc-3',
      codigo: 'BRD-2026-008721',
      tipo: 'BORDERO',
      titulo: 'Borderô Analítico Consolidado — Turnê Nacional Rock Fest 2026',
      produtorNome: 'Produtora Alpha',
      eventoNome: 'Turnê Nacional Rock Fest 2026',
      situacao: 'AGUARDANDO_APROVACAO',
      sensibilidade: 'FINANCEIRO',
      versao: 1,
      origemDescricao: 'Fechamento do Evento e Conciliação das 10 Gates',
      hashOriginal: '11a084ef729a8f4c01029348ba9817e019283746a5b4c3d2e1f0a9b8c7d6e5f4',
      regraFinanceiraUltimoAssinante: true,
      ordemAssinatura: 'SEQUENCIAL',
      dataCriacao: '2026-09-29T08:00:00Z',
      metadados: {
        vendasLiquidas: 'R$ 480.000,00',
        taxasDisk: 'R$ 57.600,00',
        repassesEfetuados: 'R$ 380.000,00',
        saldoRemanescente: 'R$ 42.400,00',
      },
      signatarios: [
        { id: 'sig-5', nome: 'Representante Alpha', email: 'contato@alpha.com', papel: 'PRODUTOR', ordem: 1, status: 'PENDENTE' },
        { id: 'sig-6', nome: 'Financeiro DiskIngressos', email: 'fin@diskingressos.com.br', papel: 'FINANCEIRO_DISK', ordem: 2, status: 'PENDENTE' },
      ],
    },
    {
      id: 'doc-4',
      codigo: 'ANT-2026-000482',
      tipo: 'ANTECIPACAO',
      titulo: 'Termo de Antecipação de Recebíveis R$ 35.000,00 — Festival Live 2026',
      produtorNome: 'Time For Fun Entretenimento',
      eventoNome: 'Festival DiskIngressos Live 2026',
      situacao: 'ASSINADO',
      sensibilidade: 'FINANCEIRO',
      versao: 1,
      origemDescricao: 'Antecipação Aprovada pelo Comitê de Risco',
      hashOriginal: '33b918fa20194857cb9182374650192847561029384756102938475610293847',
      hashFinal: '77c819fa20194857cb9182374650192847561029384756102938475610293847',
      regraFinanceiraUltimoAssinante: true,
      ordemAssinatura: 'SEQUENCIAL',
      dataCriacao: '2026-09-20T11:00:00Z',
      metadados: {
        valorSolicitado: 'R$ 35.000,00',
        taxaAntecipacao: '1,8%',
        custoOperacao: 'R$ 630,00',
        valorLiquido: 'R$ 34.370,00',
      },
      signatarios: [
        { id: 'sig-7', nome: 'Gestor Financeiro T4F', email: 'gestor@t4f.com.br', papel: 'PRODUTOR', ordem: 1, status: 'ASSINADO', assinadoEm: '2026-09-21T09:12:00Z' },
        { id: 'sig-8', nome: 'Diretoria Financeira Disk', email: 'diretoria.fin@diskingressos.com.br', papel: 'FINANCEIRO_DISK', ordem: 2, status: 'ASSINADO', assinadoEm: '2026-09-21T14:30:00Z' },
      ],
    },
  ]);

  const [contratos, setContratos] = useState<ContratoItem[]>([
    {
      id: 'ctr-1',
      codigo: 'CTR-2026-001842',
      produtorNome: 'Time For Fun Entretenimento',
      empresaContratante: 'DiskIngressos Entretenimento Ltda',
      vigenciaInicio: '2026-01-01',
      vigenciaFim: '2026-12-31',
      taxaDiskPercentual: 12.0,
      prazoRepasseDias: 7,
      antecipacaoPermitida: true,
      taxaAntecipacaoPercentual: 1.8,
      status: 'VIGENTE',
      aditivos: [
        {
          codigo: 'ADT-2026-000241',
          numeroSequencial: 1,
          dataVigencia: '2026-06-01',
          taxaDiskPercentualNova: 14.0,
          prazoRepasseDiasNovo: 5,
          justificativa: 'Expansão de volume para festivais de grande porte e suporte dedicado.',
          status: 'VIGENTE',
        },
      ],
    },
  ]);

  const [dossieEventos, setDossieEventos] = useState({
    codigo: 'DOS-2026-000192',
    eventoNome: 'Festival DiskIngressos Live 2026',
    status: 'EM_FORMACAO',
    versaoFechamento: 1,
    manifestoHash: '8e19cba028174659102938475610293847561029384756102938475610293847',
    totalArquivos: 42,
    totalDocumentosAssinados: 7,
    itensPorSecao: {
      1: [{ titulo: 'Ficha Cadastral e Alvará de Funcionamento', tipo: 'CADASTRO', hash: 'e3b0c44298fc...' }],
      2: [{ titulo: 'Contrato Master de Bilhetagem CTR-2026-001842', tipo: 'CONTRATO', hash: '4f29a08e1378...' }],
      3: [{ titulo: 'Matriz de Condições Comerciais Aprovadas', tipo: 'CONDICOES', hash: '88a1b2c3d4e5...' }],
      4: [{ titulo: 'Documentos do Produtor & Cartão CNPJ', tipo: 'PRODUTOR', hash: '99c819fa2019...' }],
      5: [{ titulo: 'Snapshot de Inventário e Mapa de Assentos', tipo: 'INVENTARIO', hash: '11a084ef729a...' }],
      6: [{ titulo: 'Relatório Consolidado de Vendas por Canal', tipo: 'VENDAS', hash: '55d2918a7c01...' }],
      7: [{ titulo: 'Espelho de Adquirentes e Webhooks de Pagamento', tipo: 'PAGAMENTOS', hash: '33b918fa2019...' }],
      8: [{ titulo: 'Logs de Portaria e Catracas (Check-in Real)', tipo: 'PORTARIA', hash: '44c019284756...' }],
      9: [{ titulo: 'Extrato do Ledger Imutável da Operação', tipo: 'FINANCEIRO', hash: '66e102938475...' }],
      10: [{ titulo: 'Solicitações de Repasse REP-2026-003821', tipo: 'REPASSES', hash: '7d3a019efbc4...' }],
      11: [{ titulo: 'Borderô Analítico Consolidado BRD-2026-008721', tipo: 'BORDEROS', hash: '22f102938475...' }],
      12: [{ titulo: 'Lançamentos Contábeis de Partidas Dobradas', tipo: 'CONTABILIDADE', hash: '77a819203948...' }],
      13: [{ titulo: 'Atribuição de Campanhas e Conversões CAPI', tipo: 'MARKETING', hash: '88b918273645...' }],
      14: [{ titulo: 'Pesquisa de Satisfação Pós-Evento', tipo: 'POS_EVENTO', hash: '99c019283746...' }],
      15: [{ titulo: 'Relatório de Incidentes Operacionais NOC', tipo: 'INCIDENTES', hash: '00d192837465...' }],
      16: [{ titulo: 'Dossiê de Auditoria e Integridade Sistêmica', tipo: 'AUDITORIA', hash: '11e293847561...' }],
      17: [{ titulo: 'Ata de Fechamento Definitivo e Conciliação', tipo: 'FECHAMENTO', hash: '22f394857610...' }],
    } as Record<number, Array<{ titulo: string; tipo: string; hash: string }>>,
  });

  const [checklist, setChecklist] = useState({
    bloqueioAtivo: false,
    motivoBloqueio: null as string | null,
    itens: [
      { id: '1', nome: 'Contrato Social ou Estatuto Vigente', tipo: 'CONTRATO_SOCIAL', obrigatorio: true, status: 'CONFORME' },
      { id: '2', nome: 'Comprovante de Inscrição no CNPJ (Ativo)', tipo: 'CARTAO_CNPJ', obrigatorio: true, status: 'CONFORME' },
      { id: '3', nome: 'Comprovante de Titularidade da Conta Bancária', tipo: 'COMPROVANTE_BANCARIO', obrigatorio: true, status: 'CONFORME' },
      { id: '4', nome: 'Documento Oficial do Representante Legal', tipo: 'DOCUMENTO_REPRESENTANTE', obrigatorio: true, status: 'CONFORME' },
    ],
  });

  // Ações de Assinatura e Aprovação
  const handleAprovarDocumento = (docId: string) => {
    setDocumentos((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, situacao: 'AGUARDANDO_ASSINATURA' } : d,
      ),
    );
    setSucessoFeedback('Documento formalmente aprovado! Solicitações de assinatura emitidas.');
    setTimeout(() => setSucessoFeedback(null), 4000);
  };

  const handleAssinarComoProdutor = (docId: string) => {
    setDocumentos((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const novosSignatarios = d.signatarios.map((s) =>
          s.papel === 'PRODUTOR' ? { ...s, status: 'ASSINADO' as const, assinadoEm: new Date().toISOString() } : s,
        );
        const todosAssinaram = novosSignatarios.every((s) => s.status === 'ASSINADO');
        return {
          ...d,
          situacao: todosAssinaram ? 'ASSINADO' : 'PARCIALMENTE_ASSINADO',
          signatarios: novosSignatarios,
          hashFinal: todosAssinaram ? 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e' : undefined,
        };
      }),
    );
    setSucessoFeedback('Assinatura do Produtor registrada com carimbo de tempo e evidência criptográfica SHA-256.');
    setTimeout(() => setSucessoFeedback(null), 4000);
  };

  const handleAssinarComoFinanceiroDisk = (docId: string) => {
    const doc = documentos.find((d) => d.id === docId);
    if (!doc) return;

    // Validação da REGRA DE OURO
    if (doc.regraFinanceiraUltimoAssinante) {
      const produtorPendente = doc.signatarios.some((s) => s.papel === 'PRODUTOR' && s.status !== 'ASSINADO');
      if (produtorPendente) {
        alert('Regra Financeira Inviolável: Financeiro Disk é o último assinante e requer a assinatura prévia do Produtor.');
        return;
      }
    }

    setDocumentos((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const novosSignatarios = d.signatarios.map((s) =>
          s.papel === 'FINANCEIRO_DISK' ? { ...s, status: 'ASSINADO' as const, assinadoEm: new Date().toISOString() } : s,
        );
        const todosAssinaram = novosSignatarios.every((s) => s.status === 'ASSINADO');
        return {
          ...d,
          situacao: todosAssinaram ? 'ASSINADO' : 'PARCIALMENTE_ASSINADO',
          signatarios: novosSignatarios,
          hashFinal: todosAssinaram ? '9b83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e' : undefined,
        };
      }),
    );
    setSucessoFeedback('Financeiro Disk assinou por último! Documento concluído e autorizado para liquidação na Tesouraria.');
    setTimeout(() => setSucessoFeedback(null), 4000);
  };

  // Filtragem de documentos
  const documentosFiltrados = documentos.filter((d) => {
    if (busca && !d.codigo.toLowerCase().includes(busca.toLowerCase()) && !d.titulo.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    if (filtroTipo && d.tipo !== filtroTipo) return false;
    if (filtroSituacao && d.situacao !== filtroSituacao) return false;
    return true;
  });

  // Documentos que aguardam ação do produtor
  const pendenciasProdutor = documentos.filter(
    (d) =>
      (d.situacao === 'AGUARDANDO_ASSINATURA' || d.situacao === 'PARCIALMENTE_ASSINADO') &&
      d.signatarios.some((s) => s.papel === 'PRODUTOR' && s.status === 'PENDENTE'),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Feedback */}
      {sucessoFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{sucessoFeedback}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Documentos & Contratos
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                EDDIE 11.35
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Objetos operacionais do EDDIE: Contratos, Aditivos, Assinatura Digital, Regra Financeira e Dossiê em 17 Seções.
          </p>
        </div>

        {/* Switch de Perfil (Disk Interno vs Portal do Produtor) */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs font-medium">
            <button
              onClick={() => {
                setModoProdutor(false);
                setAbaAtiva('visao-geral');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                !modoProdutor ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Disk Interno (ERP)
            </button>
            <button
              onClick={() => {
                setModoProdutor(true);
                setAbaAtiva('produtor-resumo');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                modoProdutor ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Portal do Produtor
            </button>
          </div>

          {!modoProdutor && (
            <button
              onClick={() => setModalDivergencia(true)}
              className="px-3.5 py-2 text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 rounded-xl transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Auditar Divergências Core
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODO PORTAL DO PRODUTOR                                                  */}
      {/* ========================================================================= */}
      {modoProdutor ? (
        <div className="space-y-6">
          {/* Caixa de Destaque: PRECISA DA SUA AÇÃO */}
          {pendenciasProdutor.length > 0 ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 mt-0.5">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-amber-200">
                      PRECISA DA SUA AÇÃO
                    </h2>
                    <p className="text-sm text-amber-300/80 mt-0.5">
                      Você possui {pendenciasProdutor.length} documento(s) aguardando sua assinatura eletrônica formal para liberação dos repasses.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDocumentoVisualizando(pendenciasProdutor[0])}
                    className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    Assinar Pendência ({pendenciasProdutor[0]?.codigo})
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Nenhuma pendência documental ativa. Todos os seus documentos, contratos e repasses estão em dia!</span>
            </div>
          )}

          {/* Abas Simplificadas do Produtor */}
          <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
            <button
              onClick={() => setAbaAtiva('produtor-resumo')}
              className={`pb-3 transition-colors ${
                abaAtiva === 'produtor-resumo'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meus Documentos
            </button>
            <button
              onClick={() => setAbaAtiva('produtor-assinar')}
              className={`pb-3 transition-colors flex items-center gap-2 ${
                abaAtiva === 'produtor-assinar'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Documentos para Assinar
              {pendenciasProdutor.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-slate-950 font-bold">
                  {pendenciasProdutor.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('produtor-borderos')}
              className={`pb-3 transition-colors ${
                abaAtiva === 'produtor-borderos'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Borderôs dos Eventos
            </button>
            <button
              onClick={() => setAbaAtiva('produtor-repasses')}
              className={`pb-3 transition-colors ${
                abaAtiva === 'produtor-repasses'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Repasses & Antecipações
            </button>
            <button
              onClick={() => setAbaAtiva('produtor-contratos')}
              className={`pb-3 transition-colors ${
                abaAtiva === 'produtor-contratos'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Contratos & Condições
            </button>
          </div>

          {/* Lista de Documentos do Produtor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentos.map((doc) => {
              const aguardaEu = doc.signatarios.some(
                (s) => s.papel === 'PRODUTOR' && s.status === 'PENDENTE',
              );

              return (
                <div
                  key={doc.id}
                  className={`p-5 rounded-2xl bg-slate-900/80 border transition-all ${
                    aguardaEu ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.codigo}
                        </span>
                        <span className="text-xs text-slate-400">{doc.tipo}</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{doc.titulo}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(doc.dataCriacao).toLocaleDateString('pt-BR')} • {doc.eventoNome}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        doc.situacao === 'VIGENTE' || doc.situacao === 'ASSINADO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : doc.situacao === 'AGUARDANDO_ASSINATURA'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {doc.situacao}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Signatários:</span>
                      <div className="flex -space-x-1.5">
                        {doc.signatarios.map((s) => (
                          <span
                            key={s.id}
                            title={`${s.nome} (${s.papel}) - ${s.status}`}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-900 ${
                              s.status === 'ASSINADO' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {s.papel[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDocumentoVisualizando(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar
                      </button>

                      {aguardaEu && (
                        <button
                          onClick={() => handleAssinarComoProdutor(doc.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Assinar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODO DISK INTERNO (ADMINISTRATIVO COMPLETO)                              */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Navegação de Abas Administrativas */}
          <div className="flex overflow-x-auto border-b border-slate-800 gap-6 text-sm font-medium scrollbar-thin">
            {[
              { id: 'visao-geral', label: 'Visão Geral' },
              { id: 'documentos', label: 'Documentos' },
              { id: 'contratos', label: 'Contratos & Aditivos' },
              { id: 'assinaturas', label: 'Assinaturas & Fluxo' },
              { id: 'modelos', label: 'Modelos de Documentos' },
              { id: 'dossies', label: 'Dossiês Operacionais' },
              { id: 'pendencias', label: 'Central de Pendências' },
              { id: 'configuracoes', label: 'Checklist & Bloqueios' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id)}
                className={`pb-3 whitespace-nowrap transition-colors ${
                  abaAtiva === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ABA: VISÃO GERAL */}
          {abaAtiva === 'visao-geral' && (
            <div className="space-y-6">
              {/* KPIs de Alto Nível */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[
                  { label: 'Total Documentos', valor: documentos.length, cor: 'text-indigo-400', icon: FileText },
                  { label: 'Contratos Vigentes', valor: contratos.length, cor: 'text-emerald-400', icon: Shield },
                  { label: 'Aguardando Assinatura', valor: 2, cor: 'text-amber-400', icon: Clock },
                  { label: 'Pendências Críticas', valor: 0, cor: 'text-rose-400', icon: AlertTriangle },
                  { label: 'Integridade SHA-256', valor: '100%', cor: 'text-cyan-400', icon: Hash },
                  { label: 'Bloqueios Ativos', valor: checklist.bloqueioAtivo ? 1 : 0, cor: 'text-slate-300', icon: Lock },
                ].map((kpi, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-medium">{kpi.label}</span>
                      <kpi.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className={`text-xl font-bold ${kpi.cor}`}>{kpi.valor}</div>
                  </div>
                ))}
              </div>

              {/* Fluxo Documental Integrado do EDDIE */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Arquitetura Operacional do Documento — EDDIE 11.35
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-9 gap-2 text-center text-xs">
                  {[
                    { etapa: 'Core Real', sub: 'Eventos/Vendas' },
                    { etapa: 'Operação', sub: 'Repasse/Borderô' },
                    { etapa: 'Documento', sub: 'Objeto EDDIE' },
                    { etapa: 'Validação', sub: 'Integridade' },
                    { etapa: 'Aprovação', sub: 'Alçada Disk' },
                    { etapa: 'Assinaturas', sub: 'Ordem Rigorosa' },
                    { etapa: 'Doc Final', sub: 'Hash Selado' },
                    { etapa: 'Dossiê', sub: '17 Seções' },
                    { etapa: 'Auditoria', sub: 'Imutável' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col justify-center"
                    >
                      <span className="font-semibold text-slate-200">{p.etapa}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{p.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabela de Documentos Recentes */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Documentos Operacionais Recentes</h2>
                  <button
                    onClick={() => setAbaAtiva('documentos')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Ver catálogo completo <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2.5">Código</th>
                        <th className="pb-2.5">Tipo</th>
                        <th className="pb-2.5">Título / Operação</th>
                        <th className="pb-2.5">Produtor</th>
                        <th className="pb-2.5">Situação</th>
                        <th className="pb-2.5">Sensibilidade</th>
                        <th className="pb-2.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {documentos.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-800/30">
                          <td className="py-3 font-mono font-medium text-slate-300">{doc.codigo}</td>
                          <td className="py-3 text-slate-400">{doc.tipo}</td>
                          <td className="py-3 font-medium text-white max-w-xs truncate">{doc.titulo}</td>
                          <td className="py-3 text-slate-300">{doc.produtorNome}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                doc.situacao === 'VIGENTE' || doc.situacao === 'ASSINADO'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : doc.situacao === 'AGUARDANDO_ASSINATURA'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {doc.situacao}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                              {doc.sensibilidade}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setDocumentoVisualizando(doc)}
                              className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                            >
                              Visualizar
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

          {/* ABA: DOCUMENTOS COMPLETA */}
          {abaAtiva === 'documentos' && (
            <div className="space-y-4">
              {/* Barra de Filtros */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex flex-1 items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg w-full">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por código, título ou produtor..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="CONTRATO">Contrato</option>
                    <option value="ADITIVO">Aditivo</option>
                    <option value="BORDERO">Borderô</option>
                    <option value="SOLICITACAO_REPASSE">Solicitação de Repasse</option>
                    <option value="ANTECIPACAO">Antecipação</option>
                  </select>

                  <select
                    value={filtroSituacao}
                    onChange={(e) => setFiltroSituacao(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="">Todas as Situações</option>
                    <option value="EM_ELABORACAO">Em Elaboração</option>
                    <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
                    <option value="AGUARDANDO_ASSINATURA">Aguardando Assinatura</option>
                    <option value="ASSINADO">Assinado</option>
                    <option value="VIGENTE">Vigente</option>
                  </select>
                </div>
              </div>

              {/* Tabela Principal */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3">Código</th>
                        <th className="pb-3">Tipo</th>
                        <th className="pb-3">Título</th>
                        <th className="pb-3">Produtor & Evento</th>
                        <th className="pb-3">Origem</th>
                        <th className="pb-3">Situação</th>
                        <th className="pb-3">Regra de Ouro</th>
                        <th className="pb-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {documentosFiltrados.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-800/30">
                          <td className="py-3 font-mono font-medium text-indigo-300">{doc.codigo}</td>
                          <td className="py-3 text-slate-300 font-medium">{doc.tipo}</td>
                          <td className="py-3 text-white max-w-xs">{doc.titulo}</td>
                          <td className="py-3 text-slate-300">
                            <div>{doc.produtorNome}</div>
                            <div className="text-[11px] text-slate-500">{doc.eventoNome}</div>
                          </td>
                          <td className="py-3 text-slate-400 max-w-xs truncate">{doc.origemDescricao}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                doc.situacao === 'VIGENTE' || doc.situacao === 'ASSINADO'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : doc.situacao === 'AGUARDANDO_ASSINATURA'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : doc.situacao === 'AGUARDANDO_APROVACAO'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {doc.situacao}
                            </span>
                          </td>
                          <td className="py-3">
                            {doc.regraFinanceiraUltimoAssinante ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Fin. Disk Último
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Padrão</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setDocumentoVisualizando(doc)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
                            >
                              Visualizar
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

          {/* ABA: CONTRATOS & ADITIVOS */}
          {abaAtiva === 'contratos' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Contratos & Condições Comerciais Estruturadas</h2>
                  <p className="text-xs text-slate-400">
                    O PDF assinado formaliza o negócio. As regras computacionais do Core executam o split e repasse.
                  </p>
                </div>
              </div>

              {contratos.map((ctr) => (
                <div key={ctr.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {ctr.codigo}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {ctr.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{ctr.produtorNome}</h3>
                      <p className="text-xs text-slate-400">Contratante: {ctr.empresaContratante}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Vigência Contratual</div>
                      <div className="text-xs font-semibold text-white">
                        {ctr.vigenciaInicio} até {ctr.vigenciaFim}
                      </div>
                    </div>
                  </div>

                  {/* Condição Comercial Estruturada */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Condições Comerciais Estruturadas (Core Operacional)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Taxa Disk Original</span>
                        <div className="text-sm font-bold text-white mt-0.5">{ctr.taxaDiskPercentual}%</div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Prazo de Repasse</span>
                        <div className="text-sm font-bold text-white mt-0.5">D+{ctr.prazoRepasseDias}</div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Antecipação</span>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">
                          {ctr.antecipacaoPermitida ? 'Permitida' : 'Bloqueada'}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Taxa Antecipação</span>
                        <div className="text-sm font-bold text-white mt-0.5">{ctr.taxaAntecipacaoPercentual}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Aditivos Vinculados com Comparação */}
                  {ctr.aditivos.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Histórico de Aditivos e Repactuações
                      </h4>

                      <div className="space-y-2">
                        {ctr.aditivos.map((adt) => (
                          <div
                            key={adt.codigo}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold text-slate-200">{adt.codigo}</span>
                                <span className="text-slate-400">(Aditivo 0{adt.numeroSequencial})</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                                  {adt.status}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs">{adt.justificativa}</p>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 block">Taxa Anterior</span>
                                <span className="line-through text-slate-400">{ctr.taxaDiskPercentual}%</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                              <div className="text-center">
                                <span className="text-[10px] text-indigo-400 block">Nova Taxa</span>
                                <span className="font-bold text-indigo-300">{adt.taxaDiskPercentualNova}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ABA: ASSINATURAS & REGRA FINANCEIRA */}
          {abaAtiva === 'assinaturas' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                <span className="font-bold">Regra de Ouro Financeira:</span> Em fluxos financeiros (repasse, antecipação e borderô), o Produtor solicita ou aprova, mas o <strong>Financeiro Disk é obrigatoriamente o último assinante</strong>.
              </div>

              <div className="space-y-4">
                {documentos
                  .filter((d) => d.situacao === 'AGUARDANDO_ASSINATURA' || d.situacao === 'PARCIALMENTE_ASSINADO')
                  .map((doc) => {
                    const produtorAssinou = doc.signatarios.find((s) => s.papel === 'PRODUTOR')?.status === 'ASSINADO';
                    const financeiroAssinou = doc.signatarios.find((s) => s.papel === 'FINANCEIRO_DISK')?.status === 'ASSINADO';

                    return (
                      <div key={doc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {doc.codigo}
                            </span>
                            <h3 className="font-semibold text-white text-sm mt-1">{doc.titulo}</h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
                            {doc.situacao}
                          </span>
                        </div>

                        {/* Signatários e Ordem */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {doc.signatarios.map((sig) => (
                            <div
                              key={sig.id}
                              className={`p-3 rounded-xl border flex items-center justify-between ${
                                sig.status === 'ASSINADO'
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : 'bg-slate-950 border-slate-800'
                              }`}
                            >
                              <div>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                                  {sig.ordem}º Signatário • {sig.papel}
                                </span>
                                <span className="font-semibold text-white">{sig.nome}</span>
                                <span className="text-slate-400 block text-[11px]">{sig.email}</span>
                              </div>

                              <div>
                                {sig.status === 'ASSINADO' ? (
                                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                    <CheckCircle2 className="w-4 h-4" /> Assinado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-amber-400">
                                    <Clock className="w-4 h-4" /> Aguardando
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Ações de Assinatura */}
                        <div className="pt-2 flex items-center justify-end gap-3 text-xs">
                          <button
                            onClick={() => setDocumentoVisualizando(doc)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          >
                            Conferir Documento
                          </button>

                          {!produtorAssinou && (
                            <button
                              onClick={() => handleAssinarComoProdutor(doc.id)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
                            >
                              Simular Assinatura Produtor
                            </button>
                          )}

                          {!financeiroAssinou && (
                            <button
                              onClick={() => handleAssinarComoFinanceiroDisk(doc.id)}
                              disabled={!produtorAssinou}
                              className={`px-3.5 py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                                produtorAssinou
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <FileCheck className="w-4 h-4" />
                              Financeiro Disk: Assinar por Último
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ABA: DOSSIÊS OPERACIONAIS (17 SEÇÕES) */}
          {abaAtiva === 'dossies' && (
            <div className="space-y-6">
              {/* Header do Dossiê */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                      {dossieEventos.codigo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                      {dossieEventos.status}
                    </span>
                    <span className="text-xs text-slate-400">Versão {dossieEventos.versaoFechamento}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{dossieEventos.eventoNome}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    Hash Manifesto SHA-256: {dossieEventos.manifestoHash}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-2 text-xs">
                    <div className="text-slate-400">Evidências / Arquivos</div>
                    <div className="text-sm font-bold text-white">{dossieEventos.totalArquivos} itens</div>
                  </div>
                  <button
                    onClick={() => {
                      alert(`Manifesto do Dossiê ${dossieEventos.codigo} exportado com sucesso com 42 hashes validados.`);
                    }}
                    className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Pacote
                  </button>
                </div>
              </div>

              {/* Seletor das 17 Seções */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-1 bg-slate-900 p-3 rounded-2xl border border-slate-800 max-h-[560px] overflow-y-auto">
                  <span className="text-[11px] font-bold text-slate-500 uppercase px-2 mb-2 block">
                    17 Seções do Dossiê
                  </span>
                  {SECOES_17_DOSSIE.map((nome, idx) => {
                    const secaoNum = idx + 1;
                    const qtd = dossieEventos.itensPorSecao[secaoNum]?.length || 0;

                    return (
                      <button
                        key={secaoNum}
                        onClick={() => setSecaoDossieSelecionada(secaoNum)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          secaoDossieSelecionada === secaoNum
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{nome}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-slate-300">
                          {qtd}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Conteúdo da Seção Selecionada */}
                <div className="md:col-span-3 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm">
                      {SECOES_17_DOSSIE[secaoDossieSelecionada - 1]}
                    </h3>
                    <span className="text-xs text-slate-400">
                      Integridade e Rastreabilidade Garantidas
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dossieEventos.itensPorSecao[secaoDossieSelecionada]?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.titulo}</div>
                            <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                              Hash: {item.hash}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                          Íntegro
                        </span>
                      </div>
                    )) || (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        Nenhum arquivo adicionado nesta seção ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: CENTRAL DE PENDÊNCIAS */}
          {abaAtiva === 'pendencias' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[
                  { titulo: 'Aguardando aprovação', valor: 14, cor: 'text-blue-400' },
                  { titulo: 'Aguardando Produtor', valor: 8, cor: 'text-amber-400' },
                  { titulo: 'Aguardando Financeiro Disk', valor: 3, cor: 'text-purple-400' },
                  { titulo: 'Próximos do vencimento', valor: 5, cor: 'text-orange-400' },
                  { titulo: 'Contratos a renovar', valor: 7, cor: 'text-indigo-400' },
                  { titulo: 'Documentação incompleta', valor: 4, cor: 'text-rose-400' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">{item.titulo}</span>
                    <span className={`text-2xl font-bold ${item.cor}`}>{item.valor}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-white text-sm">Fila de Prioridades Documentais</h3>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">REP-2026-003821</span>
                      <span className="text-white font-medium">Repasse R$ 82.500,00 aguarda assinatura do Produtor</span>
                    </div>
                    <button
                      onClick={() => handleAssinarComoProdutor('doc-2')}
                      className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/30"
                    >
                      Cobrar Produtor
                    </button>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-slate-400 mr-2">CTR-2026-001842</span>
                      <span className="text-white font-medium">Contrato T4F Entretenimento vence em 45 dias</span>
                    </div>
                    <button
                      onClick={() => alert('Processo de renovação iniciado.')}
                      className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30"
                    >
                      Iniciar Renovação
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: MODELOS DE DOCUMENTOS */}
          {abaAtiva === 'modelos' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2">Catálogo de Modelos Dinâmicos</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Geração documental baseada em tags dinâmicas vinculadas aos dados reais do Core. Edição livre de dados financeiros é estritamente proibida.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { codigo: 'MOD-CTR-01', nome: 'Contrato Padrão de Produtor', tags: ['{{produtor.razao_social}}', '{{contrato.taxa_disk}}'] },
                    { codigo: 'MOD-REP-01', nome: 'Solicitação de Repasse Operacional', tags: ['{{financeiro.valor_repasse}}', '{{evento.nome}}'] },
                    { codigo: 'MOD-BRD-01', nome: 'Borderô Analítico de Fechamento', tags: ['{{financeiro.saldo}}', '{{vendas.bruta}}'] },
                  ].map((mod) => (
                    <div key={mod.codigo} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="font-mono text-indigo-400 font-semibold">{mod.codigo}</span>
                      <div className="font-semibold text-white mt-1">{mod.nome}</div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {mod.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA: CONFIGURAÇÕES & CHECKLIST */}
          {abaAtiva === 'configuracoes' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Checklist Documental Obrigatório</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Se qualquer documento obrigatório estiver vencido ou pendente, operações financeiras (como repasses) são bloqueadas automaticamente.
                </p>
              </div>

              <div className="space-y-2.5">
                {checklist.itens.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{item.nome}</div>
                      <div className="text-[11px] text-slate-500">Tipo: {item.tipo} • {item.obrigatorio ? 'Obrigatório' : 'Opcional'}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE VISUALIZAÇÃO COM MARCA D'ÁGUA DINÂMICA                          */}
      {/* ========================================================================= */}
      {documentoVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {documentoVisualizando.codigo}
                </span>
                <span className="text-xs text-slate-400">{documentoVisualizando.tipo}</span>
              </div>
              <button
                onClick={() => setDocumentoVisualizando(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo com Marca d'Água */}
            <div className="p-6 overflow-y-auto space-y-4 relative flex-1 text-xs">
              {/* Marca d'água */}
              {marcaDaguaAtiva && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-[0.04] rotate-[-25deg] text-3xl font-black text-white text-center">
                  DISKINGRESSOS CONFIDENCIAL • VISUALIZADO POR OPERADOR • {new Date().toISOString().slice(0, 10)}
                </div>
              )}

              <h2 className="text-base font-bold text-white">{documentoVisualizando.titulo}</h2>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">Origem: <span className="text-slate-200">{documentoVisualizando.origemDescricao}</span></div>
                <div className="text-slate-400">Produtor: <span className="text-slate-200">{documentoVisualizando.produtorNome}</span></div>
                <div className="text-slate-400">Evento: <span className="text-slate-200">{documentoVisualizando.eventoNome}</span></div>
              </div>

              {/* Metadados Computacionais do Core */}
              {documentoVisualizando.metadados && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Dados Computacionais do Core</h4>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(documentoVisualizando.metadados, null, 2)}
                  </pre>
                </div>
              )}

              {/* Signatários */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Signatários & Evidências</h4>
                <div className="space-y-2">
                  {documentoVisualizando.signatarios.map((s) => (
                    <div key={s.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-white">{s.nome}</span> ({s.papel})
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${s.status === 'ASSINADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Hash SHA-256 Original: {documentoVisualizando.hashOriginal}
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marcaDaguaAtiva}
                  onChange={(e) => setMarcaDaguaAtiva(e.target.checked)}
                />
                Exibir Marca d'Água de Segurança
              </label>

              <div className="flex items-center gap-2">
                {documentoVisualizando.situacao === 'AGUARDANDO_APROVACAO' && (
                  <button
                    onClick={() => {
                      handleAprovarDocumento(documentoVisualizando.id);
                      setDocumentoVisualizando(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                  >
                    Aprovar Documento
                  </button>
                )}

                <button
                  onClick={() => setDocumentoVisualizando(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE DIVERGÊNCIAS CONTRATUAIS                                         */}
      {/* ========================================================================= */}
      {modalDivergencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Auditoria de Divergência Contrato × Core (11.31 / 11.35)
              </h3>
              <button onClick={() => setModalDivergencia(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-slate-300">
              O motor compara a condição comercial vigente do contrato assinado contra as regras operacionais cadastradas nos eventos.
            </p>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-semibold">Zero Divergências Críticas Detectadas</div>
                <div className="text-[11px] text-emerald-400/80">Todos os 184 contratos vigentes estão 100% alinhados com as configurações do Core.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalDivergencia(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
