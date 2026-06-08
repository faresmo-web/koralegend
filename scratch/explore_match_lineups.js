const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    const home = await get('https://www.kooora.com/');
    const buildId = home.match(/"buildId":"([^"]+)"/)[1];
    const BASE = `https://www.kooora.com/_next/data/${buildId}`;
    const slug = encodeURIComponent('فرايبورج-ضد-أستون-فيلا');
    const id = '2Op6fM0M_itShCoOB9azR';

    const data = await get(`${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}.json`);
    const match = data?.pageProps?.data?.match;

    // Full lineups from match object
    console.log('=== MATCH.LINEUPS ===');
    console.log(JSON.stringify(match.lineups, null, 2).substring(0, 5000));

    // Check keyEvents
    console.log('\n=== MATCH.KEYEVENTS ===');
    console.log(JSON.stringify(match.keyEvents, null, 2).substring(0, 1000));

    // Check stats
    console.log('\n=== MATCH.STATS ===');
    console.log(JSON.stringify(match.stats, null, 2).substring(0, 1000));
})();
