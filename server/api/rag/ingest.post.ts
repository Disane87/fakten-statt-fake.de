import { ArticleIngestionService } from '../../services/rag/ArticleIngestionService'

/**
 * POST /api/rag/ingest
 * Manually trigger RSS feed ingestion.
 *
 * Body (optional): { slug?: string }
 * - If slug is provided, only that source is ingested (ignoring fetch interval).
 * - If no slug, all sources due for fetching are ingested.
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event).catch(() => ({}))

    const ingestionService = new ArticleIngestionService(event)

    if (body.slug) {
        const result = await ingestionService.ingestBySlug(body.slug)
        if (!result) {
            throw createError({
                statusCode: 404,
                statusMessage: `Source with slug "${body.slug}" not found`,
            })
        }
        return { results: [result] }
    }

    const results = await ingestionService.ingestAll()
    return { results }
})
