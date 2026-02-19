import crypto from 'crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../types/database.types'
import { RssParserService } from './RssParserService'
import { EmbeddingService } from './EmbeddingService'
import { SourceRegistryService } from './SourceRegistryService'
import type { RagSource, ParsedFeedItem, IngestionResult } from './types'

/**
 * Orchestrates the full article ingestion pipeline:
 * 1. Get sources due for fetching
 * 2. Parse RSS feeds
 * 3. Deduplicate against existing articles
 * 4. Generate embeddings
 * 5. Store in database
 */
export class ArticleIngestionService {
    private event: any | null
    private rssParser: RssParserService
    private embeddingService: EmbeddingService
    private sourceRegistry: SourceRegistryService

    constructor(event?: any) {
        this.event = event ?? null
        this.rssParser = new RssParserService()
        this.embeddingService = new EmbeddingService()
        this.sourceRegistry = new SourceRegistryService(event)
    }

    private async getClient(): Promise<SupabaseClient> {
        if (this.event) {
            return await serverSupabaseClient<Database>(this.event)
        }
        const url = process.env.SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
        if (!url || !key) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
        }
        return createClient(url, key)
    }

    private contentHash(url: string, title: string): string {
        return crypto.createHash('sha256').update(`${url}|${title}`).digest('hex')
    }

    /**
     * Run a full ingestion cycle for all sources due for fetching.
     */
    async ingestAll(): Promise<IngestionResult[]> {
        const sources = await this.sourceRegistry.getSourcesDueForFetch()
        console.log(`[Ingestion] ${sources.length} source(s) due for fetching`)

        const results: IngestionResult[] = []
        for (const source of sources) {
            const result = await this.ingestSource(source)
            results.push(result)
        }
        return results
    }

    /**
     * Force-ingest a specific source by slug (ignores fetch interval).
     */
    async ingestBySlug(slug: string): Promise<IngestionResult | null> {
        const sources = await this.sourceRegistry.getAllSources()
        const source = sources.find(s => s.slug === slug)
        if (!source) return null
        return this.ingestSource(source)
    }

    /**
     * Ingest articles from a single source.
     */
    async ingestSource(source: RagSource): Promise<IngestionResult> {
        const result: IngestionResult = {
            source: source.name,
            fetched: 0,
            new: 0,
            skipped: 0,
            errors: 0,
        }

        console.log(`[Ingestion] Fetching ${source.name} (${source.feed_url})...`)

        // 1. Parse the feed
        const items = await this.rssParser.parseFeed(source)
        result.fetched = items.length

        if (items.length === 0) {
            await this.sourceRegistry.updateLastFetched(source.id)
            return result
        }

        // 2. Check which articles already exist
        const client = await this.getClient()
        const hashes = items.map(item => this.contentHash(item.url, item.title))

        const { data: existing } = await client
            .from('rag_articles')
            .select('content_hash')
            .in('content_hash', hashes)

        const existingHashes = new Set((existing || []).map(e => e.content_hash))

        // 3. Filter to new articles only
        const newItems: { item: ParsedFeedItem; hash: string }[] = []
        for (let i = 0; i < items.length; i++) {
            if (existingHashes.has(hashes[i])) {
                result.skipped++
            } else {
                newItems.push({ item: items[i], hash: hashes[i] })
            }
        }

        console.log(`[Ingestion] ${source.name}: ${newItems.length} new, ${result.skipped} existing`)

        // 4. Generate embeddings and insert new articles
        for (const { item, hash } of newItems) {
            try {
                const embeddingText = this.embeddingService.buildEmbeddingText(
                    item.title, item.content, item.summary
                )
                const embedding = await this.embeddingService.generateEmbedding(embeddingText)

                const insertData: Record<string, unknown> = {
                    source_id: source.id,
                    title: item.title,
                    url: item.url,
                    content: item.content || null,
                    summary: item.summary || null,
                    author: item.author,
                    published_at: item.publishedAt?.toISOString() ?? null,
                    content_hash: hash,
                }

                // pgvector expects the embedding as a string "[0.1,0.2,...]"
                if (embedding) {
                    insertData.embedding = `[${embedding.join(',')}]`
                }

                const { error } = await client.from('rag_articles').insert(insertData)

                if (error) {
                    console.error(`[Ingestion] Error inserting article "${item.title}":`, error.message)
                    result.errors++
                } else {
                    result.new++
                }
            } catch (err) {
                console.error(`[Ingestion] Error processing article "${item.title}":`, err)
                result.errors++
            }
        }

        // 5. Update last fetched timestamp
        await this.sourceRegistry.updateLastFetched(source.id)
        console.log(`[Ingestion] ${source.name} done: ${result.new} new, ${result.errors} errors`)

        return result
    }
}
