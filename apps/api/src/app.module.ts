import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './shared/prisma.module';
import { BusModule } from './shared/bus/bus.module';
import { OutboxModule } from './shared/outbox/outbox.module';

import { EventosModule } from './modules/eventos/eventos.module';
import { EstornoModule } from './modules/estorno/estorno.module';

/**
 * MODULITH. Cada módulo abaixo é um bounded context isolado.
 * Ao adicionar um módulo novo, registre-o aqui e crie o GEMINI.md dele.
 *
 * Roadmap de módulos ainda não implementados:
 *   inventario, pagamentos, acesso, crm, financeiro,
 *   contabilidade, marketing, remarketing, sac, developer
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    BusModule,
    OutboxModule,

    EventosModule,
    EstornoModule,
  ],
})
export class AppModule {}
