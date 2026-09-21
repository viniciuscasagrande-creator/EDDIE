import { Module } from '@nestjs/common';
import { ContabilidadeController } from './contabilidade.controller';
import { ContabilidadeService } from './contabilidade.service';
import { ContabilidadePublicService } from './contabilidade.public-service';
import { ContabilidadeConsumer } from './contabilidade.consumer';

@Module({
  controllers: [ContabilidadeController],
  providers: [
    ContabilidadeService,
    ContabilidadePublicService,
    ContabilidadeConsumer,
  ],
  // Porta pública: outros módulos consomem exclusivamente ContabilidadePublicService
  exports: [ContabilidadePublicService],
})
export class ContabilidadeModule {}
