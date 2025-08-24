export default defineEventHandler(async (event) => {
  return {
    data: {
      message: 'Hello from Nuxt serverless API!',
      timestamp: new Date().toISOString(),
      method: getMethod(event),
      userAgent: getHeader(event, 'user-agent'),
      endpoint: 'hello'
    }
  }
})