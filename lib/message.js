'use strict';

const filesize = require('filesize');

const title = '# Webpack Bundle Size Github Bot';
const legacyTitle = '**:zap:Hello, I\'m a bot:zap:**';

const getMessage = (data, prevPrNumber) => {
    const tableContent = getTableRows(data);
    const { curr, prev, diff } = data.total;
    const totalTableRow = `| Total | ${filesize(diff)} | ${filesize(prev)} | ${filesize(curr)} |\n`;
    return `
${title}

| Bundle        | Diff | Before | After |
| ------------- |:----:|:------:|:-----:|
${tableContent}${totalTableRow}
Compared against previously merged PR #${prevPrNumber}

**Powered by [webpack-bundle-size-github-bot](https://github.com/wenboyu2/webpack-bundle-size-github-bot/)**
`;
};

const getTableRows = ({ curr, diff, prev }) => {
    let res = '';
    Object.keys(curr).forEach(name => {
        res += getTableRow(name, curr[name], prev[name], diff[name]);
    });
    return res;
};

const getTableRow = (name, curr, prev, diff) => `| ${name} | ${filesize(diff)} | ${filesize(prev)} | ${filesize(curr)} |\n`;

module.exports = {
    getMessage,
    title,
    legacyTitle
};