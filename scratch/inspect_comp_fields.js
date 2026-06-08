const axios = require('axios');

const BASE_API = 'https://webws.365scores.com/web/games/current/';

async function test() {
    try {
        const res = await axios.get(BASE_API, {
            params: {
                appTypeId: 5,
                langId: 27,
                timezoneName: 'Africa/Cairo',
                userCountryId: 176,
                sports: 1,
                startDate: '20-05-2026',
                endDate: '20-05-2026',
            },
            timeout: 5000
        });
        
        const data = res.data;
        if (data.competitions && data.competitions.length > 0) {
            console.log("=== First 5 Competitions ===");
            console.log(JSON.stringify(data.competitions.slice(0, 5), null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
