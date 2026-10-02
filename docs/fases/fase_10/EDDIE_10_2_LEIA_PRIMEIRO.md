# EDDIE 10.2 — Integração, Endpoints e Relatórios

Este pacote parte do EDDIE 10.1 homologado e resolve a ausência de uma Central de Relatórios visível no menu.

Principais entregas:
1. novo módulo NestJS `relatorios`;
2. dez endpoints reais de relatório;
3. nova rota Next.js `/relatorios`;
4. item Central de Relatórios na sidebar;
5. filtros herdados do contexto Produtor/Evento;
6. exportação JSON sem inventar dados;
7. relatórios para Eventos, Financeiro, Contabilidade, Comercial B2B, Marketing, SAC, Suporte e Estornos.

A API continua sendo a fonte de verdade. Não reintroduzir stores em memória nem números demonstrativos.
