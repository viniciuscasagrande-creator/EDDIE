import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';
import { OutboxService } from '../../../shared/outbox/outbox.service';
import type { Prisma } from '@prisma/client';
import * as crypto from 'node:crypto';
import {
  CriarDossieDto,
  AdicionarItemDossieDto,
  FecharDossieDto,
  ReabrirDossieDto,
} from '../dtos/dossie.dto';
import {
  DossieSnapshotGeradoV1,
  DossieReabertoV1,
  TipoDossie,
} from '@ticketing/contracts';

export const SECOES_DOSSIE_EVENTO: Array<{ secao: number; nome: string }> = [
  { secao: 1, nome: '01. Cadastro' },
  { secao: 2, nome: '02. Contratos' },
  { secao: 3, nome: '03. Condições Comerciais' },
  { secao: 4, nome: '04. Documentação do Produtor' },
  { secao: 5, nome: '05. Inventário' },
  { secao: 6, nome: '06. Vendas' },
  { secao: 7, nome: '07. Pagamentos' },
  { secao: 8, nome: '08. Portaria' },
  { secao: 9, nome: '09. Financeiro' },
  { secao: 10, nome: '10. Repasses' },
  { secao: 11, nome: '11. Borderôs' },
  { secao: 12, nome: '12. Contabilidade' },
  { secao: 13, nome: '13. Marketing' },
  { secao: 14, nome: '14. Pós-Evento' },
  { secao: 15, nome: '15. Incidentes' },
  { secao: 16, nome: '16. Auditoria' },
  { secao: 17, nome: '17. Fechamento' },
];

