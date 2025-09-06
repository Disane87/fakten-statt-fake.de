import { $fetch } from 'ofetch'
// import { FactCheckService } from '../../services/FactCheckService'
// import { OllamaService } from '../../services/OllamaService'
// import { ClaimStoreService } from '../../services/ClaimStoreService'
// import { SocialMediaFactory } from '../../services/socialMedia/SocialMediaFactory'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    let { text } = body
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { error: 'No text provided.' }
    }

    // For demonstration purposes, return a mock result
    return {
        claim: text,
        rating: "needs-verification",
        confidence: 0.7,
        reasoning: "This is a mock result since the backend services are temporarily disabled.",
        sources: [],
        fact_check_summary: "Mock fact check result for theme development",
        created_at: new Date().toISOString()
    }

    // Commented out for theme development - original implementation:
    /*
    // Social-Media-Erkennung und Extraktion
    let socialMediaText: string | null = null;
    try {
        const url = new URL(text);
        const socialMedia = SocialMediaFactory.getSocialMedia(text);
        if (socialMedia) {
            // Stub: Get test text from social media
            socialMediaText = await socialMedia.extractText(text);
        }
    } catch {
        // Not a valid link, ignore social media
    }

    if (socialMediaText) {
        text = socialMediaText; // Override text with extracted social media text
        // return { text: socialMediaText, source: 'socialMedia' };
    }

    // Supabase-Client initialisieren (event weitergeben)
    const claimStore = new ClaimStoreService(event)
    // Prüfe, ob die Aussage (oder eine ähnliche) schon existiert
    const cached = await claimStore.findSimilarClaim(text)
    if (cached && cached.result) {
        return cached.result
    }

    const runtimeConfig = useRuntimeConfig();
    const ollamaModel: string = runtimeConfig.ollamaModel as string;
    // 1. Initiale KI-Prüfung und Keywords/Sources holen über OllamaService
    const ollamaService = new OllamaService(event)
    let { result, promptId } = await ollamaService.generateFactCheck(text)
    if (!result || !promptId) {
        return Error('Failed to generate a valid response from the AI.')
    }
    if (result && result.sources) {
        const factCheckService = new FactCheckService(process.env.NEWSAPI_KEY || '', event)
        result.sources = result.sources
            .map((src: any) => {
                const { pageContent, ...meta } = src
                return meta
            })
            .filter((src: any) => Object.keys(src).length > 0)
    }
    await claimStore.saveClaim(text, result, promptId)
    console.log('Factcheck result:', result)
    return result
    */
})
