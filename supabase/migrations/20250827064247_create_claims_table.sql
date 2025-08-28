-- Migration: create_claims_table
CREATE TABLE IF NOT EXISTS claims (
  id serial PRIMARY KEY,
  hash text UNIQUE,
  text text,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  prompt_id integer REFERENCES prompts(id) ON DELETE SET NULL

);
