const axios = require('axios');

async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/json,*/*'
    };

    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html = Buffer.from(r0.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    const buildId = m[1];
    console.log('Build ID:', buildId);

    // Egyptian league - use the exact ID from the matches page
    const leagueId = '8k1xcsyxzapl4ljduh3eomne'; // Egyptian Premiere League
    const slug = 'الدوري-المصري-الممتاز';

    // Try the مسابقة path (the one server.js uses)
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/${encodeURIComponent(slug)}/${leagueId}.json`;
    console.log('URL:', url);

    try {
        const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        const data = r.data.pageProps?.data;
        console.log('Top-level keys:', Object.keys(data));
        console.log('\nsummaryStandings type:', typeof data.summaryStandings);
        console.log('summaryStandings sample:', JSON.stringify(data.summaryStandings).substring(0, 500));
        console.log('\ntabsInfoTopPlayers type:', typeof data.tabsInfoTopPlayers);
        console.log('tabsInfoTopPlayers sample:', JSON.stringify(data.tabsInfoTopPlayers).substring(0, 500));
    } catch(e) {
        console.log('Error with مسابقة path:', e.response?.status, e.message);
        // Try بطولة path
        const url2 = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D8%A8%D8%B7%D9%88%D9%84%D8%A9/${encodeURIComponent(slug)}/${leagueId}.json`;
        console.log('Trying بطولة URL:', url2);
        try {
            const r2 = await axios.get(url2, { headers: HEADERS, timeout: 10000 });
            const data2 = r2.data.pageProps?.data;
            console.log('Top-level keys:', Object.keys(data2));
            console.log('\nsummaryStandings:', JSON.stringify(data2.summaryStandings).substring(0, 500));
        } catch(e2) {
            console.log('Also failed:', e2.response?.status, e2.message);
        }
    }
}
main().catch(console.error);
