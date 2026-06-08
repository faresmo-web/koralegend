const axios = require('axios');

async function main() {
    const BASE_URL = 'https://www.kooora.com';
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,*/*',
        'Referer': 'https://www.kooora.com/',
    };

    try {
        const r = await axios.get(BASE_URL, { headers: HEADERS });
        const m = r.data.match(/"buildId":"([^"]+)"/);
        if (!m) throw new Error('buildId not found');
        const buildId = m[1];
        console.log('Build ID:', buildId);

        const url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;
        const res = await axios.get(url, { headers: HEADERS });
        const data = res.data?.pageProps?.data;
        if (!data) {
            console.log('No data found');
            return;
        }

        const comps = Object.values(data).filter(v => v && v.competition && Array.isArray(v.matches));
        console.log('Found', comps.length, 'competitions');
        if (comps.length > 0) {
            const firstMatch = comps[0].matches?.[0];
            if (firstMatch) {
                console.log('Match fields:', Object.keys(firstMatch));
                console.log('teamA object:', JSON.stringify(firstMatch.teamA, null, 2));
                console.log('teamB object:', JSON.stringify(firstMatch.teamB, null, 2));
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
