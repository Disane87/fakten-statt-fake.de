import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
    const start = Date.now()
    const { method, url } = event.node.req
    let body = ''
    try {
        body = JSON.stringify(await readBody(event))
    } catch { }

    event.node.res.on('finish', () => {
        const duration = Date.now() - start
        // Protokolliere Request und Response-Status
        // Du kannst hier z.B. in eine Datei schreiben, in eine Datenbank loggen oder einfach ausgeben
        // Hier: Konsolenausgabe
        console.log(`[API] ${method} ${url} | Status: ${event.node.res.statusCode} | Dauer: ${duration}ms | Body: ${body}`)
    })
})
