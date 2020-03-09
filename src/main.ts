import {GitHub} from '@actions/github/lib/github';

import core from '@actions/core';
import github from '@actions/github';
import {Context} from '@actions/github/lib/context';

async function run() {
  const githubContext = github.context;
  const githubToken = core.getInput('repo-token');
  const githubClient: GitHub = new GitHub(githubToken);

  const titleRegex = new RegExp(core.getInput('title-regex'));
  const title = githubContext.payload.pull_request?.title;

  const bodyRegex = new RegExp(core.getInput('body.regex'));
  const body = githubContext.payload.pull_request?.body as any;

  const onFailedTitleComment = core
    .getInput('on-failed-title-comment')
    .replace('%regex%', titleRegex.source);
  const onFailedBodyComment = core
    .getInput('on-failed-body-comment')
    .replace('%regex%', titleRegex.source);

  core.debug(`Title Regex: ${titleRegex}`);
  core.debug(`Title: ${title}`);

  try {
    test(githubClient, githubContext, onFailedTitleComment, titleRegex, title);
    test(githubClient, githubContext, onFailedBodyComment, bodyRegex, body);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function test(
  client: GitHub,
  context: Context,
  comment: string,
  test: RegExp,
  value: any
) {
  if (!test.test(value)) {
    core.setFailed(comment);

    createReview(client, context, comment);
  }
}

async function createReview(client: GitHub, context: Context, comment: string) {
  const pr = context.issue;
  client.pulls.createReview({
    owner: pr.owner,
    repo: pr.repo,
    pull_number: pr.number,
    body: comment,
    event: 'COMMENT'
  });
}

// noinspection JSIgnoredPromiseFromCall
run();
