const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

const BUILD_ID = 'OgOgaNYbulep3HHfmXfAF';
const BASE = `https://www.kooora.com/_next/data/${BUILD_ID}`;

async function tryEndpoint(url, label) {
    try {
        const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        console.log(`\n✅ ${label}`);
        const body = JSON.stringify(r.data).substring(0, 800);
        console.log('   Body:', body);
        return r.data;
    } catch (e) {
        console.log(`\n❌ ${label}: ${e.message}`);
        return null;
    }
}

(async () => {
    // Try matches pages
    await tryEndpoint(`${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`, 'matches today (ar URL)');
    
    // Try news page
    const newsData = await tryEndpoint(`${BASE}/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1.json`, 'news page');
    if (newsData) {
        console.log('\n📰 News keys:', Object.keys(newsData?.pageProps || {}));
        const articles = newsData?.pageProps?.data?.articles || newsData?.pageProps?.articles;
        if (articles) {
            console.log('   First article:', JSON.stringify(articles[0]).substring(0, 400));
        }
    }

    // Try GraphQL endpoint
    await tryEndpoint('https://www.kooora.com/graphql', 'GraphQL');
    
    // Try the index data more deeply
    const indexData = await tryEndpoint(`${BASE}/index.json`, 'index data deep');
    if (indexData) {
        const keys = Object.keys(indexData?.pageProps?.data || {});
        console.log('\n📦 Index data keys:', keys);
        // Look for matches or news
        const data = indexData?.pageProps?.data;
        if (data) {
            for (const key of keys) {
                if (Array.isArray(data[key]) && data[key].length > 0) {
                    console.log(`\n  Key "${key}" has ${data[key].length} items`);
                    console.log('  First item:', JSON.stringify(data[key][0]).substring(0, 300));
                }
            }
        }
    }
})();
