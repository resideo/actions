import * as core from "@actions/core";
import { setupCli } from "./twistlock";
import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
import { yarmWhyFormat } from "./yarnWhyFormat";
import { postGithubComment } from "./githubComment";

const tag =
  '<p align="right"><em>Generated by <a href="https://github.com/resideo/actions/tree/master/twistlock">resideo/actions/twistlock</a>.<br>Please <a href="https://github.com/resideo/actions/issues/new">create an issue</a> in the repository if you have any feedback.<em></p><!-- Twistlock Action by Frontside Software -->';

export function* run({
  user,
  password,
  consoleUrl,
  project,
  repositoryPath,
  octokit
}: TwistlockRun) {
  const twistcli: SetupCliReturn = yield setupCli({
    user,
    password,
    consoleUrl,
    project
  });

  const results: TwistlockResults = yield twistcli.scanRepository({
    repositoryPath
  });

  const { message, pass } = yield yarmWhyFormat({ results, tag });

  const toPassOrFail: boolean = yield postGithubComment(octokit, {
    message,
    tag,
    pass
  });

  if (!toPassOrFail) {
    core.setFailed(
      "Twistlock report shows there are vulnerabilities that must be addressed. Refer to the generated Gihub Comment to see which dependencies are vulnerable."
    );
  }
}
