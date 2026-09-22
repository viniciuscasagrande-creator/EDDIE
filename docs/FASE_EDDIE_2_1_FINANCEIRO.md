# Fase EDDIE 2.1 — Implantação do Pacote Financeiro Completo

## Regra de implantação
O EDDIE permanece como arquitetura oficial. Esta fase não copia o Financeiro legado nem cria um segundo motor financeiro. A interface passa a expor, de forma operacional, os recursos que já existem no backend do EDDIE e reserva as próximas ativações apenas para recursos que possuam fonte de dados real.

## Implantado nesta fase
- Visão Financeira consolidada sem valores fictícios.
- Saldos reais por bucket do Ledger: disponível, bloqueado, reservado para estorno e retido.
- Extrato auditável consumindo o Ledger existente.
- Transferência entre eventos usando `POST /financeiro/transferencias`.
- Solicitação e histórico de repasses usando endpoints existentes.
- Simulação de antecipação usando o cálculo existente no backend.
- Consulta de contas a pagar por evento.
- Áreas de Conciliação e Relatórios preservadas sem inventar dados ou criar motores paralelos.
- Configuração por `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PRODUTOR_ID` e `NEXT_PUBLIC_EVENTO_ID`.

## Integridade preservada
Não foram alterados schema Prisma, Ledger, regras de partidas dobradas, módulos de Marketing, Comercial, Contabilidade ou Eventos. Não foram adicionadas bibliotecas ao projeto.

## Próximas ativações permitidas
1. Expor endpoints operacionais para `DivergenciaConciliacao` já existente no Prisma.
2. Completar CRUD/aprovação de contas a pagar usando o modelo existente.
3. Implementar relatórios derivados exclusivamente do Ledger e entidades existentes.
4. Substituir IDs por contexto autenticado de produtor/evento quando o guard/contexto oficial estiver disponível.

## Fora de escopo propositalmente
Plano de contas, compras, fornecedores, CNAB, contas a receber, centro de custos, DRE gerencial e motores adicionais não foram criados nesta fase porque exigiriam validação de uso real e/ou estruturas que não estão completas no EDDIE atual. A regra é não implantar funcionalidades apenas por existirem no sistema de referência.
