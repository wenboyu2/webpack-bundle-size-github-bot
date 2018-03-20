const argv = require('minimist')(process.argv.slice(2));
const log = require('loglevel');
var CronJob = require('cron').CronJob;
const config = require('dotenv').config().parsed;

const BundleSizeBot = require('./BundleSizeBot');

function runOnce() {
    log.enableAll();
    log.info(`[${new Date().toString()}] Starting BundleSizeBot`);
    log.setLevel(argv.logLevel || 'error');
    const bsb = new BundleSizeBot();
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
