const config = require('dotenv').config().parsed;
const axios = require('axios');
const filesizeParser = require('filesize-parser');
const log = require('loglevel');

const bundleNamesRegexList = require('../bot.config').bundles;
const isJenkins = config.CI === 'jenkins';
const baseUrl = isJenkins
    ? `https://${config.CI_USERNAME}:${config.CI_TOKEN}@jenkins.pod.box.net`
    : '';

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

async function getPrBundleSizes(prNumber) {
    return isJenkins
        ? getJenkinsPrBundleSizes(prNumber)
        : getTravisPrBundleSizes(prNumber);
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

async function getJenkinsLatestBuildOfPr(prNumber) {
    const res = await axios.get(
        `${baseUrl}/blue/rest/organizations/jenkins/pipelines/EndUserApp/pipelines/ContinuousIntegration/pipelines/PullRequest/runs/`
    );

    const latestBuild = res.data.find(build => {
        if (!build.name) {
            return;
        }
        const match = build.name.match(/pr\/(\d+)/i);
        return !!match && parseInt(match[1], 10) === parseInt(prNumber, 10);
    });

    const buildId = latestBuild.id;

    if (latestBuild.result !== 'SUCCESS') {
        throw new Error(
            `PR #${prNumber} latest build ${buildId} is not successful`
        );
    }

    log.info(`getJenkinsLatestBuildOfPr #${prNumber} ==> ${buildId}`);

    return buildId;
}

async function getJenkinsPrBundleSizes(prNumber) {
    const jobId = await getJenkinsLatestBuildOfPr(prNumber);

    log.info(`getPrBundleSizes - jobId #${prNumber} ==> ${jobId}`);

    const res = await axios.get(
        `${baseUrl}/blue/rest/organizations/jenkins/pipelines/EndUserApp/pipelines/ContinuousIntegration/pipelines/PullRequest/runs/${jobId}/log`
    );
    return parseJobLog(res.data);
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
        const regex = new RegExp(`(${pattern})\\s+([\\d.+]+ \\w+)`);
        const matchResult = cleanedContent.match(regex);

        if (!matchResult) {
            return;
        }

        const [, , sizeString] = matchResult;
        const cleanedSizeString = sizeString.replace('kB', 'KB');
        parsedLog[name] = filesizeParser(cleanedSizeString);
    });

    log.info(`parseJobLog ==> ${JSON.stringify(parsedLog, null, 2)}`);

    return parsedLog;
}

// (async function() {
//     log.enableAll();
//     const res = await getJenkinsLatestBuildOfPr(1167);
//     console.log(res);
// })();

module.exports = {
    getPrBundleSizes
};
