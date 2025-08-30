
import type { SocialMedia } from '../../interfaces/SocialMedia';
import { getSocialMediaClass } from './SocialMediaRegistry';
import { ThreadsSocialMedia } from './platforms/ThreadsSocialMedia';

// Fallback-Mapping für SocialMedia-Provider
const SOCIAL_MEDIA_CLASS_MAP: Record<string, any> = {
    'threads.com': ThreadsSocialMedia,
    // Weitere Netzwerke hier ergänzen
};

export class SocialMediaFactory {
    static getSocialMedia(url: string): SocialMedia | null {
        try {
            const host = new URL(url).host.replace('www.', '');
            // Erst Decorator-Registry prüfen
            let SocialMediaClass = getSocialMediaClass(host);
            // Fallback: Mapping verwenden
            if (!SocialMediaClass) {
                SocialMediaClass = SOCIAL_MEDIA_CLASS_MAP[host];
            }
            return SocialMediaClass ? new SocialMediaClass() : null;
        } catch {
            return null;
        }
    }
}
