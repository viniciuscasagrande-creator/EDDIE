# EDDIE 11.20 — MOTOR DE APROVAÇÕES, ALÇADAS E SEGREGAÇÃO DE FUNÇÕES

> **Data de Homologação:** 25 de Setembro de 2026  
> **Status:** PRODUÇÃO / AUDITADO  
> **Módulo:** `financeiro` (Control Tower)  
> **Arquivos-Chave:** [`control-tower.types.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/control-tower.types.ts), [`control-tower.service.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/control-tower.service.ts)

---

## 1. Princípios de Governança Financeira

A Torre de Controle da Operação Financeira (**EDDIE 11.20**) implementa mecanismos rigorosos de governança, conformidade e auditoria para eliminar fraudes internas, falhas operacionais e erros de lançamento contábil. Toda ação que envolva desembolso de capital, concessão de crédito, alteração de parâmetros comerciais ou movimentação bancária é governada por dois pilares fundamentais:

1. **Matriz de Alçadas Hierárquicas:** Delimitação explícita de limites monetários e tipos de autorização permitidos por papel.
2. **Segregação Estrita de Funções (SoD - Segregation of Duties):** Nenhum operador, supervisor ou diretor pode aprovar uma solicitação gerada por ele mesmo, garantindo que todo processo passe por pelo menos duas partes independentes.

---

## 2. Matriz de Alçadas e Tiers

| Nível / Papel | Teto Monetário | Tipos de Operações Permitidas | Requisitos Adicionais |
|---|---|---|---|
| **OPERADOR** | Até **R$ 5.000,00** | Liquidação de pequenas despesas, cancelamento de ingressos ordinários, conciliação manual de baixa complexidade, abertura de chamados/casos de divergência. | Registro com justificativa e verificação cadastral. |
| **SUPERVISOR** | Até **R$ 50.000,00** | Repasses ordinários de produtores, antecipações parciais (Advanced), aprovação de despesas operacionais médias, conciliação de divergências intermediárias, fechamento diário da operação. | Parecer analítico e verificação dos 4 buckets de saldo do evento. |
| **DIRETOR** | **Ilimitado** (> R$ 50.000,00) | Grandes repasses bancários, alteração de regras comerciais/taxas de evento, alteração de domicílio bancário de produtor, fechamento definitivo de evento, reabertura excepcional de evento fechado. | Código de autorização formal `AUTH-DIR-*` e justificativa técnica arquivada. |

---

## 3. Segregação Estrita de Funções (SoD)

### 3.1 Regra Inviolável de Autoaprovação
É estritamente vedada a autoaprovação de solicitações. A verificação ocorre no núcleo da lógica de negócios do backend:

```typescript
if (req.requesterId === approverId) {
  throw new BadRequestException(
    'Segregação de funções violada: o solicitante não pode aprovar a própria solicitação.',
  );
}
```

Qualquer tentativa de um solicitante aprovar seu próprio pedido resulta em rejeição imediata com código HTTP `400 Bad Request`, sendo a tentativa registrada na trilha de auditoria forense com alerta de conformidade.

### 3.2 Validação de Limites por Alçada
Antes de persistir o deferimento, o motor valida se o perfil do aprovador comporta o montante da solicitação:

```typescript
if (approverTier === 'OPERADOR' && req.amount > 5000) {
  throw new BadRequestException(
    'Alçada insuficiente: Operador só pode aprovar valores de até R$ 5.000,00.',
  );
}
if (approverTier === 'SUPERVISOR' && req.amount > 50000) {
  throw new BadRequestException(
    'Alçada insuficiente: Supervisor só pode aprovar valores de até R$ 50.000,00. Requer alçada de Diretor.',
  );
}
```

---

## 4. Operações de Alçada Exclusiva da Diretoria

Certas operações possuem impacto de governança tão profundo que sua execução é restrita ao tier **DIRETOR**, independentemente do montante envolvido:

### 4.1 Alteração de Taxa Comercial de Evento
- **Impacto:** Modifica o percentual ou valor fixo cobrado pela DiskIngressos por ingresso vendido.
- **Regra de Imutabilidade:** A alteração cria uma nova versão da regra (V2, V3...) com vigência temporal. **Vendas históricas preservam seus snapshots originais de forma imutável**.
- **Alçada Requerida:** Apenas Diretores podem submeter e homologar nova versão de taxa.

### 4.2 Alteração de Domicílio Bancário de Produtor
- **Impacto:** Altera a conta corrente e chave PIX para onde os repasses de bilheteria são transferidos.
- **Risco Mitigado:** Fraude de desvio de pagamentos (account takeover ou conluio interno).
- **Alçada Requerida:** Requer parecer do Diretor Financeiro com conferência de contrato social, comprovante de domicílio bancário da pessoa jurídica e aprovação formal.

### 4.3 Fechamento Financeiro de Evento
- **Impacto:** Congela permanentemente a contabilidade do evento e gera o Dossiê Final Imutável com assinatura digital.
- **Alçada Requerida:** Exclusiva de Diretoria após auditoria de divergências residuais.

### 4.4 Reabertura de Evento Fechado
- **Impacto:** Quebra temporária do selo do dossiê para correções financeiras excepcionais.
- **Alçada Requerida:** Requer código de autorização `AUTH-DIR-*` emitido pela Diretoria Financeira e justificativa circunstanciada registrada em log imutável.

---

## 5. Trilha de Auditoria e Imutabilidade

Todas as decisões registradas no Motor de Aprovações geram um registro imutável com a seguinte estrutura:

- `id`: Identificador universal único do item de aprovação.
- `requesterId`: Identificador do usuário que originou a demanda.
- `approverId`: Identificador do usuário que deliberou sobre a solicitação (garantidamente diferente de `requesterId`).
- `approverTier`: Nível de alçada no momento da deliberação.
- `status`: `APROVADO`, `REJEITADO` ou `PENDENTE`.
- `amount`: Valor monetário submetido.
- `notes`: Justificativa técnica circunstanciada.
- `decidedAt`: Timestamp UTC do instante exato da decisão.
- `auditLog`: Lista append-only de todos os eventos do ciclo de vida da aprovação.

---

## 6. Homologação e Testes Automatizados

O comportamento do Motor de Aprovações e Alçadas foi validado nos seguintes testes automatizados do arquivo [`control-tower.spec.ts`](file:///C:/Users/vinad/OneDrive/Desktop/EDDIE/apps/api/src/modules/financeiro/control-tower.spec.ts):
- **Cenário 4:** Autoaprovação é bloqueada com `BadRequestException`.
- **Cenário 5:** Aprovação de repasse acima de R$ 5.000,00 por Operador é rejeitada por alçada insuficiente.
- **Cenário 6:** Aprovação de repasse acima de R$ 50.000,00 por Supervisor é rejeitada, exigindo alçada de Diretor.
- **Cenário 7:** Aprovação por Diretor com solicitante distinto é deferida com sucesso.
- **Cenário 8:** Alçada exclusiva de Diretoria para alteração de taxa e domicílio bancário validada com sucesso.

Todos os testes foram executados com **100% de aprovação**.
