import { $fetch } from 'ofetch'

export class NewsService {
    private apiKey: string
    constructor(apiKey: string) {
        this.apiKey = apiKey
    }
    async searchNews(keywords: string[]): Promise<any[]> {
        const articles: any[] = []
        for (const kw of keywords.slice(0, 6)) {
            const q = kw;
            try {
                const newsRes = await $fetch('https://newsapi.org/v2/everything', {
                    method: 'GET',
                    params: {
                        q,
                        language: 'de',
                        sortBy: 'publishedAt',
                        pageSize: 10,
                        page: 1,
                        apiKey: this.apiKey
                    }
                })
                if (newsRes.articles) {
                    for (const a of newsRes.articles) {
                        if (!articles.some((art) => art.url === a.url)) {
                            articles.push({
                                title: a.title,
                                url: a.url,
                                domain: a.source?.name || '',
                                publishedAt: a.publishedAt,
                                summary: a.description || '',
                                verified: false,
                                relevant: true
                            })
                        }
                    }
                }
            } catch { }
        }
        // Nur relevante Quellen zurückgeben
        return articles.filter(a => a.relevant)
    }
}
