# Checklist Operacional & Financeiro de Fechamento de Evento
## EDDIE 11.24 — Event Closing & Settlement Protocol

Este checklist estabelece o procedimento passo a passo obrigatório para encerramento e liquidação de qualquer evento na plataforma DiskIngressos.

---

### Fase 1: Pré-Fechamento & Cutoff Operacional
- [x] **Encerramento de Vendas**: Todas as sessões e lotes encerrados no módulo `eventos`.
- [x] **Zero Carrinhos Ativos**: Validação de expiração de reservas no checkout/inventário.
- [x] **Snapshot de Corte**: Chamada a `POST /api/event-closings/:id/snapshot` registrando timestamp UTC e contadores de inventário (total, vendidos, cortesias, cancelados, disponíveis).
- [x] **Sincronização de Portaria**: Download e reconciliação dos logs de catraca (`ingressos lidos` vs `ingressos emitidos`).
- [x] **Tratamento de Inconsistências**: Qualquer divergência entre ingressos emitidos e leituras de catraca é registrada na Central de Pendências como item analítico, vedada a imputação sumária de fraude.

---

### Fase 2: Auditoria dos 11 Gates de Fechamento
- [x] **Gate 1 (Operacional)**: Sessões encerradas e zero ingressos disponíveis para venda.
- [x] **Gate 2 (Pagamentos)**: 100% das transações capturadas junto a adquirentes e sem lotes pendentes.
- [x] **Gate 3 (Taxas)**: Validação contratual de taxas fixas por ingresso e percentuais sobre o GMV.
- [x] **Gate 4 (Ledger 11.19)**: Consulta de extrato consolidado junto à conta gráfica do produtor; vedada a criação de ledger paralelo.
- [x] **Gate 5 (Estornos)**: Zero solicitações abertas de arrependimento (CDC Art. 49) no módulo `estorno`.
- [x] **Gate 6 (Revenue Assurance)**: Validação da matriz de integridade ponta a ponta sem anomalias críticas (11.22).
- [x] **Gate 7 (Conciliação)**: Matriz 6 vias validada (Pedido × Pagamento × Gateway × Ledger × Settlement × Banco).
- [x] **Gate 8 (Contabilidade)**: Partidas dobradas equilibradas e encerramento de contas de resultado do evento (11.21).
- [x] **Gate 9 (Settlement)**: Memória de cálculo exata deduzindo taxas, CDC, repasses prévios e retenção de segurança de 5%.
- [x] **Gate 10 (Banco)**: Chave Pix e conta bancária do produtor validadas e aptas a receber repasse.
- [x] **Gate 11 (Segregação de Funções - SoD)**: Definição de operador solicitante e diretor financeiro aprovador distintos.

---

### Fase 3: Aprovação de Alçada & Liquidação
- [x] **Prévia do Settlement**: Emissão e validação da memória de cálculo centavo a centavo (`POST /api/event-closings/:id/settlement/preview`).
- [x] **Validação de Alçada**: Repasses a partir de R$ 40.000,00 validados com token de autorização de diretoria (`AUTH-DIR-*`).
- [x] **Aprovação Formal**: Registro da aprovação com timestamps e identificadores (`POST /api/event-closings/:id/settlement/approve`).
- [x] **Execução com Idempotência**: Disparo do repasse com cabeçalhos `Idempotency-Key` e `x-correlation-id` (`POST /api/event-closings/:id/settlement/execute`).
- [x] **Retorno Bancário**: Confirmação da liquidação bancária e atualização do status para `LIQUIDADO`.

---

### Fase 4: Conclusão Definitiva & Emissão do Dossiê
- [x] **Emissão do Dossiê Imutável**: Canonização das 20 seções e cálculo do hash SHA-256 (`POST /api/event-closings/:id/close`).
- [x] **Atualização do Status do Evento**: Evento marcado definitivamente como `encerrado` no banco de dados.
- [x] **Bloqueio Destrutivo**: Bloqueio ativo contra re-execução ou aprovação paralela de settlement para eventos fechados.
- [x] **Trilha de Reabertura (se exigida)**: Reabertura restrita a auditoria com justificativa >= 10 caracteres, protocolo formal e preservação integral do snapshot da v1 para emissão incremental da v2.
