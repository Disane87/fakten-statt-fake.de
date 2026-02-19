import { SourceRegistryService } from '../../services/rag/SourceRegistryService'

/**
 * GET /api/rag/sources
 * Returns all configured RAG sources (active and inactive).
 */
export default defineEventHandler(async (event) => {
    const registry = new SourceRegistryService(event)
    const sources = await registry.getAllSources()
    return { sources }
})
