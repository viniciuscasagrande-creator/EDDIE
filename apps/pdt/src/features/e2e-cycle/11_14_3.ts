export interface CheckInLogE2E {
  checkinId: string;
  ingressoId: string;
  qrCode: string;
  catracaId: string;
  operadorId: string;
  status: 'AUTORIZADO' | 'NEGADO_DUPLICADO' | 'NEGADO_CANCELADO' | 'NEGADO_INVALIDO';
  motivo?: string;
  timestamp: string;
  correlationId: string;
}

export class AccessControlE2E {
  private static scannedTickets = new Map<string, CheckInLogE2E>();

  static validateAccess(
    ingressoId: string,
    qrCode: string,
    catracaId: string,
    operadorId: string,
    ticketStatus: 'DISPONIVEL' | 'UTILIZADO' | 'CANCELADO',
    correlationId: string
  ): CheckInLogE2E {
    const timestamp = new Date().toISOString();
    const checkinId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Verifica se ingresso está cancelado/estornado
    if (ticketStatus === 'CANCELADO') {
      return {
        checkinId,
        ingressoId,
        qrCode,
        catracaId,
        operadorId,
        status: 'NEGADO_CANCELADO',
        motivo: 'Ingresso estornado ou cancelado pelo SAC/Produtor',
        timestamp,
        correlationId
      };
    }

    // 2. Anti-passback: verifica se já foi lido anteriormente
    const previous = this.scannedTickets.get(ingressoId);
    if (previous || ticketStatus === 'UTILIZADO') {
      return {
        checkinId,
        ingressoId,
        qrCode,
        catracaId,
        operadorId,
        status: 'NEGADO_DUPLICADO',
        motivo: `Tentativa duplicada (Anti-passback ativado). Lido anteriormente às ${previous?.timestamp || 'horário prévio'}`,
        timestamp,
        correlationId
      };
    }

    // 3. Validação bem-sucedida
    const log: CheckInLogE2E = {
      checkinId,
      ingressoId,
      qrCode,
      catracaId,
      operadorId,
      status: 'AUTORIZADO',
      timestamp,
      correlationId
    };

    this.scannedTickets.set(ingressoId, log);
    return log;
  }

  static getStats() {
    let authorized = 0;
    let duplicateAttempts = 0;
    for (const log of this.scannedTickets.values()) {
      if (log.status === 'AUTORIZADO') authorized++;
      if (log.status === 'NEGADO_DUPLICADO') duplicateAttempts++;
    }
    return {
      totalValidated: this.scannedTickets.size,
      authorized,
      duplicateAttempts
    };
  }

  static clear() {
    this.scannedTickets.clear();
  }
}

export const featureManifest = {
  phase: "11.14.3",
  title: "EDDIE 11.14.3 — Portaria, Check-in e Antifraude E2E",
  routes: [
    "/api/e2e/ciclo/checkin-simulado",
    "/api/e2e/ciclo/portaria/status"
  ],
  antiPassbackActive: true,
  zeroDuplicateEntry: true
} as const;
