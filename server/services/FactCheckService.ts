import { NewsService } from './NewsService'
import { SourceVerifier } from './SourceVerifier'

export class FactCheckService {
    private newsService: NewsService
    private sourceVerifier: SourceVerifier
    constructor(newsApiKey: string) {
        this.newsService = new NewsService(newsApiKey)
        this.sourceVerifier = new SourceVerifier()
    }
    async process(keywords: string[], initialSources: any[]): Promise<any[]> {
        // NewsAPI-Suche
        const newsSources = await this.newsService.searchNews(keywords)
        // Kombiniere initiale und gefundene Quellen
        const allSources = [...initialSources, ...newsSources].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i)
        // Prüfe Quellen
        const checkedSources = await this.sourceVerifier.verifySources(allSources)
        // LLM-Check
        const verifiedSources = await this.sourceVerifier.llmCheck(checkedSources)
        return verifiedSources
    }
}
