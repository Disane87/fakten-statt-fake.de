export interface RagSource {
    id: number
    name: string
    slug: string
    feed_url: string
    website_url: string | null
    source_type: 'rss' | 'atom' | 'api'
    trust_score: number
    language: string
    is_active: boolean
    last_fetched_at: string | null
    fetch_interval_minutes: number
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface RagArticle {
    id: number
    source_id: number
    title: string
    url: string
    content: string | null
    summary: string | null
    author: string | null
    published_at: string | null
    content_hash: string
    ingested_at: string
}

export interface RagArticleMatch {
    id: number
    source_id: number
    source_name: string
    source_trust_score: number
    title: string
    url: string
    content: string | null
    summary: string | null
    published_at: string | null
    similarity: number
}

export interface ParsedFeedItem {
    title: string
    url: string
    content: string
    summary: string
    author: string | null
    publishedAt: Date | null
}

export interface IngestionResult {
    source: string
    fetched: number
    new: number
    skipped: number
    errors: number
}
