# EDDIE 10.2 — Endpoints + Central de Relatórios

## Endpoints adicionados
- GET /relatorios/catalogo
- GET /relatorios/executivo?produtorId=&eventoId=
- GET /relatorios/eventos?produtorId=
- GET /relatorios/financeiro?produtorId=&eventoId=
- GET /relatorios/contabilidade?produtorId=&eventoId=
- GET /relatorios/comercial
- GET /relatorios/marketing?produtorId=&eventoId=
- GET /relatorios/sac?eventoId=
- GET /relatorios/suporte?produtorId=&eventoId=
- GET /relatorios/estornos

## Interface
Foi criada `/relatorios` e o item **Central de Relatórios** no menu lateral principal. Os relatórios usam o contexto global de produtor/evento e não criam métricas artificiais.

## Regra de produção
Nenhum relatório pode usar mock/fallback numérico. API indisponível deve resultar em erro explícito; coleção vazia deve resultar em zero registros.
