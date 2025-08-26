
import type { IncomingMessage } from 'http'
import { $fetch } from 'ofetch'

type FactCheckSource = {
    title: string;
    url: string;
    verified: boolean;
}

type Mood = 'neutral' | 'positiv' | 'negativ' | 'kritisch' | 'sachlich' | 'emotional' | 'ironisch';

type TextType = 'Meinung' | 'Aussage' | 'Frage' | 'Behauptung' | 'Zitat';

type LanguageCode = 'de' | 'en' | 'fr' | 'es' | 'it' | 'ru' | 'cn' | 'tr';
type FactCheckResult = {
    result: 'Fakt' | 'Fake';
    language: LanguageCode;
    tone: Mood[];
    textType: TextType;
    claim: string[];
    compactCounter: string;
    explanation: string;
    explanationDetails: string;
    sources: FactCheckSource[];
    fakeTactic?: Array<{
        tactic: string;
        description: string;
    }>;
}

type OllamaResponse = {
    response: string
    done: boolean
    model?: string
    created_at?: string
    total_duration?: number
    load_duration?: number
    prompt_eval_duration?: number
    eval_duration?: number
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { text } = body
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { error: 'Kein Text angegeben.' }
    }

    // 1. Initiale KI-Prüfung und Quellen holen
    const response = await $fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: {
            model: 'gemma3:4b',
            prompt: `Prüfe den folgenden Text auf Fakt oder Fake. Gehe dabei wie folgt vor:\n\n1. Erkenne die Sprache des Textes (ISO-639-1-Code, z.B. "de", "en", "fr", "es", "it", "ru", "cn", "tr").\n2. Bestimme die Tonalität (z.B. neutral, positiv, negativ, kritisch, sachlich, emotional, ironisch) und den Typ des Textes (Meinung, Aussage, Frage, Behauptung, Zitat).\n3. Extrahiere alle zentralen Claims (Kernaussagen) als Array.\n4. Gib ein kompaktes Gegenargument mit maximal 160 Zeichen zurück, das als Widerlegung genutzt werden kann.\n5. Führe eine ausführliche Begründung an, warum der Text als Fakt, Fake, Meinung etc. eingestuft wurde.\n6. Füge mindestens zwei unabhängige, überprüfbare Quellen hinzu, die deine Einschätzung belegen. Prüfe, ob diese Quellen wirklich unabhängig und vertrauenswürdig sind und markiere sie im JSON mit "verified": true oder false.\n7. Falls es sich um einen Fake handelt, identifiziere alle verwendeten Taktiken (z.B. Framing, Derailing, Whataboutism, Cherry Picking, Falsche Kausalität, Ad Hominem, etc.) als Array und erkläre jede Taktik für Laien verständlich.\n\nAntworte ausschließlich als JSON im folgenden Format:\n{\n  "result": "Fakt"|"Fake",\n  "language": "...",\n  "tone": [...],\n  "textType": "...",\n  "claim": ["...", "..."],\n  "compactCounter": "...",\n  "explanation": "...",\n  "explanationDetails": "...",\n  "sources": [ { "title": "...", "url": "...", "verified": true }, ... ],\n  "fakeTactic": [ { "tactic": "...", "description": "..." }, ... ]\n}\n\nVerwende ausschließlich die angegebenen Werte und keine anderen. Die Eigenschaft "compactCounter" soll maximal 160 Zeichen lang sein. Die Eigenschaft "explanationDetails" soll eine ausführliche Begründung liefern.\nText:\n${text}`,
            format: "json",
            stream: false,
            temperature: 0
        },
        responseType: 'text'
    })

    // NDJSON verarbeiten: jede Zeile ist ein JSON-Objekt
    const lines = (response as string).split('\n').filter(Boolean)
    let lastDoneObj: any = null
    for (const line of lines) {
        try {
            const obj = JSON.parse(line)
            if (obj.done) lastDoneObj = obj
        } catch (e) {
            // ignore parse errors
        }
    }

    let result: any = {}
    if (lastDoneObj && lastDoneObj.response) {
        try {
            result = JSON.parse(lastDoneObj.response)
            // Filtere Tone auf erlaubte Moods
            const allowedMoods: Mood[] = ['neutral', 'positiv', 'negativ', 'kritisch', 'sachlich', 'emotional', 'ironisch'];
            if (Array.isArray(result.tone)) {
                result.tone = result.tone
                    .map((m: string) => m.toLowerCase())
                    .filter((m: string): m is Mood => allowedMoods.includes(m as Mood));
            }
            // Filtere textType auf erlaubte Werte
            const allowedTextTypes: TextType[] = ['Meinung', 'Aussage', 'Frage', 'Behauptung', 'Zitat'];
            if (typeof result.textType === 'string' && !allowedTextTypes.includes(result.textType)) {
                result.textType = 'Aussage'; // Fallback
            }

            // 2. Quellen per HEAD- und GET-Request prüfen und Infos holen
            if (Array.isArray(result.sources)) {
                for (const src of result.sources) {
                    try {
                        const head = await $fetch(src.url, { method: 'HEAD' })
                        src.headInfo = head // z.B. Status, Header
                        // GET-Request für Content-Check
                        const page = await $fetch(src.url, { method: 'GET', responseType: 'text' })
                        src.pageContent = page
                        // Prüfe auf typische Fehlertexte
                        if (typeof page === 'string' && (
                            page.includes('No Results Found') ||
                            page.includes('404') ||
                            page.includes('not found') ||
                            page.length < 100
                        )) {
                            src.relevant = false
                        } else {
                            src.relevant = true
                        }
                    } catch (e) {
                        src.headInfo = { error: true }
                        src.relevant = false
                    }
                }
                // 3. Quellen nochmals durch die KI prüfen
                const sourcesForCheck = result.sources.map((s: any) => ({ title: s.title, url: s.url, headInfo: s.headInfo, relevant: s.relevant }))
                const recheckPrompt = `Prüfe die folgenden Quellen und deren HEAD-Response-Infos und Content auf Vertrauenswürdigkeit, Unabhängigkeit und thematische Relevanz. Gib für jede Quelle ein JSON-Objekt mit { url, verified: true|false, relevant: true|false, reason } zurück.\nQuellen:\n${JSON.stringify(sourcesForCheck)}`
                const recheckResponse = await $fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    body: {
                        model: 'gemma3:4b',
                        prompt: recheckPrompt,
                        format: 'json',
                        stream: false
                    },
                    responseType: 'text'
                })
                const recheckLines = (recheckResponse as string).split('\n').filter(Boolean)
                let recheckResult: any = null
                for (const line of recheckLines) {
                    try {
                        const obj = JSON.parse(line)
                        if (Array.isArray(obj)) recheckResult = obj
                    } catch (e) { }
                }
                if (Array.isArray(recheckResult)) {
                    for (const src of result.sources) {
                        const found = recheckResult.find((r: any) => r.url === src.url)
                        if (found) {
                            src.verified = found.verified
                            src.relevant = found.relevant
                            src.verifyReason = found.reason
                        }
                    }
                    // Filtere nur verifizierte und relevante Quellen
                    result.sources = result.sources.filter((src: any) => src.verified && src.relevant)
                }
            }
        } catch (e) {
            result = { response: lastDoneObj.response }
        }
    } else {
        result = { error: 'Kein done-Objekt im Stream gefunden', raw: lines }
    }
    return result
})
