# EDDIE 9.3 — Operação Central: SAC, Suporte a Eventos, Estorno & Eventos

## 1. Visão Geral e Princípios Fundamentais

O **EDDIE 9.3** consolida a camada de **Operação Central** do ecossistema DiskIngressos PDT, garantindo que os fluxos operacionais críticos do dia a dia funcionem de forma coordenada, resiliente e estritamente auditada, sem contaminação entre os papéis de comprador e produtor.

### Segregação Inviolável de Responsabilidades

| Módulo | Bounded Context | Usuário Alvo | Responsabilidade Exclusiva | Regra de Ouro |
|---|---|---|---|---|
| **Atendimento SAC** | `sac` | Comprador Final (Pessoa Física) | Triagem 360° por CPF/Pedido/Telefone/Nome, tickets de suporte ITIL, SLA operacional e triagem inicial de estornos. | **NUNCA** trata negociação de taxas com produtores ou dados contratuais B2B. |
| **Comercial B2B** | `crm` / `comercial` | Produtoras, Casas de Show e Organizadores | Pipeline de vendas B2B, propostas comerciais, comissões de serviço e credenciamento institucional. | **NUNCA** atende comprador final ou abre ticket de troca de ingresso. |
| **Suporte a Eventos** | `suporte` | Produtor e Equipe de Campo no Dia do Evento | Ocorrências operacionais em tempo real: catracas offline, falhas de conectividade/rede, contingência de bilheteria física, segurança e credenciamento. | Sempre vinculado estritamente ao contexto do `eventoId` ativo. |
| **Estorno & CDC** | `estorno` | Operadores Financeiros / Jurídico / SAC | Máquina de estados finita de reembolso: análise de elegibilidade (CDC Art. 49), retenção de taxa de conveniência e reversão atômica no Ledger em partidas dobradas. | **NUNCA** cria saldo paralelo; estorno aprovado = lançamento contábil no Ledger. |
| **Eventos & Lotes** | `eventos` | Produtores e Gestores de Conteúdo | Ciclo de vida de eventos, sessões, setores marcados e abertos, lotes de ingressos com vigência temporal e taxa de conveniência. | É a fonte primordial de `eventoId` para todos os módulos downstream. |

---

## 2. Atendimento SAC (Comprador Final 360°)

### 2.1. Arquitetura de Dados e Persistência
- **Schema Postgres:** `sac`
- **Tabelas:**
  - `sac.chamados`: Armazena os dados cadastrais do comprador, protocolo único (`SAC-XXXXXX`), pedido vinculado, SLA limite e status do ticket.
  - `sac.mensagens_sac`: Histórico cronológico e imutável das interações na thread (autor: `agente`, `cliente`, `sistema`).
- **SLA Padrão:** 24 horas úteis, calculado no momento da abertura.

### 2.2. Fluxo da Consulta 360° Instantânea
O operador SAC pode consultar um comprador a qualquer momento digitando:
1. **CPF:** Limpo ou com formatação (`000.000.000-00` ou `00000000000`);
2. **Número do Pedido:** UUID ou código legível do pedido;
3. **Telefone / Celular:** Com ou sem DDD;
4. **Nome Completo ou Parcial:** Busca insensível a maiúsculas/minúsculas.

A API retorna a ficha cadastral consolidada com a quantidade de chamados em aberto, chamados históricos e o histórico de estornos atrelados, disponibilizando um botão de abertura de chamado em 1 clique já com os dados preenchidos.

---

## 3. Suporte Operacional a Eventos (Operação de Campo)

### 3.1. Arquitetura de Dados e Persistência
- **Schema Postgres:** `suporte`
- **Tabela:** `suporte.ocorrencias`
- **Tipos de Ocorrência:**
  - `catraca`: Falha de leitor, sincronização de QR Code offline, catraca travada.
  - `bilheteria`: Impressora térmica sem comunicação, maquininha POS offline.
  - `rede`: Queda de link dedicado, latência Wi-Fi de produção.
  - `credenciamento`: Falha em crachás, lista VIP, divergência de pulseiras.
  - `seguranca`: Invasão de perímetro, brigada de incêndio, evacuação médica.
  - `outro`: Demandas gerais de produção técnica.

