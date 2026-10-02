# EDDIE 11.5 — Núcleo Transacional do Event OS

Baseline: EDDIE 11.4.2 HOMOLOGADO.

## Objetivo
Fechar a primeira metade da cadeia real de venda: Evento → Lote → Reserva → Pedido → Pagamento → Ingresso, preservando a condição comercial específica do evento.

## Regras obrigatórias
- preço de face vem do lote/evento e é definido pelo produtor;
- taxa Disk não é global: usa CondicaoComercial aprovada do produtor/evento;
- modelos percentual, fixa e híbrida;
- snapshot da condição no pedido;
- pedido, ingresso, pagamento, evento e Ledger têm IDs/números independentes;
- nenhum pagamento é aprovado automaticamente;
- nenhum pedido/ingresso demonstrativo;
- evento sem condição comercial aprovada não vende.

## Endpoints
- POST /api/pedidos/reservas
- POST /api/pedidos
- POST /api/pedidos/:id/pagamentos/confirmar
- GET /api/pedidos/evento/:eventoId/consulta?q=

## Event OS
`/eventos/:eventoId/ingressos` consulta a fonte transacional real e apresenta Pedido, Comprador, Status, Total, Taxa Disk e quantidade de ingressos.

## Próxima camada
Inventário concorrente/Redis, webhook assinado do gateway, PIX/cartão, outbox `pedido.pago.v1`, QR verificável, check-in e liquidação automática.
