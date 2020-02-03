import * as core from "@actions/core";
import { createClient, addOrigin } from "@resideo/actions-core-auth0";
import { interpolate } from "@resideo/actions-core-interpolate-config";

interface Args {
  domain: string;
  clientId: string;
  clientSecret: string;
  origin: string;
  callbackUrl?: string;
  logoutUrl?: string;
}

async function main({
  domain,
  clientId,
  clientSecret,
  origin,
  callbackUrl,
  logoutUrl
}: Args) {
  try {
    const auth0 = createClient({
      domain,
      clientId,
      clientSecret
    });

    await addOrigin(auth0, {
      clientId,
      origin: interpolate(origin),
      callbackUrl: interpolate(callbackUrl || origin),
      logoutUrl: interpolate(logoutUrl || origin)
    });

    core.info(`Origin "${origin}" added to auth0 client "${clientId}"`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main({
  domain: core.getInput("domain"),
  clientId: core.getInput("clientId"),
  clientSecret: core.getInput("clientSecret"),
  origin: core.getInput("origin"),
  callbackUrl: core.getInput("callbackUrl"),
  logoutUrl: core.getInput("logoutUrl")
});
