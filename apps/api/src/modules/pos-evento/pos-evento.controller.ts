import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { PosEventoService } from './pos-evento.service';
import {
  CriarSegmentoDto,
  CriarPesquisaDto,
  SubmeterRespostaPesquisaDto,
  SimularCampanhaDto,
  CriarCampanhaDto,
  FiltrosSegmentacaoDto,
  CanalComunicacao,
} from './pos-evento.types';

@Controller('pos-evento')
export class PosEventoController {
  constructor(private readonly posEventoService: PosEventoService) {}

  @Get('precos-comunicacao')
  async obterTabelaPrecos() {
    return this.posEventoService.obterTabelaPrecos();
  }

  @Get('modelos-pesquisa')
  obterModelosPesquisa() {
    return this.posEventoService.obterModelosPesquisa();
  }

  @Get('evento/:eventoId/resumo')
  async obterResumoOperacional(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.posEventoService.obterResumoOperacional(eventoId, tenantId);
  }

  @Get('evento/:eventoId/publico-validado')
  async obterPublicoValidado(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('sessaoNome') sessaoNome?: string,
    @Query('setorNome') setorNome?: string,
    @Query('loteNome') loteNome?: string,
    @Query('canalVenda') canalVenda?: string,
    @Query('parceiroId') parceiroId?: string,
    @Query('apenasElegiveis') apenasElegiveis?: string,
  ) {
    const filtros: FiltrosSegmentacaoDto = {
      sessaoNome,
      setorNome,
      loteNome,
      canalVenda,
      parceiroId,
      apenasElegiveisLgpd: apenasElegiveis === 'true',
    };
    return this.posEventoService.obterPublicoValidado(eventoId, tenantId, filtros);
  }

  @Get('evento/:eventoId/elegibilidade')
  async obterElegibilidadeLgpd(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.posEventoService.obterElegibilidadeLgpd(eventoId, tenantId);
  }

  @Post('evento/:eventoId/segmentos')
  async criarOuCalcularSegmento(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CriarSegmentoDto,
  ) {
    return this.posEventoService.criarOuCalcularSegmento(eventoId, tenantId, dto);
  }

  @Post('evento/:eventoId/pesquisas')
  async criarPesquisa(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CriarPesquisaDto,
  ) {
    return this.posEventoService.criarPesquisa(eventoId, tenantId, dto);
  }

  @Post('pesquisas/:pesquisaId/respostas')
  async submeterResposta(
    @Param('pesquisaId') pesquisaId: string,
    @Body() dto: SubmeterRespostaPesquisaDto,
  ) {
    return this.posEventoService.submeterResposta(pesquisaId, dto);
  }

  @Post('evento/:eventoId/campanhas/simular')
  async simularCampanha(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: SimularCampanhaDto,
  ) {
    return this.posEventoService.simularCampanha(eventoId, tenantId, dto);
  }

  @Post('evento/:eventoId/campanhas')
  async criarCampanha(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CriarCampanhaDto,
  ) {
    return this.posEventoService.criarCampanha(eventoId, tenantId, dto);
  }

  @Post('campanhas/:campanhaId/aprovar')
  async aprovarCampanha(
    @Param('campanhaId') campanhaId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-user-id') aprovadorId = 'gerente-marketing',
  ) {
    return this.posEventoService.aprovarCampanha(campanhaId, tenantId, aprovadorId);
  }

  @Post('campanhas/:campanhaId/disparar')
  async dispararCampanha(
    @Param('campanhaId') campanhaId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.posEventoService.dispararCampanha(campanhaId, tenantId);
  }

  @Get('campanhas/:campanhaId/resultados')
  async obterResultadosCampanha(
    @Param('campanhaId') campanhaId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.posEventoService.obterResultadosCampanha(campanhaId, tenantId);
  }

  @Get('publico/:perfilId/historico')
  async obterHistoricoPublico(
    @Param('perfilId') perfilId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('produtorId') produtorId?: string,
  ) {
    return this.posEventoService.obterHistoricoPublico(perfilId, tenantId, produtorId);
  }

  @Get('evento/:eventoId/parceiros-comparecimento')
  async obterComparecimentoPorParceiros(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.posEventoService.obterComparecimentoPorParceiros(eventoId, tenantId);
  }

  @Get('evento/:eventoId/dossie')
  async obterRelatorioExecutivoDossie(
    @Param('eventoId') eventoId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.posEventoService.obterRelatorioExecutivoDossie(eventoId, tenantId);
  }

  @Post('lgpd/bloqueio')
  async adicionarBloqueio(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() body: { identificador: string; tipo: string; canal: string; motivo: string },
  ) {
    return this.posEventoService.adicionarBloqueio({ ...body, tenantId });
  }

  @Post('lgpd/consentimento')
  async registrarConsentimento(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() body: { perfilId: string; finalidade: string; canal: CanalComunicacao; versaoTermo: string },
  ) {
    return this.posEventoService.registrarConsentimento({ ...body, tenantId });
  }
}
