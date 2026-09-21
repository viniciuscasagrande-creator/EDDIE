# Módulo COMERCIAL (CRM B2B)

## Bounded context
Central de inteligência comercial, prospecção, pipeline de vendas e gestão de relacionamento com os **Produtores de Eventos (B2B)**.
Responsável pela carteira de produtores, funil de oportunidades (da prospecção ao fechamento), registro de atividades comerciais e negociação/aprovação de **Condições Comerciais (taxas de conveniência, taxas de processamento, prazos de repasse)**.

## Regra Arquitetural Inviolável: Cliente Comercial = Produtor B2B
O cliente deste módulo é **estritamente o Produtor/Organizador de Eventos (Pessoa Jurídica/B2B)**.
Compradores finais, participantes do evento, consulta a pedidos e atendimento individual a consumidores pertencem exclusivamente ao módulo **SAC / Atendimento**, mantendo a fronteira de domínio limpa e isolada.

## Entidades (Schema `crm`)
- `ProdutorB2B`: Cadastro corporativo, razão social, CNPJ, executivo responsável e status na carteira.
- `OportunidadeComercial`: Negócios no pipeline com valor estimado em centavos, probabilidade e data prevista de fechamento.
- `HistoricoEtapaPipeline`: Log de transição entre etapas do funil para auditoria comercial.
- `CondicaoComercial`: Tabela de taxas de conveniência, processamento e prazos acordados com vigência.
- `AtividadeComercial`: Reuniões, ligações, propostas e follow-ups realizados pelos executivos.
- `MetaComercial`: Metas periódicas por executivo comercial.

## Publica
- `comercial.produtor_cadastrado.v1`
- `comercial.oportunidade_criada.v1`
- `comercial.etapa_pipeline_alterada.v1`
- `comercial.condicao_comercial_aprovada.v1`
- `comercial.atividade_registrada.v1`

## Consome
- `evento.publicado.v1` -> Ativa produtor e avança oportunidades associadas no funil.

## Ao gerar código aqui
- Strict TypeScript sem `any`.
- Outros módulos (Financeiro, Eventos) consomem taxas exclusivamente via `ComercialPublicService`.
