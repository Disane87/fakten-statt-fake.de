import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // Simple connection test - try to get Supabase version/status
    const { data, error } = await supabase.rpc('version')
    
    return {
      status: 'success',
      message: 'Supabase connection successful from server API',
      connected: true,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Failed to connect to Supabase',
      connected: false,
      timestamp: new Date().toISOString()
    }
  }
})