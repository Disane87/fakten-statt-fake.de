// server/api/ocr.post.ts
import { defineEventHandler, readMultipartFormData, createError, readBody } from 'h3'

export interface Vertex {
    x: number;
    y: number;
}

export interface BoundingPoly {
    vertices: Vertex[];
}

export interface TextAnnotation {
    locale?: string;
    description: string;
    boundingPoly: BoundingPoly;
}

export interface Symbol {
    boundingBox: BoundingPoly;
    text: string;
    confidence: number;
    property?: {
        detectedBreak?: {
            type: string;
        };
    };
}

export interface Word {
    property?: {
        detectedLanguages: { languageCode: string; confidence: number }[];
    };
    boundingBox: BoundingPoly;
    symbols: Symbol[];
    confidence: number;
}

export interface Paragraph {
    boundingBox: BoundingPoly;
    words: Word[];
    confidence: number;
}

export interface Block {
    boundingBox: BoundingPoly;
    paragraphs: Paragraph[];
    blockType: string;
    confidence: number;
}

export interface Page {
    property?: {
        detectedLanguages: { languageCode: string; confidence: number }[];
    };
    width: number;
    height: number;
    blocks: Block[];
    confidence: number;
}

export interface FullTextAnnotation {
    pages: Page[];
    text: string;
}

export interface OcrResponse {
    textAnnotations: TextAnnotation[];
    fullTextAnnotation: FullTextAnnotation;
}


export default defineEventHandler(async (event) => {
    // API-Key aus Runtime-Konfiguration
    const { cloudVisionApiKey } = useRuntimeConfig()
    if (!cloudVisionApiKey) {
        throw createError({ statusCode: 500, statusMessage: 'CLOUD_VISION_API_KEY not configured' })
    }

    const parts = await readMultipartFormData(event)
    const file = parts?.find((p: any) => p.type && p.filename)
    if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

    // Validierung der Dateigröße (10MB Limit)
    if (file.data.length > 10 * 1024 * 1024) {
        throw createError({ statusCode: 413, statusMessage: 'File too large (max 10MB)' })
    }

    // Validierung des Dateityps
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type!)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Allowed: JPEG, PNG, WebP' })
    }

    const base64Image = file.data.toString('base64')

    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${cloudVisionApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requests: [
                {
                    image: { content: base64Image },
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                }
            ]
        })
    })

    if (!res.ok) {
        throw createError({ statusCode: res.status, statusMessage: await res.text() })
    }

    const json = await res.json().catch(() => {
        throw createError({ statusCode: 502, statusMessage: 'Invalid API response' })
    })
    return (json.responses[0] as OcrResponse).textAnnotations
        .filter(ta => !!ta.locale)
        .map(ta => ({
            description: ta.description,
            locale: ta.locale
        }));
})
