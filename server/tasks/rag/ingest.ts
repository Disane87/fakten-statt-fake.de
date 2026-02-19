import { ArticleIngestionService } from '../../services/rag/ArticleIngestionService'

/**
 * Nitro scheduled task: periodically ingests RSS feeds from all active sources.
 * Runs on a cron schedule defined in nuxt.config.ts.
 * Can also be triggered manually via /api/_nitro/tasks/rag:ingest
 */
export default defineTask({
    meta: {
        name: 'rag:ingest',
        description: 'Ingest RSS feeds from fact-check sources into the RAG knowledge base',
    },
    async run() {
        console.log('[Task:rag:ingest] Starting scheduled ingestion...')
        const startTime = Date.now()

        try {
            const ingestionService = new ArticleIngestionService()
            const results = await ingestionService.ingestAll()

            const totalNew = results.reduce((sum, r) => sum + r.new, 0)
            const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
            const duration = ((Date.now() - startTime) / 1000).toFixed(1)

            console.log(`[Task:rag:ingest] Completed in ${duration}s: ${totalNew} new articles, ${totalErrors} errors`)

            return {
                result: {
                    success: true,
                    duration: `${duration}s`,
                    sources: results,
                    totalNew,
                    totalErrors,
                },
            }
        } catch (error) {
            console.error('[Task:rag:ingest] Failed:', error)
            return {
                result: {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                },
            }
        }
    },
})
