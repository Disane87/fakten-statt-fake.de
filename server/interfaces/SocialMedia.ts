export interface SocialMedia {
    extractText(url: string): Promise<string>;
    buildContext(url: string): Promise<any>;
}

export type SocialMediaType = 'threads';
