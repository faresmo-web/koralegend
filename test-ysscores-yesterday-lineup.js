const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const lineupUrl = 'https://www.ysscores.com/ar/match_lineup?match_code=4667751';
        console.log(`Fetching lineup from: ${lineupUrl}`);
        const r = await axios.get(lineupUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.ysscores.com/ar/index',
                'X-Requested-With': 'XMLHttpRequest',
            },
            timeout: 10000
        });

        console.log('Lineup Response keys:', Object.keys(r.data));
        fs.writeFileSync('ys_yesterday_lineup.json', JSON.stringify(r.data, null, 2), 'utf-8');
        console.log('Saved ys_yesterday_lineup.json');
        
        if (r.data.substitutions) {
            console.log('Substitutions keys:', Object.keys(r.data.substitutions));
        } else {
            console.log('NO substitutions key found in finished match response.');
        }
    } catch (e) {
        console.error(e);
    }
}
test();
