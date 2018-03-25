// @flow
import log from 'loglevel';

import GithubClient from './GithubClient';
import PrAnalyticsJob from './PrAnalyticsJob';

class BundleSizeBot {
    constructor() {
        this.gc = new GithubClient();
    }

    gc: BundleSizeBot;

    async run(): Promise<*> {
        const allOpenPrNumbers = await this.gc.getOpenPullRequestsNumbers();
        log.info(`BundleSizeBot allOpenPrNumbers ==> ${allOpenPrNumbers}`);

        const jobs = Array.prototype.map.call(
            allOpenPrNumbers,
            prNumber => new PrAnalyticsJob(prNumber, this.gc)
        );

        await Promise.all(Array.prototype.map.call(jobs, job => job.run()));
    }
}

export default BundleSizeBot;
