const axios = require('axios');
const H = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' };

// Test many possible ESPN league IDs for today
const CANDIDATES = [
    // Saudi
    'sau.1', 'sau.2', 'sau.pro',
    // Egypt  
    'egy.1', 'egy.2',
    // UAE
    'uae.league', 'uae.1',
    // Qatar
    'qat.1', 'qat.stars',
    // Morocco
    'mar.1', 'mar.botola',
    // Jordan
    'jor.1',
    // Iraq
    'irq.1',
    // Kuwait
    'kwt.1',
    // Tunisia
    'tun.1',
    // Algeria
    'alg.1',
    // Libya
    'lby.1',
    // International
    'fifa.worldcup', 'fifa.cwc', 'fifa.confederations',
    'concacaf.gold', 'concacaf.nations.league',
    'conmebol.copa', 'conmebol.libertadores', 'conmebol.sudamericana',
    'afc.champions', 'afc.cup',
    'caf.champions', 'caf.confederation',
    // Europe still active
    'ned.1', 'ned.eredivisie',
    'gre.1', 'sco.1', 'bel.1', 'rus.1',
    'ukr.1', 'cze.1', 'pol.1', 'aut.1',
    'sui.1', 'den.1', 'nor.1', 'swe.1',
    'fin.1', 'srb.1', 'cro.1', 'rom.1',
    // UEFA
    'uefa.champions', 'uefa.europa', 'uefa.europa.conf',
    'uefa.nations', 'uefa.euro',
    // World Cup 2026
    'fifa.worldcup.2026',
];

const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
console.log('Testing for date:', today, '\n');

async function test(id) {
    try {
        const r = await axios.get(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${id}/scoreboard?dates=${today}`,
            { headers: H, timeout: 5000 }
        );
        const events = r.data?.events || [];
        if (events.length > 0) {
            const name = r.data?.leagues?.[0]?.name || r.data?.leagues?.[0]?.abbreviation || id;
            console.log(`✓ ${id} (${name}): ${events.length} matches`);
            const e = events[0];
            const comp = e.competitions?.[0];
            const home = comp?.competitors?.find(c => c.homeAway === 'home');
            const away = comp?.competitors?.find(c => c.homeAway === 'away');
            console.log(`  → ${home?.team?.displayName} vs ${away?.team?.displayName} | ${e.status?.type?.description}`);
        }
    } catch(e) { /* skip */ }
}

async function main() {
    // Run in batches
    for (let i = 0; i < CANDIDATES.length; i += 8) {
        await Promise.all(CANDIDATES.slice(i, i+8).map(test));
    }
    console.log('\nDone.');
}
main().catch(console.error);
