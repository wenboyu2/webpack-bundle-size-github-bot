const config = require('dotenv').config().parsed;
const octokit = require('@octokit/rest');
const log = require('loglevel');

class GithubClient {
    constructor(prNumber) {
        this.currPr = prNumber;
        this.ok = octokit();
        this.ok.authenticate({
            type: 'basic',
            username: config.GITHUB_USERNAME,
            password: config.GITHUB_TOKEN
        });
    }

    async getMergeBaseCommit() {
        try {
            const res = await this.ok.repos.compareCommits({
                owner: config.GITHUB_OWNER,
                repo: config.GITHUB_REPO,
                base: `pull/${this.currPr}/head`,
                head: 'master'
            });
            log.info(
                `getMergeBaseCommit ==> ${res.data.merge_base_commit.sha}`
            );
            return res.data.merge_base_commit.sha;
        } catch (e) {
            return null;
        }
    }

    async getPrBranchName(prNumber) {
        try {
            const res = await this.ok.pullRequests.get({
                owner: config.GITHUB_OWNER,
                repo: config.GITHUB_REPO,
                number: prNumber
            });

            log.info(`getPrBranchName ==> ${res.data.head}`);
            return res.data.head.ref;
        } catch (e) {
            return;
        }
    }

    async getPrevPrNumber() {
        const commitHash = await this.getMergeBaseCommit();
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
            log.info(`getPrevPrNumber ==> ${items[0].number}`);

            return items[0].number;
        } catch (e) {
            return;
        }
    }

    postPullRequestComment(message) {
        log.info(`postPullRequestComment ==> ${message}`);
        this.ok.issues.createComment({
            owner: config.GITHUB_OWNER,
            repo: config.GITHUB_REPO,
            number: this.currPr,
            body: message
        });
    }
}

module.exports = GithubClient;
