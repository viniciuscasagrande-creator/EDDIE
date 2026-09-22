# EDDIE 11.1 — Correção Definitiva do Contexto + Operação Real

Base oficial: **EDDIE 11.0 HOMOLOGADO**.

## Objetivo
Fechar o caminho operacional Produtor → Tenant → Eventos → Evento selecionado → módulos, eliminando loading infinito e divergência de tenant no proxy.

## Alterações
- `/api/context` virou diagnóstico ativo: valida configuração, backend e consulta real dos eventos do produtor.
- Proxy Next `/api/[...path]` injeta `x-tenant-id` server-side quando `TENANT_ID` estiver configurado.
- Contexto global faz bootstrap único e evita ciclos de recarga quando o produtor é resolvido durante a inicialização.
- Timeout de contexto: 8 s, com erro explícito e botão de nova tentativa.
- Persistência do evento selecionado em `localStorage`, validada contra a lista real do produtor.
- Suporte a `EVENTO_ID`/`NEXT_PUBLIC_EVENTO_ID` como preferência inicial, sem sobrepor seleção válida do operador.
- `/diagnostico` mostra Produtor, Tenant, quantidade de eventos, evento ativo e mensagem/código do diagnóstico de contexto.
- Marketing, Remarketing, Financeiro, Contabilidade e Relatórios continuam consumindo o mesmo `ProducerEventContext`.

## Configuração de produção recomendada
```env
API_INTERNAL_URL=https://BACKEND-REAL
NEXT_PUBLIC_API_URL=/api
PRODUTOR_ID=UUID_REAL_DO_PRODUTOR
TENANT_ID=UUID_REAL_DO_TENANT
EVENTO_ID=
```

`NEXT_PUBLIC_PRODUTOR_ID` permanece apenas como fallback de compatibilidade. Preferir variáveis server-side.

## Critérios de homologação
1. `/api/status` responde sem loading infinito.
2. `/api/context` informa contexto validado ou erro acionável.
3. Header sai de “Carregando eventos...” em no máximo 8 s.
4. Eventos retornados pertencem ao produtor e tenant configurados.
5. Trocar evento no Header atualiza o contexto compartilhado.
6. Recarregar a página preserva evento válido.
7. Marketing, Remarketing, Financeiro, Contabilidade e Relatórios usam o mesmo `eventoId`.
8. Nenhum UUID fictício é usado em produção.
9. Nenhum KPI é inventado para mascarar ausência de dados.

## Observação de segurança
O 11.1 não escolhe automaticamente “o primeiro produtor” do banco. Isso evita vazamento entre tenants. A evolução correta é substituir as variáveis server-side por identidade proveniente da autenticação quando essa camada estiver disponível.
