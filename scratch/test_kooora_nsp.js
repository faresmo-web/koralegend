const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

async function main() {
    const BASE = 'https://www.kooora.com';
    const r0 = await axios.get(BASE, { headers: H, timeout: 10000 });
    const bm = r0.data.match(/"buildId":"([^"]+)"/);
    const buildId = bm?.[1];
    console.log('buildId:', buildId);

    // The __N_SSP endpoint with date param
    const url = `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json?date=2026-05-22&sports-category=football`;
    const r = await axios.get(url, { headers: H, timeout: 15000 });
    const pp = r.data?.pageProps || {};
    console.log('pageProps keys:', Object.keys(pp));
    const data = pp.data || [];
    console.log('data type:', typeof data, Array.isArray(data) ? `array[${data.length}]` : '');
    if (Array.isArray(data) && data.length > 0) {
        console.log('first comp:', data[0]?.competition?.name, 'matches:', data[0]?.matches?.length);
        const first = data[0]?.matches?.[0];
        console.log('first match:', first?.teamA?.name, 'vs', first?.teamB?.name, '|', first?.status, '|', first?.startDate);
    }
    
    // Try different dates
    for (const date of ['2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23']) {
        const u2 = `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json?date=${date}&sports-category=football`;
        try {
            const r2 = await axios.get(u2, { headers: H, timeout: 10000 });
            const d2 = r2.data?.pageProps?.data || [];
            const total = Array.isArray(d2) ? d2.reduce((s, c) => s + (c.matches?.length || 0), 0) : 0;
            const first2 = Array.isArray(d2) ? d2[0]?.matches?.[0] : null;
            console.log(`${date}: ${d2.length} leagues, ${total} matches | ${first2?.teamA?.name} vs ${first2?.teamB?.name} | ${first2?.startDate?.slice(0,10)}`);
        } catch(e) {
            console.log(`${date}: ERROR ${e.response?.status || e.message}`);
        }
    }
}
main().catch(console.error);
