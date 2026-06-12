const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

async function test() {
    try {
        const matchUrl = 'https://www.ysscores.com/ar/match/4667751/Mexico-vs-South-Africa';
        console.log(`Fetching match details from: ${matchUrl}`);
        const r = await axios.get(matchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000,
            responseType: 'arraybuffer'
        });
        const html = Buffer.from(r.data).toString('utf-8');
        const $ = cheerio.load(html);
        
        console.log('=== EVENTS SECTIONS ===');
        const matchEvents = $('.match-events-wrap');
        console.log('match-events-wrap length:', matchEvents.length);
        if (matchEvents.length > 0) {
            fs.writeFileSync('yesterday_match_events.html', matchEvents.html(), 'utf-8');
            console.log('Saved yesterday_match_events.html');
            
            // Print out all child nodes and classes/texts of matchEvents
            matchEvents.find('*').each((i, el) => {
                const cls = $(el).attr('class');
                const tag = el.tagName;
                const txt = $(el).text().trim().replace(/\s+/g, ' ');
                if (cls) {
                    console.log(`${tag}.${cls}:`, txt.slice(0, 100));
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
}
test();
