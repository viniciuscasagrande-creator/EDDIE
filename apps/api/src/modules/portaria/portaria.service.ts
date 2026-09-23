import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../shared/prisma.module';

export type GateResult =
  | 'VALIDO'
  | 'JA_UTILIZADO'
  | 'CANCELADO'
  | 'ESTORNADO'
  | 'INVALIDO'
  | 'FORA_DA_SESSAO'
  | 'FORA_DA_JANELA'
  | 'BLOQUEADO_RISCO';

@Injectable()
export class PortariaService {
  constructor(private readonly prisma: PrismaService) {}
  private db() {
    return this.prisma as any;
  }

  /**
   * Validação atômica e consumo de ingresso na portaria.
   * Regra 11.9: O primeiro leitor a registrar consumo atômico valida o ingresso.
   * Tentativas concorrentes no mesmo milissegundo resultam em 'JA_UTILIZADO'
   * e disparam sinal explicável no antifraude.
   */
  async validarCheckin(
    tenantId: string,
    input: {
      eventoId: string;
      qrToken: string;
      operadorId: string;
      dispositivoId?: string;
      portaria?: string;
      sessaoId?: string;
    },
  ) {
    const { eventoId, qrToken, operadorId, dispositivoId, portaria = 'Portaria Principal' } = input;
    const tokenHash = createHash('sha256').update(qrToken).digest('hex');

    // Validar se dispositivo é autorizado
    if (dispositivoId) {
      const disp = await this.db().dispositivoPortaria.findFirst({
        where: { id: dispositivoId, tenantId, eventoId },
      });
      if (disp && disp.status === 'REVOGADO') {
        await this.criarAlertaAntifraude(tenantId, eventoId, {
          codigoSinal: 'DISPOSITIVO_REVOGADO',
          descricao: `Tentativa de leitura a partir de dispositivo revogado: ${disp.nome}`,
          severidade: 'ALTA',
          origem: 'DISPOSITIVO',
          detalhes: { dispositivoId, operadorId },
        });
        throw new BadRequestException('Dispositivo de leitura revogado ou não autorizado.');
      }
    }

    // Buscar ingresso por hash do QR ou pelo número legível
    const ingresso = await this.db().ingressoVenda.findFirst({
      where: {
        tenantId,
        OR: [{ qrTokenHash: tokenHash }, { numero: qrToken }],
      },
    });

    if (!ingresso) {
      await this.registrarCheckinLog(tenantId, eventoId, {
        ingressoId: '00000000-0000-0000-0000-000000000000',
        numeroIngresso: qrToken.slice(0, 16),
        operadorId,
        dispositivoId,
        portaria,
        resultado: 'INVALIDO',
        motivoRecusa: 'Código QR ou ingresso não localizado no sistema',
      });
      await this.criarAlertaAntifraude(tenantId, eventoId, {
        codigoSinal: 'QR_INEXISTENTE',
        descricao: `Tentativa de leitura de QR não cadastrado: ${qrToken.slice(0, 12)}...`,
        severidade: 'MEDIA',
        origem: 'CHECKIN',
        detalhes: { qrTokenPrefix: qrToken.slice(0, 16), portaria, operadorId },
      });
      return {
        resultado: 'INVALIDO' as GateResult,
        mensagem: 'Ingresso não localizado ou inválido.',
      };
    }

    // Verificar se ingresso pertence a este evento
    if (ingresso.eventoId !== eventoId) {
      await this.registrarCheckinLog(tenantId, eventoId, {
        ingressoId: ingresso.id,
        numeroIngresso: ingresso.numero,
        operadorId,
        dispositivoId,
        portaria,
        resultado: 'FORA_DA_SESSAO',
        motivoRecusa: `Ingresso pertence a outro evento (${ingresso.eventoId})`,
      });
      return {
        resultado: 'FORA_DA_SESSAO' as GateResult,
        mensagem: 'Ingresso emitido para outro evento.',
        numero: ingresso.numero,
      };
    }

    // Status cancelado ou estornado
    if (ingresso.status === 'CANCELADO') {
      await this.registrarCheckinLog(tenantId, eventoId, {
        ingressoId: ingresso.id,
        numeroIngresso: ingresso.numero,
        operadorId,
        dispositivoId,
        portaria,
        resultado: 'CANCELADO',
        motivoRecusa: 'Ingresso cancelado administrativamente',
      });
      return {
        resultado: 'CANCELADO' as GateResult,
        mensagem: 'Ingresso cancelado.',
        numero: ingresso.numero,
      };
    }

    if (ingresso.status === 'ESTORNADO') {
      await this.registrarCheckinLog(tenantId, eventoId, {
        ingressoId: ingresso.id,
        numeroIngresso: ingresso.numero,
        operadorId,
        dispositivoId,
        portaria,
        resultado: 'ESTORNADO',
        motivoRecusa: 'Ingresso estornado financeiramente',
      });
      await this.criarAlertaAntifraude(tenantId, eventoId, {
        ingressoId: ingresso.id,
        pedidoId: ingresso.pedidoId,
        codigoSinal: 'INGRESSO_ESTORNADO_APRESENTADO',
        descricao: `Tentativa de acesso com ingresso estornado: ${ingresso.numero}`,
        severidade: 'ALTA',
        origem: 'CHECKIN',
        detalhes: { ingressoId: ingresso.id, portaria, operadorId },
      });
      return {
        resultado: 'ESTORNADO' as GateResult,
        mensagem: 'Ingresso estornado. Entrada não permitida.',
        numero: ingresso.numero,
      };
    }

    // Já utilizado previamente
    if (ingresso.utilizadoEm) {
      await this.registrarCheckinLog(tenantId, eventoId, {
        ingressoId: ingresso.id,
        numeroIngresso: ingresso.numero,
        operadorId,
        dispositivoId,
        portaria,
        resultado: 'JA_UTILIZADO',
        motivoRecusa: `Ingresso utilizado em ${ingresso.utilizadoEm.toISOString()}`,
      });
      await this.criarAlertaAntifraude(tenantId, eventoId, {
        ingressoId: ingresso.id,
        pedidoId: ingresso.pedidoId,
        codigoSinal: 'QR_JA_UTILIZADO',
        descricao: `Tentativa de reuso de ingresso já validado: ${ingresso.numero}`,
        severidade: 'ALTA',
        origem: 'CHECKIN',
        detalhes: {
          ingressoId: ingresso.id,
          primeiroUsoEm: ingresso.utilizadoEm,
          portaria,
          operadorId,
        },
      });
      if (dispositivoId) {
        await this.db().dispositivoPortaria.update({
          where: { id: dispositivoId },
          data: { leiturasRecusadas: { increment: 1 }, ultimoHeartbeat: new Date() },
        }).catch(() => null);
      }
      return {
        resultado: 'JA_UTILIZADO' as GateResult,
        mensagem: `Ingresso já utilizado às ${ingresso.utilizadoEm.toLocaleTimeString('pt-BR')}.`,
        numero: ingresso.numero,
        utilizadoEm: ingresso.utilizadoEm,
      };
    }

    // CONSUMO ATÔMICO COM TRANSAÇÃO (Garante concorrência milimétrica)
    const agora = new Date();
    const updateResult = await this.db().ingressoVenda.updateMany({
      where: {
        id: ingresso.id,
        utilizadoEm: null,
        status: 'VALIDO',
      },
      data: {
        utilizadoEm: agora,
      },
    });

    if (updateResult.count === 0) {
      // Outro scanner consumiu exatamente no mesmo instante!
      await this.registrarCheckinLog(tenantId, eventoId, {
        ingressoId: ingresso.id,
        numeroIngresso: ingresso.numero,
        operadorId,
        dispositivoId,
        portaria,
        resultado: 'JA_UTILIZADO',
        motivoRecusa: 'Concorrência simultânea detectada. Entrada duplicada recusada.',
      });
      await this.criarAlertaAntifraude(tenantId, eventoId, {
        ingressoId: ingresso.id,
        pedidoId: ingresso.pedidoId,
        codigoSinal: 'CONCORRENCIA_LEITURA_SIMULTANEA',
        descricao: `Corrida de leitura simultânea no ingresso: ${ingresso.numero}`,
        severidade: 'CRITICA',
        origem: 'CHECKIN',
        detalhes: { ingressoId: ingresso.id, portaria, operadorId },
      });
      return {
        resultado: 'JA_UTILIZADO' as GateResult,
        mensagem: 'Ingresso acabou de ser validado em outro leitor.',
        numero: ingresso.numero,
      };
    }

    // Sucesso! Gravar log de sucesso e atualizar contador do leitor
    await this.registrarCheckinLog(tenantId, eventoId, {
      ingressoId: ingresso.id,
      numeroIngresso: ingresso.numero,
      operadorId,
      dispositivoId,
      portaria,
      resultado: 'VALIDO',
    });

    if (dispositivoId) {
      await this.db().dispositivoPortaria.update({
        where: { id: dispositivoId },
        data: { leiturasValidas: { increment: 1 }, ultimoHeartbeat: agora },
      }).catch(() => null);
    }

    return {
      resultado: 'VALIDO' as GateResult,
      mensagem: 'Entrada autorizada.',
      ingressoId: ingresso.id,
      numero: ingresso.numero,
      validadoEm: agora,
      portaria,
    };
  }

