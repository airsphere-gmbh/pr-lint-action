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

    core.debug("Get Title: " + title);

    const body: string =
      (this.gitHubContext.payload.pull_request?.body as string) ?? "";

    core.debug("Get Body: " + body);

    core.debug("Test title against Regex: " + this.config.TitelRegex);
    let titelResult = App.testAgainstPattern(title, this.config.TitelRegex);

    core.debug("Test body against Regex: " + this.config.BodyRegex);
    let bodyResult = App.testAgainstPattern(body, this.config.BodyRegex);
    let comment = "";

    if (!titelResult) {
      comment += this.config.OnFailedTitelComment.replace(
        "%regex%",
        this.config.TitelRegex
      );

      core.debug("Titel regex failed");
    }

    if (!bodyResult) {
      if (comment.length > 1) {
        comment += ". ";
      }
      comment += this.config.OnFailedBodyComment.replace(
        "%regex%",
        this.config.BodyRegex
      );
      core.debug("Body regex failed");
    }

    if (!titelResult || !bodyResult) {
      if (this.config.CreateReviewOnFailedRegex) {
        core.debug("Create Review with comment " + comment);
        this.createReview(comment, pullRequest);
      }

      if (this.config.FailActionOnFailedRegex) {
        core.debug("Fail action with comment " + comment);
        core.setFailed(comment);
      }
    } else {
      if (this.config.CreateReviewOnFailedRegex) {
        core.debug("Dismiss review");
        await this.dismissReview(pullRequest);
      }
    }

    core.debug("Execute finished");
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
