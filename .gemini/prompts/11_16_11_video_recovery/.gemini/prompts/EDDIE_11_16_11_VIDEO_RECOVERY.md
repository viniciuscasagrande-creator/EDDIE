# EDDIE 11.16.11 — RECUPERAÇÃO INTEGRAL DO MARKETING PELO VÍDEO

OBJETIVO: trazer para o EDDIE as funções de Marketing demonstradas no vídeo mkt.mp4.
O vídeo e `docs/INVENTARIO_VIDEO.md` são baseline funcional. NÃO simplifique.

1. Audite o Marketing atual do EDDIE e o legado disponível no repositório.
2. Compare item a item com `src-reference/marketing-video-nav.ts`.
3. Para cada item ausente, crie página React/TSX real e registre a rota no router existente.
4. Não crie segunda sidebar/AppShell/EventContextBar.
5. Reproduza a densidade funcional do vídeo: cabeçalho, filtros, cards, tabs, tabelas,
   gráficos, logs, diagnósticos e ações. Adapte cores/tokens ao design system do EDDIE.
6. Implemente especificamente:
   - Status Real + telemetria/diagnóstico multicanal;
   - GA4 + funil + aquisição + DebugView + configuração;
   - TikTok Ads + Pixel/Events API + públicos + logs;
   - Spotify Ads + CAPI + atribuição UTM + comparativo;
   - E-mail + campanhas/templates/A-B/logs/segmentação;
   - Central UTM + QR + comparação + funil + recuperação;
   - Atribuição multicanal + jornadas multi-touch + ranking;
   - demais telas do menu, preservando funções existentes.
7. Meta Ads & Pixel deve manter multi-pixel/CAPI e health check por evento.
8. WhatsApp deve manter campanhas, templates, segmentação, disparos e métricas somente
   quando provider real estiver conectado.
9. Dados: PROIBIDO preencher com números do vídeo. Eles são referência visual.
   Se API não existir: `Aguardando integração`/`Dados indisponíveis`.
10. Toda tela deve aceitar contexto global do produtor e contexto individual do evento.
11. Implementar loading, empty, error, stale, disconnected e sem permissão.
12. Responsivo; sem overflow global; tabelas podem ter scroll interno.
13. UI 100% pt-BR.
14. Rode typecheck, lint, testes, build e smoke das 17 rotas.
15. Gere `docs/EDDIE_11_16_11_RELATORIO_FINAL.md` com matriz:
    EXISTIA / CRIADA / CORRIGIDA / BLOQUEADA POR API.
16. Não considerar concluído se houver apenas menu, placeholder ou Markdown.
17. NÃO faça push/deploy sem autorização explícita.
