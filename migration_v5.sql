-- VMF AutoStore — Migração v5
-- Lixeira (soft delete) para carros, leads e vendas + política de retenção de 30 dias
-- Execute no SQL Editor do Neon: https://console.neon.tech

ALTER TABLE cars  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_cars_deleted_at  ON cars(deleted_at)  WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON leads(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_deleted_at ON sales(deleted_at) WHERE deleted_at IS NOT NULL;
