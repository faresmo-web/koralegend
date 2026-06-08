const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];

    console.log('Fetching yesterday matches...');
    const pageHtml = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${yDate}`);
    const nd = JSON.parse(pageHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)[1]);
    const pagePropsData = nd?.props?.pageProps?.data || {};
    const competitions = Object.values(pagePropsData).filter(v => v && v.competition && Array.isArray(v.matches));

    for (const comp of competitions) {
        for (const m of comp.matches) {
            if (m.teamA?.name?.includes('باريس') || m.teamB?.name?.includes('باريس')) {
                console.log('Found PSG match in list:', JSON.stringify(m, null, 2));
            }
        }
    }
})().catch(console.error);
