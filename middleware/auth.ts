// Authentication middleware for client-side route protection

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/submit',
    '/admin',
    '/moderator'
  ]
  
  // Define admin-only routes
  const adminRoutes = [
    '/admin'
  ]
  
  // Define moderator routes
  const moderatorRoutes = [
    '/moderator'
  ]
  
  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route))
  
  if (requiresAuth && !user.value) {
    // Redirect to login page with return URL
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // Check admin access
  if (adminRoutes.some(route => to.path.startsWith(route))) {
    const { profile } = useAuth()
    if (!profile.value?.is_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied - Admin privileges required'
      })
    }
  }
  
  // Check moderator access
  if (moderatorRoutes.some(route => to.path.startsWith(route))) {
    const { profile } = useAuth()
    if (!profile.value?.is_moderator && !profile.value?.is_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied - Moderator privileges required'
      })
    }
  }
})