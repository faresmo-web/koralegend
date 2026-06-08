const axios = require('axios');
const H = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' };

async function tryEspn(label, url) {
    try {
        const r = await axios.get(url, { headers: H, timeout: 10000 });
        const events = r.data?.events || r.data?.sports?.[0]?.leagues?.[0]?.events || [];
        console.log(`✓ ${label}: ${events.length} events`);
        if (events[0]) {
            const e = events[0];
            console.log('  First:', e.name || e.shortName, '|', e.status?.type?.description);
        }
        return true;
    } catch(e) {
        console.log(`✗ ${label}: ${e.response?.status || e.message}`);
        return false;
    }
}

async function main() {
    // ESPN public API - no key needed
    const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
    
    // Today
    await tryEspn('soccer today',     `${BASE}/all/scoreboard`);
    await tryEspn('soccer 2026-05-19', `${BASE}/all/scoreboard?dates=20260519`);
    await tryEspn('soccer 2026-05-21', `${BASE}/all/scoreboard?dates=20260521`);
    await tryEspn('soccer 2026-05-22', `${BASE}/all/scoreboard?dates=20260522`);
    
    // Try specific leagues
    await tryEspn('premier league today', `${BASE}/eng.1/scoreboard`);
    await tryEspn('premier league 2026-05-19', `${BASE}/eng.1/scoreboard?dates=20260519`);
}
main().catch(console.error);
