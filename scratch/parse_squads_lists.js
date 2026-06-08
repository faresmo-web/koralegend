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
        
        console.log('--- Printing main structural blocks inside .timeline.squad ---');
        // Let's print out children of .formationDtls
        $('.formationDtls').children().each((i, el) => {
            console.log(`Element ${i}: tag=${el.tagName} class="${$(el).attr('class')}"`);
        });
        
        // Let's print out the HTML of the first `.formation` div
        console.log('--- HTML of first .formation ---');
        console.log($('.formation').first().html().substring(0, 2000));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
