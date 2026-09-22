# EDDIE 11.0 — Contexto Global + Dashboards Operacionais + Dados Reais

Base oficial: EDDIE 10.9 HOMOLOGADO.

## Objetivo
Fechar a infraestrutura que alimenta Eventos, Marketing, Remarketing, Financeiro, Contabilidade e Relatórios sem criar dados fictícios nem registros paralelos.

## Correções centrais
- Proxy Next `/api/[...path]` normaliza `API_INTERNAL_URL` para o prefixo `/api`, igual ao endpoint de status.
- Timeout do proxy ampliado para 5 s.
- Contexto do produtor pode ser resolvido server-side por `/api/context`, evitando depender exclusivamente de variável `NEXT_PUBLIC_*` compilada no bundle.
- `PRODUTOR_ID` e `TENANT_ID` passam a ser as variáveis recomendadas para o contexto server-side.
- Seletor global encerra loading em erro, timeout ou lista vazia e exibe mensagem operacional.
- Seleção do evento continua persistida no navegador e é reutilizada por Marketing, Remarketing, Financeiro e Contabilidade.
- `/api/status` passa a informar também se o contexto do produtor está configurado.

## Dashboards preservados
O 11.0 NÃO remove os dashboards executivos do 10.9:
- Marketing: campanhas, investimento, receita atribuída, conversões, cliques, ROAS, canais e atalhos.
- Remarketing: recuperação, conversões, canais/origens e atalhos de resgate.
- Financeiro: Ledger, saldo por evento, composição patrimonial e atalhos operacionais.
- Contabilidade: resultado por evento, receita própria, saldos por conta, conciliação e atalhos contábeis.

Todos os indicadores devem vir de APIs/Prisma/Ledger existentes. Sem fonte real, usar estado vazio/indisponível; nunca mockar KPI.

## Configuração Vercel
```
API_INTERNAL_URL=https://URL-REAL-DO-BACKEND
PRODUTOR_ID=UUID-REAL-DO-PRODUTOR
TENANT_ID=UUID-REAL-DO-TENANT
NEXT_PUBLIC_API_URL=/api
```
`NEXT_PUBLIC_PRODUTOR_ID` permanece compatível, mas `PRODUTOR_ID` é preferível para produção.

## Homologação obrigatória
1. `/api/status` deve responder backendConfigured=true, contextConfigured=true e backendReachable=true.
2. `/api/context` deve retornar o produtor configurado.
3. O cabeçalho deve sair de “Carregando eventos...” em até 7 segundos mesmo em falha.
4. Selecionar um evento e navegar Marketing → Remarketing → Financeiro → Contabilidade; o mesmo evento deve permanecer selecionado.
5. Validar dashboards com evento e sem evento.
6. Validar estados vazios sem números inventados.
7. Build: `pnpm --filter @ticketing/api build` e `pnpm --filter @ticketing/pdt build`.

## Regra de segurança
O 11.0 não cria endpoint que escolha “o primeiro produtor do banco”. O produtor deve vir do contexto/autenticação/configuração do ambiente. Isso evita vazamento multi-tenant.
