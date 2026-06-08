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

    // Check all valid tabs
    const tabs = ['squad', 'matches', 'news', 'videos', 'standings', 'scorers'];
    
    for (const tab of tabs) {
        const url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${tab}/${teamId}.json`;
        try {
            const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
            const data = r.data?.pageProps?.data || {};
            const keys = Object.keys(data);
            console.log(`\n[${tab}] 200 OK`);
            console.log(`  keys: ${keys.join(', ')}`);
            
            // Check specific fields
            if (tab === 'squad') {
                const squad = data.squad || data.tabsInfoSquad;
                console.log(`  squad type:`, typeof squad, 'players:', squad?.players?.length);
            }
            if (tab === 'matches') {
                const matches = data.matches || data.summaryMatches;
                console.log(`  matches type:`, typeof matches, Array.isArray(matches) ? `length: ${matches.length}` : JSON.stringify(matches)?.slice(0, 100));
            }
        } catch(e) {
            console.log(`\n[${tab}] ERROR ${e.response?.status}: ${e.message.slice(0, 100)}`);
        }
    }
    
    // Also check the base (info) tab
    const infoUrl = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}.json`;
    try {
        const r = await axios.get(infoUrl, { headers: HEADERS, timeout: 15000 });
        const data = r.data?.pageProps?.data || {};
        console.log(`\n[info] 200 OK, keys: ${Object.keys(data).join(', ')}`);
    } catch(e) {
        console.log(`\n[info] ERROR ${e.response?.status}: ${e.message.slice(0, 100)}`);
    }
})();
