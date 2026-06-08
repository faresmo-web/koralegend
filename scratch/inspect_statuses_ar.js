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
    const todayStr = formatDate365(new Date());
    const url = `${BASE_API}/games/current/`;
    const params = {
        appTypeId:    APP_TYPE_ID,
        langId:       LANG_ID,
        timezoneName: TIMEZONE,
        userCountryId: COUNTRY_ID,
        sports:       SPORT_ID,
        startDate:    todayStr,
        endDate:      todayStr,
    };

    try {
        const res = await axios.get(url, { headers: HEADERS, params, timeout: 15000 });
        const data = res.data;
        if (!data || !data.games) {
            console.log("No games found");
            return;
        }

        const combinations = {};
        data.games.forEach(g => {
            const key = `sg: ${g.statusGroup} | text: "${g.statusText}"`;
            combinations[key] = (combinations[key] || 0) + 1;
        });

        console.log("=== Unique statusGroup and statusText combinations (Arabic) ===");
        Object.entries(combinations).forEach(([comb, count]) => {
            console.log(`${comb} -> occurred ${count} times`);
        });

    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
