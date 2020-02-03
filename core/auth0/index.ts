/* eslint-disable @typescript-eslint/camelcase */

import { ManagementClient, ManagementClientOptions } from "auth0";

interface AddOriginConfig {
  clientId: string;
  origin: string;
  callbackUrl: string;
  logoutUrl: string;
}

interface RemoveOriginConfig {
  clientId: string;
  origin: string;
}

const appendUrl = (urls: string[] | undefined, url: string) => [
  ...(urls || []),
  url
];

const removeUrl = (urls: string[] | undefined, url: string) =>
  (urls || []).filter(x => !x.includes(url));

export const createClient = (
  options: ManagementClientOptions,
  scope = "read:clients update:clients"
) => new ManagementClient({ ...options, scope });

export const addOrigin = async (
  auth0: ManagementClient,
  { clientId, origin, callbackUrl, logoutUrl }: AddOriginConfig
) => {
  const client = await auth0.getClient({ client_id: clientId });
  await auth0.updateClient(
    { client_id: clientId },
    {
      web_origins: appendUrl(client?.web_origins, origin),
      callbacks: appendUrl(client?.callbacks, callbackUrl),
      allowed_logout_urls: appendUrl(client?.allowed_logout_urls, logoutUrl)
    }
  );
};

export const removeOrigin = async (
  auth0: ManagementClient,
  { clientId, origin }: RemoveOriginConfig
) => {
  const client = await auth0.getClient({ client_id: clientId });
  await auth0.updateClient(
    { client_id: clientId },
    {
      web_origins: removeUrl(client?.web_origins, origin),
      callbacks: removeUrl(client?.callbacks, origin),
      allowed_logout_urls: removeUrl(client?.allowed_logout_urls, origin)
    }
  );
};
