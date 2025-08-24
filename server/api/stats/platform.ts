import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // Get platform statistics
    const [
      { count: totalFactChecks },
      { count: totalUsers },
      { count: verifiedFacts },
      { count: disputedFacts },
      { count: falseFacts }
    ] = await Promise.all([
      supabase.from('fact_check_results').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('fact_check_results').select('*', { count: 'exact', head: true }).eq('verdict', 'verified'),
      supabase.from('fact_check_results').select('*', { count: 'exact', head: true }).eq('verdict', 'disputed'),
      supabase.from('fact_check_results').select('*', { count: 'exact', head: true }).eq('verdict', 'false')
    ])

    // Get average confidence score
    const { data: confidenceData } = await supabase
      .from('fact_check_results')
      .select('confidence_score')
      .not('confidence_score', 'is', null)

    const averageConfidence = confidenceData && confidenceData.length > 0
      ? confidenceData.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / confidenceData.length
      : 0

    // Get top categories with fact check counts
    const { data: topCategories } = await supabase
      .from('categories')
      .select(`
        *,
        fact_check_categories(count)
      `)
      .limit(8)

    return {
      status: 'success',
      data: {
        total_fact_checks: totalFactChecks || 0,
        total_users: totalUsers || 0,
        verified_fact_checks: verifiedFacts || 0,
        disputed_fact_checks: disputedFacts || 0,
        false_fact_checks: falseFacts || 0,
        average_confidence: averageConfidence,
        top_categories: topCategories || []
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Failed to fetch platform statistics',
      data: {
        total_fact_checks: 0,
        total_users: 0,
        verified_fact_checks: 0,
        disputed_fact_checks: 0,
        false_fact_checks: 0,
        average_confidence: 0,
        top_categories: []
      },
      timestamp: new Date().toISOString()
    }
  }
})