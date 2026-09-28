# Módulo de Inventário & Gestão de Capacidade (EDDIE 11.29.2)

## Responsabilidade
Motor de **Inventário Transacional, Pools de Lotes/Setores, Holds com TTL de 10 min e Anti-Overselling**:
- `InventoryPool`: capacidade total, disponível, reservada, vendida e bloqueada por lote/setor com trava de concorrência (`versaoLock`).
- `InventoryHold`: bloqueio temporário (carrinho) com TTL estrito de 10 minutos para garantir que o cliente finalize a compra com assentos/vagas garantidos.
- `InventoryItem`: alocação individual por assento físico/lógico ou cota nominal (`DISPONIVEL`, `RESERVADO`, `VENDIDO`, `BLOQUEADO`, `CORTESIA`).
- `anti-overselling`: validação transacional e otimista de capacidade atômica, evitando venda acima da capacidade sob picos de concorrência.
- `Hold Expiration Worker`: expiração automática de holds vencidos (> 10 min), restaurando imediatamente a capacidade para o pool e emitindo o evento `inventario.reserva_expirada.v1`.
- `Hold Confirmation`: conversão do hold em venda no momento da confirmação de pagamento do pedido, promovendo itens para `VENDIDO` e atualizando a capacidade vendida.
- Public Service (`InventarioPublicService`): porta pública para consumo por `pedidos`, `api-storefront` e checkout público sem acesso direto ao banco.
