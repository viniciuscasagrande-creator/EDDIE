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

## O que já está implementado

- Infra do modulith: Outbox, EventBus (RabbitMQ + DLQ), idempotência, audit log
- Contratos de 21 eventos de domínio versionados em Zod
- Módulo **Eventos** completo (catálogo, sessões, setores, lotes, publicar, cancelar)
- Módulo **Estorno** (máquina de estados + política CDC + testes)
- Telemetria OpenTelemetry -> Tempo/Prometheus/Grafana

## Próximos módulos (nesta ordem)

1. `inventario` — reserva com TTL, carrinho, cupons
2. `pagamentos` — Pix, cartão, split, antifraude
3. `acesso` — QR assinado, check-in offline-first
4. `financeiro` — AR/AP, conciliação, repasse
5. `contabilidade` — plano de contas, NFS-e, SPED
6. `crm`, `sac`, `marketing`, `remarketing`, `developer`

Use `.gemini/prompts/novo-modulo.md` para gerar cada um.

## Regras que não se negociam

Estão em `GEMINI.md`. Leia antes de escrever a primeira linha.
