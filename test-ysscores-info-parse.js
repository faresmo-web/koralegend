const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('ys_match_detail.html', 'utf-8');
    const $ = cheerio.load(html);
    
    console.log('=== SEARCHING INFO IN HTML ===');
    // Let's print out the text and markup around words like "الحكم", "الملعب", "القناة"
    $('*').each((i, el) => {
        const txt = $(el).text().trim();
        if ($(el).children().length === 0) { // leaf nodes
            if (txt.includes('الحكم') || txt.includes('الملعب') || txt.includes('القناة') || txt.includes('المعلق')) {
                console.log(`Leaf [${el.tagName}.${$(el).attr('class') || ''}]:`, txt);
                console.log(`Parent HTML:`, $(el).parent().html().trim().replace(/\s+/g, ' '));
                console.log('-----------------------------');
            }
        }
    });
}
test();
