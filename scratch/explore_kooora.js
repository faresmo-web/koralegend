const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
    'Origin': 'https://www.kooora.com',
};

async function tryEndpoint(url, label) {
    try {
        const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        console.log(`\n✅ ${label}`);
        console.log('   Status:', r.status);
        console.log('   Content-Type:', r.headers['content-type']);
        const body = typeof r.data === 'string' ? r.data.substring(0, 500) : JSON.stringify(r.data).substring(0, 500);
        console.log('   Body:', body);
    } catch (e) {
        console.log(`\n❌ ${label}: ${e.message}`);
    }
}

(async () => {
    // Try common API patterns for Next.js sites
    await tryEndpoint('https://www.kooora.com/api/matches', 'matches API');
    await tryEndpoint('https://www.kooora.com/api/fixtures', 'fixtures API');
    await tryEndpoint('https://www.kooora.com/api/news', 'news API');
    await tryEndpoint('https://api.kooora.com/matches', 'api subdomain matches');
    await tryEndpoint('https://api.kooora.com/v1/matches', 'api v1 matches');
    await tryEndpoint('https://www.kooora.com/_next/data/matches', 'next data matches');
    
    // Try to get the build ID from the page
    const r = await axios.get('https://www.kooora.com/', { headers: HEADERS, timeout: 10000 });
    const buildIdMatch = r.data.match(/"buildId":"([^"]+)"/);
    if (buildIdMatch) {
        const buildId = buildIdMatch[1];
        console.log('\n🔑 Build ID found:', buildId);
        await tryEndpoint(`https://www.kooora.com/_next/data/${buildId}/index.json`, 'Next.js index data');
        await tryEndpoint(`https://www.kooora.com/_next/data/${buildId}/matches.json`, 'Next.js matches data');
        await tryEndpoint(`https://www.kooora.com/_next/data/${buildId}/news.json`, 'Next.js news data');
    }
})();
