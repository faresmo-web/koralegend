const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

// Fetch the main page JS chunk that handles routing/data fetching
async function main() {
    // Get the pages chunk for matches page
    const r = await axios.get('https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85', 
        { headers: H, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    
    // Find the page-specific chunk
    const pageChunks = html.match(/\/_next\/static\/chunks\/pages\/[^"']+\.js/g) || [];
    console.log('Page chunks:', pageChunks);
    
    // Find all script src
    const scripts = html.match(/src="(\/_next\/static\/[^"]+\.js)"/g) || [];
    console.log('\nAll scripts:', scripts.slice(0, 8));
    
    // Try to fetch the matches page chunk
    const matchChunk = pageChunks.find(c => c.includes('مباريات') || c.includes('matches') || c.includes('today'));
    if (matchChunk) {
        console.log('\nFetching chunk:', matchChunk);
        const cr = await axios.get(`https://www.kooora.com${matchChunk}`, { headers: H, timeout: 15000 });
        // Look for API calls with date
        const dateApi = cr.data.match(/['"](https?:\/\/[^'"]*(?:match|fixture|schedule)[^'"]*)['"]/gi) || [];
        console.log('Date API calls:', dateApi.slice(0, 5));
        
        // Look for fetch patterns
        const fetches = cr.data.match(/fetch\([^)]{10,100}\)/g) || [];
        console.log('Fetches:', fetches.slice(0, 5));
    }
    
    // Check __NEXT_DATA__ for the actual data structure with date info
    const nd = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nd) {
        const d = JSON.parse(nd[1]);
        // Look for date in the data
        const str = JSON.stringify(d.props?.pageProps || {});
        const dateMatch = str.match(/"date":"([^"]+)"/);
        console.log('\nDate in pageProps:', dateMatch?.[1]);
        
        // Check query params
        console.log('query:', JSON.stringify(d.query || {}));
        console.log('page:', d.page);
    }
}
main().catch(console.error);
