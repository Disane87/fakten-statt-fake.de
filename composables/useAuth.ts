// Enhanced authentication composable with profile management

import type { User } from '@supabase/supabase-js'
import type { Profile, AuthUser } from '~/types/database'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Profile state
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Authentication state
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.is_admin || false)
  const isModerator = computed(() => profile.value?.is_moderator || profile.value?.is_admin || false)
  const isSupporter = computed(() => profile.value?.is_supporter || false)
  
  /**
   * Load user profile
   */
  const loadProfile = async () => {
    if (!user.value) {
      profile.value = null
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (profileError) throw profileError
      
      profile.value = data as Profile
    } catch (err: any) {
      error.value = err.message
      console.error('Error loading profile:', err)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Create user profile after signup
   */
  const createProfile = async (username: string, displayName?: string) => {
    if (!user.value) throw new Error('No authenticated user')
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.value.id,
          username,
          display_name: displayName || username,
          experience_points: 0,
          reputation_score: 0,
          badge_count: 0
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      profile.value = data as Profile
      
      // Award first badge
      await awardBadge('first_signup')
      
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update user profile
   */
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value || !profile.value) throw new Error('No authenticated user')
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      profile.value = { ...profile.value, ...data }
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Award badge to user
   */
  const awardBadge = async (badgeType: string) => {
    if (!user.value) return
    
    try {
      // Check if badge exists and user doesn't already have it
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', badgeType)
        .single()
      
      if (!badge) return
      
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.value.id)
        .eq('badge_id', badge.id)
        .single()
      
      if (existingBadge) return // Already has badge
      
      // Award badge
      await supabase
        .from('user_badges')
        .insert({
          user_id: user.value.id,
          badge_id: badge.id
        })
      
      // Update badge count
      if (profile.value) {
        profile.value.badge_count += 1
        await updateProfile({ badge_count: profile.value.badge_count })
      }
    } catch (err) {
      console.error('Error awarding badge:', err)
    }
  }
  
  /**
   * Add experience points
   */
  const addExperience = async (points: number, activityType: string, relatedEntityId?: string) => {
    if (!user.value || !profile.value) return
    
    try {
      // Add to activity log
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.value.id,
          activity_type: activityType,
          points_earned: points,
          related_entity_id: relatedEntityId
        })
      
      // Update profile
      const newPoints = profile.value.experience_points + points
      await updateProfile({ experience_points: newPoints })
      
      // Check for level-based badges
      await checkLevelBadges(newPoints)
    } catch (err) {
      console.error('Error adding experience:', err)
    }
  }
  
  /**
   * Check and award level-based badges
   */
  const checkLevelBadges = async (totalPoints: number) => {
    const badges = [
      { threshold: 100, name: 'Beginner' },
      { threshold: 500, name: 'Contributor' },
      { threshold: 1000, name: 'Expert' },
      { threshold: 5000, name: 'Master' }
    ]
    
    for (const badge of badges) {
      if (totalPoints >= badge.threshold) {
        await awardBadge(badge.name)
      }
    }
  }
  
  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      // Profile will be loaded by the watch effect
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, username: string, displayName?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (signUpError) throw signUpError
      
      // Profile creation will happen after email confirmation
      // Store signup data for later
      const signupData = { username, displayName }
      localStorage.setItem('pendingProfile', JSON.stringify(signupData))
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Sign out
   */
  const signOut = async () => {
    loading.value = true
    
    try {
      await supabase.auth.signOut()
      profile.value = null
      await navigateTo('/')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
      if (resetError) throw resetError
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update password
   */
  const updatePassword = async (newPassword: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (updateError) throw updateError
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Watch for user changes and load profile
  watch(user, async (newUser) => {
    if (newUser) {
      await loadProfile()
      
      // Check for pending profile creation
      const pendingProfile = localStorage.getItem('pendingProfile')
      if (pendingProfile && !profile.value) {
        try {
          const { username, displayName } = JSON.parse(pendingProfile)
          await createProfile(username, displayName)
          localStorage.removeItem('pendingProfile')
        } catch (err) {
          console.error('Error creating pending profile:', err)
        }
      }
    } else {
      profile.value = null
    }
  }, { immediate: true })
  
  return {
    // State
    user: readonly(user),
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    isAuthenticated,
    isAdmin,
    isModerator,
    isSupporter,
    
    // Methods
    loadProfile,
    createProfile,
    updateProfile,
    addExperience,
    awardBadge,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }
}