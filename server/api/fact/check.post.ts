import { $fetch } from 'ofetch'
import { FactCheckService } from '../../services/FactCheckService'
import { OllamaService } from '../../services/OllamaService'
import { ClaimStoreService } from '../../services/ClaimStoreService'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { text } = body
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { error: 'No text provided.' }
    }

    // Supabase-Client initialisieren (event weitergeben)
    const claimStore = new ClaimStoreService(event)
    // Prüfe, ob die Aussage (oder eine ähnliche) schon existiert
    const cached = await claimStore.findSimilarClaim(text)
    // if (cached && cached.result) {
    //     // Falls im Cache: Wenn als 'statement' klassifiziert, direkt passende Antwort
    //     if (cached.result.textType === 'statement') {
    //         return {
    //             status: 'info',
    //             message: 'This is a general statement and will not be checked as fact or fake.',
    //             result: cached.result
    //         }
    //     }
    //     return cached.result
    // }
    // 1. Initiale KI-Prüfung und Keywords/Sources holen über OllamaService
    const ollamaService = new OllamaService(event, 'gemma3:4b')
    let { result, promptId } = await ollamaService.generateFactCheck(text)
    // Falls die KI die Aussage als 'statement' klassifiziert, nicht weiter prüfen
    if (!result || !promptId) {
        return Error('Failed to generate a valid response from the AI.')
    }
    // if (result && result.textType === 'statement') {
    //     await claimStore.saveClaim(text, result, promptId)
    //     return {
    //         status: 'info',
    //         message: 'This is a general statement and will not be checked as fact or fake.',
    //         result
    //     }
    // }
    if (result && result.sources) {
        // Service für NewsAPI/Quellenprüfung
        const factCheckService = new FactCheckService(process.env.NEWSAPI_KEY || '', event)
        // Entferne pageContent aus allen Quellen
        result.sources = result.sources.map((src: any) => {
            const { pageContent, ...meta } = src
            return meta
        })
    }
    // Speichere die Aussage und das Ergebnis in Supabase
    await claimStore.saveClaim(text, result, promptId)
    console.log('Factcheck result:', result)
    return result
})
