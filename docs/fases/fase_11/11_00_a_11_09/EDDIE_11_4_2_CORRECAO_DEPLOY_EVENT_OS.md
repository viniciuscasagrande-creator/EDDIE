# EDDIE 11.4.2 — Correção de Deploy do Event OS

Objetivo: eliminar a divergência entre o ZIP homologado e o código realmente publicado na Vercel.

## Critérios obrigatórios de homologação
1. A interface mostra `EDDIE 11.4.2 · Event OS` no canto inferior direito.
2. `GET /api/build-info` retorna `marker: EDDIE-11.4.2-EVENT-OS` e o SHA do commit publicado.
3. A sidebar mostra `Todos os Eventos`, nunca `Eventos & Lotes`.
4. `/eventos` abre mesmo quando a API estiver indisponível; o erro de contexto deve ser explícito.
5. `/api/bootstrap` termina em sucesso ou erro diagnosticável; não pode ficar em loading infinito.
6. O projeto Vercel deve construir este monorepo e o app `@ticketing/pdt`, não uma pasta/repositório antigo.

## Vercel
O `vercel.json` da raiz fixa instalação/build/output do PDT. Depois do deploy execute:
`node scripts/verify-deploy-11-4-2.mjs https://viniciuscasagrande-creator-eddie.vercel.app`

Se `/api/build-info` não retornar o marker 11.4.2, o domínio está apontando para outro deployment/projeto/branch e nenhuma correção de React resolverá até o vínculo da Vercel ser corrigido.
