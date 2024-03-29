# Pull Request Linter [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A GitHub Action to ensure that your PR title matches a given regex.

## Usage

Create a workflow definition at `.github/workflows/<my-workflow>.yml` with
something like the following contents:

```yaml
name: PR Lint

on:
  pull_request:
    # By default, a workflow only runs when a pull_request's activity type is opened, synchronize, or reopened. We
    # explicity override here so that PR titles are re-linted when the PR text content is edited.
    #
    # Possible values: https://help.github.com/en/actions/reference/events-that-trigger-workflows#pull-request-event-pull_request
    types: [opened, edited, reopened]

jobs:
  pr-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: airsphere-gmbh/pr-lint-action@v2.0
        with:
          title-regex: "#[eE][xX]-[0-9]+"
          body-regex: "#[eE][xX]-[0-9]+"
          on-failed-body-comment:
            "This is just an example. Failed regex: `%regex%`!"
          on-failed-title-comment:
            "This is just an example. Failed regex: `%regex%`!"
          on-failed-regex-fail-action: false
          on-failed-regex-request-changes: false
          on-failed-regex-create-review: true
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

## Changelog

### v2.0

- Inserted custom AirSphere functionalitys
- Use Webpack to build and minify
- Use directly node12 instead a docker image
- Rewrite functionality to reduce javascript elements

### v1.4.1

- Fixes [#145](https://github.com/MorrisonCole/pr-lint-action/issues/145)
  (thanks @jnewland! 🤩).

### v1.4.0

- Adds [#119](https://github.com/MorrisonCole/pr-lint-action/issues/119) (thanks
  @bryantbiggs! 🙏) the ability to configure whether changes are requested or
  not with `on-failed-regex-request-changes`. Existing behaviour is preserved.
- Upgrades all dependencies.

### v1.3.0

- Adds [#111](https://github.com/MorrisonCole/pr-lint-action/issues/111), the
  ability to specify whether to create a review and whether to fail the action
  on a regex mismatch independently with `on-failed-regex-fail-action` &
  `on-failed-regex-create-review`.
- `on-failed-regex-comment` is no longer a required input.

_Note:_ existing behaviour from previous releases is preserved without
additional configuration 🙏.

### v1.2.3

Internal refactoring only:

- Upgrade dependencies.
- Move from `lib` to `dist`.
- Address ESLint warnings.

### v1.2.2

- Fixes [#92](https://github.com/MorrisonCole/pr-lint-action/issues/92).

### v1.2.1

- Fixes [#90](https://github.com/MorrisonCole/pr-lint-action/issues/90).

### v1.1.1

Internal refactoring only:

- Upgrade dependencies.
- Configure ESLint & Prettier.

### v1.1.0

- Replaced status checks with an automatic bot review. If the PR title fails to
  match the regex, the bot will request changes. Once the title is edited to
  match it, the bot will dismiss its review.
- Upgrade dependencies.

### v1.0.0

- Initial release. This version uses action status checks but suffers from
  [#5](https://github.com/MorrisonCole/pr-lint-action/issues/5) since the GitHub
  actions API treats different hook types as separate checks by default.

## FAQ

### Why doesn't this Action use status checks any more?

Since actions
[are currently not grouped together](https://github.community/t5/GitHub-Actions/duplicate-checks-on-pull-request-event/m-p/33157),
previously failed status checks were persisted despite newer runs succeeding
(reported in [#5](https://github.com/MorrisonCole/pr-lint-action/issues/5)). We
made the decision to use a bot-based 'request changes' workflow for the time
being.

## Developing

### Build

`yarn install`

`yarn build`

Building outputs to `dist/main.js`.

## Related Reading

- [GitHub Action Metadata Syntax](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/metadata-syntax-for-github-actions)
