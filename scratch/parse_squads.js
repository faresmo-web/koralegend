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
        
        console.log('--- Printing main elements inside #squad / squad response ---');
        // Let's print out the classes of the main divs/structures
        $('div').each((i, el) => {
            const className = $(el).attr('class');
            if (className && (className.includes('squad') || className.includes('formation') || className.includes('player') || className.includes('LineUp') || className.includes('substitutes') || className.includes('coach'))) {
                console.log(`Div ${i}: class="${className}" text="${$(el).text().trim().replace(/\s+/g, ' ').substring(0, 100)}"`);
            }
        });
        
        // Let's print out a snippet of the HTML structure of formations or lineups
        console.log('--- Printing raw HTML snippet of squads ---');
        console.log(response.data.substring(0, 2000));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
