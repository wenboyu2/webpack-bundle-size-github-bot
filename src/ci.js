const config = require('dotenv').config().parsed;

const { getJenkinsPrBundleSizes } = require('./jenkins');
const { getTravisPrBundleSizes } = require('./travis');

async function getPrBundleSizes(prNumber) {
    return config.CI === 'jenkins'
        ? getJenkinsPrBundleSizes(prNumber)
        : getTravisPrBundleSizes(prNumber);
}

module.exports = {
    getPrBundleSizes
};
