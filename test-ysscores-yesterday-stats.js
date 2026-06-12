const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');

async function test() {
    try {
        const matchUrl = 'https://www.ysscores.com/ar/match/4667751/Mexico-vs-South-Africa';
        const r = await axios.get(matchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000,
            responseType: 'arraybuffer'
        });
        const html = Buffer.from(r.data).toString('utf-8');
        const $ = cheerio.load(html);
        
        console.log('=== STATS ELEMENTS ===');
        const statsBlock = $('.stats');
        console.log('stats blocks count:', statsBlock.length);
        if (statsBlock.length > 0) {
            fs.writeFileSync('yesterday_stats.html', statsBlock.html(), 'utf-8');
            console.log('Saved yesterday_stats.html');
            
            // Print all child structures
            statsBlock.find('*').each((i, el) => {
                const cls = $(el).attr('class');
                const tag = el.tagName;
                const txt = $(el).text().trim().replace(/\s+/g, ' ');
                if (cls && (cls.includes('stat') || cls.includes('title') || cls.includes('content') || cls.includes('progress') || cls.includes('bar'))) {
                    console.log(`${tag}.${cls}:`, txt.slice(0, 100));
                }
            });
        }
    } catch(e) {
        console.error(e);
    }
}
test();
