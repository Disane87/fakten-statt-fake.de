import { $fetch } from 'ofetch'
import { PromptBuilderService } from './PromptBuilderService'

export class SourceVerifier {
    promptBuilder: PromptBuilderService
    constructor(event?: any) {
        this.promptBuilder = new PromptBuilderService(event)
    }
    async verifySources(sources: any[]): Promise<any[]> {
        // Technical check: exclude faulty sources directly
        const checked: any[] = []
        for (const src of sources) {
            try {
                const head = await $fetch(src.url, { method: 'HEAD' })
                src.headInfo = head
                const page = await $fetch(src.url, { method: 'GET', responseType: 'text' })
                // src.pageContent = page // Never return to frontend
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
        // AI check: calculate relevance score for each source
        if (checked.length === 0) return []
        // Prompt aus DB holen
        const promptRaw = await this.promptBuilder.getLatestPrompt('sourcecheck')
        const prompt = (promptRaw || '') + '\nPlease rate each source with a relevance score from 0 to 100. Format: [{"url":"...","title":"...","score":...}]'
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
        // Evaluate score and filter sources
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
        // Prompt aus DB holen
        const sourcePromptRaw = await this.promptBuilder.getLatestPrompt('sourcecheck')
        const promptContent = sourcePromptRaw?.content || ''
        const recheckPrompt = promptContent.replace('{{SOURCES}}', JSON.stringify(sources.map((s: any) => ({ title: s.title, url: s.url, headInfo: s.headInfo, relevant: s.relevant }))
        ))
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
