const axios = require('axios');
const H = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' };

// Major leagues on ESPN
const LEAGUES = [
    { id: 'eng.1',  name: 'الدوري الإنجليزي الممتاز' },
    { id: 'esp.1',  name: 'الدوري الإسباني' },
    { id: 'ger.1',  name: 'الدوري الألماني' },
    { id: 'ita.1',  name: 'الدوري الإيطالي' },
    { id: 'fra.1',  name: 'الدوري الفرنسي' },
    { id: 'uefa.champions', name: 'دوري أبطال أوروبا' },
    { id: 'sau.1',  name: 'الدوري السعودي' },
    { id: 'egy.1',  name: 'الدوري المصري' },
];

async function fetchLeague(leagueId, dateStr) {
    const espnDate = dateStr.replace(/-/g, '');
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard?dates=${espnDate}`;
    try {
        const r = await axios.get(url, { headers: H, timeout: 8000 });
        return r.data?.events || [];
    } catch(e) {
        return [];
    }
}

async function main() {
    const date = '2026-05-21';
    console.log(`Testing ESPN for ${date}:\n`);
    
    for (const league of LEAGUES) {
        const events = await fetchLeague(league.id, date);
        console.log(`${league.name} (${league.id}): ${events.length} matches`);
        if (events[0]) {
            const e = events[0];
            const comp = e.competitions?.[0];
            const home = comp?.competitors?.find(c => c.homeAway === 'home');
            const away = comp?.competitors?.find(c => c.homeAway === 'away');
            console.log(`  ${home?.team?.displayName} vs ${away?.team?.displayName} | ${e.status?.type?.description}`);
        }
    }
}
main().catch(console.error);
