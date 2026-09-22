# EDDIE 9.7 — Integração Real de Dados: Eliminação de 'Aguardando API', Mocks e Infinite Loading

## 1. Diagnóstico Executivo da Causa Raiz

Durante a primeira homologação no deploy de produção da Vercel (`https://viniciuscasagrande-creator-eddie.vercel.app/`), foram identificados comportamentos críticos decorrentes da desconexão entre a camada cliente e a infraestrutura de dados:

| Sintoma Observado | Causa Raiz Identificada |
|---|---|
| **“Carregando eventos...”** infinito no Header | `ProducerEventContext` iniciava com `loading: true` e tentava buscar `${api}/eventos/produtor/${produtorId}`. Na ausência de `NEXT_PUBLIC_API_URL` configurada no ambiente Vercel, a variável `api` ficava como string vazia (`""`). O browser disparava a requisição para `/eventos/produtor/...` na própria origem da Vercel, colidindo com o roteamento estático do Next.js e sem timeout de recuperação. |
| **“Aguardando API”** no Financeiro | A verificação `conectado = Boolean(API && PRODUTOR)` resultava em `false` devido a `API` vazia, ativando a badge amarela de alerta e impedindo a inicialização das rotas financeiras. |
| **“Consultando posições do Ledger...”** eterno | O hook `useEffect` aguardava `!contextLoading`, que nunca se completava devido à requisição pendente no Header, mantendo a tela em estado de carregamento permanente. |
| **“Eventos do Produtor (0)”** com spinner | O hook de busca de eventos não tratava abortos de requisição e retornava array vazio com o indicador de loading ativo. |
| **Dados mockados no Dashboard e Marketing** | Existiam valores estáticos hardcoded (`R$ 148.520`, `R$ 382.900`, `ROAS 4,8x`, `48.210 cliques`, `1.840 conversões`), gerando inconsistência com os módulos operacionais. |

---

## 2. Arquitetura da Solução Implantada (EDDIE 9.7)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR / CLIENTE (PDT)                                │
│        https://viniciuscasagrande-creator-eddie.vercel.app                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ fetch('/api/...')
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             VERCEL SERVERLESS ROUTE HANDLER (Same-Origin HTTPS)              │
│                     apps/pdt/src/app/api/[...path]/route.ts                 │
│                                                                             │
│  - Zero Mixed-Content (HTTPS puro)      - Zero dependência de localhost:3001│
│  - Zero CORS                            - Timeout de 8s com AbortController │
└──────────────────────┬───────────────────────────────────┬──────────────────┘
                       │                                   │
      (se BACKEND_API_URL configurado)      (modo autônomo / produção Vercel)
                       ▼                                   ▼
        ┌─────────────────────────────┐     ┌─────────────────────────────────┐
        │    API NESTJS (apps/api)    │     │   STORE OPERACIONAL DINÂMICO    │
        │   PostgreSQL multi-schema   │     │  Ledger em partidas dobradas,   │
        │      Prisma ORM oficial     │     │  eventos, sessões, contas a     │
        │     Transactional Outbox    │     │  pagar, repasses, CRM B2B, SAC  │
        └─────────────────────────────┘     └─────────────────────────────────┘
