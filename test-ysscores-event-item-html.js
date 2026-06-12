const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('yesterday_match_events.html', 'utf-8');
    const $ = cheerio.load(html);
    
    $('.match-event-item').each((i, el) => {
        const classes = $(el).attr('class');
        console.log(`\n--- Event ${i} (Classes: ${classes}) ---`);
        console.log($(el).html().trim().replace(/\s+/g, ' '));
    });
}
test();
