import { Module } from '@nestjs/common';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { InventarioPublicService } from './inventario.public-service';
import { OutboxModule } from '../../shared/outbox/outbox.module';

@Module({
  imports: [OutboxModule],
  controllers: [InventarioController],
  providers: [InventarioService, InventarioPublicService],
  exports: [InventarioService, InventarioPublicService],
})
export class InventarioModule {}
