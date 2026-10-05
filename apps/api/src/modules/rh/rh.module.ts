import { Module } from '@nestjs/common';
import { RHController } from './rh.controller';
import { RHService } from './rh.service';
import { RHPublicService } from './rh.public-service';

@Module({
  controllers: [RHController],
  providers: [RHService, RHPublicService],
  // Porta pública: outros módulos consomem exclusivamente RHPublicService
  exports: [RHPublicService, RHService],
})
export class RHModule {}
