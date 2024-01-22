import { map, Observable, filter, of, EMPTY } from "rxjs";
import {
  CreateReview,
  DismissReview,
  GitHubClient,
  PullRequest,
  Review,
} from "./github/github";

export class App {
  constructor(
    private readonly client: GitHubClient,
    private readonly config: AppConfig
  ) {}

  private debug(message: string) {
    this.client.debug(message);
  }

  public init() {}

  public tearDown() {}

  public run(): Observable<any> {
    const pullRequest = this.client.pullRequest;

    const title: string = (pullRequest.title as string) ?? "";

    this.debug("Get Title: " + title);

    const body: string = (pullRequest.body as string) ?? "";

    this.debug("Get Body: " + body);

    this.debug("Test title against Regex: " + this.config.TitelRegex);
    let titelResult = App.testAgainstPattern(title, this.config.TitelRegex);

    this.debug("Test body against Regex: " + this.config.BodyRegex);
    let bodyResult = App.testAgainstPattern(body, this.config.BodyRegex);
    let comment = "";

    if (!titelResult) {
      comment += this.config.OnFailedTitelComment.replace(
        "%regex%",
        this.config.TitelRegex
      );

      this.debug("Titel regex failed");
    }

    if (!bodyResult) {
      if (comment.length > 1) {
        comment += ". ";
      }
      comment += this.config.OnFailedBodyComment.replace(
        "%regex%",
        this.config.BodyRegex
      );
      this.debug("Body regex failed");
    }

    if (!titelResult || !bodyResult) {
      if (this.config.FailActionOnFailedRegex) {
        this.debug("Fail action with comment " + comment);
        this.client.fail(comment);
      }
      if (this.config.CreateReviewOnFailedRegex) {
        this.debug("Create Review with comment " + comment);

        const createReview: CreateReview = {
          pullRequest: pullRequest,
          comment: comment,
          event: this.config.RequestChangesOnFailedRegex
            ? "REQUEST_CHANGES"
            : "COMMENT",
        };

        return this.client.createReview(of(createReview));
      }
    } else {
      if (this.config.CreateReviewOnFailedRegex) {
        this.debug("Dismiss review");
        return this.dismissReview(this.client, of(pullRequest));
      }
    }

    return EMPTY;
  }

  private dismissReview(
    client: GitHubClient,
    pullRequests: Observable<PullRequest>
  ): Observable<Review> {
    const dismisses = client.listReviews(pullRequests).pipe(
      filter((review) => review.user?.login === "github-actions[bot]"),
      map<Review, DismissReview>((review) => ({
        id: review.id,
        pullRequest: review.pullRequest,
        message: "All good!",
      }))
    );

    return client.dismissReview(dismisses);
  }

  private static testAgainstPattern(value: string, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(value);
  }
}
