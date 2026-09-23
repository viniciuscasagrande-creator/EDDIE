import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma.module';
import { OperacaoController } from './operacao.controller';
import { OperacaoService } from './operacao.service';

@Module({
  imports: [PrismaModule],
  controllers: [OperacaoController],
  providers: [OperacaoService],
  exports: [OperacaoService],
})
export class OperacaoModule {}
