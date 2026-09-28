import { Module } from '@nestjs/common';
import { GovernancaService } from './governanca.service';
import { GovernancaPublicService } from './governanca.public-service';
import { GovernancaController } from './governanca.controller';

@Module({
  controllers: [GovernancaController],
  providers: [GovernancaService, GovernancaPublicService],
  exports: [GovernancaService, GovernancaPublicService],
})
export class GovernancaModule {}
