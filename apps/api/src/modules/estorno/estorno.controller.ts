import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UsePipes,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { EstornoService } from './estorno.service';
import { EstornoPublicService } from './estorno.public-service';
import {
  SolicitarEstornoSchema,
  DecidirEstornoSchema,
  SolicitarEstornoInput,
  DecidirEstornoInput,
} from './estorno.dto';

class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados de entrada de estorno',
        errors: result.error.errors,
      });
    }
    return result.data;
  }
}

@Controller('estornos')
export class EstornoController {
  constructor(
    private readonly estornoService: EstornoService,
    private readonly estornoPublicService: EstornoPublicService,
  ) {}

  @Post('solicitar')
  @UsePipes(new ZodValidationPipe(SolicitarEstornoSchema))
  async solicitar(
    @Body() input: SolicitarEstornoInput,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.estornoService.solicitar(input, correlationId);
  }

  @Post('decidir')
  @UsePipes(new ZodValidationPipe(DecidirEstornoSchema))
  async decidir(
    @Body() input: DecidirEstornoInput,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.estornoService.decidir(input, correlationId);
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string) {
    return this.estornoPublicService.obterEstorno(id);
  }
}
