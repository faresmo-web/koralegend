const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    // Get player ID from lineup first
    const r1 = await axios.get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent('بيراميدز-ضد-سموحة')}/XClkLrdR5RhtZIywZBkj6`, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data1 = extractNextData(Buffer.from(r1.data).toString('utf8'))?.props?.pageProps?.data;
    const firstPlayer = data1?.match?.lineups?.teamA?.lineup?.[0];
    console.log('First player:', JSON.stringify(firstPlayer?.person, null, 2));
    
    const playerId = firstPlayer?.person?.id;
    const playerName = firstPlayer?.person?.name;
    console.log('\nPlayer ID:', playerId, '| Name:', playerName);
    
    if (!playerId) { console.log('No player ID found'); return; }
    
    // Try kooora player page
    const playerUrl = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%84%D8%A7%D8%B9%D8%A8/${encodeURIComponent(playerName)}/${playerId}`;
    console.log('\nFetching:', playerUrl);
    
    try {
        const r2 = await axios.get(playerUrl, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
        const data2 = extractNextData(Buffer.from(r2.data).toString('utf8'))?.props?.pageProps?.data;
        console.log('\nPlayer page keys:', Object.keys(data2 || {}));
        console.log('\nPlayer data sample:', JSON.stringify(data2).substring(0, 2000));
    } catch(e) {
        console.log('Player page error:', e.message);
        // Try alternative URL
        const altUrl = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%84%D8%A7%D8%B9%D8%A8/${playerId}`;
        console.log('Trying alt URL:', altUrl);
        try {
            const r3 = await axios.get(altUrl, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
            const data3 = extractNextData(Buffer.from(r3.data).toString('utf8'))?.props?.pageProps?.data;
            console.log('Alt page keys:', Object.keys(data3 || {}));
            console.log('Alt data sample:', JSON.stringify(data3).substring(0, 2000));
        } catch(e2) { console.log('Alt error:', e2.message); }
    }
})().catch(console.error);
