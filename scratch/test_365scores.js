const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'ar',
    'Referer': 'https://www.365scores.com/',
    'Origin': 'https://www.365scores.com',
};

async function tryUrl(label, url) {
    try {
        const r = await axios.get(url, { headers: H, timeout: 8000 });
        const data = r.data;
        const keys = typeof data === 'object' ? Object.keys(data).slice(0, 6) : typeof data;
        console.log(`✓ ${label}: ${JSON.stringify(keys)}`);
        if (data?.games) console.log('  games:', data.games.length, '| first:', data.games[0]?.homeCompetitor?.name, 'vs', data.games[0]?.awayCompetitor?.name);
        if (data?.competitions) console.log('  competitions:', data.competitions.length);
        return data;
    } catch(e) {
        console.log(`✗ ${label}: ${e.response?.status || e.message}`);
        return null;
    }
}

async function main() {
    const BASE365 = 'https://webws.365scores.com/web/games/current';
    
    // 365scores API - used by their website
    await tryUrl('365 today',     `${BASE365}/?appTypeId=5&langId=1&startDate=21/05/2026&endDate=21/05/2026&sports=1`);
    await tryUrl('365 tomorrow',  `${BASE365}/?appTypeId=5&langId=1&startDate=22/05/2026&endDate=22/05/2026&sports=1`);
    await tryUrl('365 yesterday', `${BASE365}/?appTypeId=5&langId=1&startDate=20/05/2026&endDate=20/05/2026&sports=1`);
    
    // Try Arabic
    await tryUrl('365 ar today', `${BASE365}/?appTypeId=5&langId=31&startDate=21/05/2026&endDate=21/05/2026&sports=1`);
    
    // Try different format
    await tryUrl('365 v2', `https://webws.365scores.com/web/games/?appTypeId=5&langId=1&startDate=21/05/2026&endDate=21/05/2026&sports=1`);
}
main().catch(console.error);
