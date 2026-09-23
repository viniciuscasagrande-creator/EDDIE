# EDDIE 11.6 — Eventos Operacionais

Objetivo: reproduzir a lógica operacional das telas de referência enviadas pelo usuário sem copiar CSS legado.

## Entregue
- `/eventos`: visão geral horizontal com Ativos/Inativos/Todos, busca, receita, vendas, disponibilidade, cortesia e ocupação.
- Modo Evento com sidebar contextual no padrão da referência.
- Dashboard individual com KPIs, ritmo de vendas, meios de pagamento, gráficos por período e modalidades.
- Mapa com fluxo Escolher modo → Tipo de cortesia → Selecionar → Confirmar, legenda operacional e suporte a inventário real.
- Financeiro, Marketing e Remarketing continuam vinculados ao mesmo `eventoId`.

## Regra de dados
Não inventar faturamento, pedidos ou inventário. A UI apresenta `—`/estado vazio quando a API não fornecer o dado. A grade demonstrativa do mapa é explicitamente marcada como pré-visualização estrutural.