### 3.2. Ciclo de Vida da Ocorrência
```
[ABERTA] ─── (Atendimento em campo) ───> [EM_ANDAMENTO] ─── (Complexidade) ───> [ESCALADA]
   │                                           │                                     │
   └────────────────────── (Solução Aplicada) ─┴─────────────────────────────────────┴─> [RESOLVIDA]
```
Ao resolver, a equipe técnica registra a **solução detalhada** (ex: "Troca do switch de borda da portaria principal"), carimbando data/hora UTC e responsável técnico.

---

## 4. Estorno & Chargeback (Direito de Arrependimento e Ledger)

### 4.1. Regras do Artigo 49 do CDC
O EDDIE avalia instantaneamente na interface se o pedido é elegível ao cancelamento:
- **Prazo Legal:** Data da compra inferior ou igual a 7 dias corridos (`Δdias <= 7`).
- **Margem de Segurança:** Evento deve ocorrer a mais de 48 horas do momento da solicitação (`Δhoras >= 48`).
- **Retenção de Taxa de Conveniência:** No arrependimento legal do CDC, a devolução é integral (taxa retida = R$ 0,00). Em cancelamentos fora do prazo legal ou por liberalidade do produtor, a taxa de serviço pode ser retida se parametrizada.

### 4.2. Integração com o Ledger em Partidas Dobradas
Nenhum estorno aprova movimentação financeira "no ar":
1. Ao aprovar, o `EstornoService` dispara o evento `estorno.aprovado.v1` via Outbox.
2. O `FinanceiroConsumer` consome o evento e realiza o lançamento a débito da conta do produtor e a crédito do comprador/gateway:
   - Débito: `produtor.saldo_disponivel` ou `produtor.reserva_estorno`
   - Crédito: `gateway.reembolso_pendente`
3. A `Contabilidade` gera o lançamento contábil estornando a receita apropriada anteriormente.

---

## 5. Matriz de Endpoints da Operação Central

| Bounded Context | Método | Rota | Descrição |
|---|---|---|---|
| **SAC** | `GET` | `/sac/chamados` | Listagem paginada de chamados com filtros de status e ordenação cronológica |
| **SAC** | `GET` | `/sac/consultar?q=...` | Busca 360° instantânea por CPF, pedido, celular ou nome |
| **SAC** | `GET` | `/sac/chamados/:id` | Detalhes do chamado incluindo thread completa de mensagens |
| **SAC** | `POST` | `/sac/chamados` | Abertura de novo ticket com SLA e mensagem inicial opcional |
| **SAC** | `POST` | `/sac/chamados/:id/mensagens` | Envio de nova resposta (agente ou cliente) na thread |
| **SAC** | `PATCH` | `/sac/chamados/:id/status` | Transição de status (`em_atendimento`, `resolvido`, etc.) |
| **Suporte** | `GET` | `/suporte/ocorrencias` | Feed de incidentes filtrado por `eventoId` e severidade |
| **Suporte** | `POST` | `/suporte/ocorrencias` | Abertura de incidente técnico durante a operação do evento |
| **Suporte** | `PATCH` | `/suporte/ocorrencias/:id/status` | Resolução do incidente com registro formal da solução |
| **Estorno** | `GET` | `/estornos` | Listagem analítica das solicitações com valores em centavos |
| **Estorno** | `POST` | `/estornos/solicitar` | Abertura de pedido de reembolso com contexto do pedido |
| **Estorno** | `POST` | `/estornos/decidir` | Aprovação ou negativa auditada com impacto direto no Ledger |
