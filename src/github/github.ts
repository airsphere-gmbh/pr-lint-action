import { debug, setFailed } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { Endpoints } from "@octokit/types";

import { concatAll, from, map, mergeMap, Observable } from "rxjs";

type NativeClient = InstanceType<typeof GitHub>;

export type Issue = {
  owner: string;
  repo: string;
  number: number;
};

export interface CreateReview {
  pullRequest: PullRequest;
  comment?: string;
  event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
}

export interface DismissReview {
  pullRequest: PullRequest;
  id: number;
  message: string;
}

export interface PullRequest extends Issue {
  title: string;
  body: string;
}

export type Review =
  Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"]["response"]["data"][0] & {
    pullRequest: PullRequest;
  };

export interface GitHubClient {
  get pullRequest(): PullRequest;
  debug(message: string): void;
  fail(message: string | Error): void;
  createReview(reviews: Observable<CreateReview>): Observable<any>;
  listReviews(pullRequests: Observable<PullRequest>): Observable<Review>;
  dismissReview(dismisses: Observable<DismissReview>): Observable<Review>;
}

export class GitHubClientImpl implements GitHubClient {
  get pullRequest(): PullRequest {
    return {
      title: (this.actionContext.payload.pull_request?.title as string) ?? "",
      body: (this.actionContext.payload.pull_request?.body as string) ?? "",
      ...this.actionContext.issue,
    };
  }

  constructor(
    private readonly client: NativeClient,
    private readonly actionContext: Context
  ) {}

  public debug(message: string) {
    debug(message);
  }

  public fail(message: string | Error) {
    setFailed(message);
  }

  public createReview(reviews: Observable<CreateReview>): Observable<any> {
    const createReviewFunc = this.client.rest.pulls.createReview;

    return reviews.pipe(
      map((create) =>
        from(
          createReviewFunc({
            owner: create.pullRequest.owner,
            repo: create.pullRequest.repo,
            pull_number: create.pullRequest.number,
            body: create.comment,
            event: create.event,
          })
        ).pipe(
          map(
            (response) =>
              ({ ...response.data, pullRequest: create.pullRequest } as Review)
          )
        )
      ),
      concatAll()
    );
  }

  public listReviews(
    pullRequests: Observable<PullRequest>
  ): Observable<Review> {
    const listReviewFunc = this.client.rest.pulls.listReviews;

    return pullRequests.pipe(
      map((pr) =>
        from(
          listReviewFunc({
            owner: pr.owner,
            repo: pr.repo,
            pull_number: pr.number,
          })
        ).pipe(
          mergeMap((response) =>
            response.data.map(
              (review) => ({ ...review, pullRequest: pr } as Review)
            )
          )
        )
      ),
      concatAll()
    );
  }

  public dismissReview(
    dismisses: Observable<DismissReview>
  ): Observable<Review> {
    const dismissReviewFunc = this.client.rest.pulls.dismissReview;

    return dismisses.pipe(
      map((dismiss) =>
        from(
          dismissReviewFunc({
            owner: dismiss.pullRequest.owner,
            repo: dismiss.pullRequest.repo,
            pull_number: dismiss.pullRequest.number,
            review_id: dismiss.id,
            message: dismiss.message,
          })
        ).pipe(
          map(
            (response) =>
              ({ ...response.data, pullRequest: dismiss.pullRequest } as Review)
          )
        )
      ),
      concatAll()
    );
  }
}
