import { Context } from "@actions/github/lib/context";
import { Octokit } from "@octokit/action";
import { markdownTable } from "markdown-table";
import {
  Distribution,
  SEVERITY_LEVELS,
  Vulnerability,
  TwistlockResults
} from "./twistlock";

import { Core } from "./types";

export function Heading(distribution: Distribution) {
  return `${distribution.total === 0 ? "👎" : "👍"} - ${
    distribution.critical
  } critical, ${distribution.high} high, ${distribution.medium} medium, ${
    distribution.low
  } low`;
}

export function Vulnerabilities(list: Vulnerability[]) {
  const sorted = list
    .map(({ severity, ...rest }) => ({
      ...rest,
      severity,
      severityLevel: SEVERITY_LEVELS.indexOf(severity)
    }))
    .sort((a, b) => a.severityLevel - b.severityLevel);

  return markdownTable([
    ["Severity", "Package", "Versions", "Description", "Risk Factor"],
    ...sorted.map(item => [
      item.severity,
      item.packageName,
      item.impactedVersions.join(", "),
      item.description,
      item.riskFactor.join(", ")
    ])
  ]);
}

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
