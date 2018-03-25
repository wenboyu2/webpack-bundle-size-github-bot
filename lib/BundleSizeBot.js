'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _GithubClient = require('./GithubClient');

var _GithubClient2 = _interopRequireDefault(_GithubClient);

var _PrAnalyticsJob = require('./PrAnalyticsJob');

var _PrAnalyticsJob2 = _interopRequireDefault(_PrAnalyticsJob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BundleSizeBot {
    constructor() {
        this.gc = new _GithubClient2.default();
    }

    async run() {
        const allOpenPrNumbers = await this.gc.getOpenPullRequestsNumbers();
        _loglevel2.default.info(`BundleSizeBot allOpenPrNumbers ==> ${allOpenPrNumbers}`);

        const jobs = Array.prototype.map.call(allOpenPrNumbers, prNumber => new _PrAnalyticsJob2.default(prNumber, this.gc));

        await Promise.all(Array.prototype.map.call(jobs, job => job.run()));
    }
}
exports.default = BundleSizeBot;