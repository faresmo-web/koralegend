// Simulate exactly what scraper.js does for Freiburg match
const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};
const BASE_URL = 'https://www.kooora.com';

function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    return m ? JSON.parse(m[1]) : null;
}

async function fetchMatchDetails(match) {
    const details = {
        stats: [], events: [],
        lineups: {
            confirmed: false,
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' },
    };

    console.log('slug:', match.slug, '| koooraId:', match.koooraId);
    if (!match.slug || !match.koooraId) { console.log('SKIP: no slug/id'); return details; }

    try {
        const slug = encodeURIComponent(match.slug);
        const url  = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${match.koooraId}`;
        console.log('URL:', url.substring(0, 80));
        
        const r    = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const nd   = extractNextData(r.data);
        const data = nd?.props?.pageProps?.data;
        
        console.log('data exists:', !!data);
        if (!data) return details;

        const m    = data.match || {};
        const tabs = data.tabsInfo || {};

        console.log('match.lineups exists:', !!m.lineups);
        console.log('match.lineups.confirmed:', m.lineups?.confirmed);
        console.log('match.lineups.teamA.lineup.length:', m.lineups?.teamA?.lineup?.length);

        // ── Lineups ──
        const matchLineups = m.lineups || {};
        details.lineups.confirmed = matchLineups.confirmed === true;

        const parseMatchTeam = (teamData, side) => {
            if (!teamData) { console.log(`No teamData for ${side}`); return; }
            details.lineups[side].formation = teamData.formation || '';
            details.lineups[side].coach     = teamData.coach?.name || '';
            console.log(`${side} lineup entries:`, teamData.lineup?.length);
            for (const entry of (teamData.lineup || [])) {
                const name = entry.person?.name || entry.player?.name || '';
                if (!name) { console.log('  Entry has no name:', JSON.stringify(entry).substring(0, 100)); continue; }
                const p = {
                    num:   String(entry.shirtNumber || ''),
                    name,
                    image: entry.person?.image?.url || '',
                    x:     entry.pitchPosition?.x ?? null,
                    y:     entry.pitchPosition?.y ?? null,
                    isCaptain: entry.isCaptain || false,
                };
                if (entry.pitchPosition) details.lineups[side].starters.push(p);
                else                     details.lineups[side].subs.push(p);
            }
            console.log(`${side} starters:`, details.lineups[side].starters.length, '| subs:', details.lineups[side].subs.length);
        };
        parseMatchTeam(matchLineups.teamA, 'home');
        parseMatchTeam(matchLineups.teamB, 'away');

    } catch (e) {
        console.error('ERROR:', e.message);
    }

    return details;
}

fetchMatchDetails({
    slug: 'فرايبورج-ضد-أستون-فيلا',
    koooraId: '2Op6fM0M_itShCoOB9azR',
    homeTeam: 'فرايبورج',
    awayTeam: 'أستون فيلا'
}).then(d => {
    console.log('\n=== RESULT ===');
    console.log('confirmed:', d.lineups.confirmed);
    console.log('home starters:', d.lineups.home.starters.length);
    console.log('away starters:', d.lineups.away.starters.length);
    if (d.lineups.home.starters.length > 0) {
        console.log('First home player:', JSON.stringify(d.lineups.home.starters[0]));
    }
});
