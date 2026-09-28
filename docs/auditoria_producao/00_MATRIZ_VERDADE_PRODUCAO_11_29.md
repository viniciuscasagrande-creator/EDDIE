# EDDIE 11.29 — Auditoria de Verdade de Produção & Matriz Técnica de Persistência

> **Status:** Concluída em 28/09/2026  
> **Escopo:** Varredura profunda dos 21 módulos de backend (`apps/api`), 49 modelos Prisma, contratos Zod, Outbox e camadas de persistência.  
> **Objetivo:** Estabelecer a verdade de produção absoluta de cada módulo e traçar o plano de migração para persistência real e novos motores (`Inventário`, `Payments Core`, `Distribution Hub` e `Pós-Evento`).

---

## 1. Sumário Executivo

A auditoria confirmou a maturidade da arquitetura de **Monólito Modular Orientado a Eventos** do EDDIE, mas evidenciou uma bifurcação entre duas gerações de módulos:

1. **Geração 1 (Módulos Fundacionais — 100% Postgres / Prisma):**
   - `eventos`, `pedidos`, `portaria`, `financeiro` (Ledger imutável), `contabilidade` (partidas dobradas), `estorno` (máquina de estados CDC), `comercial` (CRM B2B), `marketing` (CAPI/pixels), `sac` (chamados ITIL) e `suporte`.
   - **49 modelos Prisma mapeados e persistidos no banco relacional**.

2. **Geração 2 (Módulos Avançados 11.24–11.28 — Camada de Negócio Rica, mas Estado em Memória):**
   - `tesouraria` (11.25), `event-closing` (11.24), `financial-risk` (11.27), `financial-planning` (11.28), `cash-forecast` (11.26), `revenue-assurance` (11.22), `producer-portal` (11.23) e `usuarios` (RBAC).
   - Possuem regras de negócio matemáticas e contratuais rigorosas, controllers, DTOs e suíte de testes passando, porém **o estado reside em `Map<string, ...>` ou arrays em memória, com seeds hardcoded no construtor dos services**.

---

## 2. Matriz de Auditoria 360º dos 21 Módulos

Classificação por camada:
- **`REAL`**: Modelo Prisma no banco, query relacional e transações atômicas.
- **`PARCIAL`**: Consulta tabelas existentes, mas agrega lógica com dados voláteis.
- **`MEMÓRIA`**: Estado mantido em coleções voláteis (`Map`, `Array`) no Service.
- **`HARDCODED`**: Valores monetários, bancos ou saldos simulados no código.
- **`SEM PERSISTÊNCIA`**: Entidade de negócio não possui tabela correspondente no `schema.prisma`.
- **`SEM INTEGRAÇÃO`**: Opera internamente sem conector direto (Adquirente, SPI Banco Central, etc.).
- **`PRONTO PRODUÇÃO`**: Cumpre Ledger imutável, Outbox, idempotência e persistência ACID.

