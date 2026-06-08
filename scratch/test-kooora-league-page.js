const axios = require('axios');

async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/json,*/*'
    };
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html0 = Buffer.from(r0.data).toString('utf8');
    const bm = html0.match(/"buildId":"([^"]+)"/);
    const buildId = bm[1];
    
    // Using the ID from earlier test: ea0h6cf3bhl698hkxhpulh2zz
    // Let's try to find how a competition page is structured
    // A known competition page slug for Saudi League:
    // https://www.kooora.com/كرة-القدم/بطولات/السعودية/دوري-روشن-السعودي
    // Actually, kooora often uses routing Category Slug.
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D8%A8%D8%B7%D9%88%D9%84%D8%A9/%D8%AF%D9%88%D8%B1%D9%8A-%D8%B1%D9%88%D8%B4%D9%86-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A/ea0h6cf3bhl698hkxhpulh2zz.json`;
    try {
        const r = await axios.get(url, { headers: HEADERS });
        console.log('Success!', Object.keys(r.data?.pageProps?.data || {}));
    } catch(e) {
        console.log('Failed 1:', e.response?.status);
    }
}
main();
