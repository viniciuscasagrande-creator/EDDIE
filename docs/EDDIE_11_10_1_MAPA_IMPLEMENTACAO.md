# Mapa de implementação

1. Localizar a página real de `/eventos/[eventoId]/operacao`.
2. Identificar o componente responsável pela sidebar interna mostrada dentro do modo evento.
3. Não remover rotas: mover os links para `EventContextNav`.
4. Reutilizar os widgets reais do 11.10.
5. Envolver os widgets em `EventOperationsLayout`.
6. Mapear os oito KPIs primários; mover Ticket Médio e Scanners para "Agora no Evento".
7. Criar `OperationalHealthStrip` conectado aos health/status reais existentes.
8. Substituir o aviso técnico grande por `SystemDiagnosticBanner`.
9. Procurar hardcodes `v11.4.2`, `11.4.2` e versão do shell. Substituir por build-info existente.
10. Garantir `min-w-0`, grids responsivos e ausência de `overflow-x-auto` na navegação principal.
11. Testar 1920, 1440, 1366, 1024, 768 e 390 px.
12. Não modificar regras financeiras ou transacionais.
