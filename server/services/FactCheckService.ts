import { NewsService } from './NewsService'
import { SourceVerifier } from './SourceVerifier'

export class FactCheckService {
    private newsService: NewsService
    private sourceVerifier: SourceVerifier
    constructor(newsApiKey: string, event?: any) {
        this.newsService = new NewsService(newsApiKey)
        this.sourceVerifier = new SourceVerifier(event)
    }
    async process(keywords: string[], initialSources: any[]): Promise<any[]> {
        // NewsAPI search
        const newsSources = await this.newsService.searchNews(keywords)
        // Combine initial and found sources
        const allSources = [...initialSources, ...newsSources].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i)
        // Check sources
        const checkedSources = await this.sourceVerifier.verifySources(allSources)
        // LLM check
        const verifiedSources = await this.sourceVerifier.llmCheck(checkedSources)
        return verifiedSources
    }
}
