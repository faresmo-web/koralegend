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
    try {
        const buildId = await getBuildId();
        const teamId = '7u6a9femhquay3jnk6ysgiwx9';
        const teamName = 'العراق';

        const url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/standings/${teamId}.json`;
        console.log('Fetching:', url);
        const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const data = r.data?.pageProps?.data || {};
        
        console.log('summaryStandings:', data.summaryStandings);
        
        if (data.tabsInfoStandings) {
            console.log('tabsInfoStandings length:', data.tabsInfoStandings.length);
            console.log('First element keys:', Object.keys(data.tabsInfoStandings[0] || {}));
            console.log('First element details:', JSON.stringify(data.tabsInfoStandings[0], null, 2));
        } else {
            console.log('tabsInfoStandings is missing or empty');
        }
    } catch (e) {
        console.error(e);
    }
})();
