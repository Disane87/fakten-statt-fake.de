import { SupabaseService } from './SupabaseService'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'
import { RagRetrievalService } from './rag/RagRetrievalService'

export class PromptBuilderService {
    private supabaseService: SupabaseService;
    private event: any;
    constructor(event: any) {
        this.event = event;
        this.supabaseService = new SupabaseService(event);
    }
    async getEnumValues(table: 'claims' | 'prompts' | 'factcheck_texttype' | 'factcheck_tone'): Promise<string[]> {
        return await this.supabaseService.getEnumValues(table);
    }
    async getLatestPrompt(name: string): Promise<{ content: string | null, id: number | null }> {
        return await this.supabaseService.getLatestPrompt(name);
    }
    async buildFactCheckPrompt(text: string): Promise<{ prompt: string | null, promptId: number | null }> {
        const toneValues = await this.getEnumValues('factcheck_tone');
        const textTypeValues = await this.getEnumValues('factcheck_texttype');
        const { content: promptTemplateRaw, id: promptId } = await this.getLatestPrompt('factcheck');

        // Retrieve RAG context from knowledge base
        let ragContext = '';
        try {
            const ragService = new RagRetrievalService(this.event);
            const articles = await ragService.searchRelevantArticles(text, {
                matchThreshold: 0.3,
                matchCount: 5,
            });
            ragContext = ragService.buildPromptContext(articles);
            if (ragContext) {
                console.log(`[RAG] Found ${articles.length} relevant articles for prompt context`);
            }
        } catch (err) {
            console.warn('[RAG] Could not retrieve RAG context, continuing without:', err);
        }

        let prompt: string | null;
        if (promptTemplateRaw) {
            prompt = promptTemplateRaw
                .replace('{{TONE_ENUMS}}', toneValues.join(', '))
                .replace('{{TEXTTYPE_ENUMS}}', textTypeValues.join(', '))
                .replace('{{TEXT}}', text);

            // Inject RAG context before the user's claim text
            if (ragContext) {
                prompt = ragContext + '\n' + prompt;
            }
        } else {
            prompt = null;
        }

        return { prompt, promptId };
    }
}
