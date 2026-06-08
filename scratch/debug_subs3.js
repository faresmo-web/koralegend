const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    const r = await axios.get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent('بيراميدز-ضد-سموحة')}/XClkLrdR5RhtZIywZBkj6`, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data = extractNextData(Buffer.from(r.data).toString('utf8'))?.props?.pageProps?.data;
    const m2   = data?.match || {};
    const teamA = m2.lineups?.teamA || {};
    const teamB = m2.lineups?.teamB || {};

    // Print ALL substitutes with their events
    console.log('=== TEAM A SUBSTITUTES ===');
    (teamA.substitutes || []).forEach(p => {
        console.log(`${p.person?.name} #${p.shirtNumber} events:`, JSON.stringify(p.events));
    });

    console.log('\n=== TEAM B SUBSTITUTES ===');
    (teamB.substitutes || []).forEach(p => {
        console.log(`${p.person?.name} #${p.shirtNumber} events:`, JSON.stringify(p.events));
    });

    // Also check lineup players for sub events
    console.log('\n=== TEAM A LINEUP (sub events) ===');
    (teamA.lineup || []).forEach(p => {
        if (p.events?.length > 0) console.log(`${p.person?.name} #${p.shirtNumber} events:`, JSON.stringify(p.events));
    });

    console.log('\n=== TEAM B LINEUP (sub events) ===');
    (teamB.lineup || []).forEach(p => {
        if (p.events?.length > 0) console.log(`${p.person?.name} #${p.shirtNumber} events:`, JSON.stringify(p.events));
    });
})().catch(console.error);
