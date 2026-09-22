# EDDIE 10.5 — Frente A — Recuperação Contábil do vídeo

Baseline: EDDIE 10.4. O vídeo `contabil.mp4` foi analisado quadro a quadro (88 s) e usado somente como referência funcional; o visual antigo não foi copiado.

## Funções recuperadas para o EDDIE
- Painel de Controle Contábil com integridade de partidas, competência, lançamentos, débitos/créditos e divergências.
- Plano de Contas hierárquico já existente, preservado.
- Fechamento Contábil Mensal com pendências, conciliações, status e validação antes do fechamento.
- Centro de Conciliação Contábil com conciliadas, divergentes e valor divergente.
- DRE, Balancete, Livro Diário/Lançamentos e Centro de Controle por Evento já existentes, preservados.
- Balanço Patrimonial e Posição Financeira calculados a partir do balancete real.
- Recontabilização/rastreabilidade por competência e evento, usando lançamentos persistidos.
- Auditoria Contábil consolidada com fechamento, conciliações e lançamentos.
- Central Fiscal/NFS-e preparada de forma honesta: como o schema atual não contém documento fiscal/NFS-e, o endpoint informa integração não configurada e não fabrica notas ou impostos.

## Novos endpoints
- GET /contabilidade/painel-enterprise?competencia=AAAA-MM
- GET /contabilidade/fechamento-mensal?competencia=AAAA-MM
- GET /contabilidade/posicao-patrimonial?competencia=AAAA-MM
- GET /contabilidade/centro-conciliacao?competencia=AAAA-MM
- GET /contabilidade/recontabilizacao?competencia=AAAA-MM&eventoId=UUID
- GET /contabilidade/fiscal?competencia=AAAA-MM
- GET /contabilidade/auditoria-enterprise?competencia=AAAA-MM

## Regras preservadas
- tenant por x-tenant-id; sem segunda contabilidade paralela.
- recursos de produtores não viram receita DiskIngressos.
- partidas dobradas e fechamento existentes continuam sendo a fonte contábil.
- nenhum KPI, nota fiscal ou imposto fictício.
- interface visível em pt-BR e sem nomenclatura “360”.