| Módulo | Schema Postgres | Modelos Prisma Atuais | Estado Atual | Classificação Primária | Gargalo para Produção Real |
|---|---|---|---|---|---|
| **`eventos`** | `eventos` | `Evento`, `Sessao`, `Setor`, `Lote`, `Produtor`, `Local` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | `Lote.vendidos` é espelho; requer inventário desacoplado. |
| **`pedidos`** | `pedidos` | `PedidoVenda`, `ItemPedidoVenda`, `ReservaVenda`, `IngressoVenda`, `PagamentoVenda` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | Pagamentos embutidos no pedido; requer `payments` desacoplado. |
| **`portaria`** | `platform` / `pedidos` | `CheckinRegistro`, `DispositivoPortaria`, `AlertaAntifraude` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | Check-in seguro com QR assinado já grava no Postgres. |
| **`financeiro`** | `financeiro` | `LancamentoLedger`, `TransferenciaInterEvento`, `SolicitacaoRepasse`, `SolicitacaoAntecipacao`, `ContaPagar`, `DivergenciaConciliacao` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | Ledger de partidas dobradas e saldos 100% no banco. |
| **`contabilidade`** | `contabilidade` | `ContaContabil`, `LancamentoContabil`, `PartidaContabil`, `FechamentoContabil`, `ConciliacaoContabil` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | DRE, balancete e plano de contas 100% no banco. |
| **`estorno`** | `estorno` | `SolicitacaoEstorno`, `TransicaoEstorno`, `Chargeback` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | Máquina de estados CDC e chargeback 100% no banco. |
| **`comercial`** | `crm` | `ProdutorB2B`, `OportunidadeComercial`, `HistoricoEtapaPipeline`, `CondicaoComercial`, `AtividadeComercial`, `MetaComercial` | Prisma Postgres | **`REAL / PARCIAL`** | É CRM. Falta virar `Distribution Hub` transacional com cotas/vouchers. |
| **`marketing`** | `marketing` | `CampanhaMarketing`, `PixelTracking`, `CupomMarketing`, `UtmLink`, `ConversaoMarketing`, `AlertaMarketing` | Prisma Postgres | **`REAL / PARCIAL`** | Campanhas e links no banco; jornadas e tracking em memória. |
| **`sac`** | `sac` | `ChamadoSac`, `MensagemSac` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | Chamados ITIL e mensagens persistem no banco. |
| **`suporte`** | `suporte` | `OcorrenciaEvento` | Prisma Postgres | **`REAL / PRONTO PRODUÇÃO`** | Ocorrências de campo e auditoria no banco. |
| **`operacao`** | `platform` | `AuditLog`, `FeatureFlag`, `ProcessedEvent` | Prisma Postgres | **`PARCIAL / MEMÓRIA`** | Command Center mantém snapshots e streams SSE em memória. |
| **`relatorios`** | `financeiro` / `eventos` | Consome Prisma de outros módulos | Prisma Postgres | **`REAL / PARCIAL`** | Consultas agregadas diretas; falta read model no ClickHouse. |
| **`revenue-assurance`** (11.22) | `platform` / `financeiro` | Consulta `LancamentoLedger` e `PedidoVenda` | Híbrido | **`PARCIAL / MEMÓRIA`** | Regras de integridade em memória; falta persistência de casos. |
| **`producer-portal`** (11.23) | `financeiro` / `platform` | Consulta `Produtor` e `LancamentoLedger` | Híbrido | **`PARCIAL / MEMÓRIA`** | Solicitações e contas bancárias em `Map<string, ...>`. |
| **`usuarios`** | `platform` / `financeiro` | Consulta `Tenant` e `Produtor` | Híbrido | **`MEMÓRIA / HARDCODED`** | Usuários cadastrados em `Map<string, UsuarioDto>` com seed. |
| **`dashboard`** | `platform` | BFF agregador (chama Prisma e services) | Híbrido | **`REAL / PARCIAL`** | Agregador executivo resiliente com métricas consolidadas. |
| **`event-closing`** (11.24) | `eventos` / `financeiro` | NENHUM modelo específico no Prisma | Em Memória | **`MEMÓRIA / SEM PERSISTÊNCIA`** | `closingRecords: Map`, `executedPayouts: Map`, `reopeningLogs: Map`. |
| **`tesouraria`** (11.25) | `financeiro` / `platform` | NENHUM modelo específico no Prisma | Em Memória | **`MEMÓRIA / HARDCODED`** | `contas[]`, `lotesRemessa[]`, `pixPayouts[]`, seeds de R$ 5,45M. |
| **`cash-forecast`** (11.26) | `financeiro` / `platform` | NENHUM modelo específico no Prisma | Em Memória | **`MEMÓRIA / HARDCODED`** | `versionedAssumptions: Map`, simulações voláteis. |
| **`financial-risk`** (11.27) | `financeiro` / `platform` | NENHUM modelo específico no Prisma | Em Memória | **`MEMÓRIA / HARDCODED`** | `profiles: Map`, `circuitBreakers: Map`, `approvals: Map`. |
| **`financial-planning`** (11.28) | `financeiro` / `platform` | NENHUM modelo específico no Prisma | Em Memória | **`MEMÓRIA / HARDCODED`** | `costCenters: Map`, `variances: Map`, orçamentos voláteis. |

---

## 3. Os 22 Novos Modelos Prisma Necessários

Para eliminar os estados em memória e cumprir a regra **"Production Truth"**, o `schema.prisma` deve receber as seguintes tabelas nos schemas Postgres correspondentes:

### Schema `financeiro` (Tesouraria & Fechamento)
1. **`ContaBancaria`**: Contas correntes DiskIngressos e Produtores (Itaú, Bradesco, BB) com agência, conta, CNPJ, saldos em centavos (`saldoReal`, `saldoBloqueado`, `saldoDisponivel`).
2. **`MovimentoBancario`**: Extrato em partidas dobradas conectado a contas bancárias.
3. **`LoteRemessaCnab`**: Lotes CNAB 240/400 gerados para liquidação bancária.
4. **`ItemRemessaCnab`**: Itens individuais do lote com favorecido, PIX/TED e status bancário.
5. **`RetornoCnabProcessado`**: Arquivos de retorno importados com hash SHA-256 e conciliação.
6. **`PixPayoutExecutado`**: Liquidações PIX instantâneas com idempotency key e endToEndId.
7. **`ConciliacaoExtratoBancario`**: Batimento entre extrato bancário e partidas do Ledger.
8. **`FechamentoEvento`**: Ciclo definitivo de fechamento (Cutoff, Audit 10 Gates, Settlement, Dossiê).
9. **`GateFechamentoAuditoria`**: Status dos 10 gates por evento com checklist e auditor responsável.
10. **`SettlementEvento`**: Detalhamento financeiro da liquidação e termo de quitação irrevogável.
11. **`DossieEventoSnapshot`**: Dossiê imutável versionado com hash criptográfico SHA-256.

