# EDDIE 11.4.2 — Identificação Visível de Build & Homologação de Deploy

Baseline: EDDIE 11.4.1.

## Objetivo
Adicionar identificação visual explícita de build e versão na interface e nos endpoints de status, eliminando dúvidas causadas por cache de navegador ou latência de deployment no Vercel.

## Identificadores Adicionados
1. **Header**: Badge `v11.4.2` ao lado do status de conexão.
2. **Sidebar Header**: Badge `v11.4.2` ao lado do logotipo DiskIngressos.
3. **Sidebar Footer**: Versão `v11.4.2` no rodapé da navegação.
4. **Home Banner**: Badge `v11.4.2 Event OS` no topo da página inicial.
5. **API Status**: `/api/event-os/status` retorna explicitamente `"version": "11.4.2"`.

## Homologação
- `node scripts/preflight-11-4-2.mjs`
- Build completo de API e PDT sem erros.
- Verificação direta em produção via `curl` / janela anônima.
