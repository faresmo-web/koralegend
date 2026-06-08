const axios = require('axios');

async function main() {
    const BASE_URL = 'https://www.kooora.com';
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,*/*',
        'Referer': 'https://www.kooora.com/',
    };

    const teamId = '70tnqyqn871jwlk26gtjw7knm';
    const teamName = 'تشيكيا';

    try {
        const r = await axios.get(BASE_URL, { headers: HEADERS });
        const m = r.data.match(/"buildId":"([^"]+)"/);
        if (!m) throw new Error('buildId not found');
        const buildId = m[1];
        console.log('Build ID:', buildId);

        // We will test several URL structures for the 'squad' or 'matches' or other tabs.
        const urls = {
            'tab_squad_direct': `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/squad/${teamId}.json`,
            'tab_squad_alt': `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}/squad.json`,
            'tab_squad_num': `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/3/${teamId}.json`,
            'tab_matches_direct': `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/matches/${teamId}.json`,
            'tab_squad_three_params': `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/squad/list/${teamId}.json`
        };

        for (const [name, url] of Object.entries(urls)) {
            console.log(`Testing ${name}:`, url);
            try {
                const res = await axios.get(url, { headers: HEADERS });
                console.log(`  SUCCESS for ${name}!`);
                const data = res.data?.pageProps?.data || {};
                console.log('  Keys in pageProps.data:', Object.keys(data));
                if (data.tabsInfoSquad) {
                    console.log('  Squad players count:', Array.isArray(data.tabsInfoSquad.players) ? data.tabsInfoSquad.players.length : 'none');
                    if (data.tabsInfoSquad.players && data.tabsInfoSquad.players.length > 0) {
                        console.log('  First player:', JSON.stringify(data.tabsInfoSquad.players[0]));
                    }
                }
                if (data.tabsInfoMatches) {
                    console.log('  Matches count:', Object.keys(data.tabsInfoMatches).length);
                }
            } catch (e) {
                console.log(`  Failed:`, e.response ? e.response.status : e.message);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
