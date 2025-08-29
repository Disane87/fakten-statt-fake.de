// server/api/factcheck.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string; language?: string }>(event)
  if (!body?.query) {
    throw createError({ statusCode: 400, statusMessage: 'query required' })
  }

  const res = await searchFactCheckClaims(body.query, body.language);

  return res
})
async function searchFactCheckClaims(query: string, language?: string) {
  const { factcheckApiKey } = useRuntimeConfig();
  if (!factcheckApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'FACTCHECK_API_KEY not set' });
  }

  const res = await $fetch('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
    method: 'GET',
    params: {
      key: factcheckApiKey,
      query,
      languageCode: language ?? 'de',
    },
  }).catch((e) => {
    throw createError({ statusCode: 502, statusMessage: `FactCheck API error: ${e.message}` });
  });
  return res;
}

