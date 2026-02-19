import { SourceRegistryService } from '../../services/rag/SourceRegistryService'

/**
 * POST /api/rag/sources
 * Add a new RSS/Atom source to the RAG knowledge base.
 *
 * Body: { name, slug, feed_url, website_url?, source_type?, trust_score?, language?, fetch_interval_minutes? }
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name || !body.slug || !body.feed_url) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: name, slug, feed_url',
        })
    }

    // Validate slug format (lowercase, hyphens, no spaces)
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Slug must be lowercase alphanumeric with hyphens only',
        })
    }

    const registry = new SourceRegistryService(event)
    const source = await registry.addSource({
        name: body.name,
        slug: body.slug,
        feed_url: body.feed_url,
        website_url: body.website_url,
        source_type: body.source_type,
        trust_score: body.trust_score,
        language: body.language,
        fetch_interval_minutes: body.fetch_interval_minutes,
    })

    if (!source) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to add source. Slug may already exist.',
        })
    }

    return { source }
})
