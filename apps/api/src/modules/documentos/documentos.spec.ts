import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentosService } from './services/documentos.service';
import { AssinaturasService } from './services/assinaturas.service';
import { ContratosService } from './services/contratos.service';
import { ModelosService } from './services/modelos.service';
import { DossieService, SECOES_DOSSIE_EVENTO } from './services/dossie.service';
import { ChecklistService } from './services/checklist.service';
import { DocumentosPublicService } from './services/documentos-public.service';
import { EddieInternalSignatureProvider } from './providers/internal-signature.provider';

describe('EDDIE 11.35 — Módulo de Documentos, Contratos, Assinaturas e Dossiê', () => {
  let documentosService: DocumentosService;
  let assinaturasService: AssinaturasService;
  let contratosService: ContratosService;
  let modelosService: ModelosService;
  let dossieService: DossieService;
  let checklistService: ChecklistService;
  let documentosPublicService: DocumentosPublicService;
  let signatureProvider: EddieInternalSignatureProvider;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const produtorId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const eventoId = 'evento-festival-2026';

  // Repositórios em memória mockados
  let documentosDb: any[] = [];
  let signatariosDb: any[] = [];
  let versoesDb: any[] = [];
  let evidenciasDb: any[] = [];
  let modelosDb: any[] = [];
  let contratosDb: any[] = [];
  let aditivosDb: any[] = [];
  let dossiesDb: any[] = [];
  let itensDossieDb: any[] = [];
  let checklistsDb: any[] = [];
  let contestacoesDb: any[] = [];
  let outboxEvents: any[] = [];

  const mockPrisma: any = {
    $transaction: async (cb: any) => await cb(mockPrisma),
    documento: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `doc-${documentosDb.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        documentosDb.push(item);
        return item;
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }) => {
        return documentosDb.find((d) => {
          if (where.id && d.id !== where.id) return false;
          if (where.codigo && d.codigo !== where.codigo) return false;
          if (where.tenantId && d.tenantId !== where.tenantId) return false;
          if (where.idOperacaoOrigem && d.idOperacaoOrigem !== where.idOperacaoOrigem) return false;
          return true;
        }) || null;
      }),
      findMany: vi.fn().mockImplementation(async () => documentosDb),
      update: vi.fn().mockImplementation(async ({ where, data }) => {
        const item = documentosDb.find((d) => d.id === where.id);
        if (item) {
          Object.assign(item, data, { updatedAt: new Date() });
          return item;
        }
        return null;
      }),
      count: vi.fn().mockImplementation(async () => documentosDb.length),
    },
    signatarioDocumento: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `sig-${signatariosDb.length + 1}`, ...data, createdAt: new Date() };
        signatariosDb.push(item);
        return item;
      }),
      findMany: vi.fn().mockImplementation(async ({ where }) => {
        return signatariosDb.filter((s) => {
          if (where.documentoId && s.documentoId !== where.documentoId) return false;
          if (where.tenantId && s.tenantId !== where.tenantId) return false;
          return true;
        });
      }),
      update: vi.fn().mockImplementation(async ({ where, data }) => {
        const item = signatariosDb.find((s) => s.id === where.id);
        if (item) Object.assign(item, data);
        return item;
      }),
      count: vi.fn().mockImplementation(async () => signatariosDb.length),
    },
    versaoDocumento: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `ver-${versoesDb.length + 1}`, ...data, createdAt: new Date() };
        versoesDb.push(item);
        return item;
      }),
      findMany: vi.fn().mockImplementation(async () => versoesDb),
    },
    evidenciaAssinatura: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `evi-${evidenciasDb.length + 1}`, ...data, createdAt: new Date() };
        evidenciasDb.push(item);
        return item;
      }),
      findMany: vi.fn().mockImplementation(async () => evidenciasDb),
    },
    modeloDocumento: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `mod-${modelosDb.length + 1}`, ...data, createdAt: new Date() };
        modelosDb.push(item);
        return item;
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }) => {
        return modelosDb.find((m) => m.codigo === where.codigo) || null;
      }),
      findMany: vi.fn().mockImplementation(async () => modelosDb),
    },
    contrato: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `ctr-${contratosDb.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        contratosDb.push(item);
        return item;
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }) => {
        return contratosDb.find((c) => {
          if (where.id && c.id !== where.id) return false;
          if (where.produtorId && c.produtorId !== where.produtorId) return false;
          if (where.status && c.status !== where.status) return false;
          return true;
        }) || null;
      }),
      findMany: vi.fn().mockImplementation(async () => contratosDb),
      updateMany: vi.fn().mockImplementation(async ({ where, data }) => {
        contratosDb.filter((c) => c.documentoId === where.documentoId).forEach((c) => Object.assign(c, data));
        return { count: 1 };
      }),
      count: vi.fn().mockImplementation(async () => contratosDb.length),
    },
    aditivoContrato: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `adt-${aditivosDb.length + 1}`, ...data, createdAt: new Date() };
        aditivosDb.push(item);
        return item;
      }),
      findMany: vi.fn().mockImplementation(async ({ where }) => {
        return aditivosDb.filter((a) => a.contratoId === where.contratoId);
      }),
      updateMany: vi.fn().mockImplementation(async ({ where, data }) => {
        aditivosDb.filter((a) => a.documentoId === where.documentoId).forEach((a) => Object.assign(a, data));
        return { count: 1 };
      }),
    },
    dossieOperacional: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = {
          id: `dos-${dossiesDb.length + 1}`,
          ...data,
          totalArquivos: 0,
          totalDocumentosAssinados: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dossiesDb.push(item);
        return item;
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }) => {
        return dossiesDb.find((d) => {
          if (where.id && d.id !== where.id) return false;
          if (where.referenciaId && d.referenciaId !== where.referenciaId) return false;
          return true;
        }) || null;
      }),
      update: vi.fn().mockImplementation(async ({ where, data }) => {
        const item = dossiesDb.find((d) => d.id === where.id);
        if (item) {
          if (data.totalArquivos?.increment) item.totalArquivos += data.totalArquivos.increment;
          if (data.totalDocumentosAssinados?.increment) item.totalDocumentosAssinados += data.totalDocumentosAssinados.increment;
          delete data.totalArquivos;
          delete data.totalDocumentosAssinados;
          Object.assign(item, data, { updatedAt: new Date() });
          return item;
        }
        return null;
      }),
    },
    itemDossie: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `item-${itensDossieDb.length + 1}`, ...data, adicionadoEm: new Date() };
        itensDossieDb.push(item);
        return item;
      }),
      findMany: vi.fn().mockImplementation(async ({ where }) => {
        return itensDossieDb.filter((i) => i.dossieId === where.dossieId);
      }),
    },
    checklistDocumental: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `chk-${checklistsDb.length + 1}`, ...data, atualizadoEm: new Date() };
        checklistsDb.push(item);
        return item;
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }) => {
        return checklistsDb.find((c) => c.entidadeId === where.entidadeId && c.tipoEntidade === where.tipoEntidade) || null;
      }),
      update: vi.fn().mockImplementation(async ({ where, data }) => {
        const item = checklistsDb.find((c) => c.id === where.id);
        if (item) Object.assign(item, data);
        return item;
      }),
    },
    contestacaoDocumento: {
      create: vi.fn().mockImplementation(async ({ data }) => {
        const item = { id: `cont-${contestacoesDb.length + 1}`, ...data, createdAt: new Date() };
        contestacoesDb.push(item);
        return item;
      }),
      findMany: vi.fn().mockImplementation(async () => contestacoesDb),
    },
  };

  const mockOutbox: any = {
    emit: vi.fn().mockImplementation(async (_tx, opts) => {
      outboxEvents.push(opts);
      return 'outbox-id-123';
    }),
  };

  beforeEach(() => {
    documentosDb = [];
    signatariosDb = [];
    versoesDb = [];
    evidenciasDb = [];
    modelosDb = [];
    contratosDb = [];
    aditivosDb = [];
    dossiesDb = [];
    itensDossieDb = [];
    checklistsDb = [];
    contestacoesDb = [];
    outboxEvents = [];

    signatureProvider = new EddieInternalSignatureProvider();
    documentosService = new DocumentosService(mockPrisma, mockOutbox);
    assinaturasService = new AssinaturasService(mockPrisma, mockOutbox, signatureProvider);
    contratosService = new ContratosService(mockPrisma, mockOutbox, documentosService);
    modelosService = new ModelosService(mockPrisma, documentosService);
    dossieService = new DossieService(mockPrisma, mockOutbox);
    checklistService = new ChecklistService(mockPrisma);
    documentosPublicService = new DocumentosPublicService(
      mockPrisma,
      documentosService,
      dossieService,
      checklistService,
    );
  });

  describe('1. Documentos e Identificação Padronizada', () => {
    it('deve gerar documento com código padronizado e hash original SHA-256', async () => {
      const doc = await documentosService.criarDocumento(tenantId, 'usr-operador', {
        tipo: 'CONTRATO' as any,
        titulo: 'Contrato Festival Rock 2026',
        produtorId,
        produtorNome: 'Produtora Alpha',
        origemDescricao: 'Novo contrato de produtor',
        conteudoTexto: 'Termos e Condições do Contrato',
      });

      expect(doc.codigo).toMatch(/^CTR-\d{4}-\d{6}$/);
      expect(doc.hashOriginal).toBeDefined();
      expect(doc.hashOriginal.length).toBe(64); // SHA-256
      expect(doc.situacao).toBe('EM_ELABORACAO');
      expect(outboxEvents).toHaveLength(1);
      expect(outboxEvents[0].eventName).toBe('documentos.documento.criado.v1');
    });

    it('deve submeter e aprovar documento avançando para AGUARDANDO_ASSINATURA', async () => {
      const doc = await documentosService.criarDocumento(tenantId, 'usr-operador', {
        tipo: 'BORDERO' as any,
        titulo: 'Borderô Fechamento 2026',
        origemDescricao: 'Fechamento do Evento',
      });

      await documentosService.submeterParaAprovacao(tenantId, doc.id, 'usr-operador');
      expect(doc.situacao).toBe('AGUARDANDO_APROVACAO');

      const aprovado = await documentosService.decidirAprovacao(tenantId, doc.id, 'gestor.financeiro', {
        aprovado: true,
      });

      expect(aprovado.situacao).toBe('AGUARDANDO_ASSINATURA');
      expect(outboxEvents.some((e) => e.eventName === 'documentos.documento.aprovado.v1')).toBe(true);
    });

    it('deve cancelar documento e registrar motivo caso seja rejeitado na aprovação', async () => {
      const doc = await documentosService.criarDocumento(tenantId, 'usr-operador', {
        tipo: 'SOLICITACAO_REPASSE' as any,
        titulo: 'Repasse R$ 50.000',
        origemDescricao: 'Repasse D+7',
      });

      await documentosService.submeterParaAprovacao(tenantId, doc.id, 'usr-operador');
      const rejeitado = await documentosService.decidirAprovacao(tenantId, doc.id, 'gestor.financeiro', {
        aprovado: false,
        motivo: 'Divergência nas retenções fiscais.',
      });

      expect(rejeitado.situacao).toBe('CANCELADO');
      expect(rejeitado.motivoRejeicao).toBe('Divergência nas retenções fiscais.');
    });
  });

  describe('2. Regra de Ouro Financeira: Financeiro Disk assina por último', () => {
    it('deve impedir que Financeiro Disk assine antes do Produtor em operações financeiras', async () => {
      const doc = await documentosService.criarDocumento(tenantId, 'usr-operador', {
        tipo: 'SOLICITACAO_REPASSE' as any,
        titulo: 'Repasse Festival 2026',
        origemDescricao: 'Repasse 100k',
        regraFinanceiraUltimoAssinante: true,
        ordemAssinatura: 'SEQUENCIAL',
        signatarios: [
          {
            ordem: 1,
            nome: 'Carlos Produtor',
            email: 'carlos@produtora.com',
            documentoIdentificacao: '111.222.333-44',
            papel: 'PRODUTOR',
          },
          {
            ordem: 2,
            nome: 'Ana Financeiro Disk',
            email: 'ana@diskingressos.com.br',
            documentoIdentificacao: '555.666.777-88',
            papel: 'FINANCEIRO_DISK',
          },
        ],
      });

      // Aprova para liberar assinatura
      doc.situacao = 'AGUARDANDO_ASSINATURA';

      const sigProdutor = signatariosDb[0];
      const sigFinanceiro = signatariosDb[1];

      // Tentativa de assinatura pelo Financeiro Disk ANTES do Produtor
      await expect(
        assinaturasService.realizarAssinatura(
          tenantId,
          doc.id,
          { id: 'usr-fin', nome: sigFinanceiro.nome, email: sigFinanceiro.email },
          { signatarioId: sigFinanceiro.id },
        ),
      ).rejects.toThrow(/Financeiro Disk deve ser o último assinante/);

      // Agora Produtor assina com sucesso
      const resProd = await assinaturasService.realizarAssinatura(
        tenantId,
        doc.id,
        { id: 'usr-prod', nome: sigProdutor.nome, email: sigProdutor.email },
        { signatarioId: sigProdutor.id },
      );
      expect(resProd.sucesso).toBe(true);
      expect(resProd.documentoConcluido).toBe(false);
      expect(doc.situacao).toBe('PARCIALMENTE_ASSINADO');

      // Agora Financeiro Disk assina por último e conclui o documento
      const resFin = await assinaturasService.realizarAssinatura(
        tenantId,
        doc.id,
        { id: 'usr-fin', nome: sigFinanceiro.nome, email: sigFinanceiro.email },
        { signatarioId: sigFinanceiro.id },
      );
      expect(resFin.sucesso).toBe(true);
      expect(resFin.documentoConcluido).toBe(true);
      expect(doc.situacao).toBe('ASSINADO');
      expect(doc.hashFinal).toBeDefined();

      // Emissão do Certificado de Conclusão
      const cert = await assinaturasService.obterCertificadoConclusao(tenantId, doc.id);
      expect(cert.certificadoHash).toBeDefined();
      expect(cert.certificadoTexto).toContain('CERTIFICADO DE CONCLUSÃO DE ASSINATURA ELETRÔNICA');
      expect(cert.certificadoTexto).toContain('Carlos Produtor');
      expect(cert.certificadoTexto).toContain('Ana Financeiro Disk');
    });
  });

  describe('3. Contratos, Aditivos e Divergências com o Core', () => {
    it('deve criar contrato com condições comerciais estruturadas e detectar divergência com regra operacional', async () => {
      const { contrato } = await contratosService.criarContrato(tenantId, 'usr-comercial', {
        produtorId,
        produtorNome: 'Produtora Showbiz',
        vigenciaInicio: new Date().toISOString(),
        vigenciaFim: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        taxaDiskPercentual: 12.0, // 12%
        prazoRepasseDias: 7, // D+7
        antecipacaoPermitida: true,
        taxaAntecipacaoPercentual: 1.8,
      });

      expect(contrato.codigo).toMatch(/^CTR-\d{4}-\d{6}$/);

      // Validação sem divergência
      const checkSemDivergencia = await contratosService.validarDivergenciaComCore(tenantId, {
        produtorId,
        taxaOperacionalConfigurada: 12.0,
        prazoRepasseOperacionalConfigurado: 7,
      });
      expect(checkSemDivergencia.conforme).toBe(true);
      expect(checkSemDivergencia.divergencias).toHaveLength(0);

      // Validação com divergência: Core está usando taxa de 10% e D+5
      const checkComDivergencia = await contratosService.validarDivergenciaComCore(tenantId, {
        produtorId,
        taxaOperacionalConfigurada: 10.0,
        prazoRepasseOperacionalConfigurado: 5,
      });

      expect(checkComDivergencia.conforme).toBe(false);
      expect(checkComDivergencia.divergencias).toHaveLength(2);
      expect(checkComDivergencia.divergencias[0].campo).toBe('taxaDiskPercentual');
      expect(checkComDivergencia.divergencias[0].severidade).toBe('CRITICA');
      expect(outboxEvents.some((e) => e.eventName === 'documentos.contrato.divergencia_detectada.v1')).toBe(true);
    });

    it('deve registrar Aditivo sequencial e atualizar condição comercial vigente', async () => {
      const { contrato } = await contratosService.criarContrato(tenantId, 'usr-comercial', {
        produtorId,
        produtorNome: 'Produtora Showbiz',
        vigenciaInicio: new Date().toISOString(),
        vigenciaFim: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        taxaDiskPercentual: 12.0,
        prazoRepasseDias: 7,
        antecipacaoPermitida: true,
        taxaAntecipacaoPercentual: 1.8,
      });

      const { aditivo } = await contratosService.criarAditivo(tenantId, contrato.id, 'usr-comercial', {
        dataVigencia: new Date().toISOString(),
        taxaDiskPercentualNova: 14.0,
        prazoRepasseDiasNovo: 5,
        justificativa: 'Repactuação de taxa para turnê internacional.',
      });

      expect(aditivo.codigo).toMatch(/^ADT-\d{4}-\d{6}$/);
      expect(aditivo.numeroSequencial).toBe(1);

      // Torna o aditivo VIGENTE
      aditivo.status = 'VIGENTE';

      const historico = await contratosService.obterContratoComHistorico(tenantId, contrato.id);
      expect(historico.condicaoVigente.taxaDiskPercentual).toBe(14.0);
      expect(historico.condicaoVigente.prazoRepasseDias).toBe(5);
      expect(historico.condicaoVigente.origem).toContain('Aditivo 1');
    });
  });

  describe('4. Modelos e Interpolação Segura', () => {
    it('deve gerar documento a partir de modelo validando presença obrigatória dos campos do Core', async () => {
      await modelosService.criarModelo(tenantId, {
        codigo: 'MOD-REP-01',
        nome: 'Solicitação de Repasse Padrão',
        tipo: 'SOLICITACAO_REPASSE',
        conteudoTemplate: 'Eu, {{produtor.razao_social}}, CNPJ {{produtor.cnpj}}, solicito o repasse de {{financeiro.valor_repasse}} referente ao evento {{evento.nome}}.',
        camposObrigatorios: ['produtor.razao_social', 'produtor.cnpj', 'financeiro.valor_repasse', 'evento.nome'],
      });

      // Erro se faltar campo obrigatório do Core
      await expect(
        modelosService.gerarDocumento(tenantId, 'usr-operador', {
          modeloCodigo: 'MOD-REP-01',
          titulo: 'Repasse 1',
          origemDescricao: 'Solicitação',
          dadosCore: {
            'produtor.razao_social': 'Empresa Show Ltda',
            // faltando produtor.cnpj
          },
        }),
      ).rejects.toThrow(/Campos obrigatórios do Core ausentes/);

      // Sucesso com todos os campos presentes
      const resultado = await modelosService.gerarDocumento(tenantId, 'usr-operador', {
        modeloCodigo: 'MOD-REP-01',
        titulo: 'Repasse Festival 2026',
        origemDescricao: 'Solicitação via Core',
        dadosCore: {
          'produtor.razao_social': 'Empresa Show Ltda',
          'produtor.cnpj': '12.345.678/0001-90',
          'financeiro.valor_repasse': 'R$ 82.500,00',
          'evento.nome': 'Festival DiskIngressos Live 2026',
        },
      });

      expect(resultado.conteudoPreVisualizacao).toContain('Empresa Show Ltda');
      expect(resultado.conteudoPreVisualizacao).toContain('12.345.678/0001-90');
      expect(resultado.conteudoPreVisualizacao).toContain('R$ 82.500,00');
      expect(resultado.documento.metadados).toHaveProperty('geradoAutomaticamente', true);
    });
  });

  describe('5. Dossiê Operacional (17 Seções, Snapshot e Manifesto)', () => {
    it('deve organizar os itens nas 17 seções padronizadas do Dossiê do Evento', async () => {
      expect(SECOES_DOSSIE_EVENTO).toHaveLength(17);
      expect(SECOES_DOSSIE_EVENTO[0].nome).toBe('01. Cadastro');
      expect(SECOES_DOSSIE_EVENTO[10].nome).toBe('11. Borderôs');
      expect(SECOES_DOSSIE_EVENTO[16].nome).toBe('17. Fechamento');

      const dossie = await dossieService.obterOuCriarDossie(tenantId, {
        tipo: 'EVENTO' as any,
        referenciaId: eventoId,
        referenciaNome: 'Festival 2026',
      });

      expect(dossie.codigo).toMatch(/^DOS-\d{4}-\d{6}$/);

      // Adiciona item na Seção 2 (Contratos)
      await dossieService.adicionarItem(tenantId, dossie.id, {
        secao: 2,
        secaoNome: '02. Contratos',
        titulo: 'Contrato Assinado Produtor',
        tipoDocumento: 'CONTRATO',
        origemModulo: 'documentos',
        hashArquivo: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });

      // Adiciona item na Seção 11 (Borderôs)
      await dossieService.adicionarItem(tenantId, dossie.id, {
        secao: 11,
        secaoNome: '11. Borderôs',
        titulo: 'Borderô Analítico Consolidado',
        tipoDocumento: 'BORDERO',
        origemModulo: 'financeiro',
        hashArquivo: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      });

      const completo = await dossieService.obterDossieCompleto(tenantId, dossie.id);
      expect(completo.secoes[1].itens).toHaveLength(1);
      expect(completo.secoes[10].itens).toHaveLength(1);
      expect(completo.totalItens).toBe(2);

      // Fecha o Dossiê com snapshot imutável de fechamento
      const fechado = await dossieService.fecharDossie(tenantId, dossie.id, {
        snapshotFechamento: {
          vendasLiquidasCentavos: 125000000,
          totalIngressos: 5000,
          publicoValidadoPortaria: 4850,
          valorRepassesCentavos: 105000000,
          totalTaxasCentavos: 15000000,
          saldoRemanescenteCentavos: 5000000,
          dataEncerramentoUtc: new Date().toISOString(),
          auditadoPor: 'auditor.fechamento',
        },
      });

      expect(fechado.status).toBe('FECHADO');
      expect(fechado.manifestoHash).toBeDefined();
      expect(fechado.manifestoHash?.length).toBe(64);

      // Manifesto exportável
      const manifesto = await dossieService.gerarManifestoPacote(tenantId, dossie.id);
      expect(manifesto.totalArquivos).toBe(2);
      expect(manifesto.manifestoHash).toBe(fechado.manifestoHash);

      // Reabertura auditada
      const reaberto = await dossieService.reabrirDossie(tenantId, dossie.id, 'diretor.financeiro', {
        motivo: 'Ajuste de estorno de chargeback posterior.',
        aprovadoPor: 'Diretoria Executiva',
      });

      expect(reaberto.status).toBe('REABERTO');
      expect(reaberto.versaoFechamento).toBe(2);
      expect(outboxEvents.some((e) => e.eventName === 'documentos.dossie.reaberto.v1')).toBe(true);
    });
  });

  describe('6. Checklist Documental e Bloqueio Operacional', () => {
    it('deve bloquear repasses se houver documento obrigatório vencido ou pendente', async () => {
      await checklistService.atualizarChecklist(tenantId, {
        tipoEntidade: 'PRODUTOR',
        entidadeId: produtorId,
        entidadeNome: 'Produtora Beta',
        itens: [
          {
            id: '1',
            tipoDocumento: 'CONTRATO_SOCIAL',
            nome: 'Contrato Social',
            obrigatorio: true,
            status: 'CONFORME',
          },
          {
            id: '2',
            tipoDocumento: 'CARTAO_CNPJ',
            nome: 'Cartão CNPJ',
            obrigatorio: true,
            status: 'VENCIDO', // VENCIDO
          },
        ],
      });

      const bloqueio = await checklistService.verificarBloqueioOperacional(
        tenantId,
        produtorId,
        'PRODUTOR',
        'Repasse',
      );

      expect(bloqueio.bloqueado).toBe(true);
      expect(bloqueio.motivo).toContain('Cartão CNPJ');
      expect(bloqueio.motivo).toContain('vencido');
    });
  });

  describe('7. Porta Pública e Execução de Operações na Tesouraria', () => {
    it('deve autorizar operação apenas quando o documento correspondente estiver totalmente assinado', async () => {
      const repasseId = 'rep-teste-999';

      const doc = await documentosPublicService.gerarDocumentoRepasse(tenantId, 'usr-financeiro', {
        repasseId,
        produtorId,
        produtorNome: 'Produtora Alpha',
        eventoId,
        eventoNome: 'Festival 2026',
        valorCentavos: 8250000,
        chavePixOuConta: 'financeiro@alpha.com',
        dataPrevista: '2026-10-05',
        signatarioProdutorNome: 'Carlos Produtor',
        signatarioProdutorEmail: 'carlos@alpha.com',
        signatarioProdutorDocumento: '111.222.333-44',
        signatarioFinanceiroNome: 'Ana Disk',
        signatarioFinanceiroEmail: 'ana@diskingressos.com.br',
        signatarioFinanceiroDocumento: '555.666.777-88',
      });

      // Antes das assinaturas, a Tesouraria NÃO pode executar
      const statusAntes = await documentosPublicService.verificarOperacaoPodeSerExecutada(
        tenantId,
        repasseId,
        'REPASSE',
      );
      expect(statusAntes.autorizada).toBe(false);
      expect(statusAntes.motivo).toContain('ainda não está totalmente assinado');

      // Simula assinatura concluída do documento
      doc.situacao = 'ASSINADO';

      // Agora a Tesouraria está autorizada a liquidar
      const statusDepois = await documentosPublicService.verificarOperacaoPodeSerExecutada(
        tenantId,
        repasseId,
        'REPASSE',
      );
      expect(statusDepois.autorizada).toBe(true);
    });
  });
});
