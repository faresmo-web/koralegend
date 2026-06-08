const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

async function tryUrl(url, label) {
    try {
        const data = await get(url);
        console.log(`\n✅ ${label}`);
        console.log(JSON.stringify(data).substring(0, 600));
        return data;
    } catch(e) {
        console.log(`❌ ${label}: ${e.message}`);
        return null;
    }
}

(async () => {
    // Get fresh build ID
    const home = await get('https://www.kooora.com/');
    const buildId = home.match(/"buildId":"([^"]+)"/)?.[1];
    console.log('Build ID:', buildId);
    const BASE = `https://www.kooora.com/_next/data/${buildId}`;

    // 1. Match detail with slug + id
    const slug = encodeURIComponent('فرايبورج-ضد-أستون-فيلا');
    const id = '2Op6fM0M_itShCoOB9azR';
    await tryUrl(`${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}.json`, 'match detail slug+id');
    await tryUrl(`${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${id}.json`, 'match detail id only');

    // 2. Yesterday matches - check __NEXT_DATA__ from actual page
    console.log('\n\n=== YESTERDAY PAGE ===');
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];
    const yPage = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${yDate}`);
    const nextDataMatch = yPage.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nextDataMatch) {
        const nd = JSON.parse(nextDataMatch[1]);
        console.log('Query:', JSON.stringify(nd.query));
        console.log('Page props keys:', Object.keys(nd?.props?.pageProps || {}));
        const comps = nd?.props?.pageProps?.data;
        if (comps) console.log('Competitions count:', comps.length);
    }

    // 3. Match detail page - get __NEXT_DATA__
    console.log('\n\n=== MATCH DETAIL PAGE ===');
    const matchPage = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/%D9%81%D8%B1%D8%A7%D9%8A%D8%A8%D9%88%D8%B1%D8%AC-%D8%B6%D8%AF-%D8%A3%D8%B3%D8%AA%D9%88%D9%86-%D9%81%D9%8A%D9%84%D8%A7/2Op6fM0M_itShCoOB9azR`);
    const matchNextData = matchPage.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (matchNextData) {
        const nd = JSON.parse(matchNextData[1]);
        console.log('Match page props keys:', Object.keys(nd?.props?.pageProps || {}));
        const data = nd?.props?.pageProps?.data;
        if (data) {
            console.log('Match data keys:', Object.keys(data));
            console.log(JSON.stringify(data).substring(0, 2000));
        }
    } else {
        console.log('No __NEXT_DATA__ found in match page');
    }
})();
