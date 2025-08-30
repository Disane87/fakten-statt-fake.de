// server/api/factcheck.post.ts
import { SocialMediaFactory } from '../../../services/socialMedia/SocialMediaFactory';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string; language?: string }>(event)
  if (!body?.query) {
    throw createError({ statusCode: 400, statusMessage: 'query required' })
  }

  // Prüfe, ob die Query ein Link zu einem Social Media ist
  let socialMediaText: string | null = null;
  try {
    const url = new URL(body.query);
    const socialMedia = SocialMediaFactory.getSocialMedia(body.query);
    if (socialMedia) {
      // Stub: Get test text from social media
      socialMediaText = await socialMedia.extractText(body.query);
    }
  } catch {
    // Not a valid link, ignore social media
  }

  // Optional: Get context from social media
  // const context = socialMedia ? await socialMedia.buildContext(body.query) : null;

  // If social media text is available, return it as response (Stub)
  if (socialMediaText) {
    return { text: socialMediaText, source: 'socialMedia' };
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

