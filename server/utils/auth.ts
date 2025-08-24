// Server-side authentication utilities

import { createClient } from '@supabase/supabase-js'
import type { Profile } from '~/types/database'

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(event: any) {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authentication token'
    })
  }
  
  return user
}

/**
 * Get user profile with authentication check
 */
export async function getAuthenticatedProfile(event: any): Promise<Profile> {
  const user = await getAuthenticatedUser(event)
  const config = useRuntimeConfig()
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User profile not found'
    })
  }
  
  return profile as Profile
}

/**
 * Check if user has specific role
 */
export async function requireRole(event: any, role: 'admin' | 'moderator'): Promise<Profile> {
  const profile = await getAuthenticatedProfile(event)
  
  const hasRole = role === 'admin' ? profile.is_admin : 
                  role === 'moderator' ? (profile.is_moderator || profile.is_admin) : 
                  false
  
  if (!hasRole) {
    throw createError({
      statusCode: 403,
      statusMessage: `Access denied - ${role} privileges required`
    })
  }
  
  return profile
}

/**
 * Validate JWT token
 */
export function validateJWT(token: string): any {
  try {
    const config = useRuntimeConfig()
    // In a real implementation, you'd use a proper JWT library
    // This is a placeholder for JWT validation
    return { valid: true, payload: {} }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }
}

/**
 * Extract user ID from request (for rate limiting)
 */
export async function getUserIdFromRequest(event: any): Promise<string | null> {
  try {
    const user = await getAuthenticatedUser(event)
    return user.id
  } catch {
    return null
  }
}