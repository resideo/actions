import { ManagementClient, ManagementClientOptions } from "auth0";
interface AddOriginConfig {
    clientId: string;
    origin: string;
    callbackUrl?: string;
    logoutUrl?: string;
}
interface RemoveOriginConfig {
    clientId: string;
    origin: string;
}
export declare const createClient: (options: ManagementClientOptions) => ManagementClient<import("auth0").AppMetadata, import("auth0").UserMetadata>;
export declare const addOrigin: (auth0: ManagementClient<import("auth0").AppMetadata, import("auth0").UserMetadata>, { clientId, origin, callbackUrl, logoutUrl }: AddOriginConfig) => Promise<void>;
export declare const removeOrigin: (auth0: ManagementClient<import("auth0").AppMetadata, import("auth0").UserMetadata>, { clientId, origin }: RemoveOriginConfig) => Promise<void>;
export {};
