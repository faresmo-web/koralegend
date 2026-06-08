const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/json,*/*'
    };
    try {
        const r = await axios.get('https://www.kooora.com', { headers: HEADERS });
        const html = r.data;
        // extract all links containing "ea0h6cf3bhl698hkxhpulh2zz"
        const matches = [...html.matchAll(/href="([^"]+ea0h6cf3bhl698hkxhpulh2zz[^"]*)"/g)];
        console.log('Links found:', matches.length);
        matches.forEach(m => console.log(m[1]));
        
        // Also look for "دوري-روشن-السعودي"
        const matches2 = [...html.matchAll(/href="([^"]+%D8%AF%D9%88%D8%B1%D9%8A-%D8%B1%D9%88%D8%B4%D9%86-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A[^"]*)"/g)];
        console.log('Links found by name:', matches2.length);
        matches2.forEach(m => console.log(decodeURIComponent(m[1])));
        
        // Also look for any '/بطولة/' links
        const matches3 = [...html.matchAll(/href="([^"]+\/بطولة\/[^"]+)"/g)];
        const matches3_encoded = [...html.matchAll(/href="([^"]+%D8%A8%D8%B7%D9%88%D9%84%D8%A9[^"]*)"/g)];
        console.log('Links found with بطولة:', matches3.length, matches3_encoded.length);
        matches3_encoded.slice(0, 5).forEach(m => console.log(decodeURIComponent(m[1])));
        
    } catch(e) {
        console.log('Error:', e.message);
    }
}
main();
