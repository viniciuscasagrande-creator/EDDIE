import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { TesourariaService } from './tesouraria.service';
import {
  GerarRemessaDto,
  ProcessarRetornoDto,
  ExecutarPixDto,
  CriarOrdemPagamentoDto,
  AvancarStatusOrdemDto,
  CriarLotePagamentoDto,
  AuditarMdrDto,
  ConciliacaoRegistroDto,
  TransferenciaBancariaDto,
  TransferenciaInternaLedgerDto,
  FechamentoTesourariaDto,
  CadastrarBeneficiarioDto,
  CenarioProjecaoCaixa,
} from './tesouraria.types';

@Controller('tesouraria')
export class TesourariaController {
  constructor(private readonly tesourariaService: TesourariaService) {}

  // ============================================================================
  //  Posição de Caixa & Segregação de Saldos
  // ============================================================================

  @Get('posicao')
  async getPosicaoConsolidada() {
    return this.tesourariaService.getPosicaoConsolidada();
  }

  @Get('posicao-segregada')
  async getPosicaoCaixaSegregada() {
    return this.tesourariaService.getPosicaoCaixaSegregada();
  }

  @Get('contas')
  async listarContas() {
    return this.tesourariaService.listarContas();
  }

  // ============================================================================
  //  Agenda Financeira & Simulação de Cenários
  // ============================================================================

  @Get('agenda')
  async getAgendaFinanceira(@Query('cenario') cenario?: CenarioProjecaoCaixa) {
    return this.tesourariaService.getAgendaFinanceiraProjetada(cenario || 'BASE');
  }

  // ============================================================================
  //  Recebíveis de Adquirentes & Auditoria de MDR
  // ============================================================================

  @Get('recebiveis')
  async listarRecebiveis(
    @Query('adquirente') adquirente?: string,
    @Query('status') status?: string,
    @Query('eventoId') eventoId?: string,
  ) {
    return this.tesourariaService.listarRecebiveisAdquirentes({ adquirente, status, eventoId });
  }

  @Post('recebiveis/auditar-mdr')
  async auditarMdr(@Body() dto: AuditarMdrDto) {
    return this.tesourariaService.auditarMdrRecebivel(dto);
  }

  // ============================================================================
  //  Contas a Pagar & Ordens de Pagamento
  // ============================================================================

  @Get('ordens')
  async listarOrdens(
    @Query('status') status?: string,
    @Query('tipo') tipo?: string,
    @Query('produtorId') produtorId?: string,
  ) {
    return this.tesourariaService.listarOrdensPagamento({ status, tipo, produtorId });
  }

  @Get('ordens/:id')
  async obterOrdemPorId(@Param('id') id: string) {
    return this.tesourariaService.obterOrdemPorId(id);
  }

  @Post('ordens')
  async criarOrdemPagamento(@Body() dto: CriarOrdemPagamentoDto) {
    return this.tesourariaService.criarOrdemPagamento(dto);
  }

  @Patch('ordens/:id/status')
  async avancarStatusOrdem(@Param('id') id: string, @Body() dto: AvancarStatusOrdemDto) {
    return this.tesourariaService.avancarStatusOrdem(id, dto);
  }

  // ============================================================================
  //  Lotes de Pagamento
  // ============================================================================

  @Get('lotes-pagamento')
  async listarLotesPagamento() {
    return this.tesourariaService.listarLotesPagamento();
  }

  @Post('lotes-pagamento')
  async criarLotePagamento(@Body() dto: CriarLotePagamentoDto) {
    return this.tesourariaService.criarLotePagamento(dto);
  }

  @Post('lotes-pagamento/:id/executar')
  async executarLotePagamento(@Param('id') id: string, @Body('executadoPor') executadoPor: string) {
    return this.tesourariaService.executarLotePagamento({ loteId: id, executadoPor: executadoPor || 'gestor-tesouraria' });
  }

  // ============================================================================
  //  PIX Instantâneo & Timeout Resiliente
  // ============================================================================

  @Get('pix/payouts')
  async listarPixPayouts() {
    return this.tesourariaService.listarPixPayouts();
  }

  @Post('pix/executar')
  async executarPixPayout(@Body() dados: ExecutarPixDto) {
    return this.tesourariaService.executarPixPayout(dados);
  }

  @Post('pix/executar-seguro')
  async executarPixSeguro(@Body() dados: ExecutarPixDto) {
    return this.tesourariaService.executarPixSeguro(dados);
  }

  // ============================================================================
  //  Conciliação Bancária em 3 Níveis
  // ============================================================================

  @Get('conciliacoes')
  async listarConciliacoes(
    @Query('contaBancariaId') contaBancariaId?: string,
    @Query('nivel') nivel?: string,
    @Query('status') status?: string,
  ) {
    return this.tesourariaService.listarConciliacoes({ contaBancariaId, nivel, status });
  }

  @Post('conciliacoes')
  async registrarConciliacao(@Body() dto: ConciliacaoRegistroDto) {
    return this.tesourariaService.registrarConciliacao(dto);
  }

  // ============================================================================
  //  Transferências
  // ============================================================================

  @Post('transferencias/bancaria')
  async executarTransferenciaBancaria(@Body() dto: TransferenciaBancariaDto) {
    return this.tesourariaService.executarTransferenciaBancaria(dto);
  }

  @Post('transferencias/interna-ledger')
  async executarTransferenciaInternaLedger(@Body() dto: TransferenciaInternaLedgerDto) {
    return this.tesourariaService.executarTransferenciaInternaLedger(dto);
  }

  // ============================================================================
  //  Rastreabilidade Ponta a Ponta ("Rastrear Pagamento")
  // ============================================================================

  @Get('rastreamento')
  async rastrearPagamento(@Query('termo') termo: string) {
    return this.tesourariaService.rastrearPagamento(termo || '');
  }

  // ============================================================================
  //  Fechamento de Caixa
  // ============================================================================

  @Post('fechamento')
  async executarFechamentoCaixa(@Body() dto: FechamentoTesourariaDto) {
    return this.tesourariaService.executarFechamentoCaixa(dto);
  }

  // ============================================================================
  //  Beneficiários & Quarentena
  // ============================================================================

  @Get('beneficiarios')
  async listarBeneficiarios() {
    return this.tesourariaService.listarBeneficiarios();
  }

  @Post('beneficiarios')
  async cadastrarBeneficiario(@Body() dto: CadastrarBeneficiarioDto) {
    return this.tesourariaService.cadastrarBeneficiario(dto);
  }

  // ============================================================================
  //  CNAB Legado
  // ============================================================================

  @Get('remessas')
  async listarLotesCnab() {
    return this.tesourariaService.listarLotesCnab();
  }

  @Get('remessas/:id')
  async obterLotePorId(@Param('id') id: string) {
    return this.tesourariaService.obterLotePorId(id);
  }

  @Post('remessas/gerar')
  async gerarRemessaCnab(@Body() dados: GerarRemessaDto) {
    return this.tesourariaService.gerarRemessaCnab(dados);
  }

  @Post('retornos/processar')
  async processarArquivoRetornoCnab(@Body() dados: ProcessarRetornoDto) {
    return this.tesourariaService.processarArquivoRetornoCnab(dados);
  }
}
