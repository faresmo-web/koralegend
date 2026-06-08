const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    console.log('Fetching home page for buildId...');
    const home = await get('https://www.kooora.com/');
    const buildId = home.match(/"buildId":"([^"]+)"/)[1];
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;

    console.log('Fetching today matches data...');
    const data = await get(url);
    const pagePropsData = data?.pageProps?.data || {};
    const competitions = Object.values(pagePropsData).filter(v => v && v.competition && Array.isArray(v.matches));

    console.log('Scanning today matches for shootout/penalties...');
    for (const comp of competitions) {
        for (const m of comp.matches) {
            const combined = JSON.stringify(m);
            if (combined.toLowerCase().includes('pen') || combined.includes('ترجيح') || combined.includes('جزاء')) {
                console.log(`\n🎉 Found Match with Penalty: ${m.teamA?.name} vs ${m.teamB?.name}`);
                console.log(`Status: ${m.status}`);
                console.log('Score object:', JSON.stringify(m.score, null, 2));
                console.log('Match link:', JSON.stringify(m.link, null, 2));
            }
        }
    }
    console.log('Scan finished.');
})().catch(console.error);