  async obterResumoPortaria(tenantId: string, eventoId: string) {
    const totalIngressos = await this.db().ingressoVenda.count({
      where: { tenantId, eventoId },
    });

    const checkinsValidos = await this.db().checkinRegistro.count({
      where: { tenantId, eventoId, resultado: 'VALIDO' },
    });

    const checkinsRecusados = await this.db().checkinRegistro.count({
      where: {
        tenantId,
        eventoId,
        resultado: { not: 'VALIDO' },
      },
    });

    const jaUtilizados = await this.db().ingressoVenda.count({
      where: { tenantId, eventoId, utilizadoEm: { not: null } },
    });

    const restantes = Math.max(0, totalIngressos - jaUtilizados);
    const ocupacaoPercentual = totalIngressos > 0
      ? Math.round((jaUtilizados / totalIngressos) * 100)
      : 0;

    // Ritmo de entrada no último quarto de hora
    const quinzeMinAtras = new Date(Date.now() - 15 * 60 * 1000);
    const entradasRecentes = await this.db().checkinRegistro.count({
      where: {
        tenantId,
        eventoId,
        resultado: 'VALIDO',
        timestamp: { gte: quinzeMinAtras },
      },
    });
    const ritmoPorMinuto = Math.round((entradasRecentes / 15) * 10) / 10;

    // Dispositivos conectados
    const cincoMinAtras = new Date(Date.now() - 5 * 60 * 1000);
    const scannersTotal = await this.db().dispositivoPortaria.count({
      where: { tenantId, eventoId, status: 'ATIVO' },
    });
    const scannersOnline = await this.db().dispositivoPortaria.count({
      where: {
        tenantId,
        eventoId,
        status: 'ATIVO',
        ultimoHeartbeat: { gte: cincoMinAtras },
      },
    });

    // Alertas em aberto
    const alertasAbertos = await this.db().alertaAntifraude.count({
      where: { tenantId, eventoId, status: 'ABERTO' },
    });

    return {
      eventoId,
      totalIngressos,
      checkinsValidos,
      checkinsRecusados,
      jaUtilizados,
      restantes,
      ocupacaoPercentual,
      ritmoPorMinuto,
      scannersTotal,
      scannersOnline,
      scannersOffline: Math.max(0, scannersTotal - scannersOnline),
      alertasAbertos,
      atualizadoEm: new Date(),
    };
  }

