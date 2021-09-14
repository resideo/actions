import { Context } from "@actions/github/lib/context";
import * as core from "@actions/core/lib/core";
import { Octokit } from "@octokit/action";
import { Heading, Vulnerabilities } from "./markdown";
import { scan, setupCli, TwistlockResults } from "./twistlock";

interface SummaryParams {
  github: Octokit;
  context: Context;
  core: typeof core;
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

export function* run() {
  const twistcli = yield setupCli({
    user: core.getInput("tl-username"),
    password: core.getInput("tl-password"),
    url: core.getInput("tl-console-url")
  });

  yield scan(twistcli)
}