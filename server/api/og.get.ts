// server/api/og.get.ts
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const { url } = getQuery(event) as { url?: string }

    return await getOpenGraphData(url);
})

async function getOpenGraphData(url: string | undefined) {
    if (!url) return {}

    const target = sanitizeUrl(url)
    if (!target) return {}

    let html = ''
    try {
        html = await $fetch<string>(target, { responseType: 'text' })
    } catch {
        return {}
    }

    const og = pickOg(html)
    og.url = og.url || target
    // favicon fallback
    try {
        const u = new URL(target)
        og.favicon = og.favicon || `${u.origin}/favicon.ico`
    } catch { }

    // Heuristik: Mehrere Bilder?
    if (!og.images?.length && og.image) og.images = [og.image]

    return og;

}

function sanitizeUrl(u: string): string | null {
    try {
        const url = new URL(u.match(/^https?:\/\//i) ? u : `https://${u}`)
        return url.toString()
    } catch {
        return null
    }
}

function pick(content: string, prop: string): string | undefined {
    const re1 = new RegExp(`<meta[^>]+property=["']${escapeReg(prop)}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
    const re2 = new RegExp(`<meta[^>]+name=["']${escapeReg(prop)}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
    const m1 = content.match(re1)
    if (m1?.[1]) return decode(m1[1])
    const m2 = content.match(re2)
    if (m2?.[1]) return decode(m2[1])
    return undefined
}

function pickAll(content: string, prop: string): string[] {
    const re = new RegExp(`<meta[^>]+property=["']${escapeReg(prop)}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'ig')
    const out: string[] = []
    let m
    while ((m = re.exec(content))) {
        if (m[1]) out.push(decode(m[1]))
    }
    return out
}

function escapeReg(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function decode(s: string) {
    return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

function pickOg(html: string) {
    const siteName = pick(html, 'og:site_name') || pick(html, 'twitter:site')
    const title =
        pick(html, 'og:title') || pick(html, 'twitter:title') || pick(html, 'title')
    const description =
        pick(html, 'og:description') || pick(html, 'twitter:description') || ''
    const type = pick(html, 'og:type')
    const image = pick(html, 'og:image') || pick(html, 'twitter:image')
    const images = Array.from(new Set([
        ...pickAll(html, 'og:image'),
        ...(image ? [image] : [])
    ])).slice(0, 12) // limit

    const video =
        pick(html, 'og:video') ||
        pick(html, 'og:video:url') ||
        pick(html, 'twitter:player:stream') ||
        undefined

    // optional favicon via <link rel="icon">
    const favMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)
    const favicon = favMatch?.[1]

    // Add url property, initially an empty string
    return { siteName, title, description, type, image, images, video, favicon, url: '' }
}
