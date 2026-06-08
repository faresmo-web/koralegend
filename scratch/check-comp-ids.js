const axios = require('axios');

async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/json,*/*'
    };

    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html = Buffer.from(r0.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    const buildId = m[1];

    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85.json`;
    const r = await axios.get(url, { headers: HEADERS });
    const comps = Object.values(r.data.pageProps.data).filter(v => v && v.competition);
    
    // Show competition links/IDs from matches data
    comps.forEach(c => {
        const comp = c.competition;
        console.log({
            name: comp.name,
            id: comp.id,
            link: comp.link,
            slug: comp.slug,
            externalId: comp.externalId
        });
    });
}
main().catch(console.error);