  async listarCheckins(tenantId: string, eventoId: string, limit = 50) {
    return this.db().checkinRegistro.findMany({
      where: { tenantId, eventoId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async listarDispositivos(tenantId: string, eventoId: string) {
    return this.db().dispositivoPortaria.findMany({
      where: { tenantId, eventoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cadastrarDispositivo(
    tenantId: string,
    eventoId: string,
    input: { nome: string; portaria?: string; identificador?: string },
  ) {
    const identificador = input.identificador || `SCAN-${randomUUID().slice(0, 8).toUpperCase()}`;
    const token = randomUUID();
    return this.db().dispositivoPortaria.create({
      data: {
        tenantId,
        eventoId,
        nome: input.nome,
        portaria: input.portaria || 'Portaria Principal',
        identificador,
        token,
        status: 'ATIVO',
      },
    });
  }

  async revogarDispositivo(tenantId: string, dispositivoId: string) {
    const disp = await this.db().dispositivoPortaria.findFirst({
      where: { id: dispositivoId, tenantId },
    });
    if (!disp) throw new NotFoundException('Dispositivo não encontrado');
    return this.db().dispositivoPortaria.update({
      where: { id: dispositivoId },
      data: { status: 'REVOGADO' },
    });
  }

  async heartbeatDispositivo(tenantId: string, dispositivoId: string) {
    const disp = await this.db().dispositivoPortaria.findFirst({
      where: { id: dispositivoId, tenantId },
    });
    if (!disp) throw new NotFoundException('Dispositivo não encontrado');
    return this.db().dispositivoPortaria.update({
      where: { id: dispositivoId },
      data: { ultimoHeartbeat: new Date() },
    });
  }

  async listarAlertasAntifraude(tenantId: string, eventoId: string) {
    return this.db().alertaAntifraude.findMany({
      where: { tenantId, eventoId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async revisarAlerta(
    tenantId: string,
    alertaId: string,
    input: { status: 'REVISADO' | 'BLOQUEADO' | 'PERMITIDO'; operadorId: string },
  ) {
    const alerta = await this.db().alertaAntifraude.findFirst({
      where: { id: alertaId, tenantId },
    });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');
    return this.db().alertaAntifraude.update({
      where: { id: alertaId },
      data: {
        status: input.status,
        resolvidoPor: input.operadorId,
        resolvidoEm: new Date(),
      },
    });
  }

  private async registrarCheckinLog(tenantId: string, eventoId: string, data: any) {
    return this.db().checkinRegistro.create({
      data: {
        tenantId,
        eventoId,
        ingressoId: data.ingressoId,
        numeroIngresso: data.numeroIngresso,
        operadorId: data.operadorId,
        dispositivoId: data.dispositivoId,
        portaria: data.portaria,
        resultado: data.resultado,
        motivoRecusa: data.motivoRecusa,
      },
    }).catch(() => null);
  }

  private async criarAlertaAntifraude(tenantId: string, eventoId: string, data: any) {
    return this.db().alertaAntifraude.create({
      data: {
        tenantId,
        eventoId,
        ingressoId: data.ingressoId,
        pedidoId: data.pedidoId,
        codigoSinal: data.codigoSinal,
        descricao: data.descricao,
        severidade: data.severidade || 'MEDIA',
        origem: data.origem || 'CHECKIN',
        detalhes: data.detalhes,
        status: 'ABERTO',
      },
    }).catch(() => null);
  }
}
