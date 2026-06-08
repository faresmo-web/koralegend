const fs = require('fs');

const raw = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');
const json = JSON.parse(raw);
const data = json.pageProps?.data || {};

console.log('--- TEAM INFO ---');
console.log(JSON.stringify(data.team, null, 2));

console.log('\n--- LATEST NEWS (keys or sample) ---');
const news = data.latestNews || data.tabsInfoNewsArchive;
console.log('Type:', Array.isArray(news) ? 'Array' : typeof news);
if (Array.isArray(news)) {
    console.log('Count:', news.length);
    console.log('First item:', JSON.stringify(news[0], null, 2));
} else if (news) {
    console.log('Keys:', Object.keys(news));
    const cards = news.cards || news.items || [];
    console.log('Cards count:', cards.length);
    console.log('First card:', JSON.stringify(cards[0], null, 2));
}

console.log('\n--- VIDEOS (sample) ---');
const videos = data.tabsInfoVideosArchive;
console.log('Type:', typeof videos);
if (videos) {
    console.log('Keys:', Object.keys(videos));
    const items = videos.cards || videos.items || [];
    console.log('Items count:', items.length);
    console.log('First video item:', JSON.stringify(items[0], null, 2));
}

console.log('\n--- MATCHES (sample) ---');
const matches = data.tabsInfoMatches || data.summaryMatches;
console.log('Type:', typeof matches);
if (matches) {
    console.log('Keys:', Object.keys(matches));
    const items = matches.matches || matches.events || matches.gamesets || [];
    console.log('Items count:', items.length);
    if (items.length > 0) {
        console.log('First match item:', JSON.stringify(items[0], null, 2));
    } else {
        console.log('Matches object structure:', JSON.stringify(matches, null, 2).substring(0, 1000));
    }
}

console.log('\n--- SQUAD (sample) ---');
const squad = data.tabsInfoSquad;
console.log('Type:', typeof squad);
if (squad) {
    console.log('Keys:', Object.keys(squad));
    const squads = squad.squads || squad.players || squad.items || [];
    console.log('Squads count:', squads.length);
    if (squads.length > 0) {
        console.log('First squad item:', JSON.stringify(squads[0], null, 2).substring(0, 1000));
    } else {
        console.log('Squad structure:', JSON.stringify(squad, null, 2).substring(0, 1000));
    }
}

console.log('\n--- STANDINGS (sample) ---');
const standings = data.tabsInfoStandings || data.summaryStandings;
console.log('Type:', typeof standings);
if (standings) {
    console.log('Keys:', Object.keys(standings));
    const tables = standings.tables || [];
    console.log('Tables count:', tables.length);
    if (tables.length > 0) {
        console.log('First table first ranking:', JSON.stringify(tables[0].rankings?.[0] || {}, null, 2));
    } else {
        console.log('Standings structure:', JSON.stringify(standings, null, 2).substring(0, 1000));
    }
}

console.log('\n--- TOP PLAYERS (sample) ---');
const topPlayers = data.tabsInfoTopPlayers;
console.log('Type:', typeof topPlayers);
if (topPlayers) {
    console.log('Keys:', Object.keys(topPlayers));
    console.log('Top players structure:', JSON.stringify(topPlayers, null, 2).substring(0, 1000));
}
