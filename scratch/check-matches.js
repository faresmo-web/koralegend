const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/json,*/*'
    };
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html = Buffer.from(r0.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    if (!m) return console.log('No build id');
    const buildId = m[1];
    
    console.log('Build ID:', buildId);
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;
    const r = await axios.get(url, { headers: HEADERS });
    const comps = Object.values(r.data.pageProps.data).filter(v => v && v.competition);
    console.log(`Fetched ${comps.length} comps`);
    
    if (comps.length > 0) {
        console.log('Comp 0:', comps[0].competition.name);
        if (comps[0].matches && comps[0].matches.length > 0) {
             console.log('Match 1:', comps[0].matches[0].teamA.name, 'vs', comps[0].matches[0].teamB.name, comps[0].matches[0].startDate);
        }
    }
}
main().catch(console.error);
