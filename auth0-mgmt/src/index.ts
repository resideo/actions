import * as core from "@actions/core";
import { createClient, addOrigin, removeOrigin } from "./auth0";

interface Args {
  command: string;

  domain: string;
  clientId: string;
  clientSecret: string;

  origin?: string;
  callbackUrl?: string;
  logoutUrl?: string;
}

async function main({
  command,
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
      clientSecret,
      scope: "read:clients update:clients"
    });

    switch (command) {
      case "add-origin":
        if (!origin) {
          core.setFailed(`Missing required parameter "origin"`);
          break;
        }

        await addOrigin(auth0, {
          clientId,
          origin,
          callbackUrl,
          logoutUrl
        });

        core.info(`Origin "${origin}" added to auth0 client "${clientId}"`);
        break;
      case "remove-origin":
        if (!origin) {
          core.setFailed(`Missing required parameter "origin"`);
          break;
        }
        await removeOrigin(auth0, {
          clientId,
          origin
        });

        core.info(`Origin "${origin}" removed from auth0 client "${clientId}"`);
        break;
      default:
        core.setFailed(`Invalid command: "${command}"`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main({
  command: core.getInput("command"),
  domain: core.getInput("domain"),
  clientId: core.getInput("clientId"),
  clientSecret: core.getInput("clientSecret"),
  origin: core.getInput("origin"),
  callbackUrl: core.getInput("callbackUrl"),
  logoutUrl: core.getInput("logoutUrl")
});
