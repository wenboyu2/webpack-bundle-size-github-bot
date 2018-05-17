const log = require('loglevel');
const config = require('dotenv').config().parsed;

const GithubClient = require('./GithubClient');
const PrAnalyticsJob = require('./PrAnalyticsJob');

const INTERVAL_BETWEEN_JOBS = config.INTERVAL_BETWEEN_JOBS || 5000;

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
        var jobIdx = 0;

        var interval = setInterval(() => {
            if (jobIdx >= jobs.length) {
                clearInterval(interval);
                return;
            }

            const job = jobs[jobIdx];
            job.run();
            jobIdx += 1;
        }, INTERVAL_BETWEEN_JOBS);
    }
}

module.exports = BundleSizeBot;
