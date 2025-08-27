-- Migration: create enums for factcheck
CREATE TABLE IF NOT EXISTS factcheck_tone (
  id serial PRIMARY KEY,
  value text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS factcheck_texttype (
  id serial PRIMARY KEY,
  value text UNIQUE NOT NULL
);

