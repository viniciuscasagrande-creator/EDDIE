import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './shared/prisma.module';
import { BusModule } from './shared/bus/bus.module';
import { OutboxModule } from './shared/outbox/outbox.module';

import { EventosModule } from './modules/eventos/eventos.module';
import { EstornoModule } from './modules/estorno/estorno.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { ComercialModule } from './modules/comercial/comercial.module';
import { ContabilidadeModule } from './modules/contabilidade/contabilidade.module';
import { SacModule } from './modules/sac/sac.module';
import { SuporteModule } from './modules/suporte/suporte.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';
import { HealthController } from './health.controller';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PortariaModule } from './modules/portaria/portaria.module';
import { OperacaoModule } from './modules/operacao/operacao.module';
import { RevenueAssuranceModule } from './modules/revenue-assurance/revenue-assurance.module';
import { ProducerPortalModule } from './modules/producer-portal/producer-portal.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EventClosingModule } from './modules/event-closing/event-closing.module';
import { CashForecastModule } from './modules/cash-forecast/cash-forecast.module';
import { FinancialRiskModule } from './modules/financial-risk/financial-risk.module';
import { FinancialPlanningModule } from './modules/financial-planning/financial-planning.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TesourariaModule } from './modules/tesouraria/tesouraria.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { PosEventoModule } from './modules/pos-evento/pos-evento.module';

import { validateApiEnv } from './shared/config/env.validation';

/**
 * MODULITH. Cada módulo abaixo é um bounded context isolado.
 * Ao adicionar um módulo novo, registre-o aqui e crie o GEMINI.md dele.
 */
@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateApiEnv }),
    ScheduleModule.forRoot(),
    PrismaModule,
    BusModule,
    OutboxModule,

    EventosModule,
    EstornoModule,
    FinanceiroModule,
    MarketingModule,
    ComercialModule,
    ContabilidadeModule,
    SacModule,
    SuporteModule,
    RelatoriosModule,
    PedidosModule,
    PortariaModule,
    OperacaoModule,
    RevenueAssuranceModule,
    ProducerPortalModule,
    DashboardModule,
    EventClosingModule,
    CashForecastModule,
    FinancialRiskModule,
    FinancialPlanningModule,
    UsuariosModule,
    TesourariaModule,
    InventarioModule,
    PagamentosModule,
    PosEventoModule,
  ],
})
export class AppModule {}
