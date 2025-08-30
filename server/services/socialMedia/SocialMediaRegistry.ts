import { ThreadsSocialMedia } from "./platforms";

const socialMediaRegistry = new Map<string, any>();

export function RegisterSocialMedia(host: string) {
    return function (constructor: any) {
        console.log(`Registering ${host}`);
        socialMediaRegistry.set(host, constructor);
    };
}

export function getSocialMediaClass(host: string) {
    return socialMediaRegistry.get(host);
}
