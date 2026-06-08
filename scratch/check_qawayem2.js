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
    const d = JSON.parse(m[1]);
    const sl = d?.props?.pageProps?.data?.slideList || {};
    
    console.log('slideList keys:', Object.keys(sl));
    console.log('headline:', sl.headline);
    console.log('teaser:', sl.teaser);
    console.log('publishTime:', sl.publishTime);
    console.log('authors:', JSON.stringify(sl.authors || sl.author).slice(0, 200));
    console.log('tags:', (sl.tags || []).map(t => t.name || t).slice(0, 5));
    console.log('media:', JSON.stringify(sl.media || sl.image).slice(0, 200));
    
    if (sl.body !== undefined) {
        console.log('\nbody type:', typeof sl.body);
        if (typeof sl.body === 'string') console.log('body (400):', sl.body.slice(0, 400));
        if (Array.isArray(sl.body)) {
            console.log('body length:', sl.body.length);
            sl.body.slice(0, 2).forEach((b, i) => console.log(`body[${i}]:`, JSON.stringify(b).slice(0, 300)));
        }
    }
    
    // slides
    if (sl.slides) {
        console.log('\nslides count:', sl.slides.length);
        console.log('slide[0] keys:', Object.keys(sl.slides[0] || {}));
        console.log('slide[0]:', JSON.stringify(sl.slides[0]).slice(0, 400));
    }
    
    // all string keys > 50 chars
    for (const k of Object.keys(sl)) {
        if (typeof sl[k] === 'string' && sl[k].length > 50) {
            console.log(`\n[${k}]:`, sl[k].slice(0, 300));
        }
    }
}
main().catch(console.error);
