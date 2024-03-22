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
  repositoryPath: string;
  image: string;
  githubComment: boolean;
  scanPathScope: string[];
  octokit: InstanceType<typeof GitHub>;
}

export interface TwistlockCLI {
  code: number;
  results: TwistlockResults | TwistlockResults[];
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
  compliances: {
    id: number;
    title: string;
    severity: string;
    cause: string;
    category: string;
  }[];
  complianceDistribution: Distribution;
  vulnerabilities: Vulnerability[];
  vulnerabilityDistribution: Distribution;
}

interface DownloadCliParams {
  user?: string;
  password?: string;
  token?: string;
  consoleUrl: string;
}

interface ScanRepositoryParams {
  repositoryPath: string;
  image: string;
}

export type SetupCliReturn = {
  scanRepository: (
    params: ScanRepositoryParams
  ) => Generator<any, TwistlockCLI, any>;
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
        // this appears to require the user:pass combination
        // if you use the token (or nothing) it downloads a CLI
        // that will execute and return code 0 (and nothing else?)
        `--user "${user}:${password}" ` +
        // `--user ${token} ` +
        `--output ${cliPath} ` +
        `"${consoleUrl}/api/v1/util/twistcli"`
    ).expect();
    yield exec(`chmod +x ${cliPath}`).expect();
  }

  return {
    scanRepository: function* scanRepository({
      repositoryPath,
      image,
    }: ScanRepositoryParams): Generator<any, TwistlockCLI, any> {
      const output: FileResult = yield file();

      console.log("::group::scan");
      const twistCommand = !image
        ? `${cliPath} coderepo scan ` +
          `--address "${consoleUrl}" ` +
          `--user "${user}" ` +
          `--password "${password}" ` +
          // token appears to work here, but
          //   not when downloading the CLI, so not
          //   allowing use of the token at the current time
          // `--token ${token} ` +
          // with publish=true (the default), it does not create
          //   an output file when you specify it
          // with publish=true and no output file specified
          //   you get a 500 internal server error
          `--publish=false ` +
          `--output-file "${output.path}" ` +
          `${repositoryPath}`
        : `${cliPath} images scan ` +
          `--address "${consoleUrl}" ` +
          `--user "${user}" ` +
          `--password "${password}" ` +
          // `--token ${token} ` +
          // `--publish=false ` +
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

      try {
        console.log("::group::upload artifact");
        const resultFile = yield fs.readFile(`${output.path}`, {
          encoding: "utf-8",
        });
        const results: TwistlockResults | TwistlockResults[] =
          JSON.parse(resultFile);

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
        console.log("::endgroup::");

        return { results, code: result.code };
      } catch (error: any) {
        throw new Error(error);
      }
    },
  };
}
