const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

const URL = 'https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D9%82%D8%AF%D9%85/%D8%A7%D9%84%D9%82%D9%88%D8%A7%D8%A6%D9%85/%D8%A8%D8%A7%D8%A7%D9%84%D9%81%D9%8A%D8%AF%D9%8A%D9%88--%D8%A7%D9%84%D8%A7%D9%94%D9%87%D9%84%D9%8A-%D9%8A%D9%86%D9%87%D9%8A-%D9%85%D9%88%D8%B3%D9%85%D9%87-%D8%A8%D8%AD%D9%81%D9%84%D8%A9-%D8%A7%D9%94%D9%87%D8%AF%D8%A7%D9%81-%D9%81%D9%8A-%D9%85%D8%B1%D9%85%D9%89-%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D8%AC/bltcdbadba2bcddd286';

async function main() {
    const r = await axios.get(URL, { headers: H, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!m) { console.log('NO NEXT_DATA'); return; }
    const d = JSON.parse(m[1]);
    const pp = d?.props?.pageProps || {};
    console.log('pageProps keys:', Object.keys(pp));
    const data = pp.data || {};
    console.log('data keys:', Object.keys(data));
    if (data.article) {
        console.log('article keys:', Object.keys(data.article));
        console.log('headline:', data.article.headline);
        console.log('body type:', typeof data.article.body);
        if (typeof data.article.body === 'string') console.log('body (200):', data.article.body.slice(0, 200));
    }
    // check all top-level data keys for content
    for (const k of Object.keys(data)) {
        if (data[k] && typeof data[k] === 'object' && data[k].headline) {
            console.log(`\nFound headline in data.${k}:`, data[k].headline);
        }
    }
}
main().catch(console.error);
