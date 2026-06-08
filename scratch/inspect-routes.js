const axios = require('axios');

async function main() {
    const BASE_URL = 'https://www.kooora.com';
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,*/*',
        'Referer': 'https://www.kooora.com/',
    };

    try {
        const r = await axios.get(BASE_URL, { headers: HEADERS });
        const m = r.data.match(/"buildId":"([^"]+)"/);
        if (!m) throw new Error('buildId not found');
        const buildId = m[1];
        console.log('Build ID:', buildId);

        // Fetch build manifest
        const manifestUrl = `${BASE_URL}/_next/static/${buildId}/_buildManifest.js`;
        console.log('Fetching manifest:', manifestUrl);
        const r2 = await axios.get(manifestUrl, { headers: HEADERS });
        
        // Find all routes (keys in self.__BUILD_MANIFEST = { ... })
        const jsText = r2.data;
        console.log('Manifest content length:', jsText.length);
        
        // We can extract strings matching standard next.js route format like "/..."
        const routes = [];
        const matches = jsText.matchAll(/"(\/[^"]+)"/g);
        for (const match of matches) {
            routes.push(match[1]);
        }
        
        const uniqueRoutes = [...new Set(routes)].sort();
        console.log('\n--- Found Routes ---');
        uniqueRoutes.forEach(route => {
            if (route.includes('لاعب') || route.includes('فريق') || route.includes('نادي') || route.includes('team') || route.includes('player') || route.includes('competition') || route.includes('مسابقة')) {
                console.log(route, '->', decodeURIComponent(route));
            }
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
