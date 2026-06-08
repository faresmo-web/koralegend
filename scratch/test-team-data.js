const axios = require('axios');
const BASE_URL = 'https://www.kooora.com';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function getBuildId() {
    const r = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    return m ? m[1] : null;
}

(async () => {
    const buildId = await getBuildId();
    const teamId = '7u6a9femhquay3jnk6ysgiwx9';
    const teamName = 'العراق';

    // Check what kooora tabs exist by checking the base page
    const infoUrl = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}.json`;
    const r = await axios.get(infoUrl, { headers: HEADERS, timeout: 15000 });
    const data = r.data?.pageProps?.data || {};
    
    // Check tabsInfoSquad structure
    console.log('\n=== tabsInfoSquad ===');
    const squad = data.tabsInfoSquad;
    if (squad) {
        console.log('  players:', squad.players?.length, 'coach:', squad.coach?.name);
        if (squad.players?.[0]) {
            console.log('  player[0] keys:', Object.keys(squad.players[0]));
            console.log('  player[0].player keys:', Object.keys(squad.players[0].player || {}));
        }
    } else {
        console.log('  NOT FOUND');
    }

    // Check tabsInfoTopPlayers structure
    console.log('\n=== tabsInfoTopPlayers ===');
    const top = data.tabsInfoTopPlayers;
    if (top) {
        console.log('  categories:', top.categories?.length);
        if (top.categories?.[0]) {
            console.log('  cat[0]:', top.categories[0].name, 'players:', top.categories[0].players?.length);
        }
    } else {
        console.log('  NOT FOUND in info page');
    }

    // Check summaryMatches structure
    console.log('\n=== summaryMatches ===');
    const sm = data.summaryMatches;
    if (sm) {
        console.log('  type:', typeof sm, 'isArray:', Array.isArray(sm));
        if (Array.isArray(sm)) console.log('  length:', sm.length);
        else console.log('  keys:', Object.keys(sm));
    } else {
        console.log('  NOT FOUND');
    }

    // Check tabsInfoStandings structure
    console.log('\n=== tabsInfoStandings ===');
    const stands = data.tabsInfoStandings;
    if (stands) {
        console.log('  keys:', Object.keys(stands));
        console.log('  tables:', stands.tables?.length);
    } else {
        console.log('  NOT FOUND');
    }

    // Now check squad tab specifically for the squad data structure
    const squadUrl = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/squad/${teamId}.json`;
    const r2 = await axios.get(squadUrl, { headers: HEADERS, timeout: 15000 });
    const data2 = r2.data?.pageProps?.data || {};

    console.log('\n=== squad tab - squad field ===');
    const squadData = data2.squad;
    if (squadData) {
        console.log('  type:', typeof squadData, 'isArray:', Array.isArray(squadData));
        console.log('  keys:', Object.keys(squadData));
        console.log('  players:', squadData.players?.length);
        console.log('  coach:', squadData.coach?.name);
        if (squadData.players?.[0]) {
            console.log('  player[0] keys:', Object.keys(squadData.players[0]));
            const p = squadData.players[0];
            console.log('  player[0].position:', p.position);
            console.log('  player[0].player keys:', p.player ? Object.keys(p.player) : 'no player sub-obj');
            console.log('  player[0].person keys:', p.person ? Object.keys(p.person) : 'no person sub-obj');
        }
    } else {
        console.log('  NOT FOUND');
    }

    // Check matches tab
    const matchesUrl = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/matches/${teamId}.json`;
    const r3 = await axios.get(matchesUrl, { headers: HEADERS, timeout: 15000 });
    const data3 = r3.data?.pageProps?.data || {};
    console.log('\n=== matches tab - matches field ===');
    const matchesData = data3.matches;
    if (matchesData) {
        console.log('  type:', typeof matchesData, 'isArray:', Array.isArray(matchesData));
        if (Array.isArray(matchesData) && matchesData[0]) {
            console.log('  match[0] keys:', Object.keys(matchesData[0]));
            console.log('  match[0].status:', matchesData[0].status);
            console.log('  match[0].score:', JSON.stringify(matchesData[0].score));
        }
    } else {
        console.log('  NOT FOUND');
    }

    // Check what tabsInfoTopPlayers looks like on squad tab
    console.log('\n=== squad tab - tabsInfoTopPlayers ===');
    const topInSquad = data2.tabsInfoTopPlayers;
    if (topInSquad) {
        console.log('  categories:', topInSquad.categories?.length);
    } else {
        console.log('  NOT FOUND');
    }
})();
