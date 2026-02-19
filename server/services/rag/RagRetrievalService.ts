import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../types/database.types'
import { EmbeddingService } from './EmbeddingService'
import type { RagArticleMatch } from './types'

/**
 * Retrieves relevant articles from the RAG knowledge base
 * using vector similarity search.
 */
export class RagRetrievalService {
    private event: any | null
    private embeddingService: EmbeddingService

    constructor(event?: any) {
        this.event = event ?? null
        this.embeddingService = new EmbeddingService()
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

    /**
     * Search for articles relevant to a given claim/text.
     * Returns matched articles ranked by semantic similarity and trust score.
     */
    async searchRelevantArticles(
        queryText: string,
        options: { matchThreshold?: number; matchCount?: number } = {}
    ): Promise<RagArticleMatch[]> {
        const { matchThreshold = 0.3, matchCount = 10 } = options

        // 1. Generate embedding for the query
        const queryEmbedding = await this.embeddingService.generateEmbedding(queryText)
        if (!queryEmbedding) {
            console.warn('[RAG] Could not generate query embedding, skipping RAG retrieval')
            return []
        }

        // 2. Call the match function
        const client = await this.getClient()
        const { data, error } = await client.rpc('match_rag_articles', {
            query_embedding: `[${queryEmbedding.join(',')}]`,
            match_threshold: matchThreshold,
            match_count: matchCount,
        })

        if (error) {
            console.error('[RAG] Error searching articles:', error)
            return []
        }

        return (data || []) as RagArticleMatch[]
    }

    /**
     * Build a context string from matched articles to inject into the LLM prompt.
     * Formats the articles in a way the LLM can reference them.
     */
    buildPromptContext(articles: RagArticleMatch[]): string {
        if (articles.length === 0) return ''

        const lines = [
            '=== VERIFIED FACT-CHECK SOURCES (from trusted databases) ===',
            'The following are real, published fact-check articles from trusted sources.',
            'Use these to ground your analysis. Reference them in your sources list.\n'
        ]

        for (let i = 0; i < articles.length; i++) {
            const a = articles[i]
            lines.push(`[Source ${i + 1}] (Trust: ${a.source_trust_score}/100, Similarity: ${(a.similarity * 100).toFixed(0)}%)`)
            lines.push(`Title: ${a.title}`)
            lines.push(`Publisher: ${a.source_name}`)
            lines.push(`URL: ${a.url}`)
            if (a.published_at) {
                lines.push(`Published: ${new Date(a.published_at).toLocaleDateString('de-DE')}`)
            }
            if (a.summary) {
                lines.push(`Summary: ${a.summary.substring(0, 500)}`)
            }
            lines.push('')
        }

        lines.push('=== END OF VERIFIED SOURCES ===\n')
        return lines.join('\n')
    }
}
