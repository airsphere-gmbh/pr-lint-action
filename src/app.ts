import { debug, setFailed } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import {
  map,
  Observable,
  from,
  concatAll,
  mergeMap,
  filter,
  of,
  EMPTY,
} from "rxjs";

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

  public init() {}

  public tearDown() {}

  public run(): Observable<any> {
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
      if (this.config.FailActionOnFailedRegex) {
        debug("Fail action with comment " + comment);
        setFailed(comment);
      }
      if (this.config.CreateReviewOnFailedRegex) {
        debug("Create Review with comment " + comment);
        return this.createReview(this.client, this.config, of([comment, pullRequest]));
      }
    } else {
      if (this.config.CreateReviewOnFailedRegex) {
        debug("Dismiss review");
        return this.dismissReview(this.client, of(pullRequest));
      }
    }

    return EMPTY;
  }

  private createReview(client: GitHubClient, config: AppConfig, reviews: Observable<[string, Issue]>): Observable<any> {
    return reviews.pipe(
      map(([comment, pullRequest]) =>
        from(
          client.pulls.createReview({
            owner: pullRequest.owner,
            repo: pullRequest.repo,
            pull_number: pullRequest.number,
            body: comment,
            event: config.RequestChangesOnFailedRegex
              ? "REQUEST_CHANGES"
              : "COMMENT",
          })
        )
      ),
      concatAll()
    );
  }

  private dismissReview(client: GitHubClient, pullRequests: Observable<Issue>): Observable<any> {
    return pullRequests.pipe(
      map((pullRequest) =>
        from(
          client.pulls.listReviews({
            owner: pullRequest.owner,
            repo: pullRequest.repo,
            pull_number: pullRequest.number,
          })
        ).pipe(
          mergeMap((response) => response.data),
          filter((review) => review.user?.login === "github-actions[bot]"),
          map((review) =>
            from(
              client.pulls.dismissReview({
                owner: pullRequest.owner,
                repo: pullRequest.repo,
                pull_number: pullRequest.number,
                review_id: review.id,
                message: "All good!",
              })
            )
          ),
          concatAll(),
          map((response) => response.data)
        )
      ),
      concatAll()
    );
  }

  private static testAgainstPattern(value: string, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(value);
  }
}

//Todo:
// Label check
// check for structure of body