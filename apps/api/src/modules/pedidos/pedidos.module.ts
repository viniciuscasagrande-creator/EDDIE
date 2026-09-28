import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { InventarioModule } from '../inventario/inventario.module';
import { PagamentosModule } from '../pagamentos/pagamentos.module';

@Module({
  imports: [InventarioModule, PagamentosModule],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
