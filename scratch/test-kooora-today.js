const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function main() {
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html0 = Buffer.from(r0.data).toString('utf8');
    const bm = html0.match(/"buildId":"([^"]+)"/);
    const buildId = bm[1];

    const matchesUrl = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;
    const r = await axios.get(matchesUrl, { headers: HEADERS, timeout: 15000 });
    const data = r.data?.pageProps?.data;
    
    // data is an object with keys 0,1,2... each being {competition, matches}
    const entries = Object.values(data);
    console.log('Total leagues:', entries.length);
    let totalMatches = 0;
    entries.forEach((entry, i) => {
        const league = entry.competition?.name || 'Unknown';
        const matches = entry.matches || [];
        totalMatches += matches.length;
        console.log(`${i}. ${league}: ${matches.length} matches`);
        if (matches[0]) {
            const m = matches[0];
            console.log(`   Sample: ${m.teamA?.name} vs ${m.teamB?.name} (${m.status})`);
            console.log(`   Keys:`, Object.keys(m).join(', '));
        }
    });
    console.log('\nTotal matches:', totalMatches);
}

main().catch(console.error);
