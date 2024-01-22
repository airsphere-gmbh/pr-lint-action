import { App } from "./app";
import { Input } from "./input";
import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { lastValueFrom } from "rxjs";
import { exit } from "process";
import { GitHubClientImpl } from "./github/github";

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
const gitHubClient = new GitHubClientImpl(client, context);

const app = new App(gitHubClient, {
  BodyRegex: bodyRegexInput,
  TitelRegex: titleRegexInput,
  OnFailedBodyComment: onFailedBodyCommentInput,
  OnFailedTitelComment: onFailedTitelCommentInput,
  CreateReviewOnFailedRegex: onFailedRegexCreateReviewInput,
  FailActionOnFailedRegex: onFailedRegexFailActionInput,
  RequestChangesOnFailedRegex: onFailedRegexRequestChanges,
});

app.init();

lastValueFrom(app.run(), { defaultValue: undefined })
  .then((_) => exit(0))
  .catch((exception) => setFailed(exception))
  .finally(() => app.tearDown());
