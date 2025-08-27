import { FactCheckService } from '../services/FactCheckService'
import { OllamaService } from '../services/OllamaService'
import { ClaimStoreService } from '../services/ClaimStoreService'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { text } = body
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { error: 'Kein Text angegeben.' }
    }

    // Supabase-Client initialisieren
    const claimStore = new ClaimStoreService(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '')
    // Prüfe, ob die Aussage (oder eine ähnliche) schon existiert
    const cached = await claimStore.findSimilarClaim(text)
    if (cached && cached.result) {
        console.log('Claim aus DB:', cached)
        return cached.result
    }
    // 1. Initiale KI-Prüfung und Keywords/Sources holen über OllamaService
    const ollamaService = new OllamaService('gemma3:4b')
    let result: any = await ollamaService.generateFactCheck(text)
    if (result && result.sources) {
        // Service für NewsAPI/Quellenprüfung
        const factCheckService = new FactCheckService(process.env.NEWSAPI_KEY || '')
        // Entferne pageContent aus allen Quellen
        result.sources = result.sources.map((src: any) => {
            const { pageContent, ...meta } = src
            return meta
        })
    }
    // Speichere die Aussage und das Ergebnis in Supabase
    await claimStore.saveClaim(text, result)
    console.log('Factcheck result:', result)
    return result
})
