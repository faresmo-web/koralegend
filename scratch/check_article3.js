const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

const ARTICLE_URL = 'https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D9%82%D8%AF%D9%85/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1/%D8%B9%D9%85%D8%A7%D8%AF-%D9%85%D8%AA%D8%B9%D8%A8-%D9%8A%D9%81%D8%AA%D8%AD-%D8%A7%D9%84%D9%86%D8%A7%D8%B1-%D8%B9%D9%84%D9%89-%D9%84%D8%A7%D8%B9%D8%A8%D9%8A-%D8%A7%D9%84%D8%A7%D9%94%D9%87%D9%84%D9%8A-%D8%A8%D8%B9%D8%AF-%D8%A7%D8%AD%D8%AA%D9%84%D8%A7%D9%84-%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D8%AB%D8%A7%D9%84%D8%AB/blt4eb9963885b3452d';

async function main() {
    const r = await axios.get(ARTICLE_URL, { headers: HEADERS, timeout: 20000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const nd = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    const parsed = JSON.parse(nd[1]);
    const d = parsed?.props?.pageProps?.data?.article || {};

    console.log('article keys:', Object.keys(d));
    console.log('headline:', d.headline);
    console.log('teaser:', d.teaser);
    console.log('image:', d.image?.src || d.image?.url);
    console.log('publishDate:', d.publishDateString, d.publishTimeString);
    console.log('author:', d.author?.name);
    console.log('tags:', (d.tags || []).map(t => t.name));

    if (d.body !== undefined) {
        console.log('\nbody type:', typeof d.body);
        if (typeof d.body === 'string') {
            console.log('body (first 800):\n', d.body.slice(0, 800));
        } else if (Array.isArray(d.body)) {
            console.log('body array length:', d.body.length);
            d.body.slice(0, 4).forEach((b, i) => {
                console.log(`\nbody[${i}] type:`, b.__typename || b.type || typeof b);
                console.log(JSON.stringify(b).slice(0, 400));
            });
        }
    }

    // check all string keys for content
    Object.keys(d).forEach(k => {
        const v = d[k];
        if (typeof v === 'string' && v.length > 100) {
            console.log(`\n[${k}] (first 300):`, v.slice(0, 300));
        }
    });
}

main().catch(console.error);
