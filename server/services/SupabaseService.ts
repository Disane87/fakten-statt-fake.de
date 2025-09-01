import crypto from 'crypto'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js'

export class SupabaseService {
    private event: any;
    constructor(event: any) {
        this.event = event;
    }
    private async getClient(): Promise<SupabaseClient<Database>> {
        return await serverSupabaseClient<Database>(this.event);
    }
    getHash(text: string): string {
        return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex')
    }
    async findSimilarClaim(text: string): Promise<any | null> {
        const client = await this.getClient();
        const { data: similar, error } = await client.rpc('find_similar_claim', { input_text: text })
        if (error) {
            console.error('Supabase RPC error find_similar_claim:', error)
            throw createError({ statusCode: 500, statusMessage: `Supabase RPC error: ${error.message || JSON.stringify(error)}` })
        }
        if (similar && similar.length > 0) return similar[0]
        return null
    }
    async saveClaim(text: string, result: any, promptId?: number | string | null): Promise<void> {
        const client = await this.getClient();
        let prompt_id_value: number | null = null
        if (promptId !== undefined && promptId !== null) {
            if (typeof promptId === 'number' && Number.isInteger(promptId)) {
                prompt_id_value = promptId
            } else if (typeof promptId === 'string' && /^\d+$/.test(promptId)) {
                prompt_id_value = parseInt(promptId, 10)
            } else if (typeof promptId === 'object' && (promptId as any).id) {
                const v = (promptId as any).id
                if (typeof v === 'number' && Number.isInteger(v)) prompt_id_value = v
                else if (typeof v === 'string' && /^\d+$/.test(v)) prompt_id_value = parseInt(v, 10)
            } else {
                console.warn('Non-numeric promptId provided, storing null to avoid FK type error', { promptId })
                prompt_id_value = null
            }
        }
        const insertObj: any = { hash: this.getHash(text), text, result, prompt_id: prompt_id_value }
        console.debug('Inserting claim into DB:', { insertObj, promptIdType: typeof promptId, promptIdValue: prompt_id_value })
        const { data: insertData, error } = await client.from('claims').insert(insertObj).select()
        if (error) {
            console.error('Error saving claim:', {
                error,
                insertObj,
            })
            throw createError({ statusCode: 500, statusMessage: `Error saving claim: ${error.message || JSON.stringify(error)}; details: ${JSON.stringify(error.details || error)}` })
        }
        console.debug('Insert successful, returned rows:', insertData)
    }
    async getEnumValues(table: 'claims' | 'prompts' | 'factcheck_texttype' | 'factcheck_tone'): Promise<string[]> {
        const client = await this.getClient();
        const { data, error } = await client.from(table).select('value')
        if (error) {
            console.error('Supabase error getEnumValues:', { table, error })
            throw createError({ statusCode: 500, statusMessage: `Error fetching enum values: ${error.message || JSON.stringify(error)}` })
        }
        if (data && Array.isArray(data)) {
            return data.map((row: any) => row.value)
        }
        return []
    }
    async getLatestPrompt(name: string): Promise<{ content: string | null, id: number | null }> {
        const client = await this.getClient();
        const { data, error } = await client
            .from('prompts')
            .select('content, id')
            .eq('name', name)
            .order('version', { ascending: false })
            .limit(1)
        if (error) {
            console.error('Supabase error getLatestPrompt:', { name, error })
            throw createError({ statusCode: 500, statusMessage: `Error fetching latest prompt: ${error.message || JSON.stringify(error)}` })
        }
        if (data && data.length > 0) {
            const rawId = data[0].id
            const idNum = typeof rawId === 'number' ? rawId : (typeof rawId === 'string' && /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null)
            return { content: data[0].content, id: idNum }
        }
        return { content: null, id: null }
    }

    async getClaimById(id: number): Promise<any | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from('claims')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Supabase error getClaimById:', { id, error })
            if (error.code === 'PGRST116') {
                // No rows found
                return null
            }
            throw createError({ statusCode: 500, statusMessage: `Error fetching claim: ${error.message || JSON.stringify(error)}` })
        }

        return data
    }
}
