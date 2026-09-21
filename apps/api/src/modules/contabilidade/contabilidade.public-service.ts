import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.module';
import { ContabilidadeService } from './contabilidade.service';
import type { DashboardContabilDto, DreGerencialDto } from './contabilidade.dto';

export interface SaldoContaPublicDto {
  contaCodigo: string;
  contaNome: string;
  tipo: string;
  natureza: string;
  saldoCents: number;
}

const decimalToCents = (v: { toNumber(): number } | number): number =>
  Math.round((typeof v === 'number' ? v : v.toNumber()) * 100);

@Injectable()
export class ContabilidadePublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contabilidadeService: ContabilidadeService,
  ) {}

  /**
   * Consulta o saldo resultante de uma conta contábil em determinada competência.
   * Utilizado para conciliações com o Financeiro e conferência de obrigações com terceiros.
   */
  async consultarSaldoConta(
    tenantId: string,
    contaCodigo: string,
    competencia: string,
  ): Promise<SaldoContaPublicDto | null> {
    const conta = await this.prisma.contaContabil.findUnique({
      where: {
        tenantId_codigo: { tenantId, codigo: contaCodigo },
      },
    });

    if (!conta) return null;

    const partidas = await this.prisma.partidaContabil.findMany({
      where: {
        tenantId,
        contaId: conta.id,
        lancamento: { competencia, status: 'confirmado' },
      },
      select: { tipo: true, valor: true },
    });

    let saldoCents = 0;
    for (const p of partidas) {
      const val = decimalToCents(p.valor);
      if (conta.natureza === 'devedora') {
        saldoCents += p.tipo === 'D' ? val : -val;
      } else {
        saldoCents += p.tipo === 'C' ? val : -val;
      }
    }

    return {
      contaCodigo: conta.codigo,
      contaNome: conta.nome,
      tipo: conta.tipo,
      natureza: conta.natureza,
      saldoCents,
    };
  }

  /**
   * Verifica se uma competência contábil está aberta para lançamentos.
   */
  async verificarCompetenciaAberta(
    tenantId: string,
    competencia: string,
  ): Promise<boolean> {
    const fechamento = await this.prisma.fechamentoContabil.findUnique({
      where: { tenantId_competencia: { tenantId, competencia } },
    });

    return !fechamento || fechamento.status !== 'fechado';
  }

  /**
   * Retorna os números executivos da DRE gerencial para painéis da diretoria.
   */
  async obterDreExecutiva(
    tenantId: string,
    competencia: string,
  ): Promise<DreGerencialDto> {
    return this.contabilidadeService.obterDre(tenantId, competencia);
  }

  /**
   * Retorna os KPIs contábeis de fechamento para o NOC / Dashboard administrativo.
   */
  async obterKpisFechamento(
    tenantId: string,
    competencia: string,
  ): Promise<DashboardContabilDto> {
    return this.contabilidadeService.obterDashboard(tenantId, competencia);
  }
}
