import { $fetch } from 'ofetch'
import fs from 'fs/promises'

export class OllamaService {
    model: string
    constructor(model: string = 'gemma3:4b') {
        this.model = model
    }
    async generateFactCheck(text: string): Promise<any> {
        let prompt = await fs.readFile('server/prompts/factcheck.txt', 'utf8')
        prompt = prompt.replace('{{TEXT}}', text)
        const response = await $fetch('http://localhost:11434/api/generate', {
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
        if (lastDoneObj && lastDoneObj.response) {
            try {
                return JSON.parse(lastDoneObj.response)
            } catch (e) {
                return { response: lastDoneObj.response }
            }
        } else {
            return { error: 'Kein done-Objekt im Stream gefunden', raw: lines }
        }
    }
}
