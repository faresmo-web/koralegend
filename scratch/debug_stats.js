const axios = require('axios');

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
    const slug = 'بيراميدز-ضد-سموحة';
    const id   = 'XClkLrdR5RhtZIywZBkj6';
    const url  = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent(slug)}/${id}`;
    
    const r    = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const nd   = extractNextData(html);
    const data = nd?.props?.pageProps?.data;
    
    console.log('Top-level keys:', Object.keys(data || {}));
    console.log('tabsInfo keys:', Object.keys(data?.tabsInfo || {}));
    console.log('match keys:', Object.keys(data?.match || {}));
    
    // Check stats specifically
    const tabs = data?.tabsInfo || {};
    const m2   = data?.match || {};
    console.log('\ntabs.stats type:', typeof tabs.stats, Array.isArray(tabs.stats) ? `array[${tabs.stats?.length}]` : '');
    console.log('match.stats type:', typeof m2.stats, Array.isArray(m2.stats) ? `array[${m2.stats?.length}]` : '');
    
    // Print raw stats if exists
    if (tabs.stats) console.log('\ntabs.stats sample:', JSON.stringify(tabs.stats).substring(0, 500));
    if (m2.stats)   console.log('\nmatch.stats sample:', JSON.stringify(m2.stats).substring(0, 500));
    
    // Check all keys for anything stats-related
    const allKeys = JSON.stringify(Object.keys(data || {}));
    console.log('\nAll data keys:', allKeys);
    
    // Look for stats anywhere in the data
    const dataStr = JSON.stringify(data || {});
    const statsIdx = dataStr.indexOf('"stats"');
    if (statsIdx > -1) {
        console.log('\nFound "stats" at index', statsIdx);
        console.log('Context:', dataStr.substring(statsIdx, statsIdx + 300));
    }
})().catch(console.error);
