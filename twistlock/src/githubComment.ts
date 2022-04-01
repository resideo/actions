import * as core from "@actions/core";
import * as github from "@actions/github";

export function* postGithubComment(octokit, { message, tag }) {
  if (!github.context.payload.pull_request) {
    if (github.context.eventName === "schedule") {
      console.log("action run on cron, skipping Github comment");
    } else {
      core.setFailed("This action can only be run on pull requests");
    }
  } else {
    const { owner, repo } = github.context.repo;
    const { number } = github.context.payload.pull_request;

    try {
      const allComments = yield octokit.rest.issues.listComments({
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        issue_number: number,
      });

      const previousComment =
        allComments.data.length > 0 &&
        allComments.data.find((comment) => comment.body.includes(tag));

      if (previousComment) {
        yield octokit.rest.issues.updateComment({
          owner,
          repo,
          // eslint-disable-next-line @typescript-eslint/camelcase
          comment_id: previousComment.id,
          body: `${message}`,
        });
      } else {
        yield octokit.rest.issues.createComment({
          owner,
          repo,
          // eslint-disable-next-line @typescript-eslint/camelcase
          issue_number: number,
          body: `${message}`,
        });
      }
    } catch (error) {
      console.error("error posting the Github comment");
      console.error(error);
      core.setFailed(error as string);
    }
  }
}
