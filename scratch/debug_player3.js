const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    const playerId = 'dui82nffmbn6fox635c1hn9hx';
    const playerName = 'أحمد الشناوي';
    const url = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%84%D8%A7%D8%B9%D8%A8/${encodeURIComponent(playerName)}/${playerId}`;
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data = extractNextData(Buffer.from(r.data).toString('utf8'))?.props?.pageProps?.data;
    const p = data?.player || {};
    
    console.log('stats:', JSON.stringify(p.stats, null, 2));
    console.log('\nteam:', JSON.stringify(p.team, null, 2));
    console.log('\nage:', p.age);
    console.log('position:', p.position);
    console.log('nationality:', JSON.stringify(p.nationality, null, 2));
    console.log('image:', p.image?.url);
})().catch(console.error);
