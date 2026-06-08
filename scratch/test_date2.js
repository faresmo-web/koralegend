const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

// Try different URL formats for dates
async function testUrl(label, url) {
    try {
        const r = await axios.get(url, { headers: H, timeout: 15000, responseType: 'arraybuffer' });
        const html = Buffer.from(r.data).toString('utf8');
        const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
        if (!m) { console.log(label, '→ NO NEXT_DATA'); return; }
        const d = JSON.parse(m[1]);
        const comps = d?.props?.pageProps?.data || [];
        const totalMatches = comps.reduce((s, c) => s + (c.matches?.length || 0), 0);
        const first = comps[0]?.matches?.[0];
        console.log(`${label}: ${comps.length} leagues, ${totalMatches} matches | ${first?.teamA?.name} vs ${first?.teamB?.name} | status: ${first?.status}`);
    } catch(e) {
        console.log(label, '→ ERROR:', e.message);
    }
}

async function main() {
    const BASE = 'https://www.kooora.com';
    // Try different URL patterns
    await testUrl('today (no date)',   `${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85`);
    await testUrl('2026-05-19',        `${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=2026-05-19`);
    await testUrl('2026-05-21',        `${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=2026-05-21`);
    
    // Try _next/data JSON endpoint
    const r0 = await axios.get(BASE, { headers: H, timeout: 15000 });
    const bm = r0.data.match(/"buildId":"([^"]+)"/);
    const buildId = bm?.[1];
    console.log('\nbuildId:', buildId);
    
    if (buildId) {
        await testUrl('_next today',    `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`);
        await testUrl('_next 2026-05-19', `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json?date=2026-05-19`);
        await testUrl('_next 2026-05-21', `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json?date=2026-05-21`);
    }
}
main().catch(console.error);
