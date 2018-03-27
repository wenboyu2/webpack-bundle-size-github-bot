const config = require('dotenv').config().parsed;
const axios = require('axios');
const log = require('loglevel');

const { parseJobLog } = require('./utils');

const baseUrl = `https://${config.CI_USERNAME}:${config.CI_TOKEN}@${config.JENKINS_BASE}`;

async function getJenkinsLatestBuildOfPr(prNumber) {
    const res = await axios.get(
        `${baseUrl}/blue/rest/organizations/jenkins/pipelines/${config.JENKINS_PROJECT}/runs/`
    );

    const latestBuild = res.data.find(build => {
        if (!build.name) {
            return;
        }
        const match = build.name.match(/pr\/(\d+)/i);
        return !!match && parseInt(match[1], 10) === parseInt(prNumber, 10);
    });

    if (!latestBuild) {
        throw new Error(`PR #${prNumber} has no build`);
    }

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
        `${baseUrl}/blue/rest/organizations/jenkins/pipelines/${config.JENKINS_PROJECT}/runs/${jobId}/log`
    );
    return parseJobLog(res.data);
}

module.exports = {
    getJenkinsPrBundleSizes
};
