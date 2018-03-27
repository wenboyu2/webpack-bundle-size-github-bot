const config = require('dotenv').config().parsed;
const axios = require('axios');
const log = require('loglevel');

const { parseJobLog } = require('./utils');

function getTravis(url, options = {}) {
    return axios.get(url, {
        ...options,
        headers: {
            Authorization: `token ${config.CI_TOKEN}`,
            'User-Agent': 'webpack-bundle-size-github-bot',
            'Travis-API-Version': '3'
        }
    });
}

async function getTravisLatestBuildIdOfPr(prNumber) {
    const slug = encodeURIComponent(
        `${config.GITHUB_OWNER}/${config.GITHUB_REPO}`
    );

    const res = await getTravis(
        `https://api.travis-ci.org/repo/${slug}/builds?event_type=pull_request&state=passed&sort_by=finished_at:desc&limit=100`
    );

    const latestBuild = res.data.builds.find(
        build =>
            parseInt(build.pull_request_number, 10) === parseInt(prNumber, 10)
    );
    const id = latestBuild.jobs[0].id;

    if (latestBuild.state !== 'passed') {
        throw new Error(`PR #${prNumber} latest build ${id} is not successful`);
    }

    log.info(`getLatestBuildIdOfPr #${prNumber} ==> ${id}`);

    return id;
}

async function getTravisPrBundleSizes(prNumber) {
    const jobId = await getTravisLatestBuildIdOfPr(prNumber);

    log.info(`getPrBundleSizes - jobId #${prNumber} ==> ${jobId}`);

    const res = await getTravis(`https://api.travis-ci.org/job/${jobId}/log`);
    return parseJobLog(res.data.log_parts[0].content);
}

module.exports = {
    getTravisPrBundleSizes
};
