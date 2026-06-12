const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('ysscores_dump.html', 'utf-8');
const $ = cheerio.load(html);
console.log('Match info items:', $('.match-info-item').length);
const firstMatch = $('.match-info-item').first();
if (firstMatch.length) {
    console.log(firstMatch.html());
} else {
    // maybe matches are stored differently?
    console.log('No .match-info-item found.');
    console.log($('.matches-wrapper').first().html());
}
