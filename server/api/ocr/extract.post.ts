// server/api/ocr.post.ts
import { defineEventHandler, readMultipartFormData, createError, readBody } from 'h3'

const API_KEY = process.env.GCV_API_KEY!

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
    const parts = await readMultipartFormData(event)
    const file = parts?.find(p => p.type && p.filename)
    if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

    const base64Image = file.data.toString('base64')

    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
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

    const json = await res.json()
    return (json.responses[0] as OcrResponse).textAnnotations
        .filter(ta => !!ta.locale)
        .map(ta => ({
            description: ta.description,
            locale: ta.locale
        }));
})
