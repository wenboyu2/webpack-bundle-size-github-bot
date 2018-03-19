const config = require('dotenv').config().parsed;
const axios = require('axios');
const filesizeParser = require('filesize-parser');
const log = require('loglevel');

const bundleNamesRegexList = require('../bot.config').bundles;

function get(url, options = {}) {
    return axios.get(url, {
        ...options,
        headers: {
            Authorization: `token ${config.TRAVIS_TOKEN}`,
            'User-Agent': 'webpack-bundle-size-github-bot',
            'Travis-API-Version': '3'
        }
    });
}

async function getLatestBuildOfPr(prNumber) {
    const slug = encodeURIComponent(
        `${config.GITHUB_OWNER}/${config.GITHUB_REPO}`
    );
    try {
        const res = await get(
            `https://api.travis-ci.org/repo/${slug}/builds?event_type=pull_request&state=passed&sort_by=finished_at:desc&limit=100`
        );

        const latestBuild = res.data.builds.find(
            build =>
                parseInt(build.pull_request_number, 10) ===
                parseInt(prNumber, 10)
        );

        log.info(
            `getLatestBuildOfPr ==> ${JSON.stringify(latestBuild, null, 2)}`
        );

        return latestBuild;
    } catch (e) {
        // noop
    }
}

async function getPrBundleSizes(prNumber) {
    const build = await getLatestBuildOfPr(prNumber);
    const jobId = build.jobs[0].id;

    log.info(`getPrBundleSizes - jobId ==> ${jobId}`);

    try {
        const res = await get(`https://api.travis-ci.org/job/${jobId}/log`);
        return parseJobLog(res.data.log_parts[0].content);
    } catch (e) {
        // noop
    }
}

function cleanString(value) {
    return value
        .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        .replace(/\[\d+m/g, '');
}

function parseJobLog(content) {
    const cleanedContent = cleanString(content);
    const parsedLog = {};

    bundleNamesRegexList.forEach(({ name, pattern }) => {
        log.info(`parseJobLog - forEach ==> ${name}, ${pattern}`);
        const regex = new RegExp(`(${pattern})\\s+([\\d.+]+ \\w+)`);
        const matchResult = cleanedContent.match(regex);

        if (!matchResult) {
            return;
        }

        log.info(regex);

        const [, , sizeString] = matchResult;
        parsedLog[name] = filesizeParser(sizeString);
    });

    log.info(`parseJobLog ==> ${JSON.stringify(parsedLog, null, 2)}`);

    return parsedLog;
}

module.exports = {
    getPrBundleSizes
};
