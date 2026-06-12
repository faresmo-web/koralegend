const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const url = 'https://www.ysscores.com/ar/get_league_rank?match_code=4667751';
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        fs.writeFileSync(path.join(__dirname, 'rank_response.json'), JSON.stringify(res.data, null, 2), 'utf-8');
        console.log('Saved rank_response.json successfully.');
    } catch (e) {
        console.error(e);
    }
}
test();
