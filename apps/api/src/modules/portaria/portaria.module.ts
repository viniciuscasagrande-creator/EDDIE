import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma.module';
import { PortariaController } from './portaria.controller';
import { PortariaService } from './portaria.service';

@Module({
  imports: [PrismaModule],
  controllers: [PortariaController],
  providers: [PortariaService],
  exports: [PortariaService],
})
export class PortariaModule {}
