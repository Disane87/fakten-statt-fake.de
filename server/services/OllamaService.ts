import { $fetch } from 'ofetch'
import { PromptBuilderService } from './PromptBuilderService'

export class OllamaService {
    model: string
    ollamaUrl: string
    promptBuilder: PromptBuilderService
    constructor(event?: any, model?: string, ollamaUrl?: string) {
        this.model = model || process.env.OLLAMA_MODEL || 'gemma3:4b'
        this.ollamaUrl = ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434/api/generate'
        this.promptBuilder = new PromptBuilderService(event)
    }
    async generateFactCheck(text: string): Promise<{ result: any, promptId: number | null }> {
        const { prompt, promptId } = await this.promptBuilder.buildFactCheckPrompt(text);
        if (!prompt || !promptId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required "prompt" or "id" parameter',
            })
        }
        const response = await $fetch(this.ollamaUrl, {
            method: 'POST',
            body: {
                model: this.model,
                prompt,
                format: 'json',
                stream: false,
                temperature: 0
            },
            responseType: 'text'
        })
        const lines = (response as string).split('\n').filter(Boolean)
        let lastDoneObj: any = null
        for (const line of lines) {
            try {
                const obj = JSON.parse(line)
                if (obj.done) lastDoneObj = obj
            } catch { }
        }
        let result: any
        if (lastDoneObj && lastDoneObj.response) {
            try {
                result = JSON.parse(lastDoneObj.response)
            } catch (e) {
                result = { response: lastDoneObj.response }
            }
        } else {
            result = { error: 'Kein done-Objekt im Stream gefunden', raw: lines }
        }
        return { result, promptId }
    }
}
