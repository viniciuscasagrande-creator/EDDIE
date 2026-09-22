# EDDIE 9.5 — Integração End-to-End: Fluxos de Domínio e Comunicação Assíncrona

## 1. Princípios Arquiteturais da Integração

O ecossistema **EDDIE** opera como um **Monólito Modular Orientado a Eventos (Event-Driven Modulith)**. Cada módulo representa um Bounded Context com responsabilidades bem delimitadas e armazenamento isolado em PostgreSQL.

### Regras de Ouro da Integração
1. **Schema Exclusivo por Bounded Context:** Nenhum módulo executa `JOIN` ou acessa diretamente tabelas de schemas alheios.
2. **Identificadores Escalares Compartilhados:** Quando o módulo A precisa fazer referência a uma entidade do módulo B, ele armazena o UUID como um escalar simples (`@db.Uuid` sem `@relation` do Prisma).
3. **Transactional Outbox Obrigatório:** Toda emissão de evento de domínio é gravada na tabela `platform.outbox_messages` dentro da mesma transação de banco de dados que persiste o dado de negócio.
4. **Idempotência Garantida na Recepção:** Todo consumer registra o `eventId` na tabela `platform.processed_events` antes de executar sua lógica, descartando duplicidades com custo zero.
5. **Ledger como Fonte da Verdade Financeira:** Nenhum módulo cria tabelas paralelas de saldo. Todo impacto financeiro se materializa em partidas dobradas no Ledger.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     EVENTOS     │       │   FINANCEIRO    │       │  CONTABILIDADE  │
│ (schema: eventos│       │(schema: financei│       │(schema: contabi)│
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │  evento.publicado.v1    │                         │
         ├────────────────────────>│                         │
         │                         │                         │
         │  pedido.pago.v1         │                         │
         ├────────────────────────>│                         │
         │                         │  partidas dobradas      │
         │                         ├────────────────────────>│
         │                         │                         │
         │  estorno.aprovado.v1    │  reversão ledger        │
         ├────────────────────────>├────────────────────────>│
         │                         │                         │
┌────────┴────────┐                │                         │
│     ESTORNO     │────────────────┘                         │
│ (schema: estorno│                                          │
└─────────────────┘                                          │
         ▲                                                   │
         │ triagem CDC Art. 49                               │
┌────────┴────────┐                                          │
│       SAC       │                                          │
│  (schema: sac)  │                                          │
└─────────────────┘                                          │
```

---

## 2. Fluxos Operacionais de Ponta a Ponta

### Fluxo 1: Da Captação Comercial ao Lançamento do Evento
1. **Comercial B2B:** Equipe comercial cadastra a produtora parceira em `crm.produtores_b2b`, registra oportunidades e negocia a taxa de serviço (ex: 10% de conveniência). Ao aprovar a condição, o evento `comercial.condicao_aprovada.v1` é publicado.
2. **Eventos:** O produtor loga no PDT, seleciona sua produtora e cria o Evento, definindo sessões, mapa de assentos/setores e lotes com vigência temporal. O evento é publicado com o evento `evento.publicado.v1`.
3. **Marketing:** A equipe de marketing cria links dinâmicos com parâmetros UTM e ativa o catálogo de pixels server-side (Meta CAPI, TikTok, Google) configurados para o `eventoId`.

### Fluxo 2: Compra de Ingressos, Ledger e Apropriação Contábil
1. **Storefront / Checkout:** O comprador final adquire o ingresso. O gateway processa o pagamento e publica `pedido.pago.v1` contendo o split de valores:
   - Valor Face do Ingresso: R$ 200,00 (recurso do produtor)
   - Taxa de Conveniência: R$ 20,00 (receita própria da DiskIngressos)
2. **Financeiro (Consumer Idempotente):**
   - Cria os registros na tabela `financeiro.lancamentos_ledger`:
     - Débito: `conta_caixa_gateway` (+R$ 220,00)
     - Crédito: `produtor.bucket_retido` (+R$ 200,00)
     - Crédito: `diskingressos.receita_taxa` (+R$ 20,00)
3. **Contabilidade (Consumer Idempotente):**
   - Cria o `LancamentoContabil` com duas partidas dobradas:
     - Partida 1: D: Bancos Conta Movimento / C: Recursos de Terceiros a Repassar (Produtores)
     - Partida 2: D: Bancos Conta Movimento / C: Receita de Prestação de Serviços (Taxas)
   - O DRE Gerencial atualiza em tempo real a segregação entre Receita Própria vs Recursos de Terceiros.

### Fluxo 3: Triagem de Reclamação no SAC, Estorno CDC e Compensação Financeira
1. **SAC:** O comprador entra em contato via telefone ou WhatsApp. O atendente abre a tela de SAC e consulta o CPF do comprador em menos de 1 segundo. Localiza o pedido e constata que a compra ocorreu há 3 dias (dentro do prazo de 7 dias do CDC Artigo 49).
2. **Abertura de Estorno:** O atendente clica em "Solicitar Estorno". O formulário já preenche o `pedidoId`, `compradorId` e calcula elegibilidade positiva ao Art. 49 sem retenção de taxa.
3. **Decisão do Operador:** O operador financeiro acessa a tela de Estornos, visualiza o checklist automático e clica em **Aprovar**.
4. **Execução Automática no Ledger:**
   - O serviço de estorno publica `estorno.aprovado.v1`.
   - O Financeiro estorna o valor correspondente no Ledger (`produtor.bucket_retido` ou `reserva_estorno`).
   - O gateway efetua o estorno no cartão do cliente ou Pix reverso.
   - A Contabilidade emite o lançamento contábil estornando a receita apropriada.
   - O ticket SAC é concluído com a nota de resolução gravada.

### Fluxo 4: Operação de Campo no Dia do Evento (Suporte & Acesso)
1. **Acesso:** As catracas conectadas sincronizam os ingressos e QR Codes assinados digitalmente.
2. **Suporte a Eventos:** Caso um setor da portaria enfrente instabilidade no link de internet ou na impressora de bilheteria física, o produtor ou líder de campo abre um chamado de suporte em `/suporte`.
3. **Atendimento em Tempo Real:** A equipe técnica central monitora a fila de incidentes agrupada pelo `eventoId` ativo, altera o status para `em_andamento` e resolve o problema, gravando a solução para auditoria.

---

## 3. Matriz de Eventos de Domínio do Ecossistema

| Evento de Domínio | Módulo Emissor | Payload Principal | Consumers Principais |
|---|---|---|---|
| `produtor.criado.v1` | `comercial` | `produtorId`, `cnpj`, `razaoSocial` | `eventos`, `financeiro` |
| `evento.publicado.v1` | `eventos` | `eventoId`, `produtorId`, `nome`, `data` | `marketing`, `financeiro`, `contabilidade` |
| `pedido.pago.v1` | `checkout` / `storefront` | `pedidoId`, `eventoId`, `valorFaceCents`, `taxaCents` | `financeiro`, `contabilidade`, `marketing` |
| `estorno.solicitado.v1` | `estorno` / `sac` | `estornoId`, `pedidoId`, `motivo`, `valorCents` | `estorno`, `auditoria` |
| `estorno.aprovado.v1` | `estorno` | `estornoId`, `pedidoId`, `valorAprovadoCents` | `financeiro`, `contabilidade`, `sac` |
| `repasse.solicitado.v1` | `financeiro` | `repasseId`, `produtorId`, `valorCents`, `chavePix` | `financeiro`, `auditoria` |
| `ocorrencia.registrada.v1` | `suporte` | `ocorrenciaId`, `eventoId`, `tipo`, `severidade` | `suporte`, `telemetria` |
