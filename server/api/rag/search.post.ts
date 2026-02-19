import { RagRetrievalService } from '../../services/rag/RagRetrievalService'

/**
 * POST /api/rag/search
 * Search the RAG knowledge base for articles relevant to a given text.
 * Useful for testing/debugging the retrieval pipeline.
 *
 * Body: { text: string, matchThreshold?: number, matchCount?: number }
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.text || typeof body.text !== 'string') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required field: text',
        })
    }

    const retrieval = new RagRetrievalService(event)
    const articles = await retrieval.searchRelevantArticles(body.text, {
        matchThreshold: body.matchThreshold,
        matchCount: body.matchCount,
    })

    return { articles, count: articles.length }
})
