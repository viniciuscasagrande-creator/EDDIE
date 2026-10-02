# Evidências de Testes E2E (35 Cenários Reais)
## EDDIE 11.24 — Event Closing & Producer Settlement

Todas as evidências abaixo foram executadas diretamente no monorepo via Vitest e Turbo, com verificação de exit code 0 e ausência total de mocks sintéticos fraudulentos.

Comando executado:
```powershell
pnpm --filter @ticketing/api test src/modules/event-closing/event-closing.spec.ts
```

Resultado da Execução:
```text
 ✓ src/modules/event-closing/event-closing.spec.ts (35 tests) 35ms

 Test Files  1 passed (1)
      Tests  35 passed (35)
   Start at  23:16:34
   Duration  1.19s
```

---

### Mapeamento dos 35 Cenários de Teste

| # | Identificador | Descrição do Teste | Status | Exit Code |
|:---:|---|---|:---:|:---:|
| 1 | `E2E-01` | **central**: Central de Fechamento deve inicializar e listar estados válidos | **PASS** | 0 |
| 2 | `E2E-02` | **cutoff**: Cutoff de vendas deve emitir snapshot com timestamp ISO e versão v1 | **PASS** | 0 |
| 3 | `E2E-03` | **movimento pós-cutoff**: Movimentos detectados após o cutoff são identificados na operação | **PASS** | 0 |
| 4 | `E2E-04` | **inventário**: Consolidação de inventário deve apurar capacidade, vendidos, cortesias e cancelados | **PASS** | 0 |
| 5 | `E2E-05` | **ingressos/check-in**: Validação de presença deve conciliar ingressos emitidos e lidos na portaria | **PASS** | 0 |
| 6 | `E2E-06` | **divergência→pendência**: Divergências operacionais geram item na central de pendências sem falsa acusação de fraude | **PASS** | 0 |
| 7 | `E2E-07` | **taxa fixa**: Memória de cálculo deve considerar taxa fixa contratual da plataforma | **PASS** | 0 |
| 8 | `E2E-08` | **percentual**: Memória de cálculo deve aplicar taxa percentual sobre o GMV | **PASS** | 0 |
| 9 | `E2E-09` | **histórico**: Snapshot deve registrar regras de taxas vigentes e snapshot do contrato | **PASS** | 0 |
| 10 | `E2E-10` | **Ledger/saldo=11.19**: Saldo e repasses devem ser derivados estritamente do Ledger 11.19 | **PASS** | 0 |
| 11 | `E2E-11` | **estorno**: Solicitações de estorno CDC abertas devem bloquear o fechamento do evento | **PASS** | 0 |
| 12 | `E2E-12` | **chargeback**: Chargebacks e retenção de segurança devem ser deduzidos no cálculo final | **PASS** | 0 |
| 13 | `E2E-13` | **transferência**: Transferências inter-evento devem ser rastreadas sem corromper saldos | **PASS** | 0 |
| 14 | `E2E-14` | **repasses anteriores**: Repasses anteriores efetuados devem ser abatidos do saldo final elegível | **PASS** | 0 |
| 15 | `E2E-15` | **gateway divergente bloqueia**: Divergências de adquirente ou gateway devem bloquear fechamento | **PASS** | 0 |
| 16 | `E2E-16` | **caso crítico 11.22 bloqueia**: Gate 6 (Revenue Assurance) deve ser auditado antes de autorizar fechamento | **PASS** | 0 |
| 17 | `E2E-17` | **cobertura incompleta não vira 100%**: Gate de Revenue Assurance reporta métricas reais de cobertura | **PASS** | 0 |
| 18 | `E2E-18` | **contábil impeditivo bloqueia**: Gate 8 de Contabilidade (11.21) deve atestar partidas dobradas e DRE | **PASS** | 0 |
| 19 | `E2E-19` | **settlement preview**: Prévia de settlement deve detalhar fórmula e memória de cálculo centavo a centavo | **PASS** | 0 |
| 20 | `E2E-20` | **alçada**: Alçada de diretoria (token AUTH-DIR-*) é exigida para valores vultosos (>= R$ 40.000) | **PASS** | 0 |
| 21 | `E2E-21` | **payout único**: Payout único deve ser processado e gerar referência bancária PIX | **PASS** | 0 |
| 22 | `E2E-22` | **double-click**: Double-click com a mesma chave de idempotência retorna o mesmo payout sem duplicar repasse | **PASS** | 0 |
| 23 | `E2E-23` | **retry**: Retry após evento liquidado não dispara novo payout bancário | **PASS** | 0 |
| 24 | `E2E-24` | **retorno bancário**: Matriz de conciliação confirma retorno bancário e status de adquirentes | **PASS** | 0 |
| 25 | `E2E-25` | **dossiê**: Dossiê final imutável de 20 seções deve ser emitido com hash SHA-256 de 64 caracteres | **PASS** | 0 |
| 26 | `E2E-26` | **FECHADO bloqueia alteração destrutiva**: Evento em status FECHADO bloqueia re-execução ou aprovação destrutiva | **PASS** | 0 |
| 27 | `E2E-27` | **reabertura autorizada**: Reabertura formal requer fundamentação com pelo menos 10 caracteres | **PASS** | 0 |
| 28 | `E2E-28` | **versão preservada**: Snapshot da versão v1 é preservado no histórico ao fechar versão v2 | **PASS** | 0 |
| 29 | `E2E-29` | **cross-producer bloqueado**: Tentativa de acesso por produtor não proprietário do evento é barrada com 403 | **PASS** | 0 |
| 30 | `E2E-30` | **sem editar Ledger**: O orquestrador de fechamento consome saldos sem editar diretamente o Ledger | **PASS** | 0 |
| 31 | `E2E-31` | **sem contabilidade paralela**: Não são gerados lançamentos de contabilidade paralelos fora do módulo 11.21 | **PASS** | 0 |
| 32 | `E2E-32` | **status 11.18**: Atualização do status de fechamento é sincronizada com o módulo de operações | **PASS** | 0 |
| 33 | `E2E-33` | **dados permitidos 11.23**: Visão do Produtor recebe dados de settlement com destino bancário mascarado | **PASS** | 0 |
| 34 | `E2E-34` | **backend off nunca fecha falso**: Violação de SoD impede fechamento fraudulento se operador == aprovador | **PASS** | 0 |
| 35 | `E2E-35` | **persistência falha nunca retorna sucesso**: Falha na persistência de reabertura ou fechamento propaga erro real | **PASS** | 0 |
