import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export class ClaimStoreService {
    private supabase: any
    constructor(url: string, key: string) {
        this.supabase = createClient(url, key)
    }
    getHash(text: string): string {
        return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex')
    }
    async findSimilarClaim(text: string): Promise<any | null> {
        const hash = this.getHash(text)
        // Suche nach exaktem Hash
        let { data, error } = await this.supabase
            .from('claims')
            .select('*')
            .eq('hash', hash)
            .limit(1)
        if (data && data.length > 0) return data[0]
        // Suche nach semantisch ähnlichen Claims mit pg_trgm similarity
        const { data: similar, error: err2 } = await this.supabase.rpc('find_similar_claim', { input_text: text })
        if (similar && similar.length > 0) return similar[0]
        return null
    }
    async saveClaim(text: string, result: any): Promise<void> {
        const hash = this.getHash(text)
        await this.supabase.from('claims').upsert({ hash, text, result })
    }
}
