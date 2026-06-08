const fs = require('fs');

const raw = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');
const json = JSON.parse(raw);
const data = json.pageProps?.data || {};

console.log('--- SQUAD PLAYER RAW ---');
if (data.tabsInfoSquad && Array.isArray(data.tabsInfoSquad.players) && data.tabsInfoSquad.players.length > 0) {
    const p = data.tabsInfoSquad.players[0];
    console.log('p keys:', Object.keys(p));
    console.log('p value:', JSON.stringify(p, null, 2));
}

console.log('\n--- MATCH ROW RAW ---');
const matches = data.tabsInfoMatches || data.summaryMatches || {};
const matchesArray = Array.isArray(matches) ? matches : Object.values(matches);
if (matchesArray.length > 0) {
    const m = matchesArray[0];
    console.log('m keys:', Object.keys(m));
    console.log('m value:', JSON.stringify(m, null, 2));
}

console.log('\n--- STANDING ROW RAW ---');
const standings = data.tabsInfoStandings || data.summaryStandings || {};
const standingsArray = Array.isArray(standings) ? standings : Object.values(standings);
if (standingsArray.length > 0) {
    const s = standingsArray[0];
    console.log('s keys:', Object.keys(s));
    console.log('s value:', JSON.stringify(s, null, 2));
}
