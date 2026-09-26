# EDDIE 11.23 — Mapa de Telas & Arquitetura Visual do Portal do Produtor

Este documento apresenta a especificação detalhada de telas, navegação, componentes e estados visuais do **Portal Financeiro do Produtor (EDDIE 11.23)**.

---

## 1. Visão Geral da Interface

- **Rota Canônica:** `/financeiro/portal-produtor`
- **Público-Alvo:** Produtores de eventos parceiros da DiskIngressos.
- **Identidade Visual:** Dark Theme padronizado (Zinc-950 com acentos Indigo, Emerald, Sky, Rose e Amber).
- **Diretriz de Design:** 100% pt-BR, dados acionáveis, tipografia monoespaçada para valores monetários e identificadores, contraste WCAG AAA e eliminação de gráficos meramente decorativos.

---

## 2. Mapa das 12 Abas Operacionais

### 1. Início Financeiro & Conta Consolidada (`tab=inicio`)
- **Top Balance Cards:**
  - *Saldo Disponível:* Valor líquido liberado para repasse ou transferência imediata (em verde esmeralda).
  - *Vendas a Receber (Retido):* Saldo de ingressos vendidos com liberação programada conforme política do evento.
  - *Reserva de Estornos:* Fundo de garantia para suporte a estornos e contestações CDC.
  - *Próximo Repasse:* Data do próximo lote programado e valor estimado.
- **Card de Segurança & Isolamento:**
  - Nome da produtora titular, banco cadastrado mascarado, chave PIX mascarada e atalho para alteração cadastral.
- **Tabela Rápida de Eventos:**
  - Resumo de vendas, receita bruta e saldo disponível por evento.

### 2. Meus Eventos & Saldos Individuais (`tab=saldos`)
- Grid de cards de eventos pertencentes ao produtor autenticado.
- Cada card exibe:
  - Nome do evento, local e status operacional.
  - Saldo disponível para repasse.
  - Receita bruta acumulada.
  - Valor retido a liberar.
  - Taxa contratada vigente (Fixa ou Percentual com número da versão).
  - Botão de drill-down para o extrato individual do evento.

### 3. Extrato Financeiro Detalhado (`tab=extrato`)
- Tabela operacional com lançamentos cronológicos em UTC/pt-BR.
- Colunas: Data/Hora, Descrição do Fato, Categoria, Referência do Pedido/Lote, Tipo (Crédito/Débito), Valor e Saldo Resultante.
- Todos os dados derivam estritamente do Ledger 11.19. O frontend não recalcula saldos por conta própria.

### 4. Taxas Negociadas por Evento (`tab=taxas`)
- Painel de transparência de condições comerciais acordadas.
- Exibição de taxas percentuais (ex: 10.0%) ou fixas (ex: R$ 5,00 por ingresso).
- Histórico completo de versões vigentes e encerradas.
- Selo de garantia: *"Preservação Histórica Inviolável — alterações comerciais nunca modificam os snapshots das vendas passadas."*

### 5. Agenda de Repasses & Comprovantes (`tab=repasses`)
- Cronograma de lotes de repasse com status: `PREVISTO`, `AGENDADO`, `PAGO`, `CONCILIADO`, `BLOQUEADO`.
- Tabela com Lote/Referência, Evento, Data Programada, Status, Destino Bancário Mascarado e Valor Líquido.
- Botão "Comprovante" para repasses com status `PAGO`, abrindo modal com autenticação bancária e código de rastreio.

### 6. Transferências entre Meus Eventos (`tab=transferencias`)
- Formulário e modal para movimentação de recursos entre eventos do MESMO produtor.
- Seleção de Evento de Origem (Débito) e Evento de Destino (Crédito).
- Validação de saldo disponível antes do envio.
- Envio direto para o workflow do Control Tower 11.20 com geração de protocolo único.
- Bloqueio sumário para eventos de terceiros (403 Forbidden).

### 7. Estornos & Chargebacks (`tab=estornos`)
- Lista de estornos aprovados com impacto transparente no bucket de Reserva de Estorno.
- Lista de contestações bancárias (chargebacks) em aberto com data de notificação, prazo limite de defesa e motivo alegado.
- Proteção contra vazamento: não expõe regras internas antifraude nem scores de risco proprietários da Disk.

### 8. Fluxo de Caixa (`tab=fluxo`)
- **Segregação Rigorosa:**
  - *Fluxo Realizado:* Repasses efetivamente liquidados e entradas transitadas pelo Ledger.
  - *Fluxo Projetado:* Vendas parceladas a receber dos adquirentes e repasses agendados futuros.

### 9. DRE Gerencial do Evento (`tab=dre`)
- Demonstrativo do Resultado com: Receita Bruta de Ingressos, deduções de Taxa Disk, taxas de gateway, estornos deduzidos, despesas cadastradas e Resultado Líquido do Produtor.
- Disclaimer obrigatório: *"DRE gerencial para acompanhamento operacional do produtor. Não substitui demonstrações contábeis oficiais nem escrituração fiscal."*

### 10. Documentos & Informes (`tab=documentos`)
- Central de download de comprovantes, informes anuais de rendimento, relatórios de fechamento e contratos.
- Todos os downloads validam titularidade estrita antes de entregar o arquivo.

### 11. Dados Bancários & Alteração (`tab=dados_bancarios`)
- Visualização de dados bancários mascarados (Agência, Conta, Chave PIX).
- Formulário de alteração de domicílio bancário com justificativa e upload de comprovante.
- Aviso de segurança: lotes de repasse em andamento não são redirecionados automaticamente.

### 12. Central de Chamados & Protocolos (`tab=solicitacoes`)
- Acompanhamento de todas as solicitações (transferências, alteração bancária, dúvidas de repasse).
- Timeline detalhada com carimbo de tempo, autor e evolução de status (`PENDENTE`, `EM_ANALISE`, `APROVADO`, `CONCLUIDO`).

---

## 3. Estados Visuais do Sistema

| Estado | Tratamento Visual |
|---|---|
| **Loading** | Spinner discreto com texto contextual em pt-BR (*"Carregando informações financeiras..."*) |
| **Empty** | Card com ícone temático e mensagem explicativa (*"Nenhum repasse agendado para o período."*) |
| **Error** | Alerta em vermelho com código de erro e botão de tentar novamente |
| **Forbidden (403)** | Bloqueio de tela com aviso de violação de ownership (*"Acesso negado: este recurso pertence a outro produtor."*) |
| **Pending Review** | Badge em âmbar com carimbo de tempo e número do protocolo em acompanhamento |
