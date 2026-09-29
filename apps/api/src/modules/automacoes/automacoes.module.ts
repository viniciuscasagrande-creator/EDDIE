import { Module } from '@nestjs/common';
import { AutomacoesController } from './automacoes.controller';
import { AutomacoesService } from './automacoes.service';
import { AutomacoesPublicService } from './automacoes.public-service';
import { PrismaService } from '../../shared/prisma.module';

@Module({
  controllers: [AutomacoesController],
  providers: [AutomacoesService, AutomacoesPublicService, PrismaService],
  exports: [AutomacoesService, AutomacoesPublicService],
})
export class AutomacoesModule {}