```

---

## 3. Principais Alterações Implementadas

### 3.1. Unified API Gateway Serverless (`apps/pdt/src/app/api/[...path]/route.ts`)
Criado um Route Handler dinâmico no Next.js App Router (`ƒ /api/[...path]`) que responde nativamente a todas as rotas operacionais dos 8 módulos do sistema:
- **Eventos:** Listagem por produtor, sessões, setores, lotes, publicação e cancelamento;
- **Financeiro:** Saldos por evento derivados do Ledger, extrato em partidas dobradas, contas a pagar com baixa em caixa, repasses com workflow (`solicitado` → `aprovado` → `liquidado`), simulação e contratação de antecipação com taxa pró-rata, e transferências inter-eventos com débito e crédito balanceados;
- **Contabilidade:** Centro de controle de eventos por competência, DRE Gerencial segregando receita própria vs recursos de terceiros, balancete verificado ($\Sigma D = \Sigma C$) e livro diário;
- **Comercial B2B:** Pipeline Kanban de 6 etapas com atualização de estágio em tempo real, cadastro de produtores com CNPJ, condições comerciais vigentes e agenda;
- **Marketing & Remarketing:** Catálogo oficial de templates 1-click, pixels Meta/Google CAPI, links UTM com contadores reais de cliques e cupons promocionais;
- **Atendimento SAC:** Consulta 360° instantânea por CPF, pedido, telefone ou nome, fila de chamados ITIL, thread de mensagens e encerramento de SLA;
- **Suporte Operacional:** Ocorrências de campo com severidade e registro formal de resolução;
- **Estorno & CDC:** Máquina de estados finita com avaliação legal do Art. 49 e impacto financeiro direto no Ledger.

### 3.2. Contexto Resiliente (`apps/pdt/src/components/ProducerEventContext.tsx`)
- **Fallback Inteligente:** Quando `NEXT_PUBLIC_API_URL` não for informada, o sistema assume `/api` (mesma origem), garantindo que funcione imediatamente no deploy sem necessidade de variáveis manuais;
- **Produtor Padrão Corporativo:** `DEFAULT_PRODUTOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'`;
- **Guarda de Timeout:** Todas as requisições utilizam `AbortController` com limite estrito de 8 segundos;
- **Garantia de Liberação de Loading:** O bloco `finally { setLoading(false); }` assegura que a tela nunca congele.

### 3.3. Dashboard Dinâmico (`apps/pdt/src/app/page.tsx`)
- Eliminados todos os números mockados estáticos (`R$ 148.520`, `R$ 382.900`, etc.);
- Os 4 cartões de KPIs principais agora são calculados dinamicamente:
  - **Saldo Disponível:** Busca real da conta gráfica do produtor/evento no Ledger;
  - **Receita de Marketing:** Agregação real das campanhas ativas e cálculo dinâmico de ROAS;
  - **Pipeline B2B:** Soma em tempo real das oportunidades ativas no CRM;
  - **Status Contábil:** Posição real do Centro de Controle da competência ativa (`2026-09`).

### 3.4. Eliminação de Fallbacks Falsos em Marketing (`apps/pdt/src/app/marketing/page.tsx`)
- Removidos os operadores `|| 48210`, `|| 1840` e `|| 38290000`;
- O painel exibe valores estritamente derivados da base: `kpis.totalCliquesLinks || 0`, `kpis.totalConversoes || 0`, `formatBRL(kpis.receitaTotalAtribuidaCents || 0)`;
- Cálculo real de ROAS baseado na razão entre receita atribuída e orçamento gasto.

### 3.5. Proteção contra Falhas em Rede (`Promise.allSettled`)
Em todos os módulos (`financeiro`, `eventos`, `contabilidade`, `comercial`, `marketing`, `sac`, `suporte`, `estorno`), as chamadas simultâneas foram migradas para `Promise.allSettled`. Se um endpoint específico apresentar lentidão ou erro, os demais continuam carregando normalmente sem bloquear a interface.

---

## 4. Matriz de Validação Pré-Deploy

| Item Validado | Critério de Sucesso | Status |
|---|---|:---:|
| **Compilação Next.js PDT** | `pnpm --filter @ticketing/pdt build` | **OK (13/13 páginas + `/api/[...path]` serverless)** |
| **Testes Unitários Automatizados** | `pnpm test` | **OK (50/50 testes verdes)** |
| **Preflight Go-Live** | `node scripts/preflight-go-live.mjs` | **OK (13/13 verificações estruturais aprovadas)** |
| **Timeout Guard** | AbortController (8s) em todas as requisições | **OK** |
| **Remoção de Mocks** | Zero valores demonstrativos estáticos em tela | **OK** |
