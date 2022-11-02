import * as core from "@actions/core";
import { main, withTimeout, spawn, MainError } from "effection";
import { exec } from "@effection/process";

interface CommandExec {
  command: string;
  checkForLog: string;
}

function* run({ command, checkForLog }: CommandExec) {
  console.log("command", command);
  console.log("checkForLog", checkForLog);
  const startProcess = yield exec(command);

  console.log("startProcess", startProcess);

  yield spawn(
    startProcess.stdout.forEach((text: string) => console.log(text.toString()))
  );

  yield spawn(
    startProcess.stderr.forEach((text: string) =>
      console.error(text.toString())
    )
  );

  console.log("what is startProcess.stdout", yield spawn(startProcess.stdout));

  console.log(
    "yield spawn in try catch (logged outside of try catch)",
    yield startProcess.stdout.filter((chunk: any) => chunk).expect()
  );

  try {
    yield startProcess.stdout
      .filter((chunk: any) => chunk.includes(checkForLog))
      .expect();
  } catch (error) {
    console.log("error", error);
    throw new MainError({
      message: `did not find the stdout text:
    ${checkForLog}`,
      exitCode: 1,
    });
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    `command successfully completed${
      checkForLog === undefined || checkForLog === ""
        ? ""
        : ` and included the search text:
  ${checkForLog}`
    }`
  );
}

main(function* () {
  try {
    yield withTimeout(
      Number(core.getInput("waitFor")) * 1000,
      run({
        command: core.getInput("command"),
        checkForLog: core.getInput("checkForLog"),
      })
    );
  } catch (error) {
    throw new MainError({
      message: error as string,
      exitCode: 1,
    });
  }
});
