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
const core_1 = __importDefault(require("@actions/core"));
const github_2 = __importDefault(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const githubContext = github_2.default.context;
        const githubToken = core_1.default.getInput('repo-token');
        const githubClient = new github_1.GitHub(githubToken);
        const titleRegex = new RegExp(core_1.default.getInput('title-regex'));
        const title = githubContext.payload.pull_request.title;
        const bodyRegex = new RegExp(core_1.default.getInput('body-regex'));
        const body = githubContext.payload.pull_request.body;
        const onFailedTitleComment = core_1.default
            .getInput('on-failed-title-comment')
            .replace('%regex%', titleRegex.source);
        const onFailedBodyComment = core_1.default
            .getInput('on-failed-body-comment')
            .replace('%regex%', titleRegex.source);
        core_1.default.debug(`Title Regex: ${titleRegex}`);
        core_1.default.debug(`Title: ${title}`);
        core_1.default.debug(`Body Regex: ${bodyRegex}`);
        core_1.default.debug(`Body: ${body}`);
        try {
            core_1.default.info('Test title against Regex');
            yield test(githubClient, githubContext, onFailedTitleComment, titleRegex, title);
            core_1.default.info('Test body against Regex');
            yield test(githubClient, githubContext, onFailedBodyComment, bodyRegex, body);
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    });
}
function test(client, context, comment, test, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!test.test(value)) {
            core_1.default.setFailed(comment);
            core_1.default.debug(`Test for ${comment}`);
            yield createReview(client, context, comment);
            core_1.default.info('Test failed');
        }
        else {
            core_1.default.info('Test Successful');
        }
    });
}
function createReview(client, context, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        core_1.default.debug(`Create review ${comment}`);
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
