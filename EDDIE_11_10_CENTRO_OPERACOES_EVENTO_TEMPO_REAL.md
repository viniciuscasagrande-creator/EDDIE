# EDDIE 11.10 — Centro de Operações do Evento em Tempo Real

## Missão
Criar a sala operacional única do evento ao vivo, sem duplicar os módulos existentes.

Contexto:
Produtor → Evento → Sessão → Operação ao Vivo.

O Centro agrega dados de Vendas, Inventário, Portaria, Financeiro, Marketing, Tráfego, Antifraude e Incidentes.

## Tela principal
### Cabeçalho
Evento, ID, sessão, local, data/hora, status operacional, última atualização e seletor de sessão.

### KPIs
- Receita confirmada
- Pedidos pagos
- Ingressos emitidos
- Ocupação
- Check-ins
- Pessoas dentro
- Entradas/minuto
- Restantes
- Pagamentos pendentes/falhos
- Alertas críticos

### Bloco Vendas
Ritmo de vendas em tempo real; quantidade × valor; ticket médio; modalidades; setores/lotes; meios de pagamento.

### Bloco Portaria
Entradas/minuto, check-ins válidos/recusados, scanners online, portarias, filas e últimas leituras.

### Bloco Inventário
Capacidade, disponível, reservado, vendido, bloqueado, cortesias e ocupação por setor.

### Bloco Financeiro
Bruto confirmado, taxa Disk, valor produtor, a liquidar, liquidado, disponível, bloqueado e repasses. Nunca somar pedido pendente como receita confirmada.

### Bloco Marketing e Tráfego
Sessões/visitas quando disponíveis, origem/canal, campanhas, conversões, UTM, ROAS/CPA somente quando houver dados reais e atribuição válida.

### Bloco Risco/Antifraude
Alertas abertos, QR duplicado, dispositivos suspeitos, chargebacks e anomalias.

### Timeline operacional
Feed cronológico de eventos importantes: venda, pagamento, emissão, check-in, alerta, incidente, bloqueio, estorno, falha de gateway etc.

## Atualização em tempo real
Preferência: reutilizar infraestrutura SSE/WebSocket existente.
Fallback: polling controlado com backoff.
Cada payload possui eventoId, sessaoId quando aplicável, occurredAt, correlationId e sequence/version.
Cliente deve tolerar reconexão e evitar duplicidade.

## Centro de Alertas
Severidades: INFO, ATENCAO, ALTA, CRITICA.
Categorias: VENDAS, PAGAMENTOS, PORTARIA, INVENTARIO, FRAUDE, FINANCEIRO, MARKETING, INFRAESTRUTURA.
Alertas podem ser reconhecidos e atribuídos; críticos permanecem visíveis até resolução/ack conforme regra.

## Incidentes
Criar incidente a partir de alerta ou manualmente.
Estados: ABERTO, EM_TRATAMENTO, MONITORANDO, RESOLVIDO.
Campos: evento, sessão, categoria, severidade, responsável, descrição, timeline, ações e resolução.
Não duplicar o módulo SAC/ITIL; integrar/referenciar quando já existir incidente corporativo.

## Permissões
Operador de portaria vê operação de entrada; financeiro vê detalhes financeiros; marketing vê campanhas/tráfego; gestor do evento vê visão consolidada conforme RBAC.

## Desempenho
A tela não deve recarregar inteira.
Widgets atualizam isoladamente.
Virtualizar timelines grandes.
Pausar/reduzir atualização quando aba não estiver visível.
Indicador claro de conexão: AO VIVO, RECONECTANDO, DESATUALIZADO.

## Estados
loading, vazio, erro parcial, erro total e sucesso.
Falha de Marketing não derruba Portaria.
Falha financeira não derruba check-in.

## Homologação
- evento/sessão corretos em todos os widgets;
- check-in aparece no painel sem reload integral;
- venda paga atualiza KPIs sem duplicar;
- reconexão não duplica eventos;
- widget com falha degrada isoladamente;
- alertas críticos ficam visíveis;
- nenhum mock apresentado como real;
- pt-BR;
- navegação sem scrollbar horizontal.
