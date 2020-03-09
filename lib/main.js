"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github/lib/github");
const core = __importDefault(require("@actions/core"));
const github = __importDefault(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const githubContext = github.context;
        const githubToken = core.getInput('repo-token');
        const githubClient = new github_1.GitHub(githubToken);
        const titleRegex = new RegExp(core.getInput('title-regex'));
        const title = githubContext.payload.pull_request.title;
        const bodyRegex = new RegExp(core.getInput('body-regex'));
        const body = githubContext.payload.pull_request.body;
        const onFailedTitleComment = core
            .getInput('on-failed-title-comment')
            .replace('%regex%', titleRegex.source);
        const onFailedBodyComment = core
            .getInput('on-failed-body-comment')
            .replace('%regex%', titleRegex.source);
            core.debug(`Title Regex: ${titleRegex}`);
            core.debug(`Title: ${title}`);
            core.debug(`Body Regex: ${bodyRegex}`);
            core.debug(`Body: ${body}`);
        try {
            core.info('Test title against Regex');
            yield test(githubClient, githubContext, onFailedTitleComment, titleRegex, title);
            core.info('Test body against Regex');
            yield test(githubClient, githubContext, onFailedBodyComment, bodyRegex, body);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function test(client, context, comment, test, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!test.test(value)) {
            core.setFailed(comment);
            core.debug(`Test for ${comment}`);
            yield createReview(client, context, comment);
            core.info('Test failed');
        }
        else {
            core.info('Test Successful');
        }
    });
}
function createReview(client, context, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug(`Create review ${comment}`);
        const pr = context.issue;
        client.pulls.createReview({
            owner: pr.owner,
            repo: pr.repo,
            pull_number: pr.number,
            body: comment,
            event: 'COMMENT'
        });
    });
}
// noinspection JSIgnoredPromiseFromCall
run();
