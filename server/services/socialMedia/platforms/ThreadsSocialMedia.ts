import type { SocialMedia } from '../../../interfaces/SocialMedia';
import { RegisterSocialMedia } from '../SocialMediaRegistry';

@RegisterSocialMedia('threads.com')
export class ThreadsSocialMedia implements SocialMedia {
    async extractText(url: string): Promise<string> {
        // Stub: Threads API would be used here
        return 'Test-Text von Threads';
    }

    async buildContext(url: string): Promise<any> {
        // Stub: Context building
        return { context: 'Test-Kontext für Threads', url };
    }
}
