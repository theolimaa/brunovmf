-- VMF AutoStore — Migração v3
-- Rastreio de origem dos leads (clique no WhatsApp a partir do site/tráfego pago)
-- Execute no SQL Editor do Neon: https://console.neon.tech

-- 1. Telefone passa a ser opcional — leads criados automaticamente pelo clique
--    no WhatsApp ainda não têm telefone (só quando o cliente manda mensagem)
ALTER TABLE leads ALTER COLUMN phone DROP NOT NULL;

-- 2. Origem do lead
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE leads ADD CONSTRAINT leads_source_check
  CHECK (source IN ('manual', 'site', 'trafego_pago'));

-- 3. Parâmetros UTM do anúncio (quando vier de tráfego pago)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source   TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium   TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
