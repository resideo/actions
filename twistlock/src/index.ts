import { Context } from "@actions/github/lib/context";
import { Octokit } from "@octokit/action";
import { Heading, Vulnerabilities } from "./markdown";
import { setupCli, SetupCliReturn, TwistlockResults } from "./twistlock";
import { Core, Logger } from "./types";
interface SummaryParams {
  github: Octokit;
  context: Context;
  core: Core;
  results: TwistlockResults;
}

export async function writeSummary({
  github,
  context,
  results
}: SummaryParams) {
  const { vulnerabilities, vulnerabilityDistribution } = results;

  const body = `
    <details><summary>Vulnerabilities: ${Heading(
      vulnerabilityDistribution
    )}</summary>

      ${Vulnerabilities(vulnerabilities)}

    </details>
  `;

  github.issues.createComment({
    // eslint-disable-next-line
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body
  });

  if (!results.passed) {
    throw new Error(`☹️ Twistlock failed!`);
  }
}

interface TwistlockRun {
  user: string;
  password: string;
  consoleUrl: string;
  project: string;
  logger: Logger;
  repositoryPath: string;
}

export function* run({
  logger,
  user,
  password,
  consoleUrl,
  project,
  repositoryPath
}: TwistlockRun) {
  const twistcli: SetupCliReturn = yield setupCli({
    logger,
    user,
    password,
    consoleUrl,
    project
  });

  twistcli.scanRepository({ repositoryPath });
}
