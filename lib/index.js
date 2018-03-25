'use strict';

var _BundleSizeBot = require('./BundleSizeBot');

var _BundleSizeBot2 = _interopRequireDefault(_BundleSizeBot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = require('minimist')(process.argv.slice(2));
const log = require('loglevel');
var CronJob = require('cron').CronJob;
const config = require('dotenv').config().parsed;

function runOnce() {
    log.enableAll();
    log.info(`[${new Date().toString()}] Starting BundleSizeBot`);
    log.setLevel(argv.logLevel || 'error');
    const bsb = new _BundleSizeBot2.default();
    bsb.run();
}

function run() {
    new CronJob(config.CRON, runOnce, null, true);
}

if (argv.once || !config.CRON) {
    runOnce();
} else {
    run();
}