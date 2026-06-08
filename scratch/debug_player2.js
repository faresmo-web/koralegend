const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    const playerId = 'dui82nffmbn6fox635c1hn9hx';
    const playerName = 'أحمد الشناوي';
    const url = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%84%D8%A7%D8%B9%D8%A8/${encodeURIComponent(playerName)}/${playerId}`;
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data = extractNextData(Buffer.from(r.data).toString('utf8'))?.props?.pageProps?.data;
    
    // Player bio
    const p = data?.player || {};
    console.log('=== PLAYER BIO ===');
    console.log('name:', p.name);
    console.log('dateOfBirth:', p.dateOfBirth);
    console.log('nationality:', p.nationality?.name);
    console.log('position:', p.position);
    console.log('height:', p.height);
    console.log('weight:', p.weight);
    console.log('shirtNumber:', p.shirtNumber);
    console.log('currentTeam:', p.currentTeam?.name);
    console.log('image:', p.image?.url?.substring(0, 60));
    console.log('marketValue:', p.marketValue);
    console.log('foot:', p.foot);
    console.log('All player keys:', Object.keys(p));
    
    // Career stats
    const career = data?.tabsInfoPlayerCareer || {};
    console.log('\n=== CAREER KEYS ===', Object.keys(career));
    console.log('Career sample:', JSON.stringify(career).substring(0, 1500));
})().catch(console.error);
