# EDDIE 11.21 — PLANO DE CONTAS HIERÁRQUICO E VERSIONADO

> **Data de Homologação:** 25 de Setembro de 2026  
> **Status:** HOMOLOGADO & AUDITADO  
> **Módulo:** `contabilidade`  
> **Padrão:** Estrutura Hierárquica em 4 Níveis (Classe, Grupo, Subgrupo, Conta Analítica)

---

## 1. Estrutura e Governança do Plano de Contas

O Plano de Contas do **EDDIE 11.21** foi desenhado especificamente para a operação de bilheteria e intermediação de eventos. Ele segue as seguintes regras rígidas de governança contábil:

1. **Hierarquia e Totalização:**
   - **Nível 1 (Classe):** `1` Ativo, `2` Passivo, `3` Receitas, `4` Despesas.
   - **Nível 2 (Grupo):** Ex: `1.1` Ativo Circulante, `2.1` Passivo Circulante, `3.1` Receitas Operacionais.
   - **Nível 3 (Subgrupo):** Ex: `1.1.1` Disponibilidades, `2.1.2` Recursos de Terceiros.
   - **Nível 4 (Conta Analítica):** Apenas contas analíticas de Nível 4 recebem lançamentos diretos.
2. **Contas Sintéticas Bloqueadas para Lançamentos:**
   - Tentativas de lançar diretamente em contas sintéticas (Níveis 1, 2 ou 3) são sumariamente rejeitadas com `BadRequestException`.
3. **Imutabilidade e Integridade:**
   - Uma conta que já possui movimentações contábeis associadas **NUNCA pode ser excluída**. Em caso de descontinuação, ela é inativada com data final de vigência, preservando a rastreabilidade histórica dos balancetes passados.

---

## 2. Relação Oficial de Contas

| Código | Nome da Conta | Tipo | Natureza | Nível | Analítica | Finalidade Operacional |
|---|---|---|---|:---:|:---:|---|
| **1** | **ATIVO** | Ativo | Devedora | 1 | Não | Totalizador geral do Ativo |
| **1.1** | **ATIVO CIRCULANTE** | Ativo | Devedora | 2 | Não | Bens e direitos de curto prazo |
| **1.1.1** | **Disponibilidades** | Ativo | Devedora | 3 | Não | Caixa e contas bancárias |
| **1.1.1.01** | Disponibilidades em Bancos e Caixa | Ativo | Devedora | 4 | **Sim** | Contas correntes bancárias e aplicações imediatas |
| **1.1.2** | **Créditos de Vendas e Adquirentes** | Ativo | Devedora | 3 | Não | Direitos a receber de credenciadoras |
| **1.1.2.01** | Adquirentes e Gateways a Receber | Ativo | Devedora | 4 | **Sim** | Valores brutos de vendas capturados via cartão/PIX |
| **1.1.3** | **Adiantamentos Concedidos** | Ativo | Devedora | 3 | Não | Direitos de antecipação |
| **1.1.3.01** | Adiantamentos Concedidos a Produtores (Advanced) | Ativo | Devedora | 4 | **Sim** | Adiantamentos de bilheteria pré-evento |
| **2** | **PASSIVO** | Passivo | Credora | 1 | Não | Totalizador geral do Passivo |
| **2.1** | **PASSIVO CIRCULANTE** | Passivo | Credora | 2 | Não | Obrigações exigíveis de curto prazo |
| **2.1.2** | **Recursos de Terceiros (Intermediação)** | Passivo | Credora | 3 | Não | Valores de bilheteria pertencentes a produtores |
| **2.1.2.01** | Valores a Repassar a Produtores de Eventos | Passivo | Credora | 4 | **Sim** | Saldo líquido de ingressos a ser liquidado |
| **2.1.3** | **Receitas Diferidas / Adiantamentos** | Passivo | Credora | 3 | Não | Receitas com realização em período futuro |
| **2.1.3.01** | Receitas Diferidas de Serviços de Eventos Futuros | Passivo | Credora | 4 | **Sim** | Taxas de eventos sob política de receita diferida |
| **2.1.4** | **Obrigações Operacionais** | Passivo | Credora | 3 | Não | Fornecedores e despesas a pagar |
| **2.1.4.01** | Contas a Pagar Fornecedores e Custos de Produção | Passivo | Credora | 4 | **Sim** | Despesas diretas de eventos e estrutura |
| **2.1.5** | **Provisões para Disputas** | Passivo | Credora | 3 | Não | Reservas para contingências |
| **2.1.5.01** | Reserva para Disputas e Chargebacks | Passivo | Credora | 4 | **Sim** | Fundo retido para contestações bancárias |
| **3** | **RECEITAS** | Receita | Credora | 1 | Não | Totalizador de receitas de resultado |
| **3.1** | **RECEITAS OPERACIONAIS DE SERVIÇOS** | Receita | Credora | 2 | Não | Receitas da atividade-fim da DiskIngressos |
| **3.1.1** | **Receita Própria de Taxa de Conveniência** | Receita | Credora | 3 | Não | Taxas cobradas sobre a venda de ingressos |
| **3.1.1.01** | Receita Própria de Taxa de Conveniência / Serviço Disk | Receita | Credora | 4 | **Sim** | Faturamento bruto dos serviços de conveniência |
| **3.1.2** | **Receitas Financeiras e Spread** | Receita | Credora | 3 | Não | Ganhos sobre operações financeiras |
| **3.1.2.01** | Receitas de Antecipação e Spread Comercial | Receita | Credora | 4 | **Sim** | Deságios de antecipação comercial |
| **4** | **DESPESAS** | Despesa | Devedora | 1 | Não | Totalizador de custos e despesas |
| **4.1** | **DESPESAS FINANCEIRAS E ADQUIRENTES** | Despesa | Devedora | 2 | Não | Custos de transação e gateway |
| **4.1.1.01** | Tarifas de Gateway e Taxa MDR de Adquirentes | Despesa | Devedora | 4 | **Sim** | Custo transacional de processamento de cartão/PIX |
| **4.2** | **CUSTOS OPERACIONAIS DE PRODUÇÃO** | Despesa | Devedora | 2 | Não | Custos operacionais do evento |
| **4.2.1.01** | Custos Diretos de Operação de Eventos | Despesa | Devedora | 4 | **Sim** | Equipe de portaria, tecnologia e suporte local |

---

## 3. Versionamento e Vigência

Cada conta contábil possui controle de vigência:
- `versao`: Número inteiro incremental que registra revisões conceituais.
- `vigenciaInicio`: Timestamp UTC que marca o início da validade da conta.
- `vigenciaFim`: Nulo para contas ativas; preenchido quando a conta é encerrada para novas partidas.

As regras de classificação contábil determinística referenciam exclusivamente contas analíticas com vigência válida, garantindo consistência em todas as competências.
