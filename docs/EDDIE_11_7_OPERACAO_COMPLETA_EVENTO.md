# EDDIE 11.7 — Operação Completa do Evento

## Objetivo
Consolidar o fluxo operacional do evento sem alterar a identidade visual aprovada do EDDIE.

## Escopo obrigatório
1. Consulta de Ingressos
2. Central de Relatórios do Evento
3. Detalhes e Configurações do Evento
4. Novo Evento
5. Produtor e Local
6. Sessões, Setores e Lotes
7. Cortesias

## Regras
- Contexto obrigatório por `eventoId`.
- Um produtor visualiza somente seus eventos.
- Pedido, ingresso, pagamento e evento mantêm identificadores independentes.
- Não gerar dados financeiros fictícios.
- Condição comercial/taxa Disk permanece individual por evento.
- Todas as telas visíveis em pt-BR.
- Preservar Financeiro, Contabilidade, Marketing, Remarketing e Relatórios existentes.

## Consulta de Ingressos
Busca unificada por número do ingresso, pedido, CPF/documento, nome, telefone e e-mail.
Resultado: ingresso, pedido, titular/comprador, modalidade, setor, lote, status, pagamento e check-in.
Ações devem respeitar permissões e trilha de auditoria.

## Relatórios do Evento
Painel com:
- Vendas por período
- Pedidos por período
- Ingressos emitidos
- Cortesias
- Ocupação
- Receita por modalidade
- Meios de pagamento
- Setores e lotes
- Cancelamentos/estornos
- Check-ins
- Financeiro do evento
Filtros por período, sessão, setor, lote, modalidade, canal e status. Exportação CSV/PDF quando suportada.

## Detalhes
Dados gerais, publicação, produtor, local, datas, capacidade, regras, condição comercial (somente leitura operacional quando não houver permissão comercial), integrações e auditoria.

## Novo Evento — fluxo
1. Dados básicos
2. Produtor
3. Local
4. Datas/Sessões
5. Setores/Capacidade
6. Lotes/Ingressos/Preços
7. Cortesias e regras
8. Condição comercial
9. Revisão
10. Publicação

## Produtor/Local
Reutilizar produtor existente; evitar duplicidade. Local possui nome, endereço, cidade/UF, capacidade e configuração de mapa quando aplicável.

## Sessões/Setores/Lotes
Sessões pertencem ao evento. Setores controlam capacidade. Lotes possuem vigência, quantidade, modalidade e preço. Disponibilidade nunca pode ficar negativa.

## Cortesias
Tipos configuráveis, quantidade, setor/assento, motivo, responsável, status, emissão e auditoria.

## Critérios de homologação
- Nenhuma tela branca.
- Nenhum loading infinito.
- Sidebar contextual preservada.
- Responsividade mínima desktop/tablet/mobile.
- Estados loading/vazio/erro/sucesso.
- `eventoId` propagado para todas as operações.
- Sem mocks apresentados como dados reais.
