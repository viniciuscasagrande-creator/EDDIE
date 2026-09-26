# DiskIngressos PDT

**Painel do Produtor** — ERP + CRM interno da DiskIngressos. Monólito modular
event-driven, consumido pelo painel interno (`apps/pdt`) e, por um BFF
separado e somente leitura + checkout (`apps/api-storefront`), pelo site
público `newdawn.diskingressos.com.br` (`apps/storefront`). Os dois nascem
juntos; nunca compartilham acesso direto ao banco — ver `GEMINI.md`.

## Subir o ambiente

```bash
cp .env.example .env
corepack enable && pnpm install
pnpm infra:up          # postgres, redis, rabbitmq, clickhouse, grafana
pnpm db:migrate
pnpm dev
```

| Serviço | URL |
| --- | --- |
| API + Swagger | <http://localhost:3333/docs> |
| Frontend | <http://localhost:3000> |
| RabbitMQ (event bus) | <http://localhost:15672> — ticketing/ticketing |
| Grafana (telemetria) | <http://localhost:3001> |
| Mailpit | <http://localhost:8025> |

No VS Code: `Reopen in Container` usa o devcontainer já configurado com o
Gemini Code Assist instalado.

## Arquitetura em uma frase

Um deploy, N bounded contexts, um schema Postgres por módulo, comunicação
exclusivamente por eventos de domínio gravados via Transactional Outbox.

## Fluxo de um pedido

```text
Inventário   reserva.criada ──► Redis TTL 10min
Pagamentos   pedido.pago ──┬──► Financeiro     (AR + fluxo de caixa)
                           ├──► Contabilidade  (lançamento de competência)
                           ├──► Acesso         (emite QR assinado)
                           ├──► Eventos        (Lote.vendidos++)
                           ├──► CRM            (perfil, LTV)
                           └──► Marketing      (conversão, atribuição)

Estorno      pagamento.estornado ──┬──► Contabilidade (reversão)
                                   ├──► Acesso        (invalida QR)
                                   ├──► Eventos       (devolve inventário)
                                   └──► SAC           (fecha chamado)
```

## Módulos Implementados no Backend (`apps/api/src/modules/`)

| Módulo | Schema Postgres | Descrição |
|---|---|---|
| `eventos` | `eventos` | Catálogo de eventos, sessões, setores, lotes, precificação e produtores |
| `pedidos` | `pedidos` | Gestão de pedidos, emissão de ingressos e checkout |
| `portaria` | `platform` / `pedidos` | Controle de acesso, catracas, validação de ingressos e check-in |
| `comercial` | `crm` | CRM B2B de produtores, oportunidades, condições comerciais e metas |
| `financeiro` | `financeiro` | EDDIE 11.19/11.20: Ledger imutável, conta gráfica, repasses, split, conciliação e Control Tower |
| `contabilidade` | `contabilidade` | EDDIE 11.21: Plano de contas, lançamentos por partidas dobradas, balancete e DRE |
| `revenue-assurance` | `platform` / `financeiro` | EDDIE 11.22: Garantia de receita, matriz de integridade ponta a ponta e detecção de anomalias |
| `producer-portal` | `financeiro` / `platform` | EDDIE 11.23: Portal do Produtor, extratos, saldos, agenda de repasses e autoatendimento |
| `operacao` | `platform` / `eventos` | EDDIE 11.18: Command Center operacional, monitor de alertas, incidentes e SLA |
| `relatorios` | `financeiro` / `eventos` | Relatórios consolidados, DRE gerencial por evento e exportações analíticas |
| `estorno` | `estorno` | Máquina de estados de reembolso, CDC e chargeback |
| `marketing` | `marketing` | Campanhas, links UTM, conversões, tracking CAPI multi-pixel e jornadas |
| `sac` | `sac` | Chamados ITIL, SLA, fila de atendimento e inteligência artificial |
| `suporte` | `suporte` | Suporte operacional de campo e atendimento no evento |

## Módulos em Planejamento / Próximos Passos

1. `EDDIE 11.24 — Fechamento do Evento & Producer Settlement Final`
2. `inventario` — motor de reserva com TTL e locks distribuídos
3. `pagamentos` — integração direta multi-adquirente e split nativo

## Regras que não se negociam

Estão em `GEMINI.md`. Leia antes de escrever a primeira linha.

