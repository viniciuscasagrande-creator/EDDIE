# EDDIE 9.0 — Consolidação Geral

## Objetivo
Consolidar o EDDIE como baseline operacional única, preservando sua arquitetura modular e o visual atual. SafeSaff/legados são referência funcional, nunca fonte de layout ou duplicação de domínio.

## Módulos consolidados
- Financeiro: Ledger, saldos por evento, transferências, repasses, antecipações, contas a pagar e readiness.
- Contabilidade: plano de contas, lançamentos, fechamento/reabertura, conciliação, balancete, DRE e dashboard.
- Eventos: eventos do produtor, sessões, lotes, publicação e cancelamento.
- Comercial B2B: produtores, oportunidades, pipeline, condições, atividades e metas.
- Marketing & Remarketing: campanhas, pixels, links/UTM, cupons, KPIs, resumo e readiness por evento.
- Estorno: listagem, consulta, solicitação, aprovação e negativa sobre o workflow já existente.
- Atendimento SAC: chamados persistentes, SLA básico e consulta operacional por CPF, telefone, pedido, nome ou protocolo.
- Suporte a Eventos: ocorrências persistentes por evento/produtor, prioridade, status e responsável.

## Integridade
Não foi criado segundo Ledger, cadastro paralelo de eventos, CRM de comprador dentro do Comercial, ou saldo financeiro duplicado. SAC e Suporte receberam schemas próprios porque eram bounded contexts ausentes.

## Banco
O datasource Prisma passa a incluir os schemas `sac` e `suporte`, com `ChamadoSac` e `OcorrenciaEvento`. Antes do deploy em ambiente existente, gerar e revisar a migration Prisma correspondente.

## Variáveis do PDT
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_PRODUTOR_ID
- NEXT_PUBLIC_TENANT_ID

## Homologação obrigatória
1. `pnpm install`
2. `pnpm --filter @ticketing/api prisma generate` (ou script equivalente do workspace)
3. gerar/aplicar migration dos schemas SAC/Suporte
4. build da API
5. build do PDT
6. testar navegação e operações com tenant/produtor/evento reais
7. deploy somente após smoke test
