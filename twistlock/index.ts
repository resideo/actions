import * as core from "@actions/core";
import * as github from "@actions/github";
import { main } from "effection";
import { run } from "./src";

const token =
  core.getInput("token") === ""
    ? process.env.GITHUB_TOKEN || ""
    : core.getInput("token");
const octokit = github.getOctokit(token);

main(
  run({
    user: core.getInput("username"),
    password: core.getInput("password"),
    consoleUrl: core.getInput("consuleURL"),
    project: core.getInput("project"),
    repositoryPath: process.cwd(),
    octokit
  })
);
