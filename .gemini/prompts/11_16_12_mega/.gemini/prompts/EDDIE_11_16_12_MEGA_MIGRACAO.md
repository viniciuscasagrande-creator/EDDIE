# EXECUÇÃO — EDDIE 11.16.12 MEGA MIGRAÇÃO FUNCIONAL MARKETING + REMARKETING

MISSÃO: migrar integralmente Marketing + Remarketing para o EDDIE. Não trate como mera expansão do 11.16.

FASE 1 — INVENTÁRIO
- Leia README, PLANO_DE_MIGRACAO, MARKETING_COMPLETO, REMARKETING_COMPLETO e referências.
- Procure no repositório TODAS as implementações antigas/atuais relacionadas a marketing,
  remarketing, campaigns, ads, pixels, analytics, whatsapp, email, utm, affiliate, cart,
  audience, journey e attribution.
- Inventarie rotas, componentes, services, endpoints, schemas e jobs.
- Preencha `docs/MATRIZ_PARIDADE.md` antes de remover qualquer coisa.

FASE 2 — MIGRAÇÃO MARKETING
- Garantir as 17 telas obrigatórias.
- Portar funções úteis, filtros, tabs, tabelas, gráficos, ações, configurações,
  diagnósticos, logs e health checks.
- Não reduzir telas operacionais a dashboards genéricos.

FASE 3 — MIGRAÇÃO REMARKETING
- Garantir as 14 telas obrigatórias.
- Implementar públicos/segmentos/jornadas/carrinho/visitantes/compradores/recorrência/
  recuperação/campanhas/automações/conversões/relatórios.
- Jornadas devem possuir gatilho, condições, espera, ação/canal e critério de encerramento.

FASE 4 — INTEGRAÇÃO
- Reutilizar APIs reais existentes; adaptar contratos somente quando necessário.
- Contexto obrigatório: Produtor → Evento.
- Integrar Marketing/Remarketing com vendas/conversões sem acoplamento indevido ao Ledger.
- Meta/Google/TikTok/Spotify/WhatsApp/E-mail: preservar provider real e status de conexão.
- Sem provider/API: estado `Aguardando integração`, nunca números inventados.

FASE 5 — UX
- Usar AppShell/design system EDDIE já existente.
- Não duplicar sidebar, header, EventContextBar ou router.
- UI pt-BR; desktop/mobile; sem overflow global.
- Loading/empty/error/stale/disconnected/forbidden em todas as telas.

FASE 6 — PARIDADE E QA
- Para cada função do legado/vídeo, apontar destino e evidência.
- Nenhum item pode ficar silenciosamente perdido.
- Rodar typecheck, lint, testes, build e smoke das 31 telas.
- Gerar screenshots das rotas principais.
- Gerar `docs/EDDIE_11_16_12_RELATORIO_FINAL.md` contendo:
  migrado, reutilizado, corrigido, unificado, bloqueado por integração, endpoints e evidências.
- NÃO considerar concluído se houver somente Markdown, menu ou placeholder.
- NÃO faça push/deploy sem autorização explícita.
