# EDDIE 11.21 — MOTOR DE CLASSIFICAÇÃO CONTÁBIL DETERMINÍSTICO E VERSIONADO

> **Data de Homologação:** 25 de Setembro de 2026  
> **Status:** HOMOLOGADO & AUDITADO  
> **Módulo:** `contabilidade` (Accounting Engine)  
> **Arquivos-Chave:** [`accounting.service.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/contabilidade/accounting.service.ts), [`accounting.types.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/contabilidade/accounting.types.ts)

---

## 1. Princípios do Motor Determinístico

O Motor de Classificação Contábil do **EDDIE 11.21** atua na fronteira entre os eventos econômicos e a escrituração em partidas dobradas. Ele opera sob três preceitos invioláveis:

1. **Determinismo Absoluto:** Para cada tipo de fato financeiro com seus parâmetros de entrada (origem, produtor, evento, taxa, modelo), o motor gera uma combinação exata e previsível de contas a debitar e creditar.
2. **Proibição de Classificação Silenciosa (Fail-Safe):** Se for recebido um fato econômico sem regra configurada ou com parâmetros incompletos, o motor **NUNCA tenta adivinhar ou classificar em contas genéricas**. O evento é imediatamente registrado na **Central de Pendências Contábeis** com severidade `ALTO`, aguardando a parametrização formal pelo contador.
3. **Versionamento e Preservação Histórica:** As regras são imutáveis e versionadas (`V1`, `V2`, `V3`). Lançamentos já escriturados em períodos passados mantêm a referência indelével da versão da regra aplicada no momento do fato.

---

## 2. Catálogo Oficial de Regras de Classificação

### 2.1 Regra 1: Venda de Ingresso (`VENDA_INGRESSO`) — Versão 1
- **Fato Gerador:** Pedido de ingresso aprovado no checkout.
- **Partidas Geradas:**
  - **Débito:** `1.1.2.01` Adquirentes e Gateways a Receber (Valor Bruto Total).
  - **Crédito:** `2.1.2.01` Valores a Repassar a Produtores (Valor do Ingresso do Produtor).
  - **Crédito:** `3.1.1.01` Receita Própria de Taxa de Conveniência (Taxa Disk) — *caso não haja diferimento*.
  - **Crédito (Alternativo):** `2.1.3.01` Receitas Diferidas de Serviços — *caso haja política de receita diferida ativa para o evento*.
- **Equilíbrio:** $\text{Débito} = \text{Crédito Produtor} + \text{Crédito Taxa Disk}$.

### 2.2 Regra 2: Repasse Bancário ao Produtor (`REPASSE_PRODUTOR`) — Versão 1
- **Fato Gerador:** Liquidação de lote de repasse PIX/CNAB pelo Financeiro.
- **Partidas Geradas:**
  - **Débito:** `2.1.2.01` Valores a Repassar a Produtores (Baixa de obrigação).
  - **Crédito:** `1.1.1.01` Disponibilidades em Bancos e Caixa (Saída bancária).
- **Impacto em Resultado:** **ZERO**. O repasse não afeta contas de receitas nem despesas próprias.

### 2.3 Regra 3: Estorno CDC 7 Dias (`ESTORNO_VENDA`) — Versão 1
- **Fato Gerador:** Cancelamento de ingresso dentro do prazo legal.
- **Partidas Geradas:**
  - **Débito:** `2.1.2.01` Valores a Repassar a Produtores (Estorno do crédito do produtor).
  - **Débito:** `3.1.1.01` Receita Própria de Taxa de Conveniência (Estorno da receita da Disk).
  - **Crédito:** `1.1.2.01` Adquirentes e Gateways a Receber (Estorno da captura).

### 2.4 Regra 4: Chargeback Recebido (`CHARGEBACK`) — Versão 1
- **Fato Gerador:** Notificação de contestação bancária não coberta.
- **Partidas Geradas:**
  - **Débito:** `2.1.5.01` Reserva para Disputas e Chargebacks (Utilização do fundo provisionado).
  - **Débito:** `3.1.1.01` Receita Própria de Taxa de Conveniência (Estorno da taxa).
  - **Crédito:** `1.1.2.01` Adquirentes e Gateways a Receber (Estorno bancário do adquirente).

### 2.5 Regra 5: Transferência Inter-Eventos (`TRANSFERENCIA_SALDO`) — Versão 1
- **Fato Gerador:** Transferência de saldo disponível entre eventos do mesmo produtor.
- **Partidas Geradas:**
  - **Débito:** `2.1.2.01` Valores a Repassar a Produtores (Subconta Evento Origem).
  - **Crédito:** `2.1.2.01` Valores a Repassar a Produtores (Subconta Evento Destino).
- **Impacto em Resultado:** **ZERO**.

### 2.6 Regra 6: Adiantamento Advanced (`ADIANTAMENTO_ADVANCED`) — Versão 1
- **Fato Gerador:** Concessão de antecipação contratual de bilheteria ao produtor.
- **Partidas Geradas:**
  - **Débito:** `1.1.3.01` Adiantamentos Concedidos a Produtores (Direito exigível).
  - **Crédito:** `1.1.1.01` Disponibilidades em Bancos e Caixa (Saída de caixa).

### 2.7 Regra 7: Despesa Operacional de Evento (`DESPESA_PRODUCAO`) — Versão 1
- **Fato Gerador:** Contratação de fornecedor aprovada na Torre de Controle (11.20).
- **Partidas Geradas:**
  - **Débito:** `4.2.1.01` Custos Diretos de Operação de Eventos (Resultado/Despesa).
  - **Crédito:** `2.1.4.01` Contas a Pagar Fornecedores e Custos de Produção (Passivo Circulante).

---

## 3. Gestão de Exceções: Encaminhamento para a Central de Pendências

Quando o método `classificarFatoFinanceiro` recebe um evento sem regra ativa correspondente:

```typescript
const regra = this.rules
  .filter((r) => r.fatoTipo === input.fatoTipo && r.ativa)
  .sort((a, b) => b.versao - a.versao)[0];

if (!regra) {
  const pendencia = await this.criarPendencia({
    tenantId: input.tenantId,
    tipo: 'SEM_REGRA_CLASSIFICACAO',
    severidade: 'ALTO',
    descricao: `Fato financeiro do tipo ${input.fatoTipo} não possui regra de classificação contábil configurada.`,
    fatoOrigemTipo: input.fatoTipo,
    fatoOrigemId: input.origemReferenciaId,
    competencia: input.competencia,
  });

  return {
    sucesso: false,
    pendenciaId: pendencia.id,
    motivo: `Regra ausente para o tipo ${input.fatoTipo}. Encaminhado para a Central de Pendências.`,
  };
}
```

Essa trava impede qualquer contaminação da escrituração oficial por lançamentos incorretos ou não auditados.
