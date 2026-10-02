# EDDIE 11.4 — Event OS: Ciclo Completo do Evento

Baseline: EDDIE 11.3 (derivado do 11.2 HOMOLOGADO). Objetivo: tornar Evento o contexto operacional central do painel do produtor.

## Regra de navegação
- `/eventos`: visão geral de todos os eventos do produtor.
- `/eventos/:eventoId/*`: Modo Evento. A sidebar passa a exibir o menu individual e todo módulo recebe o mesmo eventoId.
- Retorno explícito para Todos os Eventos.

## Menu individual
Dashboard; Ingressos & Pedidos; Mapa, Setores & Cortesias; Financeiro; Marketing; Remarketing; Relatórios; Detalhes & Configurações.

## Regra transacional
Evento → Sessão → Setor → Lote/Tipo → Pedido → Ingresso único → Pagamento → condição comercial do evento → Ledger → liquidação → saldo → repasse.
Pedido, ingresso, pagamento e lançamento Ledger são identificadores distintos.

## Regra comercial
Preço de face pertence ao produtor. A remuneração DiskIngressos é negociada por produtor/evento. `CondicaoComercial.eventoId` é a especialização. Foram adicionados modelo percentual/fixo/híbrido, taxa fixa, spread e Advanced. A taxa global legada do produtor não deve sobrescrever condição específica aprovada do evento.

## Marketing por evento
Pixels/Conversões, UTM, GA4, tráfego do site, Meta Ads, TikTok Ads e Spotify Ads trabalham no evento ativo. Um evento pode possuir múltiplos pixels.

## Segurança de dados
Nenhum GMV, pedido, ingresso ou pagamento é inventado. O resumo Event OS usa Ledger real para saldo e o espelho `Lote.vendidos` somente como indicador. O próprio schema documenta que `vendidos` não é fonte da verdade do inventário.

## Pendência arquitetural explícita
A API Storefront ainda contém stubs no checkout. O 11.4 NÃO cria uma tabela paralela de Pedido/Ingresso dentro de Eventos. A persistência transacional deve ser implementada no bounded context apropriado (Pedidos/Pagamentos/Inventário) e emitir os eventos de domínio já consumidos por Financeiro, Contabilidade, Marketing e Eventos.
