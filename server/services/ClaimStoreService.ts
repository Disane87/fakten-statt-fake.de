import { SupabaseService } from './SupabaseService'

export class ClaimStoreService {
    private supabaseService: SupabaseService;
    constructor(event: any) {
        this.supabaseService = new SupabaseService(event);
    }
    getHash(text: string): string {
        return this.supabaseService.getHash(text);
    }
    async findSimilarClaim(text: string): Promise<any | null> {
        return await this.supabaseService.findSimilarClaim(text);
    }
    async saveClaim(text: string, result: any, prompt_id: number | null): Promise<void> {
        await this.supabaseService.saveClaim(text, result, prompt_id);
    }
}
