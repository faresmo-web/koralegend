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

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    // Freiburg vs Aston Villa - has expected lineup on kooora
    const matchUrl = 'https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/%D9%81%D8%B1%D8%A7%D9%8A%D8%A8%D9%88%D8%B1%D8%AC-%D8%B6%D8%AF-%D8%A3%D8%B3%D8%AA%D9%88%D9%86-%D9%81%D9%8A%D9%84%D8%A7/2Op6fM0M_itShCoOB9azR';
    
    console.log('=== MAIN MATCH PAGE ===');
    const html = await get(matchUrl);
    const nd = extractNextData(html);
    const data = nd?.props?.pageProps?.data;
    
    console.log('tabsInfo keys:', Object.keys(data?.tabsInfo || {}));
    
    // Check lineups in tabsInfo
    const lineups = data?.tabsInfo?.lineups;
    console.log('\n=== LINEUPS ===');
    console.log(JSON.stringify(lineups, null, 2).substring(0, 3000));
    
    // Check predictions / expected lineup
    console.log('\n=== PREDICTIONS ===');
    console.log(JSON.stringify(data?.predictions, null, 2).substring(0, 2000));
    
    // Try the lineup tab page
    console.log('\n\n=== LINEUP TAB PAGE ===');
    const lineupsUrl = matchUrl + '/%D8%AA%D8%B4%D9%83%D9%8A%D9%84%D8%A9';
    try {
        const lhtml = await get(lineupsUrl);
        const lnd = extractNextData(lhtml);
        const ldata = lnd?.props?.pageProps?.data;
        console.log('Lineup tab keys:', Object.keys(ldata || {}));
        console.log('tabsInfo keys:', Object.keys(ldata?.tabsInfo || {}));
        const ltabs = ldata?.tabsInfo;
        console.log('\nLineups full:');
        console.log(JSON.stringify(ltabs?.lineups, null, 2).substring(0, 4000));
        
        // Check for expected/predicted lineups
        if (ltabs) {
            for (const key of Object.keys(ltabs)) {
                if (key !== 'lineups') {
                    console.log(`\nKey "${key}":`, JSON.stringify(ltabs[key]).substring(0, 500));
                }
            }
        }
    } catch(e) {
        console.log('Lineup tab error:', e.message);
    }
    
    // Try injuries tab
    console.log('\n\n=== INJURIES / SUSPENSIONS ===');
    const injuriesUrl = matchUrl + '/%D8%A5%D8%B5%D8%A7%D8%A8%D8%A7%D8%AA';
    try {
        const ihtml = await get(injuriesUrl);
        const ind = extractNextData(ihtml);
        const idata = ind?.props?.pageProps?.data;
        console.log('Injuries tab keys:', Object.keys(idata?.tabsInfo || {}));
        console.log(JSON.stringify(idata?.tabsInfo, null, 2).substring(0, 3000));
    } catch(e) {
        console.log('Injuries tab error:', e.message);
    }
})();
