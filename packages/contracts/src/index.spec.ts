import { describe, it, expect } from 'vitest';
import { EventCatalog } from './index.js';

describe('Contracts EventCatalog', () => {
  it('should have registered domain events', () => {
    expect(Object.keys(EventCatalog).length).toBeGreaterThan(0);
    expect(EventCatalog['evento.publicado.v1']).toBeDefined();
    expect(EventCatalog['financeiro.lancamento_ledger_criado.v1']).toBeDefined();
    expect(EventCatalog['marketing.campanha_criada.v1']).toBeDefined();
  });
});
