import { readBody } from 'h3'
import { $fetch } from 'ofetch'
import { FactCheckService } from '../services/FactCheckService'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { text } = body
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { error: 'Kein Text angegeben.' }
    }

    // 1. Initiale KI-Prüfung und Keywords/Sources holen
    const fs = await import('fs/promises')
    let prompt = await fs.readFile('server/prompts/factcheck.txt', 'utf8')
    prompt = prompt.replace('{{TEXT}}', text)
    const response = await $fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: {
            model: 'gemma3:4b',
            prompt,
            format: "json",
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
    let result: any = {}
    if (lastDoneObj && lastDoneObj.response) {
        try {
            result = JSON.parse(lastDoneObj.response)
            // Service für NewsAPI/Quellenprüfung
            const factCheckService = new FactCheckService(process.env.NEWSAPI_KEY || '')
            const sources = result.sources //await factCheckService.process(result.keywords || [], result.sources || [])
            // Entferne pageContent aus allen Quellen
            result.sources = sources.map((src: any) => {
                const { pageContent, ...meta } = src
                return meta
            })
        } catch (e) {
            result = { response: lastDoneObj.response }
        }
    } else {
        result = { error: 'Kein done-Objekt im Stream gefunden', raw: lines }
    }
    console.log('Factcheck result:', result)
    return result
})
