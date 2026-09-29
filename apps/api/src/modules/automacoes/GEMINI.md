# automacoes — Contexto Local (EDDIE 11.32)

> Bounded context responsável pelo **Motor Central de Regras e Aprovações Operacionais**
> do ecossistema DiskIngressos PDT.
> Schema Postgres: `automacoes` | Dono: Tecnologia & Operações

## Responsabilidade

O módulo `automacoes` coordena regras de negócio e fluxos de aprovação entre múltiplos domínios
sem retirar o controle humano das decisões críticas (Human-in-the-Loop):

- **Motor de Regras (Rules Engine):** Avaliação de gatilhos transacionais (QUANDO),
  grupos de condições lógicas combinadas (E / OU) e execução de ações coordenadas (ENTÃO).
- **Versionamento Imutável:** Regras financeiras e operacionais versionadas (v1, v2) com rastreamento temporal.
- **Modo de Observação (Shadow Mode):** Teste de regras em produção com log de impacto sem acionar ações reais.
- **Simulação Prévia (Dry-Run):** Análise retrospectiva em 30/60/90 dias com impacto previsto de bloqueios e aprovações.
- **Proteção Anti-Loop:** Limite de profundidade, detecção de ciclos causais e idempotência de execução.
- **Interruptor de Emergência (Kill-Switch):** Pausa seletiva de regras por id, módulo, categoria ou global.
- **Motor Central de Aprovações:** Segregação de Funções estrita (SoD: solicitante não aprova própria solicitação),
  alçadas financeiras dinâmicas, duplo check executivo e delegação auditada.
- **Contexto Analítico Rico:** Enriquecimento com dados do Ledger, risco, divergências da 11.31 e portaria.
- **Fluxos Operacionais:** Modelos padronizados de Repasse, Antecipação, Estorno excepcional, Alteração bancária e Fechamento.
- **Filas de Trabalho:** Caixas operacionais por departamento (Financeiro, Comercial, Contabilidade, etc.).

## Regras Invioláveis do Módulo

1. **Nunca executar ação financeira direta sem registro prévio de auditoria e correlação causal.**
2. **Segregação de Funções Obrigatória (SoD):** Em operações que requerem aprovação, o solicitante
   nunca poderá aprovar a própria solicitação.
3. **Regras financeiras nunca são sobrescritas:** Edições geram uma nova versão (`VersaoRegra`)
   preservando o histórico para auditoria retroativa.
4. **Proteção Anti-Loop:** Se a profundidade de encadeamento de regras exceder 5 níveis,
   o motor interrompe a execução, abre um alerta crítico e notifica o administrador.
5. **Comunicação Cross-Domain:** Feita exclusivamente via eventos tipados no Outbox (`automacoes.*`)
   ou pela porta pública `AutomacoesPublicService`.

## Modelos Prisma (`automacoes`)

- `RegraAutomacao`
- `VersaoRegra`
- `ExecucaoAutomacao`
- `SolicitacaoAprovacao`
- `DecisaoAprovacao`
- `DelegacaoAprovacao`
- `DefinicaoFluxo`
- `FilaTrabalho`
