import { createClient } from '@supabase/supabase-js'

export class PromptBuilderService {
    private supabase: any
    constructor(url: string, key: string) {
        this.supabase = createClient(url, key)
    }
    async getEnumValues(table: string): Promise<string[]> {
        const { data, error } = await this.supabase.from(table).select('value')
        if (data && Array.isArray(data)) {
            return data.map((row: any) => row.value)
        }
        return []
    }
    async buildFactCheckPrompt(text: string): Promise<string> {
        const toneValues = await this.getEnumValues('factcheck_tone')
        const textTypeValues = await this.getEnumValues('factcheck_texttype')
        // Weitere Schlüsselwerte prüfen
        // result: fact|fake (fix)
        // language: ISO-639-1 (fix)
        // fakeTactic: tactic, description (frei)
        // sources: title, url, verified (frei)
        // claim, keywords, compactCounter, explanation, explanationDetails (frei)
        // Prompt dynamisch aufbauen:
        return `Check the following text for fact or fake. Follow this schema strictly:

1. Detect the language of the text (ISO-639-1 code, only 2 letters, e.g. "en", "de").
2. Determine the tone (array, only values from: [${toneValues.map(v => '"' + v + '"').join(',')}])
   and the type of the text (exactly 1 value from: [${textTypeValues.map(v => '"' + v + '"').join(',')}]).
3. Extract the central, verifiable claims (array, only verifiable core statements in short sentences, no opinions).
4. Extract the most important keywords as an array (3–10 terms, only relevant, no stopwords, all lowercase).
5. Return a compact counter-argument with max. 160 characters (formulated to refute, no links, no sources).
6. Return a short, easy-to-understand explanation (1–2 sentences).
7. Return a detailed explanation ("explanationDetails") that explains your assessment in detail and references sources.
8. Add at least two real, verifiable sources.
   - No invented URLs.
   - No blogs, forums or social media posts.
   - Only official institutions, established media or scientific publications.
   - If a source is behind a paywall, still provide title and URL, but set "verified": false.
   - Always at least 2 entries in the array.
   - Sources must directly support the claims or explanation.
   - If no relevant sources are found: keep searching until at least 2 solid sources are present.
9. If it is a fake, identify all tactics used
   (array of objects {tactic, description}).
   - If result="fact", set "fakeTactic": [].

Reply strictly as JSON in this format:
{
  "result": "fact"|"fake",
  "language": "...",
  "tone": ["..."],
  "textType": "...",
  "claim": ["..."],
  "keywords": ["..."],
  "compactCounter": "...",
  "explanation": "...",
  "explanationDetails": "...",
  "sources": [ { "title": "...", "url": "...", "verified": true }, ... ],
  "fakeTactic": [ { "tactic": "...", "description": "..." } ]
}

The JSON output must match this schema exactly. No extra fields, no comments.

Important: Always reply with all property values and texts in English, regardless of the input language.

Text:
${text}`
    }
}
