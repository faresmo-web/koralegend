const axios = require('axios');

async function main() {
    const BASE_URL = 'https://www.kooora.com';
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,*/*',
        'Referer': 'https://www.kooora.com/',
    };

    // Let's use a known team: "تشيكيا" (Czech Republic) with ID "70tnqyqn871jwlk26gtjw7knm" from today's matches.
    // Or we can try another club team: "الأهلي" (Al Ahly)
    const teamId = '70tnqyqn871jwlk26gtjw7knm';
    const teamName = 'تشيكيا';

    try {
        const r = await axios.get(BASE_URL, { headers: HEADERS });
        const m = r.data.match(/"buildId":"([^"]+)"/);
        if (!m) throw new Error('buildId not found');
        const buildId = m[1];
        console.log('Build ID:', buildId);

        const urlOptions = [
            `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}.json`,
            `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%86%D8%A7%D8%AF%D9%8A/${encodeURIComponent(teamName)}/${teamId}.json`,
            `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/team/${encodeURIComponent(teamName)}/${teamId}.json`
        ];

        for (const url of urlOptions) {
            console.log('Testing URL:', url);
            try {
                const res = await axios.get(url, { headers: HEADERS });
                console.log('  SUCCESS!');
                console.log('  Response Keys:', Object.keys(res.data?.pageProps?.data || {}));
                console.log('  Sample pageProps keys:', Object.keys(res.data?.pageProps || {}));
                
                const data = res.data?.pageProps?.data || {};
                console.log('  Team Info:', data.team?.name || data.team?.displayName);
                
                // Let's write the response to a file for deeper inspection
                const inspectFile = 'scratch/team-data-sample.json';
                const fs = require('fs');
                fs.writeFileSync(inspectFile, JSON.stringify(res.data, null, 2), 'utf-8');
                console.log('  Saved response to', inspectFile);
                break;
            } catch (e) {
                console.log('  Failed:', e.response ? e.response.status : e.message);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
