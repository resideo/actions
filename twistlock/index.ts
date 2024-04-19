import * as core from "@actions/core";
import * as github from "@actions/github";
import { main } from "effection";
import { run } from "./src";

// note that optional chaining does not appear to work in this file
// it returns `SyntaxError: Unexpected token '.'`

const token =
  core.getInput("token") === ""
    ? process.env.GITHUB_TOKEN || ""
    : core.getInput("token");
const octokit = github.getOctokit(token);

main(
  run({
    user: core.getInput("username"),
    password: core.getInput("password"),
    token: core.getInput("twistToken"),
    consoleUrl: core.getInput("consoleURL"),
    repositoryPath:
      core.getInput("repositoryPath") || process.env.GITHUB_WORKSPACE || ".",
    image: core.getInput("image"),
    githubComment: core.getInput("githubComment") === "true",
    scanPathScope: core.getInput("scanPathScope")
      ? core.getInput("scanPathScope").split(",")
      : [],
    octokit,
  })
);
