const axios = require('axios');

async function main() {
    const BASE_URL = 'https://www.kooora.com';
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,*/*',
        'Referer': 'https://www.kooora.com/',
    };

    const teamId = '70tnqyqn871jwlk26gtjw7knm';
    const teamName = 'تشيكيا';

    try {
        const r = await axios.get(BASE_URL, { headers: HEADERS });
        const m = r.data.match(/"buildId":"([^"]+)"/);
        if (!m) throw new Error('buildId not found');
        const buildId = m[1];
        console.log('Build ID:', buildId);

        const tabs = ['squad', 'matches', 'news', 'videos', 'standings', 'top-players', 'scorers'];

        for (const tab of tabs) {
            const url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${tab}/${teamId}.json`;
            console.log(`\n=== Testing tab "${tab}" ===`);
            console.log('URL:', url);
            try {
                const res = await axios.get(url, { headers: HEADERS });
                const data = res.data?.pageProps?.data || {};
                console.log('  Keys returned in pageProps.data:', Object.keys(data));
                
                // Print info about specific tab data keys
                if (data[tab]) {
                    console.log(`  Key "${tab}" exists!`);
                    console.log(`  Preview of "${tab}":`, JSON.stringify(data[tab]).slice(0, 500));
                } else {
                    // Try to find if there's any key that has a similar name or isn't the standard ones
                    const standardKeys = [
                        '__typename', 'navigation', 'tabsInfoNewsArchive', 'tabsInfoVideosArchive', 
                        'tabsInfoMatches', 'tabsInfoStandings', 'tabsInfoSquad', 'tabsInfoTopPlayers', 
                        'team', 'competition', 'seoText', 'faq', 'pageInfo'
                    ];
                    const extraKeys = Object.keys(data).filter(k => !standardKeys.includes(k));
                    console.log('  Extra keys returned:', extraKeys);
                    extraKeys.forEach(k => {
                        console.log(`  Preview of "${k}":`, JSON.stringify(data[k]).slice(0, 500));
                    });
                }
            } catch (e) {
                console.log(`  Failed:`, e.response ? e.response.status : e.message);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
