import { $fetch } from 'ofetch'
import { PromptBuilderService } from './PromptBuilderService'
import type { H3Event, EventHandlerRequest } from 'h3';

export class OllamaService {
    model: string
    ollamaUrl: string
    promptBuilder: PromptBuilderService
    constructor(event?: H3Event<EventHandlerRequest>) {

        const { ollamaModel, ollamaUrl: configOllamaUrl } = useRuntimeConfig();
        this.model = (ollamaModel) as string
        this.ollamaUrl = (configOllamaUrl) as string
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
