const axios = require('axios');
const fs = require('fs');

async function download() {
    try {
        const r1 = await axios.get('https://www.ysscores.com/app-js/lineup.js?v=20260504', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        fs.writeFileSync('ys_lineup_js.js', r1.data, 'utf-8');
        console.log('Saved ys_lineup_js.js');

        const r2 = await axios.get('https://www.ysscores.com/app-js/match_detail.js?v=20260504', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        fs.writeFileSync('ys_match_detail_js.js', r2.data, 'utf-8');
        console.log('Saved ys_match_detail_js.js');
    } catch (e) {
        console.error(e);
    }
}
download();
