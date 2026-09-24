# Contratos mínimos de dados

## Regra
Auditar endpoints existentes antes de criar novos. Nunca inventar métricas.

### Status Real
GET marketing/status-real
POST marketing/status-real/sync
GET marketing/campanhas/:id/diagnostico

### GA4
GET marketing/google-analytics/overview
GET marketing/google-analytics/funnel
GET marketing/google-analytics/acquisition
GET marketing/google-analytics/debug
POST marketing/google-analytics/debug/ping

### TikTok
GET marketing/tiktok/overview
GET marketing/tiktok/campaigns
GET marketing/tiktok/audiences
GET marketing/tiktok/logs
POST marketing/tiktok/test-connection

### Spotify
GET marketing/spotify/overview
GET marketing/spotify/campaigns
GET marketing/spotify/capi/events
POST marketing/spotify/capi/test
GET marketing/spotify/attribution

### E-mail
GET marketing/email/overview
GET/POST marketing/email/campaigns
GET marketing/email/logs
GET marketing/email/segments
GET/POST marketing/email/templates

### UTM
GET/POST marketing/utm
GET marketing/utm/:id/analytics
POST marketing/utm/:id/qr
GET marketing/utm/compare

### Atribuição
GET marketing/attribution/channels
GET marketing/attribution/journeys
GET marketing/attribution/ranking

Todos os endpoints devem ser escopados por produtor/evento e RBAC.
