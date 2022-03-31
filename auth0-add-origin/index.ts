import * as core from "@actions/core";
import { createClient, addOrigin } from "@resideo/action-core-auth0";
import { interpolate } from "@resideo/action-core-interpolate-config";

interface Args {
  domain: string;
  apiClientId: string;
  apiClientSecret: string;
  clientId: string;
  origin: string;
  callbackUrl?: string;
  logoutUrl?: string;
}

async function main({
  domain,
  apiClientId,
  apiClientSecret,
  clientId,
  origin,
  callbackUrl,
  logoutUrl,
}: Args) {
  try {
    const auth0 = createClient({
      domain,
      clientId: apiClientId,
      clientSecret: apiClientSecret,
    });

    await addOrigin(auth0, {
      clientId,
      origin: interpolate(origin),
      callbackUrl: interpolate(callbackUrl || origin),
      logoutUrl: interpolate(logoutUrl || origin),
    });

    core.info(`Origin "${origin}" added to auth0 client "${clientId}"`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

main({
  domain: core.getInput("domain"),
  apiClientId: core.getInput("apiClientId"),
  apiClientSecret: core.getInput("apiClientSecret"),
  clientId: core.getInput("clientId"),
  origin: core.getInput("origin"),
  callbackUrl: core.getInput("callbackUrl"),
  logoutUrl: core.getInput("logoutUrl"),
});
