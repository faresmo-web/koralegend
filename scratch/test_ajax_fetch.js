const axios = require('axios');

async function testFetch() {
    const matchId = '110519';
    const statsUrl = `https://www.yallakora.com/Match/EuroMatchStats2?matchID=${matchId}`;
    const squadUrl = `https://www.yallakora.com/Match/Matchsquad2?matchID=${matchId}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    try {
        console.log('Fetching stats from:', statsUrl);
        const statsResponse = await axios.post(statsUrl, {}, { headers });
        console.log('--- Stats HTML Length ---', statsResponse.data.length);
        console.log(statsResponse.data.substring(0, 1000));
        
        console.log('\nFetching squad from:', squadUrl);
        const squadResponse = await axios.post(squadUrl, {}, { headers });
        console.log('--- Squad HTML Length ---', squadResponse.data.length);
        console.log(squadResponse.data.substring(0, 1000));
    } catch (err) {
        console.error('Error fetching:', err.message);
    }
}

testFetch();
