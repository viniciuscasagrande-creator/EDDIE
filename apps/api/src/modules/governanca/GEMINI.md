# governanca — EDDIE 11.31: Central de Dados, Qualidade, Governança e Auditoria

## Responsabilidade do Bounded Context

O módulo `governanca` é o guardião da verdade de dados no ecossistema EDDIE:
- **Não inventa dados:** Não é uma segunda fonte da verdade. Observa, compara, rastreia e audita as fontes transacionais oficiais (`pedidos`, `pagamentos`, `financeiro`, `contabilidade`, `tesouraria`, `portaria`, `marketing`).
- **Qualidade dos Dados & Validação Cruzada:** Executa regras de integridade relacional entre camadas (pedido pago sem ingresso, ingresso sem pedido, check-in sem ingresso, pedido sem reflexo no ledger, partidas dobradas, repasse sem ordem bancária).
- **Conciliação Sistêmica em Múltiplas Camadas:** Decomposição ponta a ponta: Pedido ↔ Pagamento ↔ Ledger ↔ Contabilidade ↔ Tesouraria ↔ Banco, discriminando MDR e apurando divergência líquida real.
- **Central de Divergências:** Transforma anomalias em fluxo de trabalho acionável (`NOVA` → `EM_ANALISE` → `EM_CORRECAO` → `CORRIGIDA` / `ENCERRADA`) com severidade, responsável funcional e SLA.
- **Linhagem dos Dados & Centro de Investigação:** Árvore causal auditável de qualquer indicador até a transação de origem, com busca universal por termo (Pedido, TID, NSU, CPF, QR Code, Correlation ID) e linha do tempo de ciclo de vida.
- **Catálogo de Dados & Definições Oficiais:** Dicionário corporativo corporativo único para métricas (GMV, Receita Disk, Saldo, Ingressos, Público Validado, etc.) com dono funcional do dado.
- **Auditoria Central Append-Only:** Registro imutável de operações críticas (alteração de taxa, estornos, permissões, etc.) com "antes" e "depois", usuário, IP e Correlation ID. Auditoria estrita de exportações LGPD.
- **Saúde das Integrações & Eventos:** Telemetria de conectores externos (Meta, Google, TikTok, WhatsApp, Adquirentes, Bancos) e Outbox interna com reprocessamento seguro e idempotente.
- **Gate de Governança para Fechamento de Eventos (11.24):** Bloqueio obrigatório de fechamento se houver divergência crítica pendente.

## Regras Invioláveis

1. **Imutabilidade de Auditoria:** Registros de auditoria são append-only. Nenhum usuário ou administrador pode alterar ou deletar registros de log. Qualquer retificação gera novo registro de auditoria.
2. **Não inventar dados transacionais:** O módulo nunca recalcula saldos por conta própria criando lançamentos artificiais. Identifica a divergência e notifica o responsável.
3. **Privacidade e Mascaramento:** Usuários sem permissão de acesso a dados sensíveis recebem dados mascarados (CPF, Telefone, E-mail).
4. **Segregação Estrita de Acesso:** Painel administrativo interno da DiskIngressos. Produtor não tem acesso irrestrito a configurações de governança.
5. **Zero `any`:** `strict: true` e tipagem estrita com contratos Zod e Prisma Decimal para valores financeiros.
