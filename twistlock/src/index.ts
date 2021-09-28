import { setupCli, SetupCliReturn, TwistlockResults } from "./twistlock";
import { Logger } from "./types";

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

  console.log("repository path (action default check)", repositoryPath);

  const results: TwistlockResults = yield twistcli.scanRepository({
    repositoryPath
  });

  console.log(results);
  // generateSummaryComment
  // createGithubComment
}
