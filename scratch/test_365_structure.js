const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'ar',
    'Referer': 'https://www.365scores.com/',
};

async function main() {
    const r = await axios.get(
        'https://webws.365scores.com/web/games/current/?appTypeId=5&langId=31&startDate=21/05/2026&endDate=21/05/2026&sports=1',
        { headers: H, timeout: 10000 }
    );
    
    const games = r.data?.games || [];
    const comps = r.data?.competitions || [];
    const sports = r.data?.sports || [];
    
    console.log('Total games:', games.length);
    console.log('Total competitions:', comps.length);
    
    // Show game structure
    const g = games[0];
    console.log('\nGame keys:', Object.keys(g));
    console.log('Game sample:', JSON.stringify(g).slice(0, 600));
    
    // Competition structure
    const c = comps[0];
    console.log('\nComp keys:', Object.keys(c));
    console.log('Comp sample:', JSON.stringify(c).slice(0, 300));
    
    // Find Arab leagues
    console.log('\nArab competitions:');
    comps.filter(c => {
        const name = (c.name || '') + (c.countryName || '');
        return name.includes('Saudi') || name.includes('Egypt') || name.includes('Arab') || 
               name.includes('Qatar') || name.includes('UAE') || name.includes('Morocco') ||
               c.countryId === 17 || c.countryId === 18; // Arab countries
    }).forEach(c => console.log(' ', c.id, c.name, '|', c.countryName));
    
    // Show status values
    const statuses = [...new Set(games.map(g => g.statusGroup))];
    console.log('\nStatus groups:', statuses);
    
    // Show a live game if any
    const live = games.find(g => g.statusGroup === 1 || g.statusGroup === 2);
    if (live) console.log('\nLive game:', JSON.stringify(live).slice(0, 400));
    
    // Show paging
    console.log('\npaging:', r.data?.paging);
}
main().catch(console.error);
