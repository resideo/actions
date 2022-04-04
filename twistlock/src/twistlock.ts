import { spawn } from "effection";
import { exec } from "@effection/process";

import { join } from "path";
import { default as fsDefault } from "fs";
// this is compatible with node@12+
const fs = fsDefault.promises;

import { file, FileResult } from "tmp-promise";
import { GitHub } from "@actions/github/lib/utils";
import { create as artifactCreate } from "@actions/artifact";

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
  code: number;
  results: {
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
  };
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
    fsDefault.access(filePath, fsDefault.constants.F_OK, (e) => resolve(!e))
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
    yield exec(
      `curl ` +
        `--insecure ` +
        // `--user "${user}:${password}" ` +
        // `--token ${token} ` +
        `--output ${cliPath} ` +
        `"${consoleUrl}/api/v1/util/twistcli"`
    ).expect();
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
          `--user "${user}" ` +
          `--password "${password}" ` +
          // `--token ${token} ` +
          `--publish=false` +
          `--output-file "${output.path}" ` +
          `${repositoryPath}`
        : `${cliPath} images scan ` +
          `--project "${project}" ` +
          `--address "${consoleUrl}" ` +
          `--user "${user}" ` +
          `--password "${password}" ` +
          // `--token ${token} ` +
          // `--publish=false` +
          `--output-file "${output.path}" ` +
          `${image}`;

      const scan = yield exec(twistCommand);
      yield spawn(
        scan.stdout.forEach((text) => console.log(text.toString().trim()))
      );
      yield spawn(
        scan.stderr.forEach((text) => console.error(text.toString().trim()))
      );

      const result = yield scan.join();
      console.dir(result);
      console.log("::endgroup::");

      let results;

      try {
        results = yield fs.readFile(`${output.path}`, { encoding: "utf-8" });

        const artifactClient = artifactCreate();
        const artifactName = "twistcli-output.txt";
        const files = [output.path];
        const rootDirectory = "/tmp";
        const options = {
          continueOnError: true,
        };

        const uploadResult = yield artifactClient.uploadArtifact(
          artifactName,
          files,
          rootDirectory,
          options
        );
        console.dir(uploadResult);

        return { results: JSON.parse(results), code: result.code };
      } catch (error: any) {
        throw new Error(error);
      }
    },
  };
}
