# EDDIE 10.4 — Central de Relatórios Enterprise

Pacote baseado no EDDIE 10.3. Implementa um menu exclusivo **Relatórios**, com painel organizado na ordem: **Financeiro → Eventos → Contábil → Comercial B2B → Marketing → SAC → Estornos → Operacional**.

## Entregas
- Central visual com mais de 50 modelos de relatório.
- Submenu exclusivo de Relatórios na sidebar.
- Rotas individuais `/relatorios/[categoria]/[slug]`.
- Endpoint genérico real `GET /relatorios/:categoria/:slug` preservando endpoints consolidados existentes.
- Filtros de contexto produtor/evento.
- Exportação JSON e impressão/PDF pelo navegador.
- Estados vazios/erro/loading sem inventar métricas.
- Relatórios financeiros, eventos, contábeis, comerciais, marketing, SAC, estornos e operacional.

## Regra de produção
Não criar dados demonstrativos para preencher cards. Todo resultado deve vir da API/Prisma; sem registros deve aparecer estado vazio.
