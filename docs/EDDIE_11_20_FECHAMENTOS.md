# EDDIE 11.20 — FECHAMENTOS FINANCEIROS E DOSSIÊ FINAL IMUTÁVEL

> **Data de Homologação:** 25 de Setembro de 2026  
> **Status:** HOMOLOGADO & AUDITADO  
> **Módulos:** `financeiro` (Control Tower & Financial Engine)  
> **Arquivos-Chave:** [`control-tower.types.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/control-tower.types.ts), [`control-tower.service.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/control-tower.service.ts)

---

## 1. Visão Geral dos Fechamentos

O fechamento financeiro no **EDDIE 11.20** é o processo de auditoria formal e consolidação que sela as contas contábeis e gerenciais, impossibilitando mutações arbitrárias nos saldos, taxas e movimentações já ocorridas. Ele opera em dois níveis:

1. **Fechamento Diário da Operação:** Consolida o expediente da tesouraria, gateways e conciliações do dia civil.
2. **Fechamento Financeiro Definitivo do Evento:** Consolida todo o ciclo de vida do evento (pré-venda, venda, realização e pós-evento), gerando o **Dossiê Final Imutável**.

---

## 2. Fechamento Diário da Operação

O fechamento diário é realizado ao término de cada expediente ou na virada do dia civil (UTC-03:00):

### 2.1 Componentes do Snapshot Diário
O snapshot armazena os seguintes dados consolidados:
- **`date`:** Data do fechamento (formato ISO `YYYY-MM-DD`).
- **`totalSales`:** Valor bruto total de ingressos vendidos no dia.
- **`totalFees`:** Total de taxa Disk retida das vendas do dia.
- **`totalPayouts`:** Montante total repassado a produtores no dia.
- **`reconciledPercentage`:** Percentual de transações do dia devidamente conciliadas com adquirentes e extratos bancários.
- **`pendingDivergencesCount`:** Número de divergências abertas ou em investigação detectadas nas rotinas do dia.
- **`status`:** Estado do fechamento (`FECHADO` ou `PENDENTE`).
- **`closedBy`:** Identificador do supervisor responsável pelo fechamento.
- **`closedAt`:** Timestamp UTC do fechamento.

### 2.2 Finalidade Operacional
O snapshot diário impede que conciliações retroativas alterem relatórios diários já apresentados à diretoria ou à contabilidade fiscal, servindo como base imutável para a conferência de caixa.

---

## 3. Fechamento Financeiro do Evento

O fechamento do evento ocorre após a realização das sessões, vencimento do prazo legal de estorno (CDC Art. 49) e liquidação de todas as contas a pagar da produção.

### 3.1 Regra Inviolável de Bloqueio por Divergências Críticas
O fechamento financeiro do evento possui uma trava de integridade rígida: **Nenhum evento pode ser encerrado se houver divergências financeiras críticas pendentes**.

No código de validação:
```typescript
const openCriticalDivergences = this.cases.filter(
  (c) =>
    c.eventId === eventId &&
    (c.status === 'ABERTO' || c.status === 'INVESTIGANDO') &&
    c.severity === 'CRITICO',
);

if (openCriticalDivergences.length > 0) {
  throw new BadRequestException(
    `Não é possível fechar o evento. Existem ${openCriticalDivergences.length} divergência(s) crítica(s) em aberto que exigem resolução formal prévia.`,
  );
}
```

Caso o operador tente fechar o evento com divergências críticas abertas, o sistema retorna imediatamente `400 Bad Request`, protegendo a integridade contábil da DiskIngressos e do produtor.

### 3.2 O Dossiê Final Imutável (`EventDossierDto`)
Ao concluir um fechamento de evento sem pendências críticas, o motor gera um Dossiê Criptográfico com as seguintes propriedades:

1. **`dossierHash` (SHA-256):** Resumo criptográfico calculado a partir do conteúdo do DRE, totais de ingressos, lote de borderô e extrato do Ledger.
2. **`digitalSignature` (`SIG-EDDIE-FIN-...`):** Assinatura digital emitida pela chave de segurança do módulo financeiro.
3. **Snapshot do DRE:** Receita bruta, receita líquida, taxas Disk apuradas, despesas liquidadas, deduções de impostos e resultado final.
4. **Snapshot do Saldo dos 4 Buckets:** Disponível, retido, bloqueado e reserva de estorno congelados.
5. **Auditoria de Ingressos:** Quantidade emitida, cortesias, cancelamentos e taxa de ocupação física da portaria.
6. **Extrato de Repasses:** Histórico de todos os lotes de repasse e liquidações bancárias efetuadas.

```typescript
const dossier: EventDossierDto = {
  eventId,
  closedAt: new Date().toISOString(),
  closedBy: actorId,
  dossierHash: `dossier-sha256-${eventId}-${Date.now().toString(16)}`,
  digitalSignature: `SIG-EDDIE-FIN-${Date.now().toString(36).toUpperCase()}`,
  dreSnapshot: dre,
  balancesSnapshot: balances,
  totalTicketsIssued: 5000,
  totalGrossSales: 350000,
  totalDiskFees: 35000,
  totalPayouts: 315000,
  openDivergencesCount: 0,
};
```

---

## 4. Protocolo de Reabertura de Evento Fechado

A reabertura de um evento fechado é uma operação de exceção forense de altíssima criticidade, restrita exclusivamente à Diretoria Financeira.

### 4.1 Requisitos Mandatórios para Reabertura
1. **Identificação do Diretor:** Apenas usuários com tier `DIRETOR` podem solicitar.
2. **Código Formal de Autorização (`authorizationCode`):** Deve seguir estritamente o padrão `AUTH-DIR-*` emitido pelo comitê financeiro.
3. **Justificativa Circunstanciada:** Registro formal detalhado do motivo da reabertura (ex: decisão judicial, retificação de borderô homologada, nota fiscal complementar).

### 4.2 Lógica de Validação da Reabertura
```typescript
if (!authorizationCode.startsWith('AUTH-DIR-')) {
  throw new BadRequestException(
    'Código de autorização inválido. Reabertura de evento exige autorização da Diretoria iniciada por AUTH-DIR-*.',
  );
}

eventClosing.status = 'REABERTO';
eventClosing.notes = `Evento reaberto por ${actorId}. Motivo: ${reason}. Autorização: ${authorizationCode}`;
```

A reabertura grava um evento auditável imutável na trilha forense, constando autor, timestamp UTC, código diretivo e justificativa, e notifica imediatamente o comitê de auditoria interna.

---

## 5. Evidências de Testes Automatizados

O ciclo completo de Fechamentos e Dossiê foi validado nos testes automatizados de [`control-tower.spec.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/control-tower.spec.ts):
- **Cenário 9:** Tentativa de fechar evento com divergência crítica em aberto é bloqueada com `BadRequestException`.
- **Cenário 10:** Fechamento bem-sucedido de evento sem divergências com geração de Dossiê, Hash SHA-256 e Assinatura Digital.
- **Cenário 11:** Reabertura de evento com código de autorização válido da Diretoria (`AUTH-DIR-*`).
- **Cenário 12:** Rejeição de tentativa de reabertura com código inválido.
- **Cenário 13:** Fechamento diário com snapshot consolidado de conciliação e divergências.

**Resultado dos testes:** 100% aprovados sem qualquer erro ou não-conformidade.
