import * as core from "@actions/core";
import { createClient, removeOrigin } from "@resideo/actions-core-auth0";
import { interpolate } from "@resideo/actions-core-interpolate-config";

interface Args {
  domain: string;
  clientId: string;
  clientSecret: string;
  origin: string;
}

async function main({ domain, clientId, clientSecret, origin }: Args) {
  try {
    const auth0 = createClient({
      domain,
      clientId,
      clientSecret
    });

    await removeOrigin(auth0, {
      clientId,
      origin: interpolate(origin)
    });

    core.info(`Origin "${origin}" removed from auth0 client "${clientId}"`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main({
  domain: core.getInput("domain"),
  clientId: core.getInput("clientId"),
  clientSecret: core.getInput("clientSecret"),
  origin: core.getInput("origin")
});
