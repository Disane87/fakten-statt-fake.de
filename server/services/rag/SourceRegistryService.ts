import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../../types/database.types'
import type { RagSource } from './types'

/**
 * Manages RAG sources — both from DB and default seeds.
 * Provides CRUD operations for adding/removing/toggling sources.
 * Works with H3 event context (API routes) or standalone (cron tasks).
 */
export class SourceRegistryService {
    private event: any | null

    constructor(event?: any) {
        this.event = event ?? null
    }

    private async getClient(): Promise<SupabaseClient> {
        if (this.event) {
            return await serverSupabaseClient<Database>(this.event)
        }
        // Standalone mode for cron tasks — use service key
        const url = process.env.SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
        if (!url || !key) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for standalone mode')
        }
        return createClient(url, key)
    }

    async getActiveSources(): Promise<RagSource[]> {
        const client = await this.getClient()
        const { data, error } = await client
            .from('rag_sources')
            .select('*')
            .eq('is_active', true)
            .order('trust_score', { ascending: false })

        if (error) {
            console.error('Error fetching active RAG sources:', error)
            return []
        }
        return data as RagSource[]
    }

    async getAllSources(): Promise<RagSource[]> {
        const client = await this.getClient()
        const { data, error } = await client
            .from('rag_sources')
            .select('*')
            .order('trust_score', { ascending: false })

        if (error) {
            console.error('Error fetching all RAG sources:', error)
            return []
        }
        return data as RagSource[]
    }

    async getSourcesDueForFetch(): Promise<RagSource[]> {
        const sources = await this.getActiveSources()
        const now = new Date()

        return sources.filter(source => {
            if (!source.last_fetched_at) return true
            const lastFetched = new Date(source.last_fetched_at)
            const diffMinutes = (now.getTime() - lastFetched.getTime()) / (1000 * 60)
            return diffMinutes >= source.fetch_interval_minutes
        })
    }

    async addSource(source: {
        name: string
        slug: string
        feed_url: string
        website_url?: string
        source_type?: 'rss' | 'atom' | 'api'
        trust_score?: number
        language?: string
        fetch_interval_minutes?: number
    }): Promise<RagSource | null> {
        const client = await this.getClient()
        const { data, error } = await client
            .from('rag_sources')
            .insert({
                name: source.name,
                slug: source.slug,
                feed_url: source.feed_url,
                website_url: source.website_url ?? null,
                source_type: source.source_type ?? 'rss',
                trust_score: source.trust_score ?? 80,
                language: source.language ?? 'de',
                fetch_interval_minutes: source.fetch_interval_minutes ?? 360,
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding RAG source:', error)
            return null
        }
        return data as RagSource
    }

    async toggleSource(slug: string, isActive: boolean): Promise<boolean> {
        const client = await this.getClient()
        const { error } = await client
            .from('rag_sources')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('slug', slug)

        if (error) {
            console.error('Error toggling RAG source:', error)
            return false
        }
        return true
    }

    async deleteSource(slug: string): Promise<boolean> {
        const client = await this.getClient()
        const { error } = await client
            .from('rag_sources')
            .delete()
            .eq('slug', slug)

        if (error) {
            console.error('Error deleting RAG source:', error)
            return false
        }
        return true
    }

    async updateLastFetched(sourceId: number): Promise<void> {
        const client = await this.getClient()
        await client
            .from('rag_sources')
            .update({
                last_fetched_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', sourceId)
    }
}
