# EDDIE 10.1 — Expansão Funcional Enterprise

Baseline: EDDIE 10.0 homologado.

## Objetivo
Aumentar de forma visível a profundidade operacional do EDDIE, preservando arquitetura, Design System, contexto Produtor × Evento e a regra de dados reais.

## Código incluído
- Contabilidade: Plano de Contas, Fechamento Mensal, Demonstrativos e Auditoria Contábil.
- Comercial B2B: Leads, Propostas, Contratos & Ativação, Metas e Relatórios.
- Marketing/Remarketing: Automações, WhatsApp, E-mail, Carrinho Abandonado, Afiliados, Públicos & Segmentação e Integrações de Mídia.
- Componente compartilhado `OperationalPanel` com estados vazios honestos, sem mocks.

## Regra de implementação
As novas telas são superfícies operacionais prontas para conexão aos endpoints reais. Não criar números demonstrativos. Cada próxima conexão deve fechar UI → validação → API → regra → Prisma/Ledger → resposta → atualização → erro/auditoria.

## Próximo aprofundamento
Eventos: cadastro/edição, sessões, setores, lotes, tipos de ingresso, capacidade, canais e equipe/permissões.
Financeiro: aprofundar operações já presentes com endpoints reais.
SAC/Suporte/Estorno: fluxos operacionais completos e integração.
