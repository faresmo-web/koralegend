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
    
    // First, let's look at the navigation data which often has standard URLs for main leagues
    const navMatch = html0.match(/"navigation":(\{.*?\})/);
    if (navMatch) {
        try {
            const nav = JSON.parse(navMatch[1]);
            console.log('Top Nav:', JSON.stringify(nav.top?.items?.slice(0, 3), null, 2));
            const comps = nav.top?.items?.find(i => i.title === 'بطولات' || i.title === 'Competitions');
            console.log('Comps Nav:', JSON.stringify(comps?.items?.slice(0, 3), null, 2));
        } catch(e) {}
    }

    const matchesUrl = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;
    const r = await axios.get(matchesUrl, { headers: HEADERS });
    const data = r.data?.pageProps?.data;
    const comps = Object.values(data).filter(v => v && v.competition && Array.isArray(v.matches));
    
    // Find Saudi
    const saudi = comps.find(c => c.competition.name.includes('السعودي'));
    console.log('Saudi League Object:', JSON.stringify(saudi?.competition, null, 2));
    
    // Check match data for competition reference
    if (saudi && saudi.matches[0]) {
        console.log('Match Competition Ref:', JSON.stringify(saudi.matches[0].competition, null, 2));
        console.log('Match Link:', JSON.stringify(saudi.matches[0].link, null, 2));
    }
}
main();
