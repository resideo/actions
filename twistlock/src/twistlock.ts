import { spawn } from "effection";
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
  packageVersion: string;
  link: string;
  riskFactor: string[];
  impactedVersions: string[];
  publishDate: string;
  discoveredDate: string;
  fixDate: string;
  graceDays?: string;
}

export interface Distribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface TwistlockRun {
  user?: string;
  password?: string;
  token?: string;
  consoleUrl: string;
  project: string;
  repositoryPath: string;
  image: string;
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
  user?: string;
  password?: string;
  token?: string;
  consoleUrl: string;
  project: string;
}

interface ScanRepositoryParams {
  repositoryPath: string;
  image: string;
}

export type SetupCliReturn = {
  scanRepository: (
    params: ScanRepositoryParams
  ) => Generator<any, TwistlockResults, any>;
};

async function fileExists(filePath: string) {
  return new Promise((resolve) =>
    fs.access(filePath, fs.constants.F_OK, (e) => resolve(!e))
  );
}

export function* setupCli({
  user,
  password,
  token,
  consoleUrl,
  project,
}: DownloadCliParams): Generator<any, SetupCliReturn, any> {
  if (!token) {
    if (!user || !password)
      throw new Error(
        "username and password need to be input if not using token"
      );
  }
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
      repositoryPath,
      image,
    }: ScanRepositoryParams): Generator<any, TwistlockResults, any> {
      const output: FileResult = yield file();

      console.log("::group::scan");
      const twistCommand = !image
        ? `${cliPath} coderepo scan ` +
          `--project "${project}" ` +
          `--address "${consoleUrl}" ` +
          // `--user "${user}" ` +
          // `--password "${password}" ` +
          `--token ${token} ` +
          `--publish=false ` +
          `--output-file "${output.path}" ` +
          `${repositoryPath}`
        : `${cliPath} images scan ` +
          `--project "${project}" ` +
          `--address "${consoleUrl}" ` +
          `--user "${user}" ` +
          `--password "${password}" ` +
          `--token ${token} ` +
          `--output-file "${output.path}" ` +
          `${image}`;

      console.log(twistCommand);
      const scan = yield exec(twistCommand);
      yield spawn(
        scan.stdout.forEach((text) => console.log(text.toString().trim()))
      );
      yield spawn(
        scan.stderr.forEach((text) => console.error(text.toString().trim()))
      );

      yield scan.join();
      console.log("::endgroup::");

      const results = fs.readFileSync(`${output.path}`, "utf-8");

      return JSON.parse(results);
    },
  };
}
