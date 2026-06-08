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
    console.log('buildId:', buildId);

    const teamId = '7u6a9femhquay3jnk6ysgiwx9';
    const teamName = 'العراق';
    const tab = 'squad';

    // Try current URL structure (tab in path before teamId)
    const url1 = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${tab}/${teamId}.json`;
    console.log('\nURL1 (tab before id):', url1);
    try {
        const r1 = await axios.get(url1, { headers: HEADERS, timeout: 15000 });
        console.log('URL1 status:', r1.status, 'data keys:', Object.keys(r1.data?.pageProps?.data || {}));
    } catch(e) {
        console.log('URL1 error:', e.response?.status, e.message.slice(0, 100));
    }

    // Try base team URL (no tab)
    const url2 = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}.json`;
    console.log('\nURL2 (no tab):', url2);
    try {
        const r2 = await axios.get(url2, { headers: HEADERS, timeout: 15000 });
        console.log('URL2 status:', r2.status, 'data keys:', Object.keys(r2.data?.pageProps?.data || {}));
    } catch(e) {
        console.log('URL2 error:', e.response?.status, e.message.slice(0, 100));
    }

    // Try with tab AFTER teamId
    const url3 = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}/${tab}.json`;
    console.log('\nURL3 (tab after id):', url3);
    try {
        const r3 = await axios.get(url3, { headers: HEADERS, timeout: 15000 });
        console.log('URL3 status:', r3.status, 'data keys:', Object.keys(r3.data?.pageProps?.data || {}));
    } catch(e) {
        console.log('URL3 error:', e.response?.status, e.message.slice(0, 100));
    }

    // Try matches tab
    const url4 = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/matches/${teamId}.json`;
    console.log('\nURL4 (matches tab before id):', url4);
    try {
        const r4 = await axios.get(url4, { headers: HEADERS, timeout: 15000 });
        console.log('URL4 status:', r4.status, 'data keys:', Object.keys(r4.data?.pageProps?.data || {}));
    } catch(e) {
        console.log('URL4 error:', e.response?.status, e.message.slice(0, 100));
    }
})();
