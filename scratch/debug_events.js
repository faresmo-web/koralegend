const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    return m ? JSON.parse(m[1]) : null;
}

(async () => {
    const slug = 'بيراميدز-ضد-سموحة';
    const id   = 'XClkLrdR5RhtZIywZBkj6';
    const url  = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent(slug)}/${id}`;
    
    const r    = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const nd   = extractNextData(html);
    const data = nd?.props?.pageProps?.data;
    const tabs = data?.tabsInfo || {};
    const m2   = data?.match || {};

    // Check tabsInfo.events
    console.log('tabsInfo.events type:', typeof tabs.events, Array.isArray(tabs.events) ? `array[${tabs.events.length}]` : '');
    if (Array.isArray(tabs.events) && tabs.events.length > 0) {
        console.log('\nFirst tabsInfo event:');
        console.log(JSON.stringify(tabs.events[0], null, 2));
        console.log('\nAll event __typenames:');
        tabs.events.forEach(e => console.log(' -', e.__typename, '|', e.type || '', '|', e.side || ''));
    }

    // Check m.keyEvents
    console.log('\nm.keyEvents type:', typeof m2.keyEvents, Array.isArray(m2.keyEvents) ? `array[${m2.keyEvents.length}]` : '');
    if (Array.isArray(m2.keyEvents) && m2.keyEvents.length > 0) {
        console.log('First keyEvent:', JSON.stringify(m2.keyEvents[0], null, 2));
    }

    // Check commentary for subs
    const commentary = Array.isArray(m2.commentary) ? m2.commentary : [];
    const subs = commentary.filter(c => c.event?.__typename === 'MatchSubstitutionEvent');
    console.log('\nSubs in commentary:', subs.length);
    if (subs.length > 0) console.log('First sub:', JSON.stringify(subs[0], null, 2));
})().catch(console.error);
