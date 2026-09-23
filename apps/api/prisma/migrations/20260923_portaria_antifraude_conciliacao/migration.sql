CREATE TABLE IF NOT EXISTS "pedidos"."checkin_registros" (
  "id" UUID PRIMARY KEY,
  "tenantId" UUID NOT NULL,
  "eventoId" UUID NOT NULL,
  "ingressoId" UUID NOT NULL,
  "numeroIngresso" TEXT NOT NULL,
  "operadorId" TEXT NOT NULL,
  "dispositivoId" TEXT,
  "portaria" TEXT NOT NULL DEFAULT 'Portaria Principal',
  "resultado" TEXT NOT NULL,
  "motivoRecusa" TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "pedidos"."dispositivos_portaria" (
  "id" UUID PRIMARY KEY,
  "tenantId" UUID NOT NULL,
  "eventoId" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "portaria" TEXT NOT NULL DEFAULT 'Portaria Principal',
  "identificador" TEXT UNIQUE NOT NULL,
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ATIVO',
  "ultimoHeartbeat" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "leiturasValidas" INTEGER NOT NULL DEFAULT 0,
  "leiturasRecusadas" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "pedidos"."alertas_antifraude" (
  "id" UUID PRIMARY KEY,
  "tenantId" UUID NOT NULL,
  "eventoId" UUID NOT NULL,
  "ingressoId" UUID,
  "pedidoId" UUID,
  "codigoSinal" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "severidade" TEXT NOT NULL DEFAULT 'MEDIA',
  "origem" TEXT NOT NULL,
  "detalhes" JSONB,
  "status" TEXT NOT NULL DEFAULT 'ABERTO',
  "resolvidoPor" TEXT,
  "resolvidoEm" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "checkin_evento_idx" ON "pedidos"."checkin_registros" ("tenantId", "eventoId", "resultado");
CREATE INDEX IF NOT EXISTS "checkin_ingresso_idx" ON "pedidos"."checkin_registros" ("ingressoId");
CREATE INDEX IF NOT EXISTS "dispositivos_evento_idx" ON "pedidos"."dispositivos_portaria" ("tenantId", "eventoId", "status");
CREATE INDEX IF NOT EXISTS "alertas_evento_idx" ON "pedidos"."alertas_antifraude" ("tenantId", "eventoId", "status");
