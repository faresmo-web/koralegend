const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    const url = 'https://www.yallakora.com/matches';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        
        console.log('--- Printing first match item HTML ---');
        const matchItem = $('.matchCard .ul .item').first();
        if (matchItem.length > 0) {
            console.log(matchItem.html());
            console.log('--- Links inside first match item ---');
            matchItem.find('a').each((i, el) => {
                console.log(`Link ${i}: href="${$(el).attr('href')}" text="${$(el).text().trim()}" class="${$(el).attr('class')}"`);
            });
        } else {
            console.log('No match item found!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
