import RssParser from 'rss-parser'
import type { RagSource, ParsedFeedItem } from './types'

/**
 * Generic RSS/Atom feed parser.
 * Handles different feed formats and extracts normalized article data.
 */
export class RssParserService {
    private parser: RssParser

    constructor() {
        this.parser = new RssParser({
            timeout: 15000,
            headers: {
                'User-Agent': 'FaktenStattFake/1.0 (Fact-Check RSS Aggregator)',
                'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
            },
            customFields: {
                item: [
                    ['content:encoded', 'contentEncoded'],
                    ['dc:creator', 'dcCreator'],
                ],
            },
        })
    }

    async parseFeed(source: RagSource): Promise<ParsedFeedItem[]> {
        try {
            const feed = await this.parser.parseURL(source.feed_url)
            const items: ParsedFeedItem[] = []

            for (const item of feed.items) {
                const parsed = this.normalizeItem(item)
                if (parsed) {
                    items.push(parsed)
                }
            }

            console.log(`[RSS] Parsed ${items.length} items from ${source.name}`)
            return items
        } catch (error) {
            console.error(`[RSS] Error parsing feed for ${source.name} (${source.feed_url}):`, error)
            return []
        }
    }

    private normalizeItem(item: RssParser.Item & { contentEncoded?: string; dcCreator?: string }): ParsedFeedItem | null {
        const url = item.link
        if (!url || !item.title) return null

        // Extract the best available content
        const rawContent = item.contentEncoded || item.content || item.contentSnippet || ''
        const content = this.stripHtml(rawContent)

        // Summary: prefer contentSnippet (already stripped), fallback to truncated content
        const summary = item.contentSnippet
            || this.truncate(content, 500)
            || ''

        // Parse date
        let publishedAt: Date | null = null
        if (item.pubDate || item.isoDate) {
            const dateStr = item.isoDate || item.pubDate
            if (dateStr) {
                const parsed = new Date(dateStr)
                if (!isNaN(parsed.getTime())) {
                    publishedAt = parsed
                }
            }
        }

        return {
            title: item.title.trim(),
            url: url.trim(),
            content: content.trim(),
            summary: summary.trim(),
            author: item.creator || item.dcCreator || null,
            publishedAt,
        }
    }

    private stripHtml(html: string): string {
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim()
    }

    private truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
    }
}
