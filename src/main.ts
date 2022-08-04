import { App } from "./app";
import { Input } from "./input";
import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { lastValueFrom } from "rxjs";
import { exit } from "process";

const repoTokenInput = getInput("repo-token", { required: true });

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

const client = getOctokit(repoTokenInput);

const app = new App(client, context, {
  BodyRegex: bodyRegexInput,
  TitelRegex: titleRegexInput,
  OnFailedBodyComment: onFailedBodyCommentInput,
  OnFailedTitelComment: onFailedTitelCommentInput,
  CreateReviewOnFailedRegex: onFailedRegexCreateReviewInput,
  FailActionOnFailedRegex: onFailedRegexFailActionInput,
  RequestChangesOnFailedRegex: onFailedRegexRequestChanges,
});

app.init();

try {
  const value = await lastValueFrom(app.run(), { defaultValue: undefined });
  console.debug(value);
  exit(0)
} catch (ex: any) {
  setFailed(ex);
} finally {
  app.tearDown();
}
