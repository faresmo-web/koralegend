const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
    try {
        const ysscores = require('./ysscores');
        const todayStr = new Date().toISOString().split('T')[0];
        const matches = await ysscores.fetchMatchesForDate(todayStr, 'today');
        console.log(`Found ${matches.length} matches.`);
        if (matches.length === 0) return;
        
        const match = matches[0];
        console.log('Fetching details for:', match.homeTeam, 'vs', match.awayTeam);
        const matchUrl = ysscores.resolveMatchUrl(match.slug);
        console.log('Match URL:', matchUrl);
        
        const r = await axios.get(matchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000,
            responseType: 'arraybuffer'
        });
        const html = Buffer.from(r.data).toString('utf-8');
        fs.writeFileSync('ys_match_detail.html', html, 'utf-8');
        console.log('Saved ys_match_detail.html');
        
        const $ = cheerio.load(html);
        
        // Let's print out all unique class names or some headers/tables to see what sections exist
        console.log('=== Head/Body elements ===');
        const classes = new Set();
        $('*').each((i, el) => {
            const cls = $(el).attr('class');
            if (cls) cls.split(/\s+/).forEach(c => classes.add(c));
        });
        console.log('Classes found:', [...classes].filter(c => c.includes('line') || c.includes('player') || c.includes('squad') || c.includes('formation') || c.includes('coach') || c.includes('stat') || c.includes('event')));
    } catch (e) {
        console.error(e);
    }
}
test();
