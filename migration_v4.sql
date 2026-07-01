-- VMF AutoStore — Migração v4
-- Relatório de tráfego pago: config da conta Meta + cache do gasto semanal
-- Execute no SQL Editor do Neon: https://console.neon.tech

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_spend_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  week_end DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
