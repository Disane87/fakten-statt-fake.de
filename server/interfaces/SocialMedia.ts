

export type SocialMediaId = {
    [key: string]: string;
};

export abstract class SocialMediaConnector {
    // Jeder Connector muss einen Regex zur URL-Erkennung definieren
    abstract urlRegex: RegExp;

    abstract extractText(url: string): Promise<string>;
    abstract buildContext(url: string): Promise<any>;

    /**
     * Extrahiert Handle und Post-ID aus der URL
     * Gibt ein Objekt { handle, postId } oder null zurück
     */
    protected getSocialMediaIdentifiers(url: string): { handle: string, postId: string } | null {
        const match = url.match(this.urlRegex);
        if (match && match[1] && match[2]) {
            return { handle: match[1], postId: match[2] };
        }
        return null;
    }
}

export type SocialMediaType = 'threads';
