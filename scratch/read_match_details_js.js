const axios = require('axios');

async function inspect() {
    const url = 'https://www.yallakora.com/Scripts/MatchDetails.js?ver=0.3';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    try {
        console.log('Fetching:', url);
        const response = await axios.get(url, { headers });
        console.log('--- MatchDetails.js content ---');
        console.log(response.data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
