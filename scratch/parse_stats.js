const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    const matchId = '110519';
    const statsUrl = `https://www.yallakora.com/Match/EuroMatchStats2?matchID=${matchId}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    try {
        const response = await axios.post(statsUrl, {}, { headers });
        const $ = cheerio.load(response.data);
        
        console.log('--- Printing stats rows ---');
        $('div.statsRow, .mainStats, .statRow, .statistics-graph').each((i, el) => {
            console.log(`Row ${i}:`, $(el).text().trim().replace(/\s+/g, ' '));
        });
        
        // Let's dump all divs under statsDiv
        console.log('--- Listing classes of divs inside .statsDiv ---');
        $('.statsDiv div').each((i, el) => {
            console.log(`Div ${i}: class="${$(el).attr('class')}" id="${$(el).attr('id')}" text="${$(el).text().trim().replace(/\s+/g, ' ').substring(0, 100)}"`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
