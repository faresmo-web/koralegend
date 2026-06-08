const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    const r = await axios.get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent('بيراميدز-ضد-سموحة')}/XClkLrdR5RhtZIywZBkj6`, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data = extractNextData(Buffer.from(r.data).toString('utf8'))?.props?.pageProps?.data;
    const tabs = data?.tabsInfo || {};
    const m2   = data?.match || {};

    // Print full first sub from tabsInfo.events
    const firstSub = tabs.events?.find(e => e.__typename === 'MatchSubstitutionEvent');
    console.log('tabsInfo first sub full:', JSON.stringify(firstSub, null, 2));

    // Print keyEvents (all)
    console.log('\nm.keyEvents count:', m2.keyEvents?.length);
    (m2.keyEvents || []).forEach((e, i) => {
        console.log(`\nkeyEvent[${i}]:`, JSON.stringify(e, null, 2));
    });
})().catch(console.error);
