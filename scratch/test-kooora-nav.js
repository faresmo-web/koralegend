const axios = require('axios');
async function main() {
    const HEADERS = { 'User-Agent': 'Mozilla/5.0' };
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS });
    const navMatch = r0.data.match(/"navigation":(\{.*?\})/);
    if(navMatch) {
        const nav = JSON.parse(navMatch[1]);
        const comps = nav.top?.items?.find(i => i.title === 'بطولات' || i.title === 'Competitions');
        comps?.items?.slice(0, 10).forEach(c => console.log(c.title, ':', c.link?.slug, c.link?.id));
    }
}
main();
