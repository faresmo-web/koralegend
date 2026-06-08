const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
    'Origin': 'https://www.kooora.com',
};

async function tryUrl(label, url, extraHeaders = {}) {
    try {
        const r = await axios.get(url, { headers: { ...H, ...extraHeaders }, timeout: 8000 });
        const data = r.data;
        const keys = typeof data === 'object' ? Object.keys(data).slice(0, 8) : typeof data;
        console.log(`✓ ${label}: status=${r.status} keys=${JSON.stringify(keys)}`);
        if (data?.data) console.log('  data keys:', Object.keys(data.data).slice(0, 6));
        return data;
    } catch(e) {
        console.log(`✗ ${label}: ${e.response?.status || e.message}`);
        return null;
    }
}

async function main() {
    const BASE = 'https://www.kooora.com';
    
    // Try common API patterns
    await tryUrl('api/v1/matches',        `${BASE}/api/v1/matches`);
    await tryUrl('api/matches',           `${BASE}/api/matches`);
    await tryUrl('api/football/matches',  `${BASE}/api/football/matches`);
    
    // Try with date
    await tryUrl('api/v1/matches?date=2026-05-22', `${BASE}/api/v1/matches?date=2026-05-22`);
    
    // Try kooora's content API (Contentstack CMS)
    await tryUrl('contentstack matches', 'https://cdn.contentstack.io/v3/content_types/match/entries?environment=production&locale=ar-sa');
    
    // Try the live scores endpoint that kooora might use
    await tryUrl('live-scores json', `${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85`, {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    });
    
    // Try fetching the page with different date in cookie/header
    await tryUrl('page with date header', `${BASE}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85`, {
        'Cookie': 'selectedDate=2026-05-22',
    });
    
    // Check if there's a separate API subdomain
    await tryUrl('api subdomain', 'https://api.kooora.com/matches');
    await tryUrl('api subdomain v2', 'https://api.kooora.com/v2/matches');
    
    // Try the _next/data with different path format
    const r0 = await axios.get(BASE, { headers: H, timeout: 10000 });
    const bm = r0.data.match(/"buildId":"([^"]+)"/);
    const buildId = bm?.[1];
    console.log('\nbuildId:', buildId);
    
    if (buildId) {
        // Try with date in the path
        await tryUrl('_next with date in path', 
            `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85/2026-05-22.json`);
        
        // Try with date as path segment
        await tryUrl('_next date segment', 
            `${BASE}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json?date=2026-05-22&sports-category=football`);
    }
}
main().catch(console.error);
