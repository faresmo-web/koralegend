const axios = require('axios');

async function fetchESPNDetails(eventId) {
    const details = {
        stats: [], events: [],
        lineups: {
            confirmed: false,
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' }
    };

    try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${eventId}`;
        const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const d = r.data;
        
        // 1. Info
        details.info.stadium = d.gameInfo?.venue?.fullName || '';
        details.info.referee = d.gameInfo?.officials?.[0]?.fullName || '';

        // 2. Events
        const homeId = d.boxscore?.teams?.find(t => t.homeAway === 'home')?.team?.id;
        const awayId = d.boxscore?.teams?.find(t => t.homeAway === 'away')?.team?.id;
        
        for (const ev of (d.keyEvents || [])) {
            const min = ev.clock?.displayValue || '';
            const typeId = ev.type?.id;
            let type = 'other';
            if (typeId === '17') type = 'sub';
            else if (['16', '15', '25', '26', '27', '28'].includes(typeId)) type = 'goal'; // Various goal types
            else if (typeId === '24') type = 'yellow'; // yellow
            else if (['21', '22'].includes(typeId)) type = 'red'; // red

            const team = ev.team?.id === homeId ? 'home' : (ev.team?.id === awayId ? 'away' : 'home'); // default to home if unknown
            let desc = ev.text || ev.shortText || '';
            
            // Format substitution text
            if (type === 'sub') {
                const pIn = ev.participants?.[0]?.athlete?.displayName || '';
                const pOut = ev.participants?.[1]?.athlete?.displayName || '';
                if (pIn && pOut) desc = `${pOut} ↔ ${pIn}`;
            } else if (type === 'goal') {
                desc = ev.participants?.[0]?.athlete?.displayName || desc;
            } else if (['yellow', 'red'].includes(type)) {
                desc = ev.participants?.[0]?.athlete?.displayName || desc;
            }

            if (min && desc) {
                details.events.push({ min, addedMin: '', type, team, descText: desc });
            }
        }

        // 3. Stats
        const homeStats = d.boxscore?.teams?.find(t => t.homeAway === 'home')?.statistics || [];
        const awayStats = d.boxscore?.teams?.find(t => t.homeAway === 'away')?.statistics || [];
        
        const statNames = new Set([...homeStats.map(s => s.name), ...awayStats.map(s => s.name)]);
        for (const name of statNames) {
            const hVal = homeStats.find(s => s.name === name)?.displayValue || '0';
            const aVal = awayStats.find(s => s.name === name)?.displayValue || '0';
            details.stats.push({ name: name, home: hVal, away: aVal });
        }

        // 4. Lineups
        if (d.rosters && d.rosters.length >= 2) {
            details.lineups.confirmed = true;
            for (const r of d.rosters) {
                const team = r.homeAway === 'home' ? 'home' : 'away';
                details.lineups[team].formation = r.formation || '';
                
                for (const p of (r.roster || [])) {
                    const playerObj = { name: p.athlete?.displayName || '', num: p.jersey || '' };
                    if (p.starter) details.lineups[team].starters.push(playerObj);
                    else details.lineups[team].subs.push(playerObj);
                }
            }
        }

    } catch (e) {
        console.error('ESPN fetch details error:', e.message);
    }

    return details;
}

async function test() {
    const res = await fetchESPNDetails('705199');
    console.log(JSON.stringify(res, null, 2));
}
test();
