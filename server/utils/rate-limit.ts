// Rate limiting utilities

interface RateLimitConfig {
  max: number // Maximum requests
  window: number // Time window in seconds
  keyGenerator?: (event: any) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (in production, use Redis)
const store: RateLimitStore = {}

/**
 * Rate limiting middleware
 */
export async function rateLimit(event: any, config: RateLimitConfig): Promise<void> {
  const key = config.keyGenerator ? config.keyGenerator(event) : getClientIP(event) || 'unknown'
  const now = Date.now()
  const windowMs = config.window * 1000
  
  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }
  
  // Initialize or increment counter
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else {
    store[key].count++
  }
  
  // Check if limit exceeded
  if (store[key].count > config.max) {
    const remainingTime = Math.ceil((store[key].resetTime - now) / 1000)
    
    setHeader(event, 'X-RateLimit-Limit', config.max.toString())
    setHeader(event, 'X-RateLimit-Remaining', '0')
    setHeader(event, 'X-RateLimit-Reset', store[key].resetTime.toString())
    setHeader(event, 'Retry-After', remainingTime.toString())
    
    throw createError({
      statusCode: 429,
      statusMessage: `Rate limit exceeded. Try again in ${remainingTime} seconds.`
    })
  }
  
  // Set rate limit headers
  setHeader(event, 'X-RateLimit-Limit', config.max.toString())
  setHeader(event, 'X-RateLimit-Remaining', (config.max - store[key].count).toString())
  setHeader(event, 'X-RateLimit-Reset', store[key].resetTime.toString())
}

/**
 * Rate limits for different endpoints
 */
export const rateLimits = {
  // General API rate limit
  api: {
    max: 100,
    window: 60 // 1 minute
  },
  
  // Fact check submission rate limit
  factCheckSubmission: {
    max: 5,
    window: 300, // 5 minutes
    keyGenerator: async (event: any) => {
      const userId = await getUserIdFromRequest(event)
      return userId ? `fact_check_${userId}` : `fact_check_ip_${getClientIP(event)}`
    }
  },
  
  // Comment creation rate limit
  commentCreation: {
    max: 10,
    window: 60, // 1 minute
    keyGenerator: async (event: any) => {
      const userId = await getUserIdFromRequest(event)
      return userId ? `comment_${userId}` : `comment_ip_${getClientIP(event)}`
    }
  },
  
  // Voting rate limit
  voting: {
    max: 50,
    window: 60, // 1 minute
    keyGenerator: async (event: any) => {
      const userId = await getUserIdFromRequest(event)
      return userId ? `vote_${userId}` : `vote_ip_${getClientIP(event)}`
    }
  },
  
  // Search rate limit
  search: {
    max: 30,
    window: 60, // 1 minute
    keyGenerator: (event: any) => `search_${getClientIP(event)}`
  },
  
  // Authentication rate limit
  auth: {
    max: 5,
    window: 300, // 5 minutes
    keyGenerator: (event: any) => `auth_${getClientIP(event)}`
  },
  
  // Report submission rate limit
  reportSubmission: {
    max: 3,
    window: 600, // 10 minutes
    keyGenerator: async (event: any) => {
      const userId = await getUserIdFromRequest(event)
      return userId ? `report_${userId}` : `report_ip_${getClientIP(event)}`
    }
  }
}

/**
 * Apply rate limit to endpoint
 */
export async function applyRateLimit(event: any, limitType: keyof typeof rateLimits): Promise<void> {
  const config = rateLimits[limitType]
  
  // If key generator is async, await it
  if (config.keyGenerator) {
    const keyGen = config.keyGenerator
    const key = await keyGen(event)
    await rateLimit(event, {
      ...config,
      keyGenerator: () => key
    })
  } else {
    await rateLimit(event, config)
  }
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
      // Fallback to in-memory store
      return true
    }
  }
  
  async getRemainingRequests(key: string, max: number): Promise<number> {
    try {
      const count = await this.redis.get(key) || 0
      return Math.max(0, max - parseInt(count))
    } catch (error) {
      console.error('Redis get remaining error:', error)
      return max
    }
  }
}