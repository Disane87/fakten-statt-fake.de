import { SupabaseService } from '../../services/SupabaseService'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Fact ID is required'
    })
  }

  // Validate ID is numeric
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fact ID format'
    })
  }

  try {
    const supabaseService = new SupabaseService(event)
    const claim = await supabaseService.getClaimById(numericId)
    
    if (!claim) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Fact not found'
      })
    }

    return {
      status: 'success',
      data: {
        id: claim.id,
        text: claim.text,
        result: claim.result,
        hash: claim.hash,
        createdAt: claim.created_at,
        promptId: claim.prompt_id
      }
    }
  } catch (error: any) {
    console.error('Error fetching fact:', error)
    
    // Re-throw createError instances
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching fact'
    })
  }
})
