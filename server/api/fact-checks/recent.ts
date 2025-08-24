import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // Get recent fact checks with basic info
    const { data: factChecks, error } = await supabase
      .from('fact_check_results')
      .select(`
        id,
        verdict,
        summary,
        confidence_score,
        published_at,
        submission:fact_check_submissions(
          id,
          source_url,
          source_type,
          source_platform,
          original_content
        )
      `)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(6)
    
    if (error) throw error
    
    return {
      status: 'success',
      data: factChecks || [],
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Failed to fetch recent fact checks',
      data: [],
      timestamp: new Date().toISOString()
    }
  }
})