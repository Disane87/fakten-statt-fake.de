
import { SocialMediaConnector } from '../../../interfaces/SocialMedia';
import { RegisterSocialMedia } from '../SocialMediaRegistry';

interface ThreadsPost {
    id: string;
    text: string;
    media_type: string;
    media_url?: string;
    permalink: string;
    timestamp: string;
    username: string;
    is_quote_post?: boolean;
    has_replies?: boolean;
    reply_to?: string;
}

interface ThreadsConversation {
    original_post: ThreadsPost;
    replies: ThreadsPost[];
    target_post: ThreadsPost;
    full_text: string;
}

interface ThreadsAppAccessTokenResponse {
    access_token: string;
    token_type: string;
}

@RegisterSocialMedia('threads.com')
export class ThreadsSocialMedia extends SocialMediaConnector {
    override urlRegex = /threads\.com\/@([\w\d\.\-_]+)\/post\/([\w\d\-]+)/;

    private accessToken: string = '';
    private appId: string;
    private appSecret: string;
    private baseUrl = 'https://graph.threads.net/v1.0';
    private tokenExpiresAt: number = 0;

    constructor() {
        super();
        const config = useRuntimeConfig();
        this.appId = config.threadsAppId || '';
        this.appSecret = config.threadsAppSecret || '';

        if (!this.appId || !this.appSecret) {
            throw new Error('THREADS_APP_ID and THREADS_APP_SECRET environment variables are required');
        }
    }

    /**
     * Generiert ein App Access Token für Threads API
     */
    private async getAppAccessToken(): Promise<string> {
        // Prüfe ob Token noch gültig ist (mit 5 Minuten Puffer)
        if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
            return this.accessToken;
        }

        try {
            // Für App Access Token verwenden wir das Format app_id|app_secret
            this.accessToken = `TH|${this.appId}|${this.appSecret}`;
            // App Access Tokens laufen nicht ab, aber wir setzen eine lange Gültigkeitsdauer
            this.tokenExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 Stunden

            return this.accessToken;
        } catch (error) {
            console.error('Error getting Threads app access token:', error);
            throw new Error('Failed to authenticate with Threads API');
        }
    }

    /**
     * Erstellt einen authentifizierten API-Request
     */
    private async makeAuthenticatedRequest(url: string): Promise<Response> {
        const token = await this.getAppAccessToken();
        const separator = url.includes('?') ? '&' : '?';
        const authenticatedUrl = `${url}${separator}access_token=${(token)}`;

        const response = await fetch(authenticatedUrl, {
            headers: {
                'User-Agent': 'fakten-statt-fake.de/1.0',
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token ist ungültig, versuche neuen zu holen
                this.accessToken = '';
                this.tokenExpiresAt = 0;

                // Retry mit neuem Token
                const newToken = await this.getAppAccessToken();
                const retryUrl = url.replace(/access_token=[^&]*/, `access_token=${encodeURIComponent(newToken)}`);
                return fetch(retryUrl);
            }
            throw new Error(`Threads API error: ${response.status} - ${await response.text()}`);
        }

        return response;
    }

    async extractText(url: string): Promise<string> {
        try {
            const identifiers = this.getSocialMediaIdentifiers(url);
            if (!identifiers) {
                throw new Error('Invalid Threads URL format');
            }
            const postId = identifiers.postId; // Post-ID aus der URL

            const post = await this.getPost(postId);

            // Prüfen ob es eine Antwort ist
            if (post.reply_to) {
                const conversation = await this.getFullConversation(postId);
                return conversation.full_text;
            }

            return post.text;
        } catch (error) {
            console.error('Error extracting text from Threads:', error);
            return 'Fehler beim Laden des Threads-Posts';
        }
    }

    async buildContext(url: string): Promise<any> {
        try {
            const identifiers = this.getSocialMediaIdentifiers(url);
            if (!identifiers) {
                throw new Error('Invalid Threads URL format');
            }
            const postId = identifiers.postId;

            const post = await this.getPost(postId);

            let context: any = {
                platform: 'Threads',
                url,
                post_id: postId,
                username: post.username,
                timestamp: post.timestamp,
                is_reply: !!post.reply_to
            };

            if (post.reply_to) {
                const conversation = await this.getFullConversation(postId);
                context.conversation = conversation;
                context.conversation_length = conversation.replies.length;
            }

            return context;
        } catch (error) {
            console.error('Error building context for Threads:', error);
            return { context: 'Fehler beim Laden des Kontexts', url };
        }
    }

    private async getPost(postId: string): Promise<ThreadsPost> {
        const url = `${this.baseUrl}/${postId}?fields=id,text,media_type,media_url,permalink,timestamp,username,is_quote_post,has_replies`;
        const response = await this.makeAuthenticatedRequest(url);
        return await response.json();
    }

    private async getFullConversation(postId: string): Promise<ThreadsConversation> {
        const targetPost = await this.getPost(postId);

        // Finde den ursprünglichen Post
        let originalPost = targetPost;
        let currentPost = targetPost;

        // Gehe die Kette zurück bis zum ursprünglichen Post
        while (currentPost.reply_to) {
            currentPost = await this.getPost(currentPost.reply_to);
            originalPost = currentPost;
        }

        // Sammle alle Antworten in der Konversation
        const replies = await this.getAllReplies(originalPost.id, postId);

        // Erstelle den vollständigen Text
        const fullText = this.buildFullConversationText(originalPost, replies, targetPost);

        return {
            original_post: originalPost,
            replies,
            target_post: targetPost,
            full_text: fullText
        };
    }

    private async getAllReplies(originalPostId: string, targetPostId: string): Promise<ThreadsPost[]> {
        const replies: ThreadsPost[] = [];
        const visited = new Set<string>();

        // Rekursive Funktion zum Sammeln aller Antworten
        const collectReplies = async (postId: string) => {
            if (visited.has(postId)) return;
            visited.add(postId);

            try {
                const url = `${this.baseUrl}/${postId}/replies?fields=id,text,timestamp,username,reply_to`;
                const response = await this.makeAuthenticatedRequest(url);

                const data = await response.json();
                if (data.data) {
                    for (const reply of data.data) {
                        replies.push(reply);

                        // Wenn das der Ziel-Post ist, stoppe hier
                        if (reply.id === targetPostId) {
                            return;
                        }

                        // Sammle Antworten auf diese Antwort
                        await collectReplies(reply.id);
                    }
                }
            } catch (error) {
                console.error('Error collecting replies:', error);
            }
        };

        await collectReplies(originalPostId);

        // Sortiere nach Zeitstempel
        return replies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    private buildFullConversationText(originalPost: ThreadsPost, replies: ThreadsPost[], targetPost: ThreadsPost): string {
        let conversationText = `Ursprünglicher Post von @${originalPost.username}:\n${originalPost.text}\n\n`;

        // Füge alle relevanten Antworten bis zum Ziel-Post hinzu
        for (const reply of replies) {
            conversationText += `Antwort von @${reply.username}:\n${reply.text}\n\n`;

            // Stoppe beim Ziel-Post
            if (reply.id === targetPost.id) {
                break;
            }
        }

        return conversationText.trim();
    }

    // Hilfsmethode für Rate Limiting
    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validiert die Konfiguration der Authentifizierung
     */
    public async validateAuth(): Promise<boolean> {
        try {
            await this.getAppAccessToken();
            return true;
        } catch (error) {
            console.error('Threads authentication validation failed:', error);
            return false;
        }
    }
}
