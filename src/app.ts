import * as github from "@actions/github";
import * as core from "@actions/core";
import { getOctokit } from "@actions/github";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";

export class App {
  private readonly config: AppConfig;
  private readonly githubClient: InstanceType<typeof GitHub>;
  private readonly gitHubContext: Context;

  constructor(token: string, config: AppConfig) {
    this.config = config;
    this.githubClient = getOctokit(token);
    this.gitHubContext = github.context;
  }

  public async Run(): Promise<void> {
    const pullRequest = this.gitHubContext.issue as PullRequest;

    const title: string =
      (this.gitHubContext.payload.pull_request?.title as string) ?? "";

    const body: string =
      (this.gitHubContext.payload.pull_request?.body as string) ?? "";

    // const comment = onFailedRegexCommentInput.replace(
    //   "%regex%",
    //   titleRegex.source
    // );

    let titelResult = App.testAgainstPattern(title, this.config.TitelRegex);
    let bodyResult = App.testAgainstPattern(body, this.config.BodyRegex);
    let comment = "";

    if (!titelResult) {
      comment += this.config.OnFailedTitelComment;
    }

    if (!bodyResult) {
      comment += this.config.OnFailedBodyComment;
    }

    if (!titelResult || !bodyResult) {
      if (this.config.CreateReviewOnFailedRegex) {
        this.createReview(comment, pullRequest);
      }

      if (this.config.FailActionOnFailedRegex) {
        core.setFailed(comment);
      }
    } else {
      if (this.config.CreateReviewOnFailedRegex) {
        await this.dismissReview(pullRequest);
      }
    }
  }

  private async createReview(
    comment: string,
    pullRequest: PullRequest
  ): Promise<void> {
    await this.githubClient.pulls.createReview({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
      body: comment,
      event: this.config.RequestChangesOnFailedRegex
        ? "REQUEST_CHANGES"
        : "COMMENT",
    });
  }

  private async dismissReview(pullRequest: PullRequest): Promise<void> {
    const reviews = await this.githubClient.pulls.listReviews({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
    });

    reviews.data.forEach(async (review) => {
      if (review.user.login == "github-actions[bot]") {
        await this.githubClient.pulls.dismissReview({
          owner: pullRequest.owner,
          repo: pullRequest.repo,
          pull_number: pullRequest.number,
          review_id: review.id,
          message: "All good!",
        });
      }
    });
  }

  private static testAgainstPattern(value: string, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(value);
  }
}
