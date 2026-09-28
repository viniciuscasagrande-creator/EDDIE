import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import {
  ConfirmHoldDto,
  CreateHoldDto,
  HoldDetailDto,
  InitPoolDto,
  PoolStatusDto,
  ReleaseHoldDto,
} from './inventario.types';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post('holds')
  @HttpCode(HttpStatus.CREATED)
  async criarHold(@Body() dto: CreateHoldDto): Promise<HoldDetailDto> {
    return this.inventarioService.createHold(dto);
  }

  @Post('holds/:id/confirmar')
  @HttpCode(HttpStatus.OK)
  async confirmarHold(
    @Param('id') id: string,
    @Body() dto: ConfirmHoldDto,
  ): Promise<HoldDetailDto> {
    return this.inventarioService.confirmHold(id, dto);
  }

  @Post('holds/:id/liberar')
  @HttpCode(HttpStatus.OK)
  async liberarHold(
    @Param('id') id: string,
    @Body() dto?: ReleaseHoldDto,
  ): Promise<HoldDetailDto> {
    return this.inventarioService.releaseHold(id, dto);
  }

  @Get('holds/:id')
  async obterHold(@Param('id') id: string): Promise<HoldDetailDto> {
    return this.inventarioService.getHold(id);
  }

  @Post('holds/expirar')
  @HttpCode(HttpStatus.OK)
  async expirarHoldsVencidos(): Promise<{ expiradas: number; detalhes: string[] }> {
    return this.inventarioService.expireHolds();
  }

  @Get('pools')
  async listarPools(@Query('eventoId') eventoId?: string): Promise<PoolStatusDto[]> {
    return this.inventarioService.listPools(eventoId);
  }

  @Get('pools/:loteId')
  async obterDisponibilidade(
    @Param('loteId') loteId: string,
    @Query('setorId') setorId?: string,
  ): Promise<PoolStatusDto> {
    return this.inventarioService.getPoolAvailability(loteId, setorId);
  }

  @Post('pools/init')
  @HttpCode(HttpStatus.CREATED)
  async inicializarPool(@Body() dto: InitPoolDto): Promise<PoolStatusDto> {
    return this.inventarioService.initPool(dto);
  }
}
