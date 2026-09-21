import { Module } from '@nestjs/common';
import { ComercialController } from './comercial.controller';
import { ComercialService } from './comercial.service';
import { ComercialPublicService } from './comercial.public-service';
import { ComercialConsumer } from './comercial.consumer';

@Module({
  controllers: [ComercialController],
  providers: [
    ComercialService,
    ComercialPublicService,
    ComercialConsumer,
  ],
  // Porta pública: outros módulos (Financeiro, Eventos) consomem exclusivamente ComercialPublicService
  exports: [ComercialPublicService],
})
export class ComercialModule {}
