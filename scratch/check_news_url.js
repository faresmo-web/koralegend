const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

const BASE_URL = 'https://www.kooora.com';

async function main() {
    // Step 1: get buildId
    console.log('Fetching buildId...');
    const r = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000 });
    const m = r.data.match(/"buildId":"([^"]+)"/);
    if (!m) { console.error('buildId NOT FOUND'); return; }
    const buildId = m[1];
    console.log('buildId:', buildId);

    // Step 2: try the news JSON endpoint
    const newsUrl = `${BASE_URL}/_next/data/${buildId}/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1.json`;
    console.log('\nTrying:', newsUrl);
    try {
        const r2 = await axios.get(newsUrl, { headers: HEADERS, timeout: 15000 });
        const keys = Object.keys(r2.data?.pageProps || {});
        console.log('pageProps keys:', keys);
        const cards = r2.data?.pageProps?.cards || [];
        console.log('cards count:', cards.length);
        if (cards[0]) console.log('first card keys:', Object.keys(cards[0]));
    } catch (e) {
        console.error('news URL failed:', e.message);
    }

    // Step 3: try the HTML page and look at __NEXT_DATA__
    const htmlUrl = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D9%82%D8%AF%D9%85/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1`;
    console.log('\nTrying HTML page:', htmlUrl);
    try {
        const r3 = await axios.get(htmlUrl, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
        const html = Buffer.from(r3.data).toString('utf8');
        const nd = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
        if (nd) {
            const data = JSON.parse(nd[1]);
            const ppKeys = Object.keys(data?.props?.pageProps || {});
            console.log('pageProps keys from HTML:', ppKeys);
            // check for articles or cards
            const pp = data?.props?.pageProps || {};
            if (pp.cards) console.log('cards count:', pp.cards.length, '| first:', pp.cards[0]?.headline);
            if (pp.articles) console.log('articles count:', pp.articles.length);
            if (pp.data) console.log('data keys:', Object.keys(pp.data));
        } else {
            console.log('No __NEXT_DATA__ found in HTML');
        }
    } catch (e) {
        console.error('HTML page failed:', e.message);
    }
}

main().catch(console.error);
