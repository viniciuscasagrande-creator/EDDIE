import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CatalogController } from './modules/catalog/catalog.controller';
import { CartController } from './modules/cart/cart.controller';
import { CheckoutController } from './modules/checkout/checkout.controller';
import { TicketsController } from './modules/tickets/tickets.controller';

@Module({
  imports: [
    // Rate limiting para proteção contra bots em on-sale e scraping
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requisições por minuto por IP por padrão
      },
    ]),
  ],
  controllers: [
    CatalogController,
    CartController,
    CheckoutController,
    TicketsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
