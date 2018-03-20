const config = require('dotenv').config().parsed;
const octokit = require('@octokit/rest');
const log = require('loglevel');

const { title } = require('./message');

class GithubClient {
    constructor() {
        this.ok = octokit();
        this.ok.authenticate({
            type: 'basic',
            username: config.GITHUB_USERNAME,
            password: config.GITHUB_TOKEN
        });
    }

    async getMergeBaseCommit(prNumber) {
        try {
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
        } catch (e) {
            // noop
        }
    }

    async getPrevPrNumber(prNumber) {
        const commitHash = await this.getMergeBaseCommit(prNumber);
        if (!commitHash) {
            return;
        }

        try {
            const res = await this.ok.search.issues({
                q: `repo:${config.GITHUB_OWNER}/${
                    config.GITHUB_REPO
                } ${commitHash.substr(0, 7)}`
            });

            const items = res.data.items;

            if (!items.length) {
                return;
            }
            log.info(`getPrevPrNumber #${prNumber} ==> ${items[0].number}`);

            return items[0].number;
        } catch (e) {
            // noop
        }
    }

    async getOpenPullRequestsNumbers() {
        try {
            const res = await this.ok.pullRequests.getAll({
                owner: config.GITHUB_OWNER,
                repo: config.GITHUB_REPO,
                state: 'open'
            });

            return res.data.map(pr => pr.number);
        } catch (e) {
            // noop
        }
    }

    async getPullRequestComments(prNumber) {
        try {
            const res = await this.ok.issues.getComments({
                owner: config.GITHUB_OWNER,
                repo: config.GITHUB_REPO,
                number: prNumber
            });

            return res.data;
        } catch (e) {
            // noop
        }
    }

    async getExistingBotComment(prNumber) {
        try {
            const comments = await this.getPullRequestComments(prNumber);
            const botComment = comments.find(
                ({ body }) => body.indexOf(title) !== -1
            );

            return botComment;
        } catch (e) {
            // noop
        }
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
//     console.log(await bsb.getPullRequestComments(3));
// })();

module.exports = GithubClient;
