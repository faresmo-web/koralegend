const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('ys_match_detail.html', 'utf-8');
    const $ = cheerio.load(html);
    
    console.log('=== MATCH INFO ITEMS ===');
    $('.match-info-item').each((i, el) => {
        const title = $(el).find('.title').text().trim();
        const content = $(el).find('.content').text().trim();
        console.log(`Item ${i}: Title="${title}" Content="${content}"`);
    });
}
test();
