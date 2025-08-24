// Rate limiting utilities using @nuxtjs/security
// This file provides additional rate limiting helpers for specific use cases

/**
 * Rate limits for different endpoints
 * These are configured in nuxt.config.ts via routeRules
 */
export const rateLimits = {
  // General API rate limit
  api: {
    tokensPerInterval: 100,
    interval: 60000 // 1 minute
  },
  
  // Fact check submission rate limit
  factCheckSubmission: {
    tokensPerInterval: 5,
    interval: 300000 // 5 minutes
  },
  
  // Comment creation rate limit
  commentCreation: {
    tokensPerInterval: 10,
    interval: 60000 // 1 minute
  },
  
  // Voting rate limit
  voting: {
    tokensPerInterval: 50,
    interval: 60000 // 1 minute
  },
  
  // Search rate limit
  search: {
    tokensPerInterval: 30,
    interval: 60000 // 1 minute
  },
  
  // Authentication rate limit
  auth: {
    tokensPerInterval: 5,
    interval: 300000 // 5 minutes
  },
  
  // Report submission rate limit
  reportSubmission: {
    tokensPerInterval: 3,
    interval: 600000 // 10 minutes
  }
}

/**
 * Custom rate limiting for specific business logic
 * Note: Primary rate limiting is handled by @nuxtjs/security middleware
 */
interface CustomRateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for custom rate limiting (use Redis in production)
const customStore: CustomRateLimitStore = {}

/**
 * Custom rate limit for business-specific scenarios
 * @param key - Unique identifier for the rate limit
 * @param max - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function checkCustomRateLimit(key: string, max: number, windowMs: number): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  
  // Clean up expired entries
  if (customStore[key] && customStore[key].resetTime < now) {
    delete customStore[key]
  }
  
  // Initialize or increment counter
  if (!customStore[key]) {
    customStore[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return { allowed: true }
  }
  
  customStore[key].count++
  
  // Check if limit exceeded
  if (customStore[key].count > max) {
    const remainingTime = Math.ceil((customStore[key].resetTime - now) / 1000)
    return { allowed: false, remainingTime }
  }
  
  return { allowed: true }
}

/**
 * Get remaining requests for a custom rate limit
 */
export function getRemainingRequests(key: string, max: number): number {
  const entry = customStore[key]
  if (!entry || entry.resetTime < Date.now()) {
    return max
  }
  return Math.max(0, max - entry.count)
}

/**
 * Clear custom rate limit for a specific key
 */
export function clearCustomRateLimit(key: string): void {
  delete customStore[key]
}

/**
 * Enhanced rate limiting with Redis (for production)
 */
export class RedisRateLimit {
  private redis: any
  
  constructor(redisClient: any) {
    this.redis = redisClient
  }
  
  async checkLimit(key: string, max: number, window: number): Promise<boolean> {
    try {
      const multi = this.redis.multi()
      multi.incr(key)
      multi.expire(key, window)
      const results = await multi.exec()
      
      const count = results[0][1]
      return count <= max
    } catch (error) {
      console.error('Redis rate limit error:', error)
      // Fallback to custom store
      const result = checkCustomRateLimit(key, max, window * 1000)
      return result.allowed
    }
  }
  
  async getRemainingRequests(key: string, max: number): Promise<number> {
    try {
      const count = await this.redis.get(key) || 0
      return Math.max(0, max - parseInt(count))
    } catch (error) {
      console.error('Redis get remaining error:', error)
      return getRemainingRequests(key, max)
    }
  }
}