import { SupabaseService } from './SupabaseService'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

export class PromptBuilderService {
    private supabaseService: SupabaseService;
    constructor(event: any) {
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

        let prompt: string | null;
        if (promptTemplateRaw) {
            prompt = promptTemplateRaw
                .replace('{{TONE_ENUMS}}', toneValues.join(', '))
                .replace('{{TEXTTYPE_ENUMS}}', textTypeValues.join(', '));
        } else {
            prompt = null;
        }

    return { prompt, promptId };
    }
}
