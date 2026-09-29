import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.module';
import { AtualizarChecklistDto } from '../dtos/checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async obterOuInicializarChecklist(
    tenantId: string,
    tipoEntidade: 'PRODUTOR' | 'PARCEIRO' | 'EVENTO',
    entidadeId: string,
    entidadeNome: string,
  ) {
    const checklist = await this.prisma.checklistDocumental.findFirst({
      where: { tenantId, tipoEntidade, entidadeId },
    });

    if (checklist) return checklist;

    // Inicializa checklist padrão para a entidade
    const itensPadrao =
      tipoEntidade === 'PRODUTOR'
        ? [
            {
              id: 'item-contrato-social',
              tipoDocumento: 'CONTRATO_SOCIAL',
              nome: 'Contrato Social ou Estatuto Vigente',
              obrigatorio: true,
              status: 'CONFORME',
              dataVencimento: null,
            },
            {
              id: 'item-cnpj',
              tipoDocumento: 'CARTAO_CNPJ',
              nome: 'Comprovante de Inscrição e Situação Cadastral (CNPJ)',
              obrigatorio: true,
              status: 'CONFORME',
              dataVencimento: null,
            },
            {
              id: 'item-bancario',
              tipoDocumento: 'COMPROVANTE_BANCARIO',
              nome: 'Comprovante de Titularidade da Conta Bancária',
              obrigatorio: true,
              status: 'CONFORME',
              dataVencimento: null,
            },
            {
              id: 'item-representante',
              tipoDocumento: 'DOCUMENTO_REPRESENTANTE',
              nome: 'Documento com Foto do Representante Legal (RG/CNH)',
              obrigatorio: true,
              status: 'CONFORME',
              dataVencimento: null,
            },
          ]
        : [
            {
              id: 'item-alvara',
              tipoDocumento: 'ALVARA',
              nome: 'Alvará de Funcionamento / Bombeiros',
              obrigatorio: true,
              status: 'CONFORME',
              dataVencimento: null,
            },
            {
              id: 'item-locacao',
              tipoDocumento: 'CONTRATO_LOCACAO',
              nome: 'Contrato de Locação do Espaço',
              obrigatorio: false,
              status: 'CONFORME',
              dataVencimento: null,
            },
          ];

    return await this.prisma.checklistDocumental.create({
      data: {
        tenantId,
        tipoEntidade,
        entidadeId,
        entidadeNome,
        itens: itensPadrao as any,
        bloqueioAtivo: false,
      },
    });
  }

  async atualizarChecklist(tenantId: string, dto: AtualizarChecklistDto) {
    // Avalia se há algum item obrigatório pendente ou vencido
    const itemInvalido = dto.itens.find(
      (item) => item.obrigatorio && (item.status === 'PENDENTE' || item.status === 'VENCIDO'),
    );

    const bloqueioAtivo = !!itemInvalido;
    const motivoBloqueio = itemInvalido
      ? `Operação indisponível porque o documento obrigatório "${itemInvalido.nome}" está ${itemInvalido.status.toLowerCase()}.`
      : null;

    const existente = await this.prisma.checklistDocumental.findFirst({
      where: {
        tenantId,
        tipoEntidade: dto.tipoEntidade,
        entidadeId: dto.entidadeId,
      },
    });

    if (existente) {
      return await this.prisma.checklistDocumental.update({
        where: { id: existente.id },
        data: {
          entidadeNome: dto.entidadeNome,
          itens: dto.itens as any,
          bloqueioAtivo,
          motivoBloqueio,
          atualizadoEm: new Date(),
        },
      });
    }

    return await this.prisma.checklistDocumental.create({
      data: {
        tenantId,
        tipoEntidade: dto.tipoEntidade,
        entidadeId: dto.entidadeId,
        entidadeNome: dto.entidadeNome,
        itens: dto.itens as any,
        bloqueioAtivo,
        motivoBloqueio,
      },
    });
  }

  async verificarBloqueioOperacional(
    tenantId: string,
    entidadeId: string,
    tipoEntidade: 'PRODUTOR' | 'PARCEIRO' | 'EVENTO',
    tipoOperacao: string,
  ): Promise<{ bloqueado: boolean; motivo?: string }> {
    const checklist = await this.prisma.checklistDocumental.findFirst({
      where: { tenantId, tipoEntidade, entidadeId },
    });

    if (!checklist) {
      return { bloqueado: false };
    }

    if (checklist.bloqueioAtivo) {
      return {
        bloqueado: true,
        motivo: checklist.motivoBloqueio || `Documentação obrigatória pendente para ${tipoOperacao}.`,
      };
    }

    return { bloqueado: false };
  }
}
