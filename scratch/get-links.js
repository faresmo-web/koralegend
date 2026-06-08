const axios = require('axios');
async function getLinks() {
    try {
        const HEADERS = { 'User-Agent': 'Mozilla/5.0' };
        const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
        const html = Buffer.from(r0.data).toString('utf8');
        const m = html.match(/href="([^"]+)"/g);
        if (m) {
            const matches = m.filter(x => x.includes('مباريات') || x.includes('matches'));
            console.log([...new Set(matches)]);
        }
    } catch(e) { console.error(e.message); }
}
getLinks();
