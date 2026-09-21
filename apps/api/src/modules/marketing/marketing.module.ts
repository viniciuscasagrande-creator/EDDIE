import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { MarketingPublicService } from './marketing.public-service';
import { MarketingConsumer } from './marketing.consumer';
import { EventosModule } from '../eventos/eventos.module';

@Module({
  imports: [EventosModule],
  controllers: [MarketingController],
  providers: [
    MarketingService,
    MarketingPublicService,
    MarketingConsumer,
  ],
  // Porta pública: outros módulos (ex: storefront BFF, inventário) consomem exclusivamente MarketingPublicService
  exports: [MarketingPublicService],
})
export class MarketingModule {}
