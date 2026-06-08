const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    const r = await axios.get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent('بيراميدز-ضد-سموحة')}/XClkLrdR5RhtZIywZBkj6`, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data = extractNextData(Buffer.from(r.data).toString('utf8'))?.props?.pageProps?.data;
    const m2   = data?.match || {};
    const tabs = data?.tabsInfo || {};

    const teamA = m2.lineups?.teamA || {};
    const teamB = m2.lineups?.teamB || {};

    // Print substitutes arrays
    console.log('teamA.substitutes count:', teamA.substitutes?.length);
    console.log('First teamA substitute:', JSON.stringify(teamA.substitutes?.[0], null, 2));

    // Print tabsInfo.events with index
    console.log('\ntabsInfo.events count:', tabs.events?.length);
    tabs.events?.forEach((e, i) => {
        console.log(`event[${i}]:`, JSON.stringify(e));
    });

    // Check tabsInfo.commentary full first item
    console.log('\ntabsInfo.commentary[0]:', JSON.stringify(tabs.commentary?.[0], null, 2)?.substring(0, 600));
})().catch(console.error);
