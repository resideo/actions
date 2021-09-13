import { Context } from "@actions/github/lib/context";
import * as core from "@actions/core/lib/core";
import { Octokit } from "@octokit/action";
import { markdownTable } from "markdown-table";

const SEVERITY_LEVELS = ["critical", "high", "medium", "low"];

function Heading(distribution: Distribution) {
  return `${distribution.total === 0 ? "👎" : "👍"} - ${
    distribution.critical
  } critical, ${distribution.high} high, ${distribution.medium} medium, ${
    distribution.low
  } low`;
}

function Vulnerabilities(list: Vulnerability[]) {
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

interface TwistlockResults {
  repository: string;
  passed: boolean;
  packages: {
    type: string;
    name: string;
    version: string;
    path: string;
    license: string[];
  }[];
  complianceIssues: unknown;
  complianceDistribution: Distribution;
  vulnerabilities: Vulnerability[];
  vulnerabilityDistribution: Distribution;
}

interface Vulnerability {
  id: string;
  status: string;
  cvss: string;
  vector: string;
  description: string;
  severity: Severity;
  packageName: string;
  link: string;
  riskFactor: string[];
  impactedVersions: string[];
  publishDate: string;
  discoveredDate: string;
}

interface Distribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface SummaryParams {
  github: Octokit;
  context: Context;
  core: typeof core;
  results: TwistlockResults;
}

type Severity = "low" | "medium" | "high" | "critical";
