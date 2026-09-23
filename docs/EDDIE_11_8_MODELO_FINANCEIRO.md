# Modelo financeiro — Venda até Repasse

Exemplo conceitual, sem valores fixos:
1. pagamento confirmado registra obrigação ao produtor e componentes da taxa conforme condição comercial do evento;
2. liquidação do adquirente move valor de `a_liquidar` para `liquidado`;
3. bloqueios/chargebacks reduzem elegibilidade;
4. saldo disponível = liquidado elegível - compromissos - bloqueios - repasses já programados;
5. repasse baixa obrigação ao produtor e registra saída da conta de liquidação.

Não criar regra contábil paralela: integrar ao Ledger/Plano de Contas existentes.
Toda reversão referencia o lançamento original.
