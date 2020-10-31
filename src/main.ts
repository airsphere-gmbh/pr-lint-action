import { App } from "./app";
import * as core from "@actions/core";

const repoTokenInput = core.getInput("repo-token", { required: true });

const titleRegexInput: string = core.getInput("title-regex", {
  required: true,
});
const bodyRegexInput: string = core.getInput("body-regex", {
  required: true,
});

const onFailedTitelCommentInput: string = core.getInput(
  "on-failed-titel-comment"
);
const onFailedBodyCommentInput: string = core.getInput(
  "on-failed-body-comment"
);

const onFailedRegexCreateReviewInput: boolean =
  core.getInput("on-failed-regex-create-review") == "true";
const onFailedRegexFailActionInput: boolean =
  core.getInput("on-failed-regex-fail-action") == "true";
const onFailedRegexRequestChanges: boolean =
  core.getInput("on-failed-regex-request-changes") == "true";

const app = new App(repoTokenInput, {
  BodyRegex: bodyRegexInput,
  TitelRegex: titleRegexInput,
  OnFailedBodyComment: onFailedBodyCommentInput,
  OnFailedTitelComment: onFailedTitelCommentInput,
  CreateReviewOnFailedRegex: onFailedRegexCreateReviewInput,
  FailActionOnFailedRegex: onFailedRegexFailActionInput,
  RequestChangesOnFailedRegex: onFailedRegexRequestChanges,
});
app.Run();
