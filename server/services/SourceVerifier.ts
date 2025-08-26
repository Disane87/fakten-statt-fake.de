import { $fetch } from 'ofetch'
import fs from 'fs/promises'

export class SourceVerifier {
    async verifySources(sources: any[]): Promise<any[]> {
        // Technische Prüfung: Fehlerhafte Quellen direkt ausschließen
        const checked: any[] = []
        for (const src of sources) {
            try {
                const head = await $fetch(src.url, { method: 'HEAD' })
                src.headInfo = head
                const page = await $fetch(src.url, { method: 'GET', responseType: 'text' })
                // src.pageContent = page // Niemals an das Frontend zurückgeben
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
            if (src.relevant) checked.push(src)
        }
        // KI-Prüfung: Relevanzscore für jede Quelle berechnen
        if (checked.length === 0) return []
        const fs = await import('fs/promises')
        const promptRaw = await fs.readFile('server/prompts/sourcecheck.txt', 'utf8')
        // Prompt für Score: Jede Quelle einzeln prüfen
        const prompt = promptRaw + '\nBitte bewerte jede Quelle mit einem Relevanzscore von 0 bis 100. Format: [{"url":"...","title":"...","score":...}]'
        const sourcesForCheck = checked.map((s: any) => ({ title: s.title, url: s.url }))
        const recheckPrompt = prompt.replace('{{SOURCES}}', JSON.stringify(sourcesForCheck))
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
        // Score auswerten und Quellen filtern
        const threshold = 60
        if (Array.isArray(recheckResult)) {
            for (const src of checked) {
                const found = recheckResult.find((r: any) => r.url === src.url)
                if (found) {
                    src.relevanceScore = found.score
                }
            }
            return checked.filter((src: any) => src.relevanceScore >= threshold)
        }
        return []
    }

    async llmCheck(sources: any[]): Promise<any[]> {
        const sourcePromptRaw = await fs.readFile('server/prompts/sourcecheck.txt', 'utf8')
        const recheckPrompt = sourcePromptRaw.replace('{{SOURCES}}', JSON.stringify(sources.map((s: any) => ({ title: s.title, url: s.url, headInfo: s.headInfo, relevant: s.relevant }))))
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
            for (const src of sources) {
                const found = recheckResult.find((r: any) => r.url === src.url)
                if (found) {
                    src.verified = found.verified
                    src.relevant = found.relevant
                    src.verifyReason = found.reason
                }
            }
            return sources.filter((src: any) => src.verified && src.relevant)
        }
        return sources
    }
}
