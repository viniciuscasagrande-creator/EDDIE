-- EDDIE 11.4 — extensão aditiva. Não altera valores históricos.
ALTER TABLE "crm"."condicoes_comerciais"
  ADD COLUMN IF NOT EXISTS "modeloTaxa" TEXT NOT NULL DEFAULT 'percentual',
  ADD COLUMN IF NOT EXISTS "taxaServicoFixa" DECIMAL(14,2),
  ADD COLUMN IF NOT EXISTS "spreadPercentual" DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS "advancedHabilitado" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "advancedTaxaPercentual" DECIMAL(5,2);
