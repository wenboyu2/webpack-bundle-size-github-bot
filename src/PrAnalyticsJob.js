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
        this.totalBundleSizes = { curr: 0, prev: 0, diff: 0 };
        Object.keys(this.currBundleSizes).forEach(key => {
            const currVal = this.currBundleSizes[key];
            const prevVal = this.prevBundleSizes[key];
            const diff = currVal - prevVal;

            this.totalBundleSizes.prev += prevVal;
            this.totalBundleSizes.curr += currVal;
            this.totalBundleSizes.diff += diff;

            this.diffBundleSizes[key] = diff;
            this.diffBundleSizes.totalDiff += diff;
        });
        log.info(
            `#${this.currPrNumber} - #${this.prevPrNumber}`,
            this.totalBundleSizes
        );
    }

    postComment() {
        const data = {
            curr: this.currBundleSizes,
            diff: this.diffBundleSizes,
            prev: this.prevBundleSizes,
            total: this.totalBundleSizes
        };

        const message = getMessage(data, this.prevPrNumber);
        this.gc.postPullRequestComment(message, this.currPrNumber);
    }
}

module.exports = PrAnalyticsJob;
