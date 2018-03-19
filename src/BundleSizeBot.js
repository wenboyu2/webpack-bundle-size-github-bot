const log = require('loglevel');

const GithubClient = require('./GithubClient');
const { getPrBundleSizes } = require('./travis');
const getMessage = require('./getMessage');

class BundleSizeBot {
    constructor(currPrNumber) {
        this.currPrNumber = currPrNumber;
        this.gc = new GithubClient(currPrNumber);
    }

    async run() {
        this.prevPrNumber = await this.gc.getPrevPrNumber();
        this.currBundleSizes = await getPrBundleSizes(this.currPrNumber);
        log.info(this.currBundleSizes);
        this.prevBundleSizes = await getPrBundleSizes(this.prevPrNumber);
        log.info(this.prevBundleSizes);
        this.bundleSizeAnalytics();
        this.postComment();
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
        log.info(this.totalBundleSizes);
    }

    postComment() {
        const data = {
            curr: this.currBundleSizes,
            diff: this.diffBundleSizes,
            prev: this.prevBundleSizes,
            total: this.totalBundleSizes
        };

        const message = getMessage(data, this.prevPrNumber);
        log.info(message);
        this.gc.postPullRequestComment(message);
    }
}

module.exports = BundleSizeBot;
