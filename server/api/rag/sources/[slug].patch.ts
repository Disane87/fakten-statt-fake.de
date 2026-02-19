import { SourceRegistryService } from '../../../services/rag/SourceRegistryService'

/**
 * PATCH /api/rag/sources/:slug
 * Toggle a source active/inactive.
 *
 * Body: { is_active: boolean }
 */
export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Missing slug parameter' })
    }

    const body = await readBody(event)
    if (typeof body.is_active !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'is_active must be a boolean' })
    }

    const registry = new SourceRegistryService(event)
    const success = await registry.toggleSource(slug, body.is_active)

    if (!success) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to update source' })
    }

    return { success: true, slug, is_active: body.is_active }
})
