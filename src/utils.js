const log = require('loglevel');
const filesizeParser = require('filesize-parser');

const bundleNamesRegexList = require('../bot.config').bundles;

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

module.exports = {
    parseJobLog
};
