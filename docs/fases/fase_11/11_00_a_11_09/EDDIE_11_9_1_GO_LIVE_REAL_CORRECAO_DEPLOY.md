# EDDIE 11.9.1 — Go-Live Real + Correção de Deploy

## Objetivo
Garantir que o código homologado 11.9 seja exatamente o código construído e publicado em produção.

Fluxo obrigatório:
Git/Commit → instalação → Prisma validate/generate → migrations → build API → build PDT → rotas → menus → smoke tests → Vercel Production → build-info → homologação.

## Marcador obrigatório
Version: 11.9.1
Marker: EDDIE-11.9.1-GOLIVE
Baseline funcional: EDDIE 11.9 HOMOLOGADO

## Gates
G0 Git limpo e commit conhecido.
G1 Variáveis obrigatórias validadas sem imprimir segredos.
G2 Prisma schema válido e client gerado.
G3 Migrations aplicáveis; produção usa deploy, nunca reset.
G4 API compila.
G5 PDT compila.
G6 Rotas 11.9 existem.
G7 Menus apontam para rotas reais.
G8 Smoke tests locais/preview.
G9 Deploy de produção.
G10 `/api/build-info` comprova SHA/branch/deployment/version/marker.
G11 Smoke tests de produção.

## Rotas mínimas a homologar
/eventos
/eventos/:eventoId/dashboard
/eventos/:eventoId/ingressos
/eventos/:eventoId/mapa
/eventos/:eventoId/relatorios
/eventos/:eventoId/detalhes
/eventos/:eventoId/portaria
/eventos/:eventoId/antifraude
/financeiro
/financeiro/conciliacao
/estornos

## API mínima
/api/build-info
/api/bootstrap
/api/event-os/status
endpoints de portaria/check-in
endpoints de conciliação
endpoints de chargeback/estorno

## Regra de produção
Se build-info não retornar `EDDIE-11.9.1-GOLIVE`, o deploy é considerado REPROVADO, mesmo que a Vercel informe sucesso.

## Segurança
Nunca imprimir ou versionar secrets/.env.
Nunca executar `prisma migrate reset` em produção.
Nunca mascarar migration/build quebrado removendo módulos.
