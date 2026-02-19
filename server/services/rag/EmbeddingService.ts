import { $fetch } from 'ofetch'

/**
 * Generates vector embeddings using Ollama (nomic-embed-text).
 * Used for both article ingestion and query-time embedding.
 */
export class EmbeddingService {
    private ollamaUrl: string
    private model: string

    constructor() {
        const baseUrl = (process.env.OLLAMA_URL || 'http://localhost:11434/api/generate')
            .replace('/api/generate', '')
            .replace(/\/$/, '')
        this.ollamaUrl = baseUrl
        this.model = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'
    }

    async generateEmbedding(text: string): Promise<number[] | null> {
        const truncated = text.substring(0, 8000) // nomic-embed-text context window

        try {
            const response = await $fetch<{ embedding: number[] }>(`${this.ollamaUrl}/api/embed`, {
                method: 'POST',
                body: {
                    model: this.model,
                    input: truncated,
                },
                timeout: 30000,
            })

            if (response.embedding && Array.isArray(response.embedding)) {
                return response.embedding
            }

            // Fallback: some Ollama versions use "embeddings" (plural) with array of arrays
            const alt = response as any
            if (alt.embeddings && Array.isArray(alt.embeddings) && alt.embeddings.length > 0) {
                return alt.embeddings[0]
            }

            console.error('[Embedding] Unexpected response format:', Object.keys(response))
            return null
        } catch (error) {
            console.error('[Embedding] Error generating embedding:', error)
            return null
        }
    }

    async generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
        const results: (number[] | null)[] = []
        // Process sequentially to avoid overloading Ollama
        for (const text of texts) {
            results.push(await this.generateEmbedding(text))
        }
        return results
    }

    /**
     * Builds a text representation suitable for embedding from article fields.
     * Combines title and content/summary for richer semantic representation.
     */
    buildEmbeddingText(title: string, content: string | null, summary: string | null): string {
        const parts = [title]
        if (summary) parts.push(summary)
        if (content && content !== summary) {
            // Add content if it differs from summary, truncated to keep embedding focused
            parts.push(content.substring(0, 4000))
        }
        return parts.join('\n\n')
    }
}
