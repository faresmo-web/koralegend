const fs = require('fs');
const content = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');
const json = JSON.parse(content);
const data = json.pageProps?.data || {};

console.log('tabsInfoSquad keys:', Object.keys(data.tabsInfoSquad || {}));
console.log('tabsInfoSquad JSON:', JSON.stringify(data.tabsInfoSquad, null, 2));
