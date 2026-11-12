-- Run after 20261112-alibaba-drafts.sql, before deploying either intake or editor.
-- No estimates/backfill: existing products retain unknown packaging data.
BEGIN;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "alibabaListing" TEXT NOT NULL DEFAULT '{}';
COMMIT;
