-- Additive, repeatable update; run before starting the new application version.
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "attribution" TEXT NOT NULL DEFAULT '{}';
