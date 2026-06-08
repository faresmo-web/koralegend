const axios = require('axios');
const BASE_URL = 'https://www.kooora.com';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    return m ? JSON.parse(m[1]) : null;
}

(async () => {
    // Info from the sample news card
    const slug = 'فيديو-منافس-السعودية--إسبانيا-تتلقى-هدفًا-صاروخيًا-أمام-العراق';
    const id = 'blt799cc3eefaa78d64';
    const categorySlug = 'كرة-قدم'; // from routingCategorySlug

    // Try URL pattern 1: /categorySlug/أخبار/slug/id
    // e.g. /كرة-قدم/أخبار/slug/id
    const url1 = `${BASE_URL}/${encodeURIComponent(categorySlug)}/%D8%A3%D8%AE%D9%85%D8%A7%D8%B1/${encodeURIComponent(slug)}/${id}`;
    // Wait, kooora has /أخبار/ in Arabic: %D8%A3%D8%AE%D8%A8%D9%82%D8%A7%D8%B1
    const path = `/%D9%83%D8%B1%D8%A9-%D9%8A%D9%82%D8%AF%D9%85/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1/${encodeURIComponent(slug)}/${id}`;
    const url1_fixed = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D9%82%D8%AF%D9%85/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1/${encodeURIComponent(slug)}/${id}`;

    console.log('Testing url:', url1_fixed);

    try {
        const r = await axios.get(url1_fixed, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
        const html = Buffer.from(r.data).toString('utf8');
        const nd = extractNextData(html);
        if (nd) {
            console.log('Success! Headline:', nd.props?.pageProps?.data?.article?.headline);
        } else {
            console.log('Failed to extract NEXT_DATA');
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
})();
