const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    console.log('Fetching home page for buildId...');
    const home = await get('https://www.kooora.com/');
    const buildId = home.match(/"buildId":"([^"]+)"/)[1];
    const BASE = `https://www.kooora.com/_next/data/${buildId}`;

    console.log('Fetching yesterday matches...');
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];
    const yPage = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${yDate}`);
    const ynd = JSON.parse(yPage.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)[1]);
    const comps = ynd.props.pageProps.data || [];

    console.log('Scanning matches...');
    for (const comp of comps) {
        for (const m of (comp.matches || [])) {
            if (m.status === 'RESULT' && m.link?.slug && m.link?.id) {
                const slug = encodeURIComponent(m.link.slug);
                const id = m.link.id;
                try {
                    const detailPage = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}`);
                    const dnd = JSON.parse(detailPage.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)[1]);
                    const ddata = dnd.props.pageProps.data;
                    const matchObj = ddata.match || {};
                    
                    // Search for penalties in commentary or stats or keyEvents
                    const hasPenInGoals = (matchObj.keyEvents || []).some(e => e.__typename === 'MatchGoalEvent' && e.type === 'GOAL_PENALTY');
                    const hasPenShootout = JSON.stringify(matchObj).toLowerCase().includes('shootout') || JSON.stringify(matchObj).includes('ترجيح') || JSON.stringify(matchObj.score).includes('penalty') || JSON.stringify(matchObj.score).includes('pen');
                    
                    if (hasPenInGoals || hasPenShootout) {
                        console.log(`\n🎉 Found Match with Penalties: ${m.teamA?.name} vs ${m.teamB?.name}`);
                        console.log(`Score: ${matchObj.score?.teamA} - ${matchObj.score?.teamB}`);
                        console.log(`Status: ${m.status}`);
                        console.log('Score keys:', Object.keys(matchObj.score || {}));
                        console.log('Score object:', JSON.stringify(matchObj.score, null, 2));
                        console.log('Match fields:', Object.keys(matchObj).filter(k => typeof matchObj[k] !== 'object'));
                        console.log('Penalties events count:', (matchObj.keyEvents || []).filter(e => e.type === 'GOAL_PENALTY').length);
                        if (hasPenShootout) {
                            console.log('Penalty Shootout details detected!');
                            console.log(JSON.stringify(matchObj.score, null, 2));
                        }
                    }
                } catch(e) {
                    // skip errors
                }
            }
        }
    }
    console.log('\nScan completed.');
})().catch(console.error);
