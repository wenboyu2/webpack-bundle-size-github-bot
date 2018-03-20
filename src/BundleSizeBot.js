const log = require('loglevel');

const GithubClient = require('./GithubClient');
const PrAnalyticsJob = require('./PrAnalyticsJob');

class BundleSizeBot {
    constructor() {
        this.gc = new GithubClient();
    }

    async run() {
        const allOpenPrNumbers = await this.gc.getOpenPullRequestsNumbers();
        log.info(`BundleSizeBot allOpenPrNumbers ==> ${allOpenPrNumbers}`);

        const jobs = Array.prototype.map.call(
            allOpenPrNumbers,
            prNumber => new PrAnalyticsJob(prNumber, this.gc)
        );

        await Promise.all(Array.prototype.map.call(jobs, job => job.run()));
    }
}

module.exports = BundleSizeBot;