### Schema `financeiro` (Risco, FP&A & Cash Forecast)
12. **`PerfilRiscoProdutor`**: Score de crédito (0-1000), Rating (AAA a D), limite de crédito e exposição líquida.
13. **`TravaCircuitBreaker`**: Circuit breakers armados e acionados por produtor/evento com severidade e alçada.
14. **`SolicitacaoAprovacaoRisco`**: Workflow de aprovação de estouro de limite de risco.
15. **`CentroCustoOrcamento`**: Centros de custo (Operações, Tecnologia, Marketing, etc.) e limites anuais.
16. **`RubricaOrcamentaria`**: Rubricas com orçamento anual, empenhado, realizado e variância.
17. **`PremissaMacroForecast`**: Premissas versionadas (Selic, CDI, deságio, curva sellout).
18. **`ProjecaoFluxoCaixa`**: Séries temporais projetadas de fluxo de caixa em D+30, D+60, D+90.

### Schema `platform` (RBAC & Identidade)
19. **`UsuarioPlataforma`**: Usuários do sistema (DiskIngressos vs Produtor) com email, senha hash, MFA e papel.
20. **`UsuarioProdutorVinculo`**: Mapeamento seguro ABAC/RBAC (qual produtor o usuário pode operar).

### Schema `revenue_assurance` (Garantia de Receita)
21. **`CasoRevenueAssurance`**: Incidentes de fuga de receita e divergências operacionais.
22. **`ExecucaoIntegridade`**: Histórico das varreduras da matriz de integridade ponta a ponta.

---

## 4. Arquitetura dos Novos Motores de Negócio

### 4.1 Inventário Real (`inventario`)
Substitui o campo derivado `Lote.vendidos` por um motor de reserva concorrente:
```text
InventoryPool (Capacidade total por setor/evento)
   ├── InventoryAllocation (Cotas por canal)
   │     ├── Canal: Site DiskIngressos (60%)
   │     ├── Canal: Agência Turismo A (15%)
   │     ├── Canal: Bilheteria Local (15%)
   │     └── Canal: Cortesias / VIP (10%)
   └── InventoryHold (Reserva temporária no carrinho com TTL em Redis e Lock Distribuído)
```

### 4.2 Payments Core (`payments`)
Desacopla pagamentos de `pedidos`:
```text
PedidoVenda
   ↓
PaymentIntent (Idempotency Key + Valor + Split)
   ├── Processador: PIX Direto (Banco Central / PSP)
   ├── Processador: Cartão de Crédito (Adquirente + Antifraude)
   └── Webhook Listener Idempotente (confirmação ou recusa)
         ↓ Outbox
   pagamento.confirmado.v1 → Ledger + Ingressos + Contabilidade
```

### 4.3 Distribution Hub (`distribution`)
Evolui o CRM de agências para um canal transacional de vendas B2B:
```text
DistributionPartner (Agência / Operadora / Hotel)
   ├── API Key & Webhook Endpoint
   ├── Contrato & Cotas Autorizadas
   ├── Regra de Comissão Dinâmica (% ou R$ fixo por lote/setor)
   ├── Voucher com QR Code de Troca ou Acesso Direto
   └── Fechamento Quinzenal/Mensal de Comissão
```

### 4.4 Pós-Evento & Customer Event Graph
Transforma o **Check-in validado na catraca** no ativo mais valioso de retenção:
```text
IngressoVenda
   ↓
CheckinRegistro VÁLIDO (Presença Física Confirmada)
   ↓
Filtro de Consentimento LGPD
   ↓
Pesquisa Pós-Evento (NPS + Avaliação de Estrutura + Artistas)
   ↓
Customer Event Graph
   ├── Frequência real nos últimos 12 meses
   ├── Gêneros musicais com presença comprovada
   └── Taxa de No-Show (Comprou mas não foi)
   ↓
Campanha Hiper-Segmentada no WhatsApp/Email com Conversão Direta
```

---

## 5. Ordem de Execução do Pacote 11.29

```
[FASE 1] Production Truth 2:
   ├── 1.1 Atualização do schema.prisma (+22 modelos)
   ├── 1.2 Migração Postgres & Prisma Client Generate
   ├── 1.3 Refatoração do TesourariaService (Prisma real)
   ├── 1.4 Refatoração do EventClosingService (Prisma real)
   ├── 1.5 Refatoração do FinancialRiskService (Prisma real)
   ├── 1.6 Refatoração do FinancialPlanning & CashForecast (Prisma real)
   └── 1.7 Refatoração do UsuariosService (Prisma real)

[FASE 2] Inventário Real & Concorrência:
   ├── 2.1 Modelos InventoryPool, Allocation & Hold
   ├── 2.2 Redis Distributed Lock & TTL
   └── 2.3 Integração atômica no Checkout

[FASE 3] Payments Core:
   ├── 3.1 Bounded Context payments desacoplado
   └── 3.2 PaymentIntent, Webhook Handler & Split Automático

[FASE 4] Distribution Hub:
   ├── 4.1 Bounded Context distribution
   ├── 4.2 API Pública de Parceiros & Vouchers
   └── 4.3 Motor de Comissões e Repasse B2B

[FASE 5] Pós-Evento & Customer Graph:
   ├── 5.1 Motor de Extração de Público Validado (Check-in real)
   ├── 5.2 Pesquisas NPS e Consentimento LGPD
   └── 5.3 Customer Event Graph para Remarketing
```
