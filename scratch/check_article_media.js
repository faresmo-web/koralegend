const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar,en-US;q=0.7', 'Referer': 'https://www.kooora.com/' };
const ARTICLE_URL = 'https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D9%82%D8%AF%D9%85/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1/%D8%B9%D9%85%D8%A7%D8%AF-%D9%85%D8%AA%D8%B9%D8%A8-%D9%8A%D9%81%D8%AA%D8%AD-%D8%A7%D9%84%D9%86%D8%A7%D8%B1-%D8%B9%D9%84%D9%89-%D9%84%D8%A7%D8%B9%D8%A8%D9%8A-%D8%A7%D9%84%D8%A7%D9%94%D9%87%D9%84%D9%8A-%D8%A8%D8%B9%D8%AF-%D8%A7%D8%AD%D8%AA%D9%84%D8%A7%D9%84-%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D8%AB%D8%A7%D9%84%D8%AB/blt4eb9963885b3452d';
async function main() {
    const r = await axios.get(ARTICLE_URL, { headers: HEADERS, timeout: 20000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const nd = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    const parsed = JSON.parse(nd[1]);
    const d = parsed?.props?.pageProps?.data?.article || {};
    console.log('media:', JSON.stringify(d.media).slice(0, 400));
    console.log('mobileMedia:', JSON.stringify(d.mobileMedia).slice(0, 400));
    console.log('authors:', JSON.stringify(d.authors).slice(0, 300));
    console.log('publishTime:', d.publishTime);
    console.log('updateTime:', d.updateTime);
}
main().catch(console.error);
