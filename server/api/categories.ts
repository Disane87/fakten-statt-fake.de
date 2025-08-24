import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // Get all active categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    
    return {
      status: 'success',
      data: categories || [],
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Failed to fetch categories',
      data: [],
      timestamp: new Date().toISOString()
    }
  }
})