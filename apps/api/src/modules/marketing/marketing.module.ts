import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { AudiencesJourneysController } from './audiences-journeys.controller';
import { TrackingController } from './tracking.controller';
import { HealthTelemetryController } from './health-telemetry.controller';
import { MarketingService } from './marketing.service';
import { AudiencesJourneysService } from './audiences-journeys.service';
import { TrackingService } from './tracking.service';
import { HealthTelemetryService } from './health-telemetry.service';
import { MarketingPublicService } from './marketing.public-service';
import { MarketingConsumer } from './marketing.consumer';
import { MarketingVideoService } from './marketing-video.service';
import { EventosModule } from '../eventos/eventos.module';

@Module({
  imports: [EventosModule],
  controllers: [
    MarketingController,
    AudiencesJourneysController,
    TrackingController,
    HealthTelemetryController,
  ],
  providers: [
    MarketingService,
    AudiencesJourneysService,
    TrackingService,
    HealthTelemetryService,
    MarketingPublicService,
    MarketingConsumer,
    MarketingVideoService,
  ],
  // Porta pública: outros módulos (ex: storefront BFF, inventário) consomem exclusivamente MarketingPublicService
  exports: [
    MarketingPublicService,
    AudiencesJourneysService,
    TrackingService,
    HealthTelemetryService,
  ],
})
export class MarketingModule {}
