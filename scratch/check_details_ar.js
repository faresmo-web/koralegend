const axios = require('axios');

const TIMEZONE     = 'Africa/Cairo';
const COUNTRY_ID   = 176;
const LANG_ID      = 27; // Arabic
const APP_TYPE_ID  = 5;
const BASE_API     = 'https://webws.365scores.com/web';

const HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'application/json, text/plain, */*',
    'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
    'Origin':          'https://www.365scores.com',
    'Referer':         'https://www.365scores.com/',
};

async function test() {
    const gameId = '4690209'; // Boca Juniors vs Cruzeiro (or any other game ID)
    const params = {
        langId:        LANG_ID,
        timezoneName:  TIMEZONE,
        userCountryId: COUNTRY_ID,
        gameId,
    };

    try {
        const res = await axios.get(`${BASE_API}/gameStats/`, { headers: HEADERS, params, timeout: 10000 });
        const data = res.data;
        console.log("=== Stats response ===");
        if (data && data.game && data.game.gameStats) {
            console.log(JSON.stringify(data.game.gameStats.slice(0, 5), null, 2));
        } else {
            console.log("No stats found for game:", gameId);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
