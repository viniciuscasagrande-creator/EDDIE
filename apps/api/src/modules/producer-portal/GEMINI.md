# Producer Financial Portal & Self-Service — Contexto Local (EDDIE 11.23)

## Responsabilidade do Módulo
Fornecer a experiência financeira de autoatendimento para o Produtor: Início Financeiro consolidado, saldos por evento derivados do 11.19, extratos detalhados, transparência de taxas negociadas, agenda de repasses com comprovantes, transferências entre eventos próprios via workflow, estornos, chargebacks, fluxo de caixa segregado (realizado vs projetado), DRE gerencial, documentos, dados bancários seguros e central de solicitações com protocolos e timeline.

## Regras Invioláveis do Módulo
1. **11.23 NUNCA escreve no Ledger.** Todo dado financeiro deriva estritamente das portas públicas do 11.19 (`FinanceiroPublicService`). Solicitações de transferência e alteração cadastral são encaminhadas ao workflow do 11.19/11.20 via Outbox.
2. **Isolamento Estrito Multi-Tenant:** O Produtor A jamais consegue visualizar ou acessar informações financeiras, eventos, documentos, extratos ou solicitações do Produtor B. Manipulação de `producerId`, `eventId` ou URLs de outros produtores resulta imediatamente em 403 Forbidden.
3. **Bloqueio de Transferência Cross-Producer:** Transferências de saldo são permitidas exclusivamente entre eventos pertencentes ao mesmo produtor titular. Tentativas de transferir para eventos de terceiros são bloqueadas na raiz.
4. **Sem Exposição de Segredos Internos:** O módulo não expõe contabilidade interna completa, margens proprietárias da Disk, dados de terceiros ou regras internas de motores antifraude.
5. **Dados Bancários Mascarados:** Dados bancários são exibidos mascarados. Solicitações de alteração de dados bancários não redirecionam repasses em andamento sem homologação prévia da Disk.
