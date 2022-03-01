import * as core from "@actions/core";
import { main, withTimeout } from "effection";
import { daemon } from "@effection/process";

interface CommandExec {
  command: string;
  checkForLog: string;
}

function* run({ command, checkForLog }: CommandExec) {
  const myProcess = yield daemon(command);

  yield myProcess.stdout
    .filter((chunk: any) => chunk.includes(checkForLog))
    .expect();

  console.log(
    `command successfully completed${
      checkForLog === undefined || checkForLog === ""
        ? ""
        : ` and included the search text:
  ${checkForLog}`
    }`
  );
}

main(
  withTimeout(
    Number(core.getInput("waitFor")) * 1000,
    run({
      command: core.getInput("command"),
      checkForLog: core.getInput("checkForLog"),
    })
  )
);
