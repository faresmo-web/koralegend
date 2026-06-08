const axios = require('axios');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,*/*', 'Accept-Language': 'ar', 'Referer': 'https://www.kooora.com/' };
function extractNextData(html) { const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s); return m ? JSON.parse(m[1]) : null; }

(async () => {
    const r = await axios.get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent('بيراميدز-ضد-سموحة')}/XClkLrdR5RhtZIywZBkj6`, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const data = extractNextData(Buffer.from(r.data).toString('utf8'))?.props?.pageProps?.data;
    const tabs = data?.tabsInfo || {};
    const m2   = data?.match || {};

    // Check lineups for substitutions
    console.log('lineups keys:', Object.keys(m2.lineups || {}));
    console.log('lineups.teamA keys:', Object.keys(m2.lineups?.teamA || {}));
    
    const teamA = m2.lineups?.teamA || {};
    const teamB = m2.lineups?.teamB || {};
    console.log('\nteamA.substitutions:', JSON.stringify(teamA.substitutions || teamA.subs, null, 2)?.substring(0, 800));
    console.log('\nteamB.substitutions:', JSON.stringify(teamB.substitutions || teamB.subs, null, 2)?.substring(0, 800));

    // Check tabsInfo.commentary for subs
    const tabCommentary = tabs.commentary || [];
    console.log('\ntabsInfo.commentary length:', tabCommentary.length);
    const tabSubs = tabCommentary.filter(c => c.event?.__typename === 'MatchSubstitutionEvent' || c.__typename === 'MatchSubstitutionEvent');
    console.log('tabsInfo.commentary subs:', tabSubs.length);
    if (tabSubs.length > 0) console.log('First tab sub:', JSON.stringify(tabSubs[0], null, 2)?.substring(0, 500));

    // Search entire data string for playerIn/playerOut
    const dataStr = JSON.stringify(data);
    const idx = dataStr.indexOf('playerIn');
    if (idx > -1) {
        console.log('\nFound playerIn at:', idx);
        console.log('Context:', dataStr.substring(idx - 50, idx + 300));
    } else {
        console.log('\nNo playerIn found anywhere');
    }
    
    // Check if lineup has substitution info
    const allLineup = [...(teamA.lineup || []), ...(teamB.lineup || [])];
    const subPlayers = allLineup.filter(p => p.substitution || p.subbedIn || p.subbedOff);
    console.log('\nPlayers with sub info:', subPlayers.length);
    if (subPlayers.length > 0) console.log('First:', JSON.stringify(subPlayers[0], null, 2)?.substring(0, 400));
})().catch(console.error);
