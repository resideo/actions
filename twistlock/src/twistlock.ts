import { Exec, exec } from "@effection/process";
import { spawn } from "effection";
import { join } from "path";
import * as fs from "fs";
import { file, FileResult } from "tmp-promise";
import { Logger } from "./types";

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
  logger: Logger;
}

interface ScanRepositoryParams {
  repositoryPath: string;
}

async function fileExists(filePath: string) {
  return new Promise(resolve =>
    fs.access(filePath, fs.constants.F_OK, e => resolve(!e))
  );
}

export type SetupCliReturn = {
  scanRepository: (
    params: ScanRepositoryParams
  ) => Generator<any, TwistlockResults, any>;
};

export function* setupCli({
  logger,
  user,
  password,
  consoleUrl,
  project
}: DownloadCliParams): Generator<any, SetupCliReturn, any> {
  const cliPath = join(__dirname, "twistcli");

  if (!(yield fileExists(cliPath))) {
    yield exec(`curl \
            --insecure
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

      logger.debug(`Will write output to ${output.path}`);

      const scan = yield exec(`${cliPath} coderepo scan \
            --ci \
            --details \
            --project "${project}" \
            --address "${consoleUrl}" \
            --user "${user}" \
            --password "${password}" \
            --output-file "${output.path}" \
            ${repositoryPath}
        `);

      yield spawn(scan.stdout.forEach((text: string) => logger.info(text)));
      yield spawn(scan.stderr.forEach((text: string) => logger.error(text)));

      yield scan.expect();

      return JSON.parse(output.path);
    }
  };
}
