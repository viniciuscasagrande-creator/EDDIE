# Mapa de Módulos — DiskIngressos PDT (Painel do Produtor)

> Levantado a partir da navegação gravada em `Gravando_2026-09-21_150825.mp4`.
> Para cada módulo: o que a tela mostra, que dado/evento ele precisa para
> deixar de ser `R$ 0,00`, e a peça de backend que falta. Prioridade em
> `P0` (bloqueia o resto), `P1` (importante, não bloqueia), `P2` (depois).

---

## Como ler este documento

Cada módulo do menu lateral virou uma seção. Dentro de cada um:

- **Bounded context** — o que ele sabe e o que ele NÃO sabe (regra do modulith)
- **Precisa existir** — entidades/tabelas mínimas
- **Consome / Publica** — eventos de domínio (ver `packages/contracts`)
- **O que é peculiar aqui** — a parte que não é CRUD comum, onde mora a complexidade real
- **Prioridade**

---

## A. NÚCLEO — Eventos, Cockpit Operacional, Comercial

### A.1 Todos os Eventos / Novo Evento / Configurar Lotes
Já coberto no esqueleto entregue (`modules/eventos`). Sem novidade.
**Prioridade: P0 — já em andamento.**

### A.2 Cockpit Operacional (dentro de cada evento)
Este é um **agregador de leitura**, não um módulo com dado próprio. Cada
aba nele é uma porta pública de outro módulo, consolidada numa única tela:

| Aba | De onde vem o dado | Observação |
|---|---|---|
| Inventário e Lotes | `inventario` (a criar) | disponibilidade real, não o espelho `Lote.vendidos` |
| Consulta de Clientes | `crm` (a criar) | histórico de compras do comprador daquele evento |
| Live Operations | `acesso` + `pedidos` via WebSocket/SSE | ver A.3 |
| Incident Center | `developer` (telemetria) | ver A.4 |
| Revenue Intelligence | read model em ClickHouse | ver A.5 |
| Disk Intelligence | IA (Gemini) sobre o mesmo read model | ver A.5 |
| Readiness / Go-Live | checklist de publicação do evento | ver A.6 |

**Precisa existir:** um `CockpitFacade` (service de composição, não um módulo
novo) que chama as portas públicas dos módulos acima em paralelo
(`Promise.all`) e monta o payload da tela. Nunca um módulo novo com schema
próprio — isso violaria a regra de bounded context.
**Prioridade: P1 — só faz sentido depois que os módulos de baixo existirem.**

### A.3 Live Operations
O card "Atividade em Tempo Real" no dashboard geral (vendas aparecendo ao
vivo, "há 2 min", "há 6 min") **não é polling**. É notificação push.

**O que é peculiar aqui:** precisa de um canal de push. Duas opções:
- **SSE** (`text/event-stream`) — mais simples, unidirecional, perfeito para
  esse caso (o cliente só recebe, nunca envia).
- **WebSocket** — só se você também precisar mandar comandos do frontend
  em tempo real (ex.: um operador confirmando check-in manual e o painel
  de outro operador atualizando na hora).

**Precisa existir:** um gateway (`LiveGateway`) que assina `pedido.pago.v1`
e `acesso.checkin_realizado.v1` no bus e retransmite para os clientes
conectados, filtrado por `tenantId`/`eventoId`. Não é um módulo de negócio,
é infraestrutura de apresentação — fica em `shared/`, não em `modules/`.
**Prioridade: P1.**

### A.4 Incident Center
Isto é o **módulo Developer** com uma lente de "o que está quebrado agora",
não um módulo novo. A tela deve mostrar:
- Filas do RabbitMQ com lag alto (`event bus inspector`)
- DLQ com mensagens (evento que falhou repetidas vezes)
- SLA de SAC violado (`sac.sla_violado.v1`)
- Erros de webhook de pagamento/antifraude

**Precisa existir:** endpoint agregando `AuditLog` + `OutboxMessage` (contagem
de `attempts >= MAX_ATTEMPTS`) + métricas do Prometheus via query direta.
**Prioridade: P2 — só compensa depois que houver volume real gerando incidentes.**

