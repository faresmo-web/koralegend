const { fetchMatchesForDate, resolveMatchUrl } = require('./ysscores');
const axios = require('axios');

async function run() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const dateStr = d.toISOString().split('T')[0];
    const matches = await fetchMatchesForDate(dateStr, 'الأمس');
    
    for (const m of matches) {
        if (!m.id) continue;
        console.log(`\nMatch: ${m.homeTeam} vs ${m.awayTeam} (${m.id})`);
        try {
            const res = await axios.get(`https://www.ysscores.com/ar/get_league_rank?match_code=${m.id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = res.data;
            console.log(`- type_league: ${data.type_league}`);
            console.log(`- list_match isArray: ${Array.isArray(data.list_match)}, keys:`, data.list_match ? Object.keys(data.list_match) : 'null');
            if (data.list_match && data.list_match.length > 0) {
                const first = data.list_match[0];
                console.log(`- list_match[0] keys:`, Object.keys(first));
                // print first group or first few keys
                const groupKey = Object.keys(first)[0];
                if (groupKey) {
                    console.log(`  - Sub-keys for '${groupKey}':`, Object.keys(first[groupKey] || {}).slice(0, 5));
                    const firstTeamKey = Object.keys(first[groupKey] || {})[0];
                    if (firstTeamKey) {
                        console.log(`    - Sample team structure:`, first[groupKey][firstTeamKey].team_name?.title, 'Points:', first[groupKey][firstTeamKey].points);
                    }
                }
            }
        } catch (e) {
            console.error(`- Error: ${e.message}`);
        }
    }
}
run();
