const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/json,*/*'
    };
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html0 = Buffer.from(r0.data).toString('utf8');
    const bm = html0.match(/"buildId":"([^"]+)"/);
    const buildId = bm[1];
    const matchesUrl = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;
    const r = await axios.get(matchesUrl, { headers: HEADERS });
    const data = r.data?.pageProps?.data;
    const comps = Object.values(data).filter(v => v && v.competition && Array.isArray(v.matches));
    
    // Find Saudi
    const saudi = comps.find(c => c.competition.name.includes('السعودي'));
    console.log('Saudi League:', saudi?.competition);
    console.log('First Match ID:', saudi?.matches?.[0]?.id);
    
    // Try to get a match detail page and see if there's a league link there
    if (saudi && saudi.matches[0]) {
        const m = saudi.matches[0];
        const link = m.link; // { id, slug, ... }
        console.log('Match link object:', link);
    }
}
main();
