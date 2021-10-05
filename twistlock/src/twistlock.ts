import { exec } from "@effection/process";
import { join } from "path";
import * as fs from "fs";
import { file, FileResult } from "tmp-promise";
import { GitHub } from "@actions/github/lib/utils";

export const SEVERITY_LEVELS = ["critical", "high", "medium", "low"] as const;

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

export interface TwistlockRun {
  user: string;
  password: string;
  consoleUrl: string;
  project: string;
  repositoryPath: string;
  octokit: InstanceType<typeof GitHub>;
}

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

interface DownloadCliParams {
  user: string;
  password: string;
  consoleUrl: string;
  project: string;
}

interface ScanRepositoryParams {
  repositoryPath: string;
}

export type SetupCliReturn = {
  scanRepository: (
    params: ScanRepositoryParams
  ) => Generator<any, TwistlockResults, any>;
};

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
}: DownloadCliParams): Generator<any, SetupCliReturn, any> {
  const cliPath = join(__dirname, "twistcli");

  if (!(yield fileExists(cliPath))) {
    yield exec(`curl \
            --insecure \
            --user "${user}:${password}" \
            --output ${cliPath} \
            "${consoleUrl}/api/v1/util/twistcli"`).expect();
    yield exec(`chmod +x ${cliPath}`).expect();
  }

  return {
    scanRepository: function* scanRepository({
      repositoryPath
    }: ScanRepositoryParams): Generator<any, TwistlockResults, any> {
      const output: FileResult = yield file();

      const scan = yield exec(`${cliPath} coderepo scan \
            --project "${project}" \
            --address "${consoleUrl}" \
            --user "${user}" \
            --password "${password}" \
            --output-file "${output.path}" \
            ${repositoryPath}
        `);

      yield scan.expect();

      return JSON.parse(fs.readFileSync(`${output.path}`, "utf-8"));
    }
  };
}
