# Arquitetura
UI React → Marketing Action Service → EDDIE API → RBAC/ownership → idempotência/auditoria →
Provider Adapter Registry → Meta/Google/TikTok/Spotify/WhatsApp/E-mail → sync/webhook/job →
estado confirmado → Status Real/Dashboard/Atribuição.

Nunca enviar segredo/token privado ao browser. Toda mutação crítica retorna correlationId.
Produtor só opera seus eventos.
