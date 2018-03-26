const config = require('dotenv').config().parsed;
const octokit = require('@octokit/rest');
const log = require('loglevel');

const { title, legacyTitle } = require('./message');

class GithubClient {
    constructor() {
        this.ok = octokit({
            baseUrl: config.GITHUB_BASE_URL
        });
        this.ok.authenticate({
            type: 'basic',
            username: config.GITHUB_USERNAME,
            password: config.GITHUB_TOKEN
        });
    }

    async getMergeBaseCommit(prNumber) {
        const res = await this.ok.repos.compareCommits({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            base: `pull/${prNumber}/head`,
            head: 'master'
        });
        log.info(
            `getMergeBaseCommit #${prNumber} ==> ${
                res.data.merge_base_commit.sha
            }`
        );
        return res.data.merge_base_commit.sha;
    }

    async getCommitsBefore(commitHash) {
        const res = await this.ok.repos.getCommits({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            sha: commitHash
        });
        log.info('getCommits');
        return res.data.slice(1);
    }

    async getPrevPrNumber(prNumber) {
        const commitHash = await this.getMergeBaseCommit(prNumber);

        const immediateCommitPrNumber = await this.getCommitPrNumber(
            commitHash
        );
        if (immediateCommitPrNumber) {
            return immediateCommitPrNumber;
        }

        const prevCommits = await this.getCommitsBefore(commitHash);
        for (let commit of prevCommits) {
            const prNumber = await this.getCommitPrNumber(commit.sha);
            if (prNumber) {
                return prNumber;
            }
        }
    }

    async getCommitPrNumber(commitHash) {
        const res = await this.ok.search.issues({
            q: `repo:${config.GITHUB_OWNER}/${
                config.GITHUB_REPO
            } ${commitHash.substr(0, 7)}`
        });

        const items = res.data.items;

        if (!items.length) {
            return;
        }
        log.info(`getPrevPrNumber #${commitHash} ==> ${items[0].number}`);

        return items[0].number;
    }

    async getOpenPullRequestsNumbers() {
        const res = await this.ok.pullRequests.getAll({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            state: 'open'
        });

        return res.data.map(pr => pr.number);
    }

    async getPullRequestComments(prNumber) {
        const res = await this.ok.issues.getComments({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            number: prNumber
        });

        return res.data;
    }

    async getExistingBotComment(prNumber) {
        const comments = await this.getPullRequestComments(prNumber);
        const botComment = comments.find(
            ({ body }) =>
                body.indexOf(title) !== -1 || body.indexOf(legacyTitle) !== -1
        );

        return botComment;
    }

    updatePullRequestComment(message, commentId) {
        log.info(`updatePullRequestComment ==> ${commentId}`);
        this.ok.issues.editComment({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            id: commentId,
            body: message
        });
    }

    async postPullRequestComment(message, prNumber) {
        const botComment = await this.getExistingBotComment(prNumber);

        if (botComment) {
            const { id: botCommentId, body: botCommentBody } = botComment;
            const areCommentsIdentical = botCommentBody === message;

            log.info(
                `postPullRequestComment #${prNumber} existing commentId ==> ${botCommentId}`
            );
            log.info(
                `postPullRequestComment #${prNumber} ${botCommentId} areCommentsIdentical ==> ${areCommentsIdentical}`
            );

            if (areCommentsIdentical) {
                return;
            }

            await this.updatePullRequestComment(message, botCommentId);
            return;
        }

        await this.ok.issues.createComment({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            number: prNumber,
            body: message
        });
    }
}

// (async function() {
//     log.setLevel('info');
//     const bsb = new GithubClient();
//     console.log(await bsb.getPrevPrNumber(1));
// })();

module.exports = GithubClient;
