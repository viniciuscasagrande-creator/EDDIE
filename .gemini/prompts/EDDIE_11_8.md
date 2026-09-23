# EXECUÇÃO — EDDIE 11.8 OPERAÇÃO REAL PONTA A PONTA

Leia:
- EDDIE_11_8_OPERACAO_REAL_PONTA_A_PONTA.md
- docs/EDDIE_11_8_CONTRATOS_TRANSACIONAIS.md
- docs/EDDIE_11_8_MODELO_FINANCEIRO.md

Implemente em massa SOBRE a arquitetura existente.

ORDEM:
1. Audite models, services, Ledger, Prisma, pedidos e pagamentos existentes. REUTILIZE antes de criar.
2. Feche inventário/reserva com transação e concorrência.
3. Feche pedido e snapshot comercial do evento.
4. Crie adapters de pagamento; não invente credenciais nem marque pagamento como pago.
5. Implemente webhook assinado/idempotente.
6. Emita ingresso e QR somente após confirmação real.
7. Implemente check-in atômico.
8. Integre pagamento confirmado ao Ledger existente via outbox.
9. Feche liquidação/saldo elegível/repasse sem duplicar módulos financeiros.
10. Conecte telas do Event OS aos endpoints reais.
11. Adicione testes de concorrência/idempotência e estados de erro.
12. Build API + PDT + Prisma validation + typecheck/lint/testes disponíveis.

PROIBIDO:
- mocks apresentados como produção;
- floats para dinheiro;
- armazenar PAN/CVV;
- QR com PII;
- webhook sem verificação;
- duplicar Ledger;
- saldo disponível antes da liquidação;
- apagar funcionalidades para o build passar;
- push/deploy sem autorização.

Ao final produza relatório com:
arquivos alterados, migrations, endpoints, testes, pendências de credenciais/providers e resultado dos builds.
