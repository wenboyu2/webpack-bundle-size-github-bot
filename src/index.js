const argv = require('minimist')(process.argv.slice(2));
const log = require('loglevel');
const BundleSizeBot = require('./BundleSizeBot');

(async function() {
    log.setLevel('debug' || argv.logLevel);
    const bsb = new BundleSizeBot(argv._[0]);
    await bsb.run();
})();
