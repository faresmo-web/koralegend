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

async function fetchMatchDetails(slug, koooraId) {
    const encodedSlug = encodeURIComponent(slug);
    const url = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodedSlug}/${koooraId}`;
    console.log('Fetching:', url);
    
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const nd = extractNextData(r.data);
    const data = nd?.props?.pageProps?.data;
    
    if (!data) { console.log('No data!'); return; }
    
    const m = data.match || {};
    console.log('Match status:', m.status);
    console.log('Match lineups confirmed:', m.lineups?.confirmed);
    console.log('TeamA lineup count:', m.lineups?.teamA?.lineup?.length);
    console.log('TeamB lineup count:', m.lineups?.teamB?.lineup?.length);
    
    if (m.lineups?.teamA?.lineup?.length > 0) {
        const first = m.lineups.teamA.lineup[0];
        console.log('First player:', JSON.stringify(first));
    }
}

// Test with Freiburg vs Aston Villa
fetchMatchDetails('فرايبورج-ضد-أستون-فيلا', '2Op6fM0M_itShCoOB9azR').catch(console.error);
