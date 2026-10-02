# EDDIE 10.6 — Frente A Consolidada

Baseline operacional: EDDIE 10.3 HOMOLOGADO.

Este pacote consolida, sem substituir a arquitetura oficial do EDDIE:
- Central exclusiva de Relatórios Enterprise (10.4), com menu, catálogo, categorias e páginas detalhadas.
- Contabilidade operacional recuperada do vídeo `contabil.mp4` (10.5).
- Financeiro existente, Ledger imutável, saldos por evento, transferências, repasses, antecipações e conciliação preservados.

## Ordem oficial da Central de Relatórios
1. Financeiro
2. Eventos
3. Contábil
4. Comercial B2B
5. Marketing
6. SAC
7. Estornos
8. Operacional

## Contabilidade consolidada
Centro de Controle por Evento, DRE, Balancete, Livro Diário, Plano de Contas, Fechamento Mensal, Centro de Conciliação, Posição Patrimonial/Balanço, Demonstrativos, Recontabilização, Auditoria e estrutura Fiscal/NFS-e preparada para integração real.

## Regra de produção
Nenhum indicador deve ser fabricado. Ausência de dados = estado vazio. Falha de API = erro explícito. Toda UI visível permanece pt-BR. Não criar Ledger, cadastro de eventos ou saldos paralelos.

## Implantação
1. pnpm install
2. pnpm db:generate
3. pnpm --filter @ticketing/api build
4. pnpm --filter @ticketing/pdt build
5. pnpm audit:production (quando disponível)
6. validar /relatorios, /contabilidade e /financeiro
7. validar API_INTERNAL_URL e banco antes do deploy.
