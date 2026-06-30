-- VMF AutoStore — Migração v2
-- Execute no SQL Editor do Neon: https://console.neon.tech

-- 1. Atualizar status dos leads existentes antes de trocar o constraint
UPDATE leads SET status = 'lead_novo'      WHERE status = 'novo';
UPDATE leads SET status = 'visita_marcada' WHERE status = 'contatado';
-- 'negociando' permanece igual
UPDATE leads SET status = 'vendeu'         WHERE status = 'ganho';
UPDATE leads SET status = 'nao_comprou'    WHERE status = 'perdido';

-- 2. Trocar o CHECK constraint de status em leads
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('lead_novo', 'visita_marcada', 'negociando', 'ligar_de_volta', 'vendeu', 'nao_comprou'));

-- 3. Adicionar campos de data ao leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted_at    DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visit_date      DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visit_time      TIME;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS came_to_store_at DATE;

-- 4. Adicionar novos campos ao cars
ALTER TABLE cars ADD COLUMN IF NOT EXISTS category         TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS doors            INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_premium       BOOLEAN DEFAULT false;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS acquisition_date DATE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS optionals        TEXT[];
ALTER TABLE cars ADD COLUMN IF NOT EXISTS discount_max     DECIMAL(12, 2);

-- 5. Criar tabela de metas mensais
CREATE TABLE IF NOT EXISTS goals (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  month      INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       INTEGER NOT NULL,
  target     INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

CREATE OR REPLACE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
