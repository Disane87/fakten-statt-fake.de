// server/api/factcheck.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string; language?: string }>(event)
  if (!body?.query) {
    throw createError({ statusCode: 400, statusMessage: 'query required' })
  }

  const { factcheckApiKey } = useRuntimeConfig()
  if (!factcheckApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'FACTCHECK_API_KEY not set' })
  }

  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${encodeURIComponent(factcheckApiKey)}&query=${encodeURIComponent(body.query)}&languageCode=${body.language ?? 'de'}`

  const res = await $fetch(url).catch((e) => {
    throw createError({ statusCode: 502, statusMessage: `FactCheck API error: ${e.message}` })
  })

  return res
})
