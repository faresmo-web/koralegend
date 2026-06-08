const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    return m ? JSON.parse(m[1]) : null;
}

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    // Get fresh build ID
    const home = await get('https://www.kooora.com/');
    const buildId = home.match(/"buildId":"([^"]+)"/)[1];
    console.log('Build ID:', buildId);
    const BASE = `https://www.kooora.com/_next/data/${buildId}`;

    const slug = encodeURIComponent('فرايبورج-ضد-أستون-فيلا');
    const id = '2Op6fM0M_itShCoOB9azR';

    // Try different tab paths in _next/data
    const paths = [
        `%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}/%D8%AA%D8%B4%D9%83%D9%8A%D9%84%D8%A9.json`,
        `%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}/%D8%A5%D8%B5%D8%A7%D8%A8%D8%A7%D8%AA.json`,
        `%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}/lineups.json`,
        `%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}/injuries.json`,
    ];

    for (const p of paths) {
        try {
            const data = await get(`${BASE}/${p}`);
            console.log(`\n✅ ${p.split('/').pop()}`);
            const tabs = data?.pageProps?.data?.tabsInfo;
            console.log('tabsInfo keys:', Object.keys(tabs || {}));
            console.log(JSON.stringify(tabs, null, 2).substring(0, 2000));
        } catch(e) {
            console.log(`❌ ${p.split('/').pop()}: ${e.response?.status || e.message}`);
        }
    }

    // Also check the main page tabsInfo more carefully - maybe it has expected lineup
    console.log('\n\n=== MAIN PAGE - FULL tabsInfo ===');
    const mainData = await get(`${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}.json`);
    const tabs = mainData?.pageProps?.data?.tabsInfo;
    console.log('All tabsInfo keys:', Object.keys(tabs || {}));
    
    // Print full lineups
    console.log('\nFull lineups object:');
    console.log(JSON.stringify(tabs?.lineups, null, 2));
    
    // Check match object for injuries/suspensions
    const match = mainData?.pageProps?.data?.match;
    console.log('\nMatch keys:', Object.keys(match || {}));
    
    // Look for injuries in match
    if (match) {
        for (const key of Object.keys(match)) {
            const val = match[key];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                const str = JSON.stringify(val);
                if (str.includes('injur') || str.includes('suspend') || str.includes('absent') || str.includes('إصاب')) {
                    console.log(`\nKey "${key}" may have injuries:`, str.substring(0, 500));
                }
            }
        }
    }
    
    // Check standingsTabsInfo
    const standings = mainData?.pageProps?.data?.standingsTabsInfo;
    console.log('\nstandingsTabsInfo keys:', Object.keys(standings || {}));
    
    // Check h2h
    const h2h = mainData?.pageProps?.data?.h2h;
    console.log('\nh2h:', JSON.stringify(h2h).substring(0, 500));
})();
