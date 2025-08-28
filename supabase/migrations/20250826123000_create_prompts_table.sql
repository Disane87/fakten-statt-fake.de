-- Migration: create_prompts_table
-- Erstellt die Tabelle `prompts` mit UUID-PK und Index für neueste Version

-- Tabelle anlegen (idempotent)
CREATE TABLE IF NOT EXISTS public.prompts (
  id serial PRIMARY KEY,
  name text NOT NULL,
  content text NOT NULL,
  version integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index für schnelle Auswahl der neuesten Version pro Name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_prompts_name_version' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_prompts_name_version ON public.prompts (name, version DESC);
  END IF;
END
$$ LANGUAGE plpgsql;
