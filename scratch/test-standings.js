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

    // Check standings tab
    const url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/standings/${teamId}.json`;
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const data = r.data?.pageProps?.data || {};
    
    console.log('=== standings tab ===');
    console.log('summaryStandings:', JSON.stringify(data.summaryStandings)?.slice(0, 500));
    console.log('\ntabsInfoStandings:', JSON.stringify(data.tabsInfoStandings)?.slice(0, 500));
    
    // Check tabsInfoTopPlayers in base URL  
    const baseUrl = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}.json`;
    const r2 = await axios.get(baseUrl, { headers: HEADERS, timeout: 15000 });
    const data2 = r2.data?.pageProps?.data || {};
    
    console.log('\n=== base tab - tabsInfoTopPlayers ===');
    const top = data2.tabsInfoTopPlayers;
    if (top) {
        console.log('categories:', top.categories?.length);
        if (top.categories?.[0]) {
            console.log('cat[0]:', JSON.stringify(top.categories[0]).slice(0, 300));
        }
    } else {
        console.log('NOT FOUND - top players data unavailable for this team');
    }

    // Check summaryStandings in base url
    console.log('\n=== base tab - summaryStandings ===');
    const ss = data2.summaryStandings;
    if (ss) {
        console.log('type:', typeof ss, 'keys:', Object.keys(ss));
        if (ss.tables) {
            console.log('tables:', ss.tables.length);
            if (ss.tables[0]?.rankings?.[0]) {
                console.log('row[0]:', JSON.stringify(ss.tables[0].rankings[0]).slice(0, 300));
            }
        }
    } else {
        console.log('NOT FOUND');
    }
})();
