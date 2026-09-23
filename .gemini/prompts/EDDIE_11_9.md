# EXECUÇÃO EDDIE 11.9

Leia:
- EDDIE_11_9_PORTARIA_ANTIFRAUDE_CONCILIACAO_CHARGEBACK.md
- docs/EDDIE_11_9_CONTRATOS_OPERACIONAIS.md
- docs/EDDIE_11_9_TELAS.md
- EDDIE_11_8_OPERACAO_REAL_PONTA_A_PONTA.md

Implemente em massa sobre a arquitetura existente.

PRIORIDADE:
1. auditar check-in, pagamentos, Ledger, estorno, conciliação e Prisma existentes;
2. reutilizar antes de criar;
3. check-in atômico + dispositivos/operadores;
4. atualização operacional em tempo real usando infraestrutura já disponível (SSE/WebSocket/polling controlado);
5. sinais antifraude explicáveis;
6. conciliação gateway × pedido × ledger × banco;
7. chargeback e estorno com reversões referenciadas;
8. telas Portaria, Antifraude, Conciliação, Chargebacks/Estornos;
9. testes de corrida, idempotência e duplicidade;
10. build API/PDT + Prisma validate + typecheck/lint/test.

NÃO:
- duplicar módulos existentes;
- usar mocks como produção;
- inventar credenciais;
- baixar automaticamente conciliação ambígua;
- concluir estorno sem confirmação necessária;
- apagar histórico financeiro;
- expor PII/segredos no QR/log;
- remover funções para fazer build passar;
- push/deploy sem autorização.

Produza relatório final de arquivos, migrations, endpoints, testes, integrações pendentes e builds.
