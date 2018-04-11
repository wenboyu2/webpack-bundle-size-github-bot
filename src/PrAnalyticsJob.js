const log = require('loglevel');

const { getPrBundleSizes } = require('./ci');
const { getMessage } = require('./message');

class PrAnalyticsJob {
    constructor(currPrNumber, githubClient) {
        this.currPrNumber = currPrNumber;
        this.gc = githubClient;
    }

    async run() {
        try {
            this.prevPrNumber = await this.gc.getPrevPrNumber(
                this.currPrNumber
            );
            log.info(`run prevPrNumber ==> ${this.prevPrNumber}`);
            this.currBundleSizes = await getPrBundleSizes(this.currPrNumber);
            log.info(`#${this.currPrNumber}`, this.currBundleSizes);
            this.prevBundleSizes = await getPrBundleSizes(this.prevPrNumber);
            log.info(`#${this.prevPrNumber}`, this.prevBundleSizes);
            this.bundleSizeAnalytics();
            this.postComment();
        } catch (e) {
            log.error(e);
        }
    }

    bundleSizeAnalytics() {
        this.diffBundleSizes = {};
        this.diffPercentBundleSizes = {};
        this.totalBundleSizes = { curr: 0, prev: 0, diff: 0, diffPercent: 0 };
        Object.keys(this.currBundleSizes).forEach(key => {
            const currVal = this.currBundleSizes[key] | 0;
            const prevVal = this.prevBundleSizes[key] | 0;
            const diff = currVal - prevVal;

            this.totalBundleSizes.prev += prevVal;
            this.totalBundleSizes.curr += currVal;
            this.totalBundleSizes.diff += diff;

            this.diffBundleSizes[key] = diff;
            this.diffPercentBundleSizes[key] = prevVal
                ? diff / prevVal * 100
                : 0;
        });
        this.totalBundleSizes.diffPercent = this.totalBundleSizes.prev
            ? this.totalBundleSizes.diff / this.totalBundleSizes.prev * 100
            : 0;

        log.info(
            `#${this.currPrNumber} - #${this.prevPrNumber}`,
            this.totalBundleSizes
        );
    }

    postComment() {
        const data = {
            curr: this.currBundleSizes,
            diff: this.diffBundleSizes,
            diffPercent: this.diffPercentBundleSizes,
            prev: this.prevBundleSizes,
            total: this.totalBundleSizes
        };

        const message = getMessage(data, this.prevPrNumber);
        this.gc.postPullRequestComment(message, this.currPrNumber);
    }
}

module.exports = PrAnalyticsJob;
