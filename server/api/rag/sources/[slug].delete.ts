import { SourceRegistryService } from '../../../services/rag/SourceRegistryService'

/**
 * DELETE /api/rag/sources/:slug
 * Remove a source and all its articles from the RAG knowledge base.
 */
export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Missing slug parameter' })
    }

    const registry = new SourceRegistryService(event)
    const success = await registry.deleteSource(slug)

    if (!success) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete source' })
    }

    return { success: true, slug }
})
