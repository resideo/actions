import { exec } from "@effection/node";
import { join } from "path";
import * as fs from "fs";
import tmp from "tmp-promise";

export const SEVERITY_LEVELS = ["critical", "high", "medium", "low"] as const;

export interface TwistlockResults {
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

export interface Vulnerability {
  id: string;
  status: string;
  cvss: string;
  vector: string;
  description: string;
  severity: typeof SEVERITY_LEVELS[number];
  packageName: string;
  link: string;
  riskFactor: string[];
  impactedVersions: string[];
  publishDate: string;
  discoveredDate: string;
}

export interface Distribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface DownloadCliParams {
  user: string;
  password: string;
  consoleUrl: string;
  project: string;
}

interface ScanRepositoryParams {
  repositoryPath: string;
}

async function fileExists(filePath: string) {
  return new Promise(resolve =>
    fs.access(filePath, fs.constants.F_OK, e => resolve(!e))
  );
}

export function* setupCli({
  user,
  password,
  consoleUrl,
  project
}: DownloadCliParams): Generator<any, any, any> {
  const cliPath = join(__dirname, "twistcli");

  if (!(yield fileExists(cliPath))) {
    yield exec(`curl \
            --insecure
            --user "${user}:${password}" \
            --output ${cliPath} \
            "${consoleUrl}/api/v1/util/twistcli"`);
    yield exec(`chmod +x ${cliPath}`);
  }

  function* scanRepository({
    repositoryPath
  }: ScanRepositoryParams): Generator<any, TwistlockResults, any> {

    const output = 
    return yield exec(`${cliPath} coderepo scan \
            --ci \
            --details \
            --project "${project}" \
            --address "${consoleUrl}" \
            --user "${user}" \
            --password "${password}" \
            --output-file ".twistlock-result.json" \
            ${repositoryPath}
        `);
  }

  return {
    scanRepository
  };
}
