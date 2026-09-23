import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { CriarEventoDto, CriarSessaoDto, CriarSetorDto, CriarLoteDto, CancelarEventoDto } from './eventos.dto';
const DEFAULT_TENANT='00000000-0000-0000-0000-000000000001';
const DEFAULT_ATOR='00000000-0000-0000-0000-000000000002';
@ApiTags('eventos') @Controller('eventos')
export class EventosController {
  constructor(private readonly service: EventosService) {}
  private tenant(v?:string){return v||DEFAULT_TENANT} private ator(v?:string){return v||DEFAULT_ATOR}
  @Get('locais') listarLocais(@Headers('x-tenant-id') t?:string){return this.service.listarLocais(this.tenant(t))}
  @Get('produtor/:produtorId/contexto') resolverContexto(@Param('produtorId') p:string){return this.service.resolverContextoProdutor(p)}
  @Get('produtor/:produtorId') listarPorProdutor(@Param('produtorId') p:string,@Headers('x-tenant-id') t?:string){return this.service.listarPorProdutor(this.tenant(t),p)}
  @Get(':id/os-resumo') resumoEventOs(@Param('id') id:string,@Headers('x-tenant-id') t?:string){return this.service.resumoEventOs(this.tenant(t),id)}
  @Get(':id') buscar(@Param('id') id:string,@Headers('x-tenant-id') t?:string){return this.service.buscarDetalhado(this.tenant(t),id)}
  @Post() criar(@Body() dto:CriarEventoDto,@Headers('x-tenant-id') t?:string,@Headers('x-user-id') u?:string){return this.service.criar(this.tenant(t),dto,this.ator(u))}
  @Patch(':id') @ApiOperation({summary:'Atualiza dados cadastrais do evento'}) atualizar(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarEvento(this.tenant(t),id,body)}
  @Post(':id/sessoes') adicionarSessao(@Param('id') id:string,@Body() dto:CriarSessaoDto,@Headers('x-tenant-id') t?:string){return this.service.adicionarSessao(this.tenant(t),id,dto)}
  @Patch('sessoes/:id') atualizarSessao(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarSessao(this.tenant(t),id,body)}
  @Post('sessoes/:sessaoId/setores') adicionarSetor(@Param('sessaoId') id:string,@Body() dto:CriarSetorDto,@Headers('x-tenant-id') t?:string){return this.service.adicionarSetor(this.tenant(t),id,dto)}
  @Patch('setores/:id') atualizarSetor(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarSetor(this.tenant(t),id,body)}
  @Post('sessoes/:sessaoId/lotes') adicionarLote(@Param('sessaoId') id:string,@Body() dto:CriarLoteDto,@Headers('x-tenant-id') t?:string){return this.service.adicionarLote(this.tenant(t),id,dto)}
  @Patch('lotes/:id') atualizarLote(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarLote(this.tenant(t),id,body)}
  @Post(':id/publicar') publicar(@Param('id') id:string,@Headers('x-tenant-id') t?:string,@Headers('x-user-id') u?:string){return this.service.publicar(this.tenant(t),id,this.ator(u))}
  @Post(':id/cancelar') cancelar(@Param('id') id:string,@Body() dto:CancelarEventoDto,@Headers('x-tenant-id') t?:string,@Headers('x-user-id') u?:string){return this.service.cancelar(this.tenant(t),id,dto,this.ator(u))}
}
