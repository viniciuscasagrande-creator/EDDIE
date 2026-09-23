import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
@Controller('pedidos')
export class PedidosController {
 constructor(private readonly service:PedidosService){}
 @Post('reservas') reservar(@Headers('x-tenant-id') t:string,@Headers('x-produtor-id') p:string,@Body() b:any){return this.service.criarReserva(t,p,b)}
 @Post() criar(@Headers('x-tenant-id') t:string,@Headers('x-produtor-id') p:string,@Body() b:any){return this.service.criarPedido(t,p,b)}
 @Post(':id/pagamentos/confirmar') pagar(@Headers('x-tenant-id') t:string,@Param('id') id:string,@Body() b:any){return this.service.confirmarPagamento(t,id,b)}
 @Get('evento/:eventoId/consulta') consultar(@Headers('x-tenant-id') t:string,@Param('eventoId') e:string,@Query('q') q=''){return this.service.consultarEvento(t,e,q)}
}
