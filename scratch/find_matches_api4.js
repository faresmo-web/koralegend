const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

async function tryUrl(label, url) {
    try {
        const r = await axios.get(url, { headers: H, timeout: 10000 });
        const comps = r.data?.pageProps?.data || [];
        const total = comps.reduce ? comps.reduce((s, c) => s + (c.matches?.length || 0), 0) : 0;
        const first = comps[0]?.matches?.[0];
        console.log(`✓ ${label}: ${comps.length} leagues, ${total} matches | ${first?.teamA?.name} vs ${first?.teamB?.name}`);
        return true;
    } catch(e) {
        console.log(`✗ ${label}: ${e.response?.status || e.message}`);
        return false;
    }
}

async function main() {
    // Get buildId
    const r0 = await axios.get('https://www.kooora.com', { headers: H, timeout: 15000 });
    const bm = r0.data.match(/"buildId":"([^"]+)"/);
    const buildId = bm?.[1];
    console.log('buildId:', buildId, '\n');

    const BASE = 'https://www.kooora.com';
    const PATH = `/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;

    // Try different query param formats
    await tryUrl('no date',           `${BASE}${PATH}`);
    await tryUrl('date=2026-05-19',   `${BASE}${PATH}?date=2026-05-19`);
    await tryUrl('date=2026-05-21',   `${BASE}${PATH}?date=2026-05-21`);
    await tryUrl('date=2026-05-22',   `${BASE}${PATH}?date=2026-05-22`);
    
    // Try with sports-category in path
    const PATH2 = `/_next/data/${buildId}/football/live-scores.json`;
    await tryUrl('football/live-scores no date', `${BASE}${PATH2}`);
    await tryUrl('football/live-scores 2026-05-19', `${BASE}${PATH2}?date=2026-05-19`);
    await tryUrl('football/live-scores 2026-05-21', `${BASE}${PATH2}?date=2026-05-21`);
    
    // Try with sports-category param
    const PATH3 = `/_next/data/${buildId}/%5Bsports-category%5D/live-scores.json`;
    await tryUrl('[sports-category]/live-scores no date', `${BASE}${PATH3}?sports-category=football`);
    await tryUrl('[sports-category]/live-scores 2026-05-19', `${BASE}${PATH3}?sports-category=football&date=2026-05-19`);
    await tryUrl('[sports-category]/live-scores 2026-05-21', `${BASE}${PATH3}?sports-category=football&date=2026-05-21`);
}
main().catch(console.error);