@Injectable()
export class DossieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  private gerarCodigoDossie(): string {
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(100000 + Math.random() * 900000);
    return `DOS-${ano}-${sequencial}`;
  }

  async obterOuCriarDossie(tenantId: string, dto: CriarDossieDto) {
    const existente = await this.prisma.dossieOperacional.findFirst({
      where: {
        tenantId,
        tipo: dto.tipo,
        referenciaId: dto.referenciaId,
      },
    });

    if (existente) return existente;

    const codigo = this.gerarCodigoDossie();
    return await this.prisma.dossieOperacional.create({
      data: {
        tenantId,
        codigo,
        tipo: dto.tipo,
        referenciaId: dto.referenciaId,
        referenciaNome: dto.referenciaNome,
        status: 'EM_FORMACAO',
        versaoFechamento: 1,
      },
    });
  }

  async adicionarItem(tenantId: string, dossieId: string, dto: AdicionarItemDossieDto) {
    const dossie = await this.prisma.dossieOperacional.findFirst({
      where: { id: dossieId, tenantId },
    });
    if (!dossie) throw new NotFoundException('Dossiê não encontrado.');

    if (dossie.status === 'FECHADO') {
      throw new BadRequestException('Não é possível adicionar itens a um dossiê já concluído. Solicite a reabertura formal se necessário.');
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const item = await tx.itemDossie.create({
        data: {
          tenantId,
          dossieId: dossie.id,
          secao: dto.secao,
          secaoNome: dto.secaoNome,
          titulo: dto.titulo,
          tipoDocumento: dto.tipoDocumento,
          documentoId: dto.documentoId,
          origemModulo: dto.origemModulo,
          referenciaId: dto.referenciaId,
          hashArquivo: dto.hashArquivo,
          arquivoUrl: dto.arquivoUrl,
          metadados: (dto.metadados as any) || {},
        },
      });

      // Se for documento assinado, incrementa contagem
      const eAssinado = dto.tipoDocumento === 'CONTRATO' || dto.tipoDocumento === 'BORDERO' || dto.tipoDocumento === 'SOLICITACAO_REPASSE';
      await tx.dossieOperacional.update({
        where: { id: dossie.id },
        data: {
          totalArquivos: { increment: 1 },
          totalDocumentosAssinados: eAssinado ? { increment: 1 } : undefined,
        },
      });

      return item;
    });
  }

  async obterDossieCompleto(tenantId: string, dossieId: string) {
    const dossie = await this.prisma.dossieOperacional.findFirst({
      where: { id: dossieId, tenantId },
    });
    if (!dossie) throw new NotFoundException('Dossiê não encontrado.');

    const itens = await this.prisma.itemDossie.findMany({
      where: { dossieId: dossie.id, tenantId },
      orderBy: [{ secao: 'asc' }, { adicionadoEm: 'desc' }],
    });

    // Se for Dossiê do Evento, organiza os itens dentro das 17 seções
    const estruturaSecoes = SECOES_DOSSIE_EVENTO.map((s) => ({
      secao: s.secao,
      nome: s.nome,
      itens: itens.filter((i: any) => i.secao === s.secao),
    }));

    return {
      dossie,
      secoes: estruturaSecoes,
      totalItens: itens.length,
    };
  }

  async fecharDossie(tenantId: string, dossieId: string, dto: FecharDossieDto) {
    const dossie = await this.prisma.dossieOperacional.findFirst({
      where: { id: dossieId, tenantId },
    });
    if (!dossie) throw new NotFoundException('Dossiê não encontrado.');

    const itens = await this.prisma.itemDossie.findMany({
      where: { dossieId: dossie.id, tenantId },
      orderBy: { adicionadoEm: 'asc' },
    });

    // Calcula o Hash do Manifesto integrando todos os hashes dos itens + snapshot imutável
    const hashesItens = itens.map((i: any) => `${i.secao}:${i.hashArquivo}`).join('|');
    const snapshotStr = JSON.stringify(dto.snapshotFechamento);
    const manifestoHash = crypto
      .createHash('sha256')
      .update(dossie.codigo + '|' + hashesItens + '|' + snapshotStr)
      .digest('hex');

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const atualizado = await tx.dossieOperacional.update({
        where: { id: dossie.id },
        data: {
          status: 'FECHADO',
          snapshotFechamento: dto.snapshotFechamento as any,
          manifestoHash,
          concluidoEm: new Date(),
        },
      });

      // Publica evento de Snapshot Gerado no Outbox
      await this.outbox.emit(tx, {
        eventName: DossieSnapshotGeradoV1.name,
        source: 'dossie',
        tenantId,
        payload: {
          dossieId: atualizado.id,
          codigo: atualizado.codigo,
          tipo: atualizado.tipo as TipoDossie,
          referenciaId: atualizado.referenciaId,
          versaoFechamento: atualizado.versaoFechamento,
          manifestoHash,
          totalArquivos: itens.length,
          totalDocumentosAssinados: atualizado.totalDocumentosAssinados,
          geradoEm: new Date().toISOString(),
        },
      });

      return atualizado;
    });
  }

  async reabrirDossie(
    tenantId: string,
    dossieId: string,
    reabertoPor: string,
    dto: ReabrirDossieDto,
  ) {
    const dossie = await this.prisma.dossieOperacional.findFirst({
      where: { id: dossieId, tenantId },
    });
    if (!dossie) throw new NotFoundException('Dossiê não encontrado.');
    if (dossie.status !== 'FECHADO') {
      throw new BadRequestException('Apenas dossiês fechados podem ser reabertos.');
    }

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const novaVersao = dossie.versaoFechamento + 1;

      const atualizado = await tx.dossieOperacional.update({
        where: { id: dossie.id },
        data: {
          status: 'REABERTO',
          versaoFechamento: novaVersao,
          reabertoEm: new Date(),
          reabertoPor,
          motivoReabertura: dto.motivo,
        },
      });

      await this.outbox.emit(tx, {
        eventName: DossieReabertoV1.name,
        source: 'dossie',
        tenantId,
        payload: {
          dossieId: atualizado.id,
          codigo: atualizado.codigo,
          reabertoPor,
          motivo: dto.motivo,
          aprovadoPor: dto.aprovadoPor,
          reabertoEm: new Date().toISOString(),
        },
      });

      return atualizado;
    });
  }

  async gerarManifestoPacote(tenantId: string, dossieId: string) {
    const dossie = await this.prisma.dossieOperacional.findFirst({
      where: { id: dossieId, tenantId },
    });
    if (!dossie) throw new NotFoundException('Dossiê não encontrado.');

    const itens = await this.prisma.itemDossie.findMany({
      where: { dossieId: dossie.id, tenantId },
      orderBy: [{ secao: 'asc' }, { adicionadoEm: 'asc' }],
    });

    const itensManifesto = itens.map((item: any) => ({
      secao: item.secao,
      secaoNome: item.secaoNome,
      titulo: item.titulo,
      tipoDocumento: item.tipoDocumento,
      hashArquivo: item.hashArquivo,
      origem: item.origemModulo,
      adicionadoEm: item.adicionadoEm.toISOString(),
    }));

    return {
      codigoDossie: dossie.codigo,
      tipo: dossie.tipo,
      referencia: dossie.referenciaNome,
      status: dossie.status,
      versaoFechamento: dossie.versaoFechamento,
      totalArquivos: itens.length,
      totalDocumentosAssinados: dossie.totalDocumentosAssinados,
      manifestoHash: dossie.manifestoHash || 'DOSSIE_EM_ABERTO',
      snapshotFechamento: dossie.snapshotFechamento,
      itens: itensManifesto,
      concluidoEm: dossie.concluidoEm,
    };
  }
}
