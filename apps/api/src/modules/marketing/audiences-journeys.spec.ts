// apps/api/src/modules/marketing/audiences-journeys.spec.ts
// Testes unitários para Públicos, Segmentação AND/OR, Journey Builder e Automações (EDDIE 11.16.16)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudiencesJourneysService } from './audiences-journeys.service';

describe('AudiencesJourneysService (EDDIE 11.16.16)', () => {
  let service: AudiencesJourneysService;
  let mockPrisma: any;
  let mockOutbox: any;

  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const EVENTO_ID = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockPrisma = {};
    mockOutbox = {
      emit: vi.fn().mockResolvedValue('outbox-msg-1'),
    };
    service = new AudiencesJourneysService(mockPrisma, mockOutbox);
  });

  describe('Central de Públicos & Segmentação AND/OR', () => {
    it('deve listar públicos pré-configurados do evento', () => {
      const audiences = service.listarAudiences(TENANT_ID, EVENTO_ID);
      expect(audiences.length).toBeGreaterThan(0);
      expect(audiences[0]?.nome).toContain('Carrinho Abandonado');
    });

    it('deve criar um novo público com grupos de segmentação AND/OR', () => {
      const novo = service.criarAudience(TENANT_ID, EVENTO_ID, {
        nome: 'Compradores VIP Rock in Rio',
        tipo: 'DYNAMIC',
        origem: 'COMPRADORES_ANTERIORES',
        eventoId: EVENTO_ID,
        segmentacao: {
          conjuncaoPrincipal: 'AND',
          grupos: [
            {
              id: 'grp-test-1',
              conjuncao: 'OR',
              regras: [
                { id: 'r1', dimensao: 'quantidade_ingressos', operador: 'GREATER_THAN', valor: 2 },
                { id: 'r2', dimensao: 'ticket_medio_cents', operador: 'GREATER_THAN', valor: 40000 },
              ],
            },
          ],
        },
      });

      expect(novo.id).toBeDefined();
      expect(novo.status).toBe('ATIVO');
      expect(novo.statusCalculo).toBe('CALCULADO');
      expect(novo.provedoresSync?.length).toBeGreaterThan(0);
    });

    it('deve duplicar um público existente com sufixo (Cópia)', () => {
      const lista = service.listarAudiences(TENANT_ID, EVENTO_ID);
      const original = lista[0]!;
      const duplicado = service.duplicarAudience(TENANT_ID, EVENTO_ID, original.id);

      expect(duplicado.id).not.toBe(original.id);
      expect(duplicado.nome).toBe(`${original.nome} (Cópia)`);
    });

    it('deve recalcular tamanho de público dinâmico com contagem real', () => {
      const lista = service.listarAudiences(TENANT_ID, EVENTO_ID);
      const original = lista[0]!;
      const recalculado = service.recalcularAudience(TENANT_ID, EVENTO_ID, original.id);

      expect(recalculado.tamanhoCalculado).toBeGreaterThan(0);
      expect(recalculado.statusCalculo).toBe('CALCULADO');
    });

    it('deve gerar preview de segmentação retornando participantes elegíveis', () => {
      const preview = service.previewSegmento(TENANT_ID, EVENTO_ID, {
        grupos: [{ id: 'g1' }, { id: 'g2' }],
      });

      expect(preview.participantesElegiveis).toBeGreaterThan(0);
      expect(preview.amostraAnonimizada.length).toBeGreaterThan(0);
      // Garantir mascaramento LGPD
      expect(preview.amostraAnonimizada[0]).toContain('***');
    });
  });

  describe('Journey Builder Persistente & Automações', () => {
    it('deve validar um grafo conexo com trigger, action e exit', () => {
      const journeys = service.listarJourneys(TENANT_ID, EVENTO_ID);
      const jrn = journeys[0]!;
      const validacao = service.validarJourney(TENANT_ID, EVENTO_ID, jrn.id);

      expect(validacao.valido).toBe(true);
      expect(validacao.mensagem).toContain('Grafo conexo');
    });

    it('deve permitir ciclo de vida: pausar, retomar e encerrar jornada', () => {
      const journeys = service.listarJourneys(TENANT_ID, EVENTO_ID);
      const jrn = journeys[0]!;

      const pausada = service.pausarJourney(TENANT_ID, EVENTO_ID, jrn.id);
      expect(pausada.status).toBe('PAUSED');

      const retomada = service.retomarJourney(TENANT_ID, EVENTO_ID, jrn.id);
      expect(retomada.status).toBe('ACTIVE');

      const encerrada = service.encerrarJourney(TENANT_ID, EVENTO_ID, jrn.id);
      expect(encerrada.status).toBe('ENDED');
    });

    it('deve executar simulação de teste gerando correlationId e log com máscara LGPD', () => {
      const journeys = service.listarJourneys(TENANT_ID, EVENTO_ID);
      const jrn = journeys[0]!;

      const resultado = service.testarJourney(TENANT_ID, EVENTO_ID, jrn.id);
      expect(resultado.correlationId).toBeDefined();
      expect(resultado.status).toBe('TESTE_CONCLUIDO');

      const logs = service.obterJourneyLogs(TENANT_ID, EVENTO_ID, jrn.id);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]?.correlationId).toBe(resultado.correlationId);
      expect(logs[0]?.clienteAnonimizado).toContain('***');
    });

    it('deve fornecer relatório de recuperação de remarketing com funil completo', () => {
      const recovery = service.obterRemarketingRecovery(TENANT_ID, EVENTO_ID);
      expect(recovery.kpis.carrinhosAbandonados).toBeGreaterThan(0);
      expect(recovery.kpis.carrinhosRecuperados).toBeGreaterThan(0);
      expect(recovery.funil.length).toBe(5);
      expect(recovery.canais.length).toBeGreaterThanOrEqual(3);
    });
  });
});
