import { describe, it, expect } from 'vitest';
import { formatBRL, formatNumber, formatPercent, cn } from '../../lib/utils';

describe('Super Dashboard UI Utilities & Types', () => {
  it('deve formatar moedas em BRL corretamente a partir de centavos', () => {
    expect(formatBRL(10000)).toContain('100,00');
    expect(formatBRL(4250080)).toContain('42.500,80');
    expect(formatBRL(0)).toContain('0,00');
  });

  it('deve formatar números com separador de milhar pt-BR', () => {
    expect(formatNumber(1250)).toBe('1.250');
    expect(formatNumber(342)).toBe('342');
  });

  it('deve formatar percentuais com precisão decimal configurável', () => {
    expect(formatPercent(62.4, 1)).toBe('62.4%');
    expect(formatPercent(100, 0)).toBe('100%');
  });

  it('deve mesclar classes tailwind corretamente com cn', () => {
    const res = cn('bg-slate-900', 'p-4', 'bg-slate-800');
    expect(res).toBe('p-4 bg-slate-800');
  });
});
