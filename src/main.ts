import { App } from "./app";
import { Input } from "./input";
import * as core from "@actions/core";

const repoTokenInput = core.getInput("repo-token", { required: true });

const titleRegexInput = Input.getInputAsString("title-regex", true);

const bodyRegexInput = Input.getInputAsString("body-regex", true);

const onFailedTitelCommentInput = Input.getInputAsString(
  "on-failed-title-comment",
  true
);

const onFailedBodyCommentInput = Input.getInputAsString(
  "on-failed-body-comment",
  true
);

const onFailedRegexCreateReviewInput = Input.getInput(
  "on-failed-regex-create-review",
  false,
  Input.convertToBoolean
);

const onFailedRegexFailActionInput = Input.getInput(
  "on-failed-regex-fail-action",
  false,
  Input.convertToBoolean
);

const onFailedRegexRequestChanges = Input.getInput(
  "on-failed-regex-request-changes",
  false,
  Input.convertToBoolean
);

const app = new App(repoTokenInput, {
  BodyRegex: bodyRegexInput,
  TitelRegex: titleRegexInput,
  OnFailedBodyComment: onFailedBodyCommentInput,
  OnFailedTitelComment: onFailedTitelCommentInput,
  CreateReviewOnFailedRegex: onFailedRegexCreateReviewInput,
  FailActionOnFailedRegex: onFailedRegexFailActionInput,
  RequestChangesOnFailedRegex: onFailedRegexRequestChanges,
});
app.Run().catch((error) => core.setFailed(error));
