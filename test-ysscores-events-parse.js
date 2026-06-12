const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('ys_match_detail.html', 'utf-8');
    const $ = cheerio.load(html);
    
    console.log('=== EVENTS SECTIONS ===');
    const matchEvents = $('.match-events-wrap');
    console.log('match-events-wrap length:', matchEvents.length);
    if (matchEvents.length > 0) {
        fs.writeFileSync('match_events.html', matchEvents.html(), 'utf-8');
        console.log('Saved match_events.html');
    }
    
    // Print all elements with "event" in their class name
    $('*').each((i, el) => {
        const cls = $(el).attr('class');
        if (cls && cls.includes('event')) {
            console.log(`Tag: ${el.tagName}, Class: ${cls}, Text: ${$(el).text().trim().replace(/\s+/g, ' ').slice(0, 100)}`);
        }
    });
}
test();
