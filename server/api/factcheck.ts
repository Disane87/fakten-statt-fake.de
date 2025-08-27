import { $fetch } from 'ofetch'
import { FactCheckService } from '../services/FactCheckService'
import { OllamaService } from '../services/OllamaService'
import { ClaimStoreService } from '../services/ClaimStoreService'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { text } = body
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { error: 'No text provided.' }
    }

    // Supabase-Client initialisieren
    const claimStore = new ClaimStoreService(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '')
    // Prüfe, ob die Aussage (oder eine ähnliche) schon existiert
    const cached = await claimStore.findSimilarClaim(text)
    if (cached && cached.result) {
        // Falls im Cache: Wenn als 'statement' klassifiziert, direkt passende Antwort
        if (cached.result.textType === 'statement') {
            return {
                status: 'info',
                message: 'This is a general statement and will not be checked as fact or fake.',
                result: cached.result
            }
        }
        return cached.result
    }
    // 1. Initiale KI-Prüfung und Keywords/Sources holen über OllamaService
    const ollamaService = new OllamaService('gemma3:4b')
    let result: any = await ollamaService.generateFactCheck(text)
    // Falls die KI die Aussage als 'statement' klassifiziert, nicht weiter prüfen
    if (result && result.textType === 'statement') {
        await claimStore.saveClaim(text, result)
        return {
            status: 'info',
            message: 'This is a general statement and will not be checked as fact or fake.',
            result
        }
    }
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
