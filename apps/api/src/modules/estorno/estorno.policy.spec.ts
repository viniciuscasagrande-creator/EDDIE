import { describe, it, expect } from 'vitest';
import { EstornoPolicy } from './estorno.policy';
import { podeTransicionar } from './estorno.state-machine';

const policy = new EstornoPolicy();
const base = {
  compradoEm: new Date(),
  eventoEm: new Date(Date.now() + 30 * 86_400_000),
  houveCheckin: false,
  valorSolicitadoCents: 10_000,
  taxaConvenienciaCents: 1_000,
};

describe('EstornoPolicy', () => {
  it('aprova arrependimento dentro dos 7 dias sem reter taxa', () => {
    const d = policy.avaliar({ ...base, motivo: 'arrependimento_cdc' });
    expect(d.aprovacaoAutomatica).toBe(true);
    expect(d.taxaRetidaCents).toBe(0);
  });

  it('retém taxa quando o arrependimento é fora do prazo', () => {
    const d = policy.avaliar({
      ...base,
      motivo: 'arrependimento_cdc',
      compradoEm: new Date(Date.now() - 20 * 86_400_000),
    });
    expect(d.aprovacaoAutomatica).toBe(false);
    expect(d.taxaRetidaCents).toBe(1_000);
  });

  it('nega automação quando o evento acontece em menos de 48h', () => {
    const d = policy.avaliar({
      ...base,
      motivo: 'arrependimento_cdc',
      eventoEm: new Date(Date.now() + 3_600_000),
    });
    expect(d.aprovacaoAutomatica).toBe(false);
  });

  it('devolve integral quando o evento é cancelado', () => {
    const d = policy.avaliar({ ...base, motivo: 'evento_cancelado' });
    expect(d.aprovacaoAutomatica).toBe(true);
    expect(d.taxaRetidaCents).toBe(0);
  });

  it('exige supervisor se houve check-in', () => {
    const d = policy.avaliar({ ...base, motivo: 'evento_cancelado', houveCheckin: true });
    expect(d.exigeSupervisor).toBe(true);
  });
});

describe('máquina de estados', () => {
  it('não permite pular da solicitação para concluído', () => {
    expect(podeTransicionar('solicitado', 'concluido')).toBe(false);
  });
  it('permite retry depois de falha', () => {
    expect(podeTransicionar('falhou', 'processando')).toBe(true);
  });
  it('estado final é terminal', () => {
    expect(podeTransicionar('concluido', 'processando')).toBe(false);
  });
});
