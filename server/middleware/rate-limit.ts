// Rate limiting middleware 
import { checkCustomRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  // Only apply rate limiting to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Get client IP from various sources
  const forwarded = event.node.req.headers['x-forwarded-for'] as string
  const clientIP = forwarded?.split(',')[0]?.trim() || 
                  event.node.req.connection?.remoteAddress || 
                  event.node.req.socket?.remoteAddress || 'unknown'
  
  // Apply different rate limits based on the endpoint
  let limit = { tokensPerInterval: 100, interval: 60000 } // Default: 100 req/min
  
  if (event.node.req.url.includes('/fact-checks/submit')) {
    limit = { tokensPerInterval: 5, interval: 300000 } // 5 req/5min
  } else if (event.node.req.url.includes('/comments/')) {
    limit = { tokensPerInterval: 10, interval: 60000 } // 10 req/min
  } else if (event.node.req.url.includes('/votes/')) {
    limit = { tokensPerInterval: 50, interval: 60000 } // 50 req/min
  } else if (event.node.req.url.includes('/search/')) {
    limit = { tokensPerInterval: 30, interval: 60000 } // 30 req/min
  } else if (event.node.req.url.includes('/auth/')) {
    limit = { tokensPerInterval: 5, interval: 300000 } // 5 req/5min
  } else if (event.node.req.url.includes('/reports/')) {
    limit = { tokensPerInterval: 3, interval: 600000 } // 3 req/10min
  }

  const key = `rate_limit_${clientIP}_${event.node.req.url}`
  const result = checkCustomRateLimit(key, limit.tokensPerInterval, limit.interval)
  
  if (!result.allowed) {
    setHeader(event, 'X-RateLimit-Limit', limit.tokensPerInterval.toString())
    setHeader(event, 'X-RateLimit-Remaining', '0')
    setHeader(event, 'Retry-After', result.remainingTime?.toString() || '60')
    
    throw createError({
      statusCode: 429,
      statusMessage: `Rate limit exceeded. Try again in ${result.remainingTime || 60} seconds.`
    })
  }
  
  // Set rate limit headers for successful requests
  const remaining = limit.tokensPerInterval - 1 // Approximate remaining requests
  setHeader(event, 'X-RateLimit-Limit', limit.tokensPerInterval.toString())
  setHeader(event, 'X-RateLimit-Remaining', remaining.toString())
})