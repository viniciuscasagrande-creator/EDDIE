import { Module } from '@nestjs/common';
import { FiscalController } from './fiscal.controller';
import { FiscalService } from './fiscal.service';
import { FiscalPublicService } from './fiscal.public-service';

@Module({
  controllers: [FiscalController],
  providers: [FiscalService, FiscalPublicService],
  // Porta pública: outros módulos consomem exclusivamente FiscalPublicService
  exports: [FiscalPublicService, FiscalService],
})
export class FiscalModule {}
