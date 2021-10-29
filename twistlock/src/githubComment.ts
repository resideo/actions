import * as core from "@actions/core";
import * as github from "@actions/github";

export function* postGithubComment(octokit, { message, tag, pass }) {
  if (!github.context.payload.pull_request) {
    core.setFailed("This action can only be run on pull requests");
  } else {
    const { owner, repo } = github.context.repo;
    const { number } = github.context.payload.pull_request;

    const allComments = yield octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: number
    });

    const previousComment =
      allComments.data.length > 0 &&
      allComments.data.find(comment => comment.body.includes(tag));

    if (previousComment) {
      yield octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: previousComment.id,
        body: `${message}`
      });
    } else {
      yield octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: `${message}`
      });
    }
    return pass;
  }
}
