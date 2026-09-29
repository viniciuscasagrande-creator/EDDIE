export class ItemChecklistInput {
  id!: string;
  tipoDocumento!: string;
  nome!: string;
  obrigatorio!: boolean;
  status!: 'CONFORME' | 'PENDENTE' | 'VENCIDO';
  dataVencimento?: string;
  documentoId?: string;
}

export class AtualizarChecklistDto {
  tipoEntidade!: 'PRODUTOR' | 'PARCEIRO' | 'EVENTO';
  entidadeId!: string;
  entidadeNome!: string;
  itens!: ItemChecklistInput[];
}