### A.5 Revenue Intelligence / Disk Intelligence
Duas telas, um motor só: previsão de sell-out e detecção de anomalia sobre
a curva de vendas. **Revenue Intelligence** = números e projeção
determinística (regressão simples sobre velocidade de venda). **Disk
Intelligence** = camada de IA em cima disso (Gemini lendo o mesmo read
model e respondendo em linguagem natural: "esse evento vai esgotar em 4
dias no ritmo atual", "o lote 2 está vendendo 40% mais devagar que o
esperado para essa fase").

**O que é peculiar aqui:** a parte determinística NÃO deve usar LLM —
regressão/série temporal é mais barata, mais rápida e mais confiável para
número. O LLM entra só para **explicar** o número em texto, nunca para
calculá-lo. Isso também é o que o módulo Developer precisa telemetrar via
`LlmCall` (custo e latência por chamada).

**Precisa existir:**
- Read model em ClickHouse: vendas por evento/lote/hora
- Job (`RevenueForecastJob`, cron) que roda a projeção e grava o resultado
- Endpoint que serve o número pronto (não calcula na hora da requisição)
- Prompt versionado em `packages/contracts` ou similar, chamando Gemini
  só para o texto explicativo, nunca para o cálculo
**Prioridade: P2.**

### A.6 Readiness / Go-Live
Checklist de pré-publicação: taxa de serviço definida (viu na tela do
Comercial: "4 eventos sem condição comercial"), pelo menos um lote ativo,
política de estorno configurada, conta bancária de repasse cadastrada.

**Precisa existir:** função pura `avaliarReadiness(eventoId)` no módulo
Eventos que consulta (via portas públicas) Financeiro e Estorno e retorna
uma lista de pendências. Isso é o motivo pelo qual `publicar()` no service
de Eventos já lança erro se faltar lote — Readiness é a versão "visível"
dessa mesma validação, com todos os itens de uma vez em vez de um por vez.
**Prioridade: P1.**

### A.7 Comercial (Painel de Produtores)
Tela com Taxa Disk, Spread, Advanced, alçada, "4 eventos sem condição
comercial".

**Precisa existir:**
- Campo `ContratoComercial` por produtor/evento: `taxaPlataforma`,
  `spread` (markup adicional, distinto da taxa — provavelmente margem de
  antecipação), `limiteAdvanced` (teto de antecipação elegível)
- Estado `Elegível / Regular / Sem Taxa` é derivado, não armazenado:
  calculado a partir de `politicaEstorno` + `ContratoComercial` preenchidos
**Prioridade: P0 — bloqueia publicação de evento, então bloqueia tudo.**

---

## B. VENDAS & ACESSO

### B.1 Pedidos & Vendas
CRUD de leitura sobre o que o módulo `pedidos`/`pagamentos` (do roadmap
original) gera. Não tem lógica própria — é uma porta pública com filtro e
paginação.
**Prioridade: P0 — é o módulo `inventario` + `pagamentos` do roadmap anterior.**

### B.2 Participantes
Lista de compradores/portadores de ingresso por evento. Cross-reference
entre `pedido.pago.v1` (quem comprou) e `acesso.checkin_realizado.v1`
(quem entrou). Pode ter titularidade transferida — cada ingresso então
precisa rastrear `titularAtualId` separado de `compradorId`.
**Precisa existir:** módulo `crm` com read model `Participante` mantido
por consumer, mais um endpoint de transferência de titularidade que emite
`acesso.titularidade_transferida.v1` (evento novo a registrar no catálogo).
**Prioridade: P1.**

### B.3 Status Faciais
Reconhecimento facial no check-in. **Atenção jurídica:** biometria é dado
pessoal sensível pela LGPD (art. 5º, II).

**O que é peculiar aqui — regras não negociáveis:**
1. Nunca armazenar a foto. Só o **template vetorial** (embedding), que é
   matematicamente irreversível para a imagem original.
2. Consentimento específico e destacado, separado do aceite geral de termos.
3. Prazo de retenção definido (ex.: apagar o template X dias após o evento).
4. Log de auditoria de todo acesso ao dado biométrico — é `AuditLog` com
   `module: 'acesso'`, `entity: 'TemplateFacial'`, então já existe
   infraestrutura para isso, só falta usar.
5. Comparação (`matching`) roda em serviço isolado; o resultado que chega
   ao resto do sistema é booleano (`bateu / não bateu`) + score, nunca o
   vetor em si trafegando por módulos que não precisam dele.

**Precisa existir:** schema próprio `acesso.templates_faciais` com
`clienteId`, `embeddingVetor` (pgvector), `consentidoEm`, `expiraEm`, mais
um job de expurgo automático.
**Prioridade: P2 — feature de diferenciação, não bloqueia o core.**

### B.4 Terminais POS
Venda presencial. Tem que funcionar **offline** — internet de evento é
não-confiável por definição.

**O que é peculiar aqui:** o terminal grava a venda localmente (IndexedDB
ou SQLite local) com um `idempotencyKey` gerado no dispositivo, e sincroniza
quando a conexão volta. O conflito mais comum é **overselling**: dois
terminais venderam o último ingresso do lote ao mesmo tempo, ambos offline.

**Precisa existir:**
- Endpoint de sync em lote (`POST /pos/sync`) que aceita idempotência por
  `idempotencyKey`
- Reserva local com teto pré-alocado por terminal (ex.: cada POS recebe um
  "bloco" de 20 ingressos reservados do lote no início do evento, evitando
  que dois terminais disputem o mesmo inventário em tempo real)
- Fila de conflito visível no Incident Center quando o pré-alocado esgota
**Prioridade: P1 — crítico no dia do evento, mas não bloqueia pré-venda online.**

---

## C. FINANCEIRO & CONTABILIDADE

### C.1 Financeiro → Saldos (Saldo & Disponibilidade)
Confirmado no vídeo: **ledger de partidas dobradas**, exatamente como
proposto — "valores calculados diretamente das movimentações e obrigações
financeiras". Saldo nunca é uma coluna, é `SUM(entradas) - SUM(saídas)`.

**Precisa existir (esqueleto Prisma, schema `financeiro`):**
```prisma
model LancamentoLedger {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @db.Uuid
  produtorId  String   @db.Uuid
  eventoId    String?  @db.Uuid
  bucket      String   // disponivel | bloqueado | reservado_estorno | retido
  tipo        String   // entrada | saida
  valor       Decimal  @db.Decimal(14,2)
  origem      String   // 'pedido.pago.v1' | 'pagamento.estornado.v1' | 'repasse' ...
  origemId    String   // id do evento de domínio que gerou este lançamento
  criadoEm    DateTime @default(now())

  @@index([tenantId, produtorId, bucket])
  @@unique([origem, origemId, bucket]) // idempotência: mesmo evento nunca lança 2x
}
```
Saldo disponível = `SUM(valor WHERE bucket='disponivel' AND tipo='entrada') - SUM(... tipo='saida')`.
Isso é o que resolve "Divergências — exigem conciliação" de forma estrutural:
se o número sempre vem da soma, não existe estado divergente por definição —
só existe lançamento faltando ou duplicado, que é auditável.

**Prioridade: P0 — Estorno, Comercial e Contabilidade dependem disso.**

### C.2 Contas a Pagar / Repasses / Antecipações / Despesas / Contas Bancárias
Todos consomem o mesmo ledger acima, cada um com sua máquina de estados:

- **Repasse:** `solicitado → aprovado → programado → liquidado`. Emite
  lançamento de saída no bucket `disponivel` do produtor.
- **Antecipação:** compra do recebível futuro com deságio. Precisa de
  motor de cálculo: `valorLiquido = valorFuturo - (valorFuturo * taxaDiaria * diasAntecipados)`.
  A `taxaDiaria` vem do `ContratoComercial` (campo "Spread" visto no Comercial).
- **Contas a Pagar:** já confirmado no texto da própria tela — "liquidação
  direta e transferências inter-eventos com partidas dobradas no Ledger".
  Ou seja, pagar um fornecedor debita o bucket `disponivel` do evento.
**Prioridade: P0 (Repasse), P1 (Antecipação, Contas a Pagar).**

### C.3 Contabilidade (Visão Geral, Operação Contábil, DRE Gerencial, Fiscal & Compliance)
Este módulo **não inventa números** — ele reclassifica os lançamentos do
ledger financeiro num plano de contas contábil (regime de competência).

**O que é peculiar aqui:** dois regimes coexistindo.
- **Caixa** (o ledger financeiro, C.1) — quando o dinheiro efetivamente
  entra/sai.
- **Competência** (Contabilidade) — quando a receita é reconhecida, que
  para ticketing costuma ser **na data do evento**, não na data da venda
  (uma venda antecipada em janeiro para um show em julho só vira receita
  reconhecida em julho).

**Precisa existir:** um consumer que, ao processar `pedido.pago.v1`, grava
o valor como **receita diferida** (passivo) e um job agendado que, na data
da sessão, move o valor para receita reconhecida — dois lançamentos
contábeis automáticos, nunca manuais.
**Prioridade: P1 — importa para fechamento mensal, não para operação diária.**

---

## D. ESTORNO (atualizado com o que o vídeo mostrou)

O esqueleto que já entreguei (`modules/estorno`) precisa de três acréscimos
que não estavam nos prints originais:

### D.1 Alçada financeira
Aprovação não é um usuário genérico — é hierárquica por valor.
```
até R$ 500     → Supervisor
R$ 500–5.000   → Gerente Financeiro
acima de 5.000 → Diretor
```
**Precisa existir:** campo `alcadaNecessaria` calculado na criação da
`SolicitacaoEstorno` (função pura, tabela de faixas configurável por
tenant) + validação no `aprovar()` conferindo o cargo do `atorId`.

### D.2 Preservação em voucher
Alternativa ao reembolso em dinheiro: o cliente aceita crédito para uso
futuro (visto no vídeo: "R$ 348,00 — 30% preservado"). Isso muda a
contrapartida do lançamento no ledger — em vez de saída de caixa, vira um
passivo de crédito (`VoucherCredito`, com validade e queima parcial).
**Precisa existir:** nova tabela `VoucherCredito` no schema `estorno`, e a
`EstornoPolicy` ganha um novo campo de decisão: `ofereceVoucher: boolean`
(normalmente true para "arrependimento", false para "evento cancelado" —
nesse caso a lei exige dinheiro de volta, não crédito).

### D.3 Zona de segurança / taxa de chargeback
Card "Meta operacional ≤ 1,00%" monitorando `chargebacks / total transações`
por janela móvel. **Precisa existir:** job agendado que recalcula a taxa a
cada N minutos e grava num read model; se ultrapassar o limite, publica
`estorno.zona_seguranca_violada.v1` (evento novo) que o Incident Center
(A.4) escuta.
**Prioridade: P0 para D.1 (bloqueia aprovação correta), P1 para D.2/D.3.**

---

## E. MARKETING & REMARKETING

### E.1 Dashboard Marketing / Status Real das Campanhas
Já detalhado na análise anterior: reconciliação entre status declarado
pela plataforma de ads (Meta/Google/TikTok/Spotify) e entrega real
(impressões nas últimas 6h). **Não é uma query ao vivo** — é um job.

**Precisa existir:**
- `CampanhaSyncJob` (cron, a cada poucos minutos): chama a Graph API /
  Google Ads API / TikTok Ads API / Spotify Ads API, compara
  `status_plataforma` vs. `impressoes_6h > 0`
- Tabela `DiagnosticoCampanha`: quando inconsistente, grava a causa
  (`ad_set_pausado`, `criativo_reprovado`, `saldo_esgotado`, `conta_bloqueada`)
  — o texto "Inconsistência de veiculação: campanha marcada como Ativa no
  Meta Ads, mas o Grupo de Anúncios correspondente foi pausado" visto no
  vídeo é literalmente esse diagnóstico automatizado, não um humano digitando.
**Prioridade: P1.**

### E.2 CAPI / Pixels & Conversões
Conversion API server-side. **O que é peculiar aqui:** deduplicação. Se o
pixel do navegador E o evento server-side (CAPI) reportam a mesma compra,
sem dedup o Meta conta a venda duas vezes e o ROAS mostrado mente para
menos (parece pior do que é, porque o denominador de investimento é
o mesmo mas o CPA calculado erra).

**Precisa existir:** ao publicar `pedido.pago.v1`, gerar um `event_id`
determinístico (ex.: hash do `pedidoId`) e usar o MESMO id no pixel
client-side (via um parâmetro devolvido na resposta do checkout) e na
chamada CAPI server-side. O Meta deduplica automaticamente por esse id.
**Prioridade: P1.**

### E.3 Atribuição Multicanal
Qual canal "ganha" a venda quando o cliente veio de Instagram Ads, depois
voltou por e-mail, depois comprou direto pelo Google? Modelo mínimo viável:
**last non-direct click** (ignora acessos diretos, atribui ao último canal
pago/orgânico antes da compra). Modelos mais sofisticados (linear,
data-driven) ficam para depois.
**Precisa existir:** tabela de jornada por `clienteId`/sessão, populada
pela Central de UTM & Links, cruzada com `pedido.pago.v1` no momento da
compra.
**Prioridade: P2.**

### E.4 Remarketing — Régua de Recuperação
A régua de 3 etapas vista no vídeo (15min → 2h → 24h) é uma máquina de
estados sobre `inventario.reserva_criada.v1` que **não virou**
`pedido.criado.v1` dentro do TTL.

**Precisa existir:**
- Consumer de `inventario.reserva_expirada.v1` que agenda 3 jobs adiados
  (BullMQ/Redis com delay, não cron — são disparos pontuais por reserva)
- Envio via WhatsApp Business API / e-mail transacional
- Cupom dinâmico de validade curta gerado na Etapa 2, vinculado
  especificamente àquela reserva (não reutilizável)
**Prioridade: P1 — impacto direto em receita recuperada, como o próprio
card do vídeo mostra (R$ 38.450,00 recuperados).**

### E.5 Recuperação de Pagamento (Pix/Boleto pendente)
Caso especial de remarketing: o pedido **já foi criado**, mas o pagamento
Pix/boleto ainda não foi confirmado (diferente do carrinho abandonado, que
nunca chegou a gerar pedido). Precisa consumir `pedido.criado.v1` +
`pagamento.recusado.v1` = null (nem recusou nem confirmou, está "pendurado"),
com o mesmo timer de expiração do TTL de reserva.
**Prioridade: P1.**

---

## F. ATENDIMENTO / SAC

Já coberto na primeira análise (ITIL, SLA, IA). Sem novidade relevante no
vídeo além de confirmar que "Atendimento/SAC" e "Suporte a Eventos" no menu
são a mesma coisa com nomes diferentes em dois lugares — vale unificar a
nomenclatura antes de gerar código, senão o Gemini vai tratar como dois
módulos distintos.
**Prioridade: P1.**

---

## G. PLATAFORMA

### G.1 Desenvolvedor
Já é o módulo `developer` do desenho original (telemetria, outbox
inspector, feature flags, audit log, custo de LLM). O vídeo não mostrou
esta tela em detalhe — mantém o design já proposto.

### G.2 Núcleo Operacional
**Sem função definida ainda** (confirmado). Removido do roadmap de
implementação — não gerar backend para isso até existir escopo. Deixe o
item no menu como placeholder/desabilitado até então.

### G.4 Fronteira PDT ↔ Storefront (`newdawn.diskingressos.com.br`)
Os dois nascem juntos, do zero. Isso muda a estrutura do monorepo:

```
apps/api/               # backend interno completo — só o PDT fala com ele
apps/api-storefront/     # BFF público, somente leitura + checkout
apps/pdt/                 # painel interno (o que este documento inteiro descreve)
apps/storefront/          # newdawn.diskingressos.com.br — site do comprador
```

**Regra:** o Storefront nunca acessa Prisma nem os services internos
diretamente. Ele só enxerga o que as portas públicas dos módulos (ex.:
`EventosPublicService.obterLoteParaVenda`) decidem expor, através do BFF.
Toda vez que o site público precisar de um dado novo, a mudança entra pela
porta pública do módulo dono — nunca por uma rota que acessa a tabela
direto. Ver `GEMINI.md` raiz para a tabela completa PDT vs. Storefront.
**Prioridade: P0 — decisão estrutural, define a forma de toda API daqui pra frente.**

### G.3 Administração
Usuários, permissões, segurança. Modelo de autorização: RBAC simples não
basta porque "Produtor Admin" (visto no vídeo) sugere que permissão é
**escopada por produtora**, não só por papel global. Isso é ABAC leve:
`papel + tenantId + [produtoraIds autorizadas]`.
**Precisa existir:** Casbin (já estava na stack sugerida) com policy
`(papel, produtoraId, recurso, ação)`.
**Prioridade: P0 — sem isso nenhum módulo tem controle de acesso real.**

---

## Ordem de implementação sugerida (revisada com o vídeo)

```
P0 — bloqueia tudo
  1. Fronteira PDT ↔ Storefront (G.4)         ← decide a forma de toda API
  2. Ledger financeiro (C.1)                  ← já era a recomendação
  3. Contrato Comercial por produtor (A.7)    ← novo, descoberto no vídeo
  4. Inventário + Pagamentos (B.1)            ← do roadmap original
  5. Administração / Casbin (G.3)             ← novo, sem isso nada é seguro
  6. Estorno + alçada (D.1)                   ← já em andamento, +alçada

P1 — importante, não bloqueia
  6. Repasse + Antecipação (C.2)
  7. Acesso + POS offline (B.4)
  8. Remarketing / régua de recuperação (E.4, E.5)
  9. CRM / Participantes (B.2)
  10. SAC unificado (F)
  11. Marketing — Status Real + CAPI dedup (E.1, E.2)
  12. Live Operations — SSE (A.3)
  13. Readiness/Go-Live (A.6)

P2 — depois
  14. Contabilidade / DRE (C.3)
  15. Revenue & Disk Intelligence (A.5)
  16. Status Faciais (B.3)
  17. Atribuição Multicanal (E.3)
  18. Incident Center (A.4)
```

## Atualizações desta revisão
- **Núcleo Operacional (G.2):** confirmado sem função definida. Removido do
  roadmap; fica como placeholder no menu até haver escopo.
- **Fronteira PDT ↔ Storefront (G.4):** `newdawn.diskingressos.com.br` está
  sendo construído do zero junto com o PDT. Adicionada como item P0 —
  decisão estrutural que muda a forma de toda API criada daqui pra frente
  (ver `GEMINI.md` raiz).
