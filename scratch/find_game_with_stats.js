const axios = require('axios');

const TIMEZONE     = 'Africa/Cairo';
const COUNTRY_ID   = 176;
const LANG_ID      = 27; // Arabic
const APP_TYPE_ID  = 5;
const SPORT_ID     = 1;
const BASE_API     = 'https://webws.365scores.com/web';

const HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'application/json, text/plain, */*',
    'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
    'Origin':          'https://www.365scores.com',
    'Referer':         'https://www.365scores.com/',
};

const formatDate365 = (date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
};

async function test() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = formatDate365(yesterday);
    const url = `${BASE_API}/games/current/`;
    const params = {
        appTypeId:    APP_TYPE_ID,
        langId:       LANG_ID,
        timezoneName: TIMEZONE,
        userCountryId: COUNTRY_ID,
        sports:       SPORT_ID,
        startDate:    dateStr,
        endDate:      dateStr,
    };

    try {
        const res = await axios.get(url, { headers: HEADERS, params, timeout: 15000 });
        const data = res.data;
        if (!data || !data.games) {
            console.log("No games found");
            return;
        }

        const finishedGames = data.games.filter(g => Number(g.statusGroup) === 4);
        console.log(`Checking ${finishedGames.length} finished games...`);

        for (const g of finishedGames) {
            const gameId = g.id;
            const detailsParams = {
                langId:        LANG_ID,
                timezoneName:  TIMEZONE,
                userCountryId: COUNTRY_ID,
                gameId,
            };

            try {
                const statsRes = await axios.get(`${BASE_API}/gameStats/`, { headers: HEADERS, params: detailsParams, timeout: 2000 });
                if (statsRes.data && statsRes.data.game && statsRes.data.game.gameStats) {
                    console.log(`\n🎉 Success! Game ID: ${gameId} (${g.homeCompetitor?.name} vs ${g.awayCompetitor?.name}) has stats:`);
                    console.log(JSON.stringify(statsRes.data.game.gameStats.slice(0, 3), null, 2));
                    break;
                }
            } catch (e) {
                // Ignore 404/errors and try next
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
