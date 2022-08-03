import { debug, setFailed } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";

type Issue = {
  owner: string;
  repo: string;
  number: number;
};

type GitHubClient = InstanceType<typeof GitHub>;

export class App {
  constructor(
    private readonly client: GitHubClient,
    private readonly actionContext: Context,
    private readonly config: AppConfig
  ) {}

  public async Run(): Promise<void> {
    const pullRequest = this.actionContext.issue;

    const title: string =
      (this.actionContext.payload.pull_request?.title as string) ?? "";

    debug("Get Title: " + title);

    const body: string =
      (this.actionContext.payload.pull_request?.body as string) ?? "";

    debug("Get Body: " + body);

    debug("Test title against Regex: " + this.config.TitelRegex);
    let titelResult = App.testAgainstPattern(title, this.config.TitelRegex);

    debug("Test body against Regex: " + this.config.BodyRegex);
    let bodyResult = App.testAgainstPattern(body, this.config.BodyRegex);
    let comment = "";

    if (!titelResult) {
      comment += this.config.OnFailedTitelComment.replace(
        "%regex%",
        this.config.TitelRegex
      );

      debug("Titel regex failed");
    }

    if (!bodyResult) {
      if (comment.length > 1) {
        comment += ". ";
      }
      comment += this.config.OnFailedBodyComment.replace(
        "%regex%",
        this.config.BodyRegex
      );
      debug("Body regex failed");
    }

    if (!titelResult || !bodyResult) {
      if (this.config.CreateReviewOnFailedRegex) {
        debug("Create Review with comment " + comment);
        this.createReview(comment, pullRequest);
      }

      if (this.config.FailActionOnFailedRegex) {
        debug("Fail action with comment " + comment);
        setFailed(comment);
      }
    } else {
      if (this.config.CreateReviewOnFailedRegex) {
        debug("Dismiss review");
        await this.dismissReview(pullRequest);
      }
    }

    debug("Execute finished");
  }

  private async createReview(
    comment: string,
    pullRequest: Issue
  ): Promise<void> {
    await this.client.pulls.createReview({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
      body: comment,
      event: this.config.RequestChangesOnFailedRegex
        ? "REQUEST_CHANGES"
        : "COMMENT",
    });
  }

  private async dismissReview(pullRequest: Issue): Promise<void> {
    const reviews = await this.client.pulls.listReviews({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
    });

    reviews.data.forEach(async (review) => {
      if (review.user?.login === "github-actions[bot]") {
        await this.client.pulls.dismissReview({
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
