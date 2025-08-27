-- Migration: create_find_similar_claim_function
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION find_similar_claim(input_text text)
RETURNS SETOF claims AS $$
  SELECT * FROM claims
  WHERE similarity(text, input_text) > 0.4
  ORDER BY similarity(text, input_text) DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;
