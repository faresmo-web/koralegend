const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};
const BASE_URL = 'https://www.kooora.com';

async function main() {
    // Get a real article href from news list
    const buildId_r = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000 });
    const m = buildId_r.data.match(/"buildId":"([^"]+)"/);
    const buildId = m[1];
    console.log('buildId:', buildId);

    const newsUrl = `${BASE_URL}/_next/data/${buildId}/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1.json`;
    const nr = await axios.get(newsUrl, { headers: HEADERS, timeout: 15000 });
    const cards = nr.data?.pageProps?.cards || [];
    const first = cards[0];
    console.log('first card href:', first?.href);
    console.log('first card headline:', first?.headline);

    // Now fetch the article page
    const articleHref = first?.href;
    if (!articleHref) return;

    const articleUrl = articleHref.startsWith('http') ? articleHref : `${BASE_URL}${articleHref}`;
    console.log('\nFetching article:', articleUrl);

    const ar = await axios.get(articleUrl, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(ar.data).toString('utf8');
    const nd = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!nd) { console.log('No __NEXT_DATA__'); return; }

    const data = JSON.parse(nd[1]);
    const pp = data?.props?.pageProps || {};
    console.log('\npageProps keys:', Object.keys(pp));

    // Check for article data
    if (pp.article) {
        console.log('\narticle keys:', Object.keys(pp.article));
    }
    if (pp.data) {
        console.log('\ndata keys:', Object.keys(pp.data));
        const d = pp.data;
        if (d.headline) console.log('headline:', d.headline);
        if (d.title) console.log('title:', d.title);
        if (d.body) {
            console.log('body type:', typeof d.body);
            if (typeof d.body === 'string') console.log('body (first 500):', d.body.slice(0, 500));
            if (Array.isArray(d.body)) {
                console.log('body length:', d.body.length);
                console.log('body[0]:', JSON.stringify(d.body[0]).slice(0, 400));
                console.log('body[1]:', JSON.stringify(d.body[1]).slice(0, 400));
            }
        }
        if (d.content) {
            console.log('content type:', typeof d.content);
            if (typeof d.content === 'string') console.log('content (first 500):', d.content.slice(0, 500));
        }
        console.log('image:', d.image?.src || d.image?.url);
        console.log('publishDate:', d.publishDateString, d.publishTimeString);
        console.log('tags:', (d.tags || []).map(t => t.name));
        console.log('author:', d.author?.name);
    }
    if (pp.cards) console.log('\nrelated cards:', pp.cards.length);
}

main().catch(console.error);
