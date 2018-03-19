const filesize = require('filesize');

const title = '# Webpack Bundle Size Github Bot';
const getMessage = (data, prevPrNumber) => {
    const tableContent = getTableRows(data);
    const { curr, prev, diff } = data.total;
    const totalTableRow = `| Total | ${filesize(diff)} | ${filesize(
        curr
    )} | ${filesize(prev)} |\n`;
    return `
${title}

| Bundle        | Diff | Before | After |
| ------------- |:----:|:------:|:-----:|
${tableContent}${totalTableRow}
Compared against previously merged PR #${prevPrNumber}
`;
};

const getTableRows = ({ curr, diff, prev }) => {
    let res = '';
    Object.keys(curr).forEach(name => {
        res += getTableRow(name, curr[name], prev[name], diff[name]);
    });
    return res;
};

const getTableRow = (name, curr, prev, diff) =>
    `| ${name} | ${filesize(diff)} | ${filesize(curr)} | ${filesize(prev)} |\n`;

module.exports = getMessage;
