# EDDIE 9.6 — Homologação e Procedimentos Oficiais de Go-Live

## 1. Objetivo e Política de Zero-Defeito

Este documento estabelece o protocolo mandatório de **Homologação e Entrada em Produção (Go-Live)** para a versão consolidada do **EDDIE PDT**. Nenhuma versão é promovida para o ambiente de produção sem a aprovação integral de todos os itens deste checklist.

---

## 2. Checklist Pré-Deploy Técnico

| Etapa | Comando / Ação | Critério de Sucesso | Status |
|---|---|---|:---:|
| **1. Dependências** | `pnpm install` | Todas as dependências instaladas sem conflito no lockfile | **OK** |
| **2. Prisma ORM** | `pnpm db:generate` | Prisma Client gerado cobrindo todos os 10 schemas Postgres | **OK** |
| **3. Testes Automatizados** | `pnpm test` | 100% dos testes unitários e de integração aprovados (50/50) | **OK** |
| **4. Compilação API** | `pnpm --filter @ticketing/api exec tsc -p tsconfig.build.json` | 0 erros de tipagem TypeScript em modo estrito | **OK** |
| **5. Build Frontend** | `pnpm --filter @ticketing/pdt build` | 13/13 páginas estáticas geradas com sucesso | **OK** |
| **6. Script de Preflight** | `node scripts/preflight-go-live.mjs` | 13/13 verificações de integridade estrutural validadas | **OK** |

---

## 3. Matriz de Smoke Tests por Módulo

Antes de liberar o acesso geral aos produtores e operadores, o time de homologação deve executar os seguintes testes nas telas do PDT:

### 3.1. Navegação e Contexto Global
- [x] O Header carrega a lista de eventos reais do produtor logado;
- [x] Ao selecionar um evento diferente no Header, todas as abas das páginas acompanham o `eventoId` ativo sem refresh de tela;
- [x] O estado da seleção permanece salvo no navegador caso a página seja recarregada.

### 3.2. Financeiro & Ledger
- [x] O painel exibe o saldo do produtor segregado por buckets (`disponivel`, `bloqueado`, `retido`, `reserva_estorno`);
- [x] A tela de Transferência Inter-Eventos valida se o evento de origem tem saldo disponível antes de autorizar;
- [x] O simulador de antecipação calcula a taxa de desconto pró-rata com base nos dias restantes até o evento;
- [x] Solicitações de repasse geram registro de auditoria e liquidam apenas com chave Pix validada;
- [x] A tela de Contas & Compromissos realiza a baixa de despesas debitando diretamente do Ledger do evento correspondente.

### 3.3. Contabilidade & DRE
- [x] O Centro de Controle de Eventos mapeia corretamente o status da conciliação e do fechamento contábil mensal;
- [x] O DRE Gerencial demonstra claramente a segregação entre Receita Própria da DiskIngressos e Recursos de Terceiros dos Produtores;
- [x] O Balancete de Verificação assegura o equilíbrio fundamental ($\Sigma \text{Débitos} = \Sigma \text{Créditos}$);
- [x] Lançamentos manuais no Livro Diário exigem partidas dobradas perfeitamente balanceadas.

### 3.4. Atendimento SAC (Comprador Final)
- [x] A Consulta Instantânea 360° localiza compradores por CPF formatado ou numérico, número do pedido ou celular;
- [x] A thread de mensagens permite troca fluida entre atendente e cliente;
- [x] A alteração do status do ticket para "resolvido" grava data/hora de conclusão e encerra o SLA.

### 3.5. Suporte Operacional a Eventos
- [x] A criação de ocorrência exige vínculo com o `eventoId` ativo;
- [x] Categorias de campo (catraca, bilheteria, rede, credenciamento, segurança) e severidades são salvas com sucesso;
- [x] A resolução de uma ocorrência obriga a descrição da solução técnica aplicada.

### 3.6. Estorno & Chargeback
- [x] A interface avalia automaticamente a elegibilidade ao Artigo 49 do CDC (7 dias da compra e mais de 48h para o evento);
- [x] A aprovação de um estorno debita o valor correspondente do Ledger e atualiza o histórico imutável de transições.

---

## 4. Variáveis de Ambiente Mandatórias

### Backend (`apps/api/.env`)
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/diskingressos?schema=public"
REDIS_URL="redis://localhost:6379"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
JWT_SECRET="eddie-production-jwt-token-secret-change-me"
```

### Frontend (`apps/pdt/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 5. Procedimento de Rollback de Contingência

Em caso de anomalia crítica durante o processo de ativação:
1. Reverter os contêineres para a tag estável anterior no registry Docker;
2. Se houver divergência no Postgres, restaurar o snapshot do banco executado imediatamente antes da migração;
3. O log de auditoria em `platform.audit_logs` e a fila Outbox em `platform.outbox_messages` não devem ser truncados, preservando o rastreamento integral das operações realizadas.
