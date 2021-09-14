import * as core from "@actions/core";
import { main } from "effection";
import { run } from "./src";

main(
  run({
    user: core.getInput("tl-username"),
    password: core.getInput("tl-password"),
    consoleUrl: core.getInput("tl-console-url"),
    project: core.getInput("tl-project"),
    logger: {
      info: core["info"],
      debug: core["debug"],
      warning: core["warning"],
      error: core["error"]
    }
  })
);
