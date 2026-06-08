const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

// Try to find the actual API endpoint kooora uses for date-based matches
// by looking at the page source for API URLs
async function main() {
    const r = await axios.get('https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85', 
        { headers: H, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    
    // Look for API endpoints in the JS
    const apiMatches = html.match(/https?:\/\/[^"'\s]+api[^"'\s]*/gi) || [];
    console.log('API URLs found:', [...new Set(apiMatches)].slice(0, 10));
    
    // Look for fetch/axios calls with date
    const fetchMatches = html.match(/fetch\([^)]+date[^)]+\)/gi) || [];
    console.log('\nFetch with date:', fetchMatches.slice(0, 5));
    
    // Look for any URL with date parameter
    const dateUrls = html.match(/["'][^"']*date[^"']*["']/gi) || [];
    console.log('\nURLs with date:', [...new Set(dateUrls)].filter(u => u.includes('http') || u.includes('/api')).slice(0, 10));
    
    // Check __NEXT_DATA__ for any API config
    const nd = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nd) {
        const d = JSON.parse(nd[1]);
        console.log('\n__NEXT_DATA__ runtimeConfig:', JSON.stringify(d.runtimeConfig || {}).slice(0, 300));
        console.log('publicRuntimeConfig:', JSON.stringify(d.publicRuntimeConfig || {}).slice(0, 300));
        // Look for any API base URL
        const str = JSON.stringify(d);
        const apiBase = str.match(/"apiUrl":"([^"]+)"/);
        if (apiBase) console.log('apiUrl:', apiBase[1]);
        const graphql = str.match(/"graphql[^"]*":"([^"]+)"/i);
        if (graphql) console.log('graphql:', graphql[1]);
    }
    
    // Look for JS chunk files that might have the API
    const chunks = html.match(/\/_next\/static\/chunks\/[^"']+\.js/g) || [];
    console.log('\nJS chunks:', chunks.slice(0, 5));
}
main().catch(console.error);
