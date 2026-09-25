import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma.module';
import { OperacaoController } from './operacao.controller';
import { OperacaoService } from './operacao.service';
import { CommandCenterController } from './command-center.controller';
import { CommandCenterService } from './command-center.service';

@Module({
  imports: [PrismaModule],
  controllers: [OperacaoController, CommandCenterController],
  providers: [OperacaoService, CommandCenterService],
  exports: [OperacaoService, CommandCenterService],
})
export class OperacaoModule {}
