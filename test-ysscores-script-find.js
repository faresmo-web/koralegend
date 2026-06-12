const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('ys_match_detail.html', 'utf-8');
    const $ = cheerio.load(html);
    
    console.log('=== SCRIPT TAGS ===');
    $('script').each((i, el) => {
        const src = $(el).attr('src');
        const content = $(el).html();
        if (src) {
            console.log(`Script src: ${src}`);
        } else if (content) {
            console.log(`Inline Script (length: ${content.length}):`);
            if (content.includes('lineup') || content.includes('player') || content.includes('formation')) {
                console.log(content.slice(0, 1000));
                console.log('----------------------------');
            }
        }
    });
}
test();
