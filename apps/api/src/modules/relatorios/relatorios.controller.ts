import { Controller, Get, Headers, Query } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}
  @Get('catalogo') catalogo(){ return this.service.catalogo(); }
  @Get('executivo') executivo(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.executivo(t,p,e)}
  @Get('eventos') eventos(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string){return this.service.eventos(t,p)}
  @Get('financeiro') financeiro(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.financeiro(t,p,e)}
  @Get('contabilidade') contabilidade(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.contabilidade(t,p,e)}
  @Get('comercial') comercial(@Headers('x-tenant-id') t?:string){return this.service.comercial(t)}
  @Get('marketing') marketing(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.marketing(t,p,e)}
  @Get('sac') sac(@Headers('x-tenant-id') t?:string,@Query('eventoId') e?:string){return this.service.sac(t,e)}
  @Get('suporte') suporte(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.suporte(t,p,e)}
  @Get('estornos') estornos(@Headers('x-tenant-id') t?:string){return this.service.estornos(t)}
}
