-- Migration: RAG system tables for source-verified fact checking
-- Enables pgvector for embedding-based similarity search

CREATE EXTENSION IF NOT EXISTS vector;

-- rag_sources: configurable RSS feed sources for fact-check articles
CREATE TABLE IF NOT EXISTS rag_sources (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  feed_url text NOT NULL,
  website_url text,
  source_type text NOT NULL DEFAULT 'rss', -- rss, atom, api
  trust_score integer NOT NULL DEFAULT 80 CHECK (trust_score >= 0 AND trust_score <= 100),
  language text NOT NULL DEFAULT 'de',
  is_active boolean NOT NULL DEFAULT true,
  last_fetched_at timestamptz,
  fetch_interval_minutes integer NOT NULL DEFAULT 360, -- default: every 6 hours
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- rag_articles: ingested articles with vector embeddings
CREATE TABLE IF NOT EXISTS rag_articles (
  id serial PRIMARY KEY,
  source_id integer NOT NULL REFERENCES rag_sources(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text UNIQUE NOT NULL,
  content text,
  summary text,
  author text,
  published_at timestamptz,
  embedding vector(768), -- nomic-embed-text produces 768-dim vectors
  content_hash text UNIQUE NOT NULL, -- SHA-256 to prevent duplicates
  ingested_at timestamptz DEFAULT now()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS rag_articles_embedding_idx
  ON rag_articles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for source lookups
CREATE INDEX IF NOT EXISTS rag_articles_source_id_idx ON rag_articles(source_id);
CREATE INDEX IF NOT EXISTS rag_articles_published_at_idx ON rag_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS rag_sources_is_active_idx ON rag_sources(is_active);

-- Function: search for articles similar to a given embedding
CREATE OR REPLACE FUNCTION match_rag_articles(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id int,
  source_id int,
  source_name text,
  source_trust_score int,
  title text,
  url text,
  content text,
  summary text,
  published_at timestamptz,
  similarity float
) AS $$
  SELECT
    a.id,
    a.source_id,
    s.name AS source_name,
    s.trust_score AS source_trust_score,
    a.title,
    a.url,
    a.content,
    a.summary,
    a.published_at,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM rag_articles a
  JOIN rag_sources s ON a.source_id = s.id
  WHERE s.is_active = true
    AND a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql STABLE;

-- Seed: insert default German fact-check sources
INSERT INTO rag_sources (name, slug, feed_url, website_url, source_type, trust_score, language) VALUES
  ('Correctiv Faktencheck', 'correctiv', 'https://correctiv.org/faktencheck/feed/', 'https://correctiv.org/faktencheck/', 'rss', 95, 'de'),
  ('dpa Faktencheck', 'dpa-faktencheck', 'https://www.dpa-factchecking.com/germany/rss.xml', 'https://www.dpa-factchecking.com/germany', 'rss', 95, 'de'),
  ('Tagesschau Faktenfinder', 'tagesschau-faktenfinder', 'https://www.tagesschau.de/xml/rss2_feed_faktenfinder.xml', 'https://www.tagesschau.de/faktenfinder/', 'rss', 90, 'de'),
  ('Mimikama', 'mimikama', 'https://www.mimikama.org/feed/', 'https://www.mimikama.org/', 'rss', 80, 'de'),
  ('AFP Faktencheck', 'afp-faktencheck', 'https://faktencheck.afp.com/list/all/all/all/38970/rss.xml', 'https://faktencheck.afp.com/', 'rss', 90, 'de')
ON CONFLICT (slug) DO NOTHING;
