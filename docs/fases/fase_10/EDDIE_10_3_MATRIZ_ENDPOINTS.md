# Matriz de Endpoints EDDIE 10.3

Inventário extraído dos controllers NestJS do pacote.

## Comercial
- Controller base: `'comercial'`
- POST `'produtores'`
- GET `'produtores'`
- POST `'oportunidades'`
- PATCH `'oportunidades/:id/etapa'`
- POST `'condicoes'`
- PATCH `'condicoes/:id/aprovar'`
- GET `'condicoes/vigente'`
- POST `'atividades'`
- GET `'pipeline/resumo'`
- GET `'oportunidades'`
- GET `'atividades'`
- PATCH `'atividades/:id/concluir'`
- GET `'condicoes'`

## Contabilidade
- Controller base: `'contabilidade'`
- POST `'contas'`
- GET `'contas'`
- POST `'lancamentos'`
- POST `'fechamento'`
- POST `'reabertura'`
- POST `'conciliacao'`
- GET `'balancete'`
- GET `'dre'`
- GET `'dashboard'`
- GET `'centro-controle-eventos'`
- GET `'lancamentos'`
- GET `'conciliacoes'`

## Estorno
- Controller base: `'estornos'`
- GET `raiz`
- POST `'solicitar'`
- POST `'decidir'`
- GET `':id'`

## Eventos
- Controller base: `'eventos'`
- GET `'locais') listarLocais(@Headers('x-tenant-id') t?:string){return this.service.listarLocais(this.tenant(t)`
- GET `'produtor/:produtorId') listarPorProdutor(@Param('produtorId') p:string,@Headers('x-tenant-id') t?:string){return this.service.listarPorProdutor(this.tenant(t),p`
- GET `':id') buscar(@Param('id') id:string,@Headers('x-tenant-id') t?:string){return this.service.buscarDetalhado(this.tenant(t),id`
- POST `) criar(@Body() dto:CriarEventoDto,@Headers('x-tenant-id') t?:string,@Headers('x-user-id') u?:string){return this.service.criar(this.tenant(t),dto,this.ator(u)`
- PATCH `':id') @ApiOperation({summary:'Atualiza dados cadastrais do evento'}) atualizar(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarEvento(this.tenant(t),id,body`
- POST `':id/sessoes') adicionarSessao(@Param('id') id:string,@Body() dto:CriarSessaoDto,@Headers('x-tenant-id') t?:string){return this.service.adicionarSessao(this.tenant(t),id,dto`
- PATCH `'sessoes/:id') atualizarSessao(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarSessao(this.tenant(t),id,body`
- POST `'sessoes/:sessaoId/setores') adicionarSetor(@Param('sessaoId') id:string,@Body() dto:CriarSetorDto,@Headers('x-tenant-id') t?:string){return this.service.adicionarSetor(this.tenant(t),id,dto`
- PATCH `'setores/:id') atualizarSetor(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarSetor(this.tenant(t),id,body`
- POST `'sessoes/:sessaoId/lotes') adicionarLote(@Param('sessaoId') id:string,@Body() dto:CriarLoteDto,@Headers('x-tenant-id') t?:string){return this.service.adicionarLote(this.tenant(t),id,dto`
- PATCH `'lotes/:id') atualizarLote(@Param('id') id:string,@Body() body:any,@Headers('x-tenant-id') t?:string){return this.service.atualizarLote(this.tenant(t),id,body`
- POST `':id/publicar') publicar(@Param('id') id:string,@Headers('x-tenant-id') t?:string,@Headers('x-user-id') u?:string){return this.service.publicar(this.tenant(t),id,this.ator(u)`
- POST `':id/cancelar') cancelar(@Param('id') id:string,@Body() dto:CancelarEventoDto,@Headers('x-tenant-id') t?:string,@Headers('x-user-id') u?:string){return this.service.cancelar(this.tenant(t),id,dto,this.ator(u)`

## Financeiro
- Controller base: `'financeiro'`
- GET `'saldos/produtor/:produtorId'`
- GET `'saldos/produtor/:produtorId/eventos'`
- GET `'saldos/evento/:eventoId'`
- GET `'extrato/:produtorId'`
- POST `'transferencias'`
- POST `'repasses'`
- GET `'repasses/:produtorId'`
- POST `'antecipacoes/simular'`
- POST `'antecipacoes'`
- POST `'contas-pagar'`
- GET `'contas-pagar'`
- POST `'contas-pagar/:id/pagar'`
- GET `'readiness/:produtorId/:eventoId'`
- POST `'repasses/:id/aprovar'`
- POST `'repasses/:id/liquidar'`
- POST `'repasses/:id/cancelar'`
- GET `'antecipacoes/:produtorId'`
- POST `'antecipacoes/:id/aprovar'`
- GET `'conciliacao/divergencias'`
- POST `'conciliacao/divergencias/:id/resolver'`
- POST `'conciliacao/importar-extrato'`
- GET `'contas-financeiras'`

## Marketing
- Controller base: `'marketing'`
- GET `'campanhas/templates'`
- POST `'campanhas'`
- PATCH `'campanhas/:id/status'`
- GET `'campanhas'`
- POST `'pixels'`
- GET `'pixels'`
- POST `'links'`
- GET `'links'`
- POST `'cupons'`
- GET `'cupons/validar'`
- GET `'cupons'`
- GET `'kpis'`
- GET `'resumo/evento/:eventoId'`
- GET `'readiness/evento/:eventoId'`
- GET `'pixels/todos'`
- POST `'cupons/:id/toggle'`
- POST `'campanhas/ativar-template'`

## Relatorios
- Controller base: `'relatorios'`
- GET `'catalogo') catalogo(){ return this.service.catalogo(`
- GET `'executivo') executivo(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.executivo(t,p,e`
- GET `'eventos') eventos(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string){return this.service.eventos(t,p`
- GET `'financeiro') financeiro(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.financeiro(t,p,e`
- GET `'contabilidade') contabilidade(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.contabilidade(t,p,e`
- GET `'comercial') comercial(@Headers('x-tenant-id') t?:string){return this.service.comercial(t`
- GET `'marketing') marketing(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.marketing(t,p,e`
- GET `'sac') sac(@Headers('x-tenant-id') t?:string,@Query('eventoId') e?:string){return this.service.sac(t,e`
- GET `'suporte') suporte(@Headers('x-tenant-id') t?:string,@Query('produtorId') p?:string,@Query('eventoId') e?:string){return this.service.suporte(t,p,e`
- GET `'estornos') estornos(@Headers('x-tenant-id') t?:string){return this.service.estornos(t`

## Sac
- Controller base: `'sac'`
- GET `'chamados'`
- GET `['consulta', 'consultar']`
- GET `'chamados/:id'`
- POST `'chamados'`
- POST `'chamados/:id/mensagens'`
- PATCH `['chamados/:id', 'chamados/:id/status']`

## Suporte
- Controller base: `['suporte', 'suporte-eventos']`
- GET `'ocorrencias'`
- GET `'ocorrencias/:id'`
- POST `'ocorrencias'`
- PATCH `['ocorrencias/:id', 'ocorrencias/:id/status']`
