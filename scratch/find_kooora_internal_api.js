const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

async function main() {
    // Fetch the main app chunk to find internal API
    const r = await axios.get('https://www.kooora.com/_next/static/chunks/pages/_app-a460fdfbfb50d7b7.js', 
        { headers: H, timeout: 15000 });
    const code = r.data;
    
    // Look for any URL with date in it
    const patterns = [
        /["'`][^"'`]*date[^"'`]{0,50}["'`]/g,
        /fetch\([^)]{5,200}\)/g,
        /axios\.[a-z]+\([^)]{5,200}\)/g,
        /["'`]https?:\/\/[^"'`]{10,100}["'`]/g,
    ];
    
    for (const p of patterns) {
        const matches = code.match(p) || [];
        if (matches.length > 0) {
            console.log(`\nPattern ${p.source.slice(0,30)}:`);
            matches.slice(0, 5).forEach(m => console.log(' ', m.slice(0, 150)));
        }
    }
    
    // Look for specific API domains
    const domains = code.match(/[a-z0-9-]+\.kooora\.com/g) || [];
    console.log('\nKooora subdomains:', [...new Set(domains)]);
    
    // Look for /api/ paths
    const apiPaths = code.match(/["'`]\/api\/[^"'`]{3,60}["'`]/g) || [];
    console.log('\nAPI paths:', [...new Set(apiPaths)].slice(0, 10));
}
main().catch(console.error);
