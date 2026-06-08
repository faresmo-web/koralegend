const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    const matchId = '110519';
    const squadUrl = `https://www.yallakora.com/Match/Matchsquad2?matchID=${matchId}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    try {
        const response = await axios.post(squadUrl, {}, { headers });
        const $ = cheerio.load(response.data);
        
        console.log('--- Printing raw HTML of first .teamList ---');
        console.log($('.teamList').first().html().substring(0, 2000));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
