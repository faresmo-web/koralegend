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
        console.log("=== Root Keys ===");
        console.log(Object.keys(data).join(', '));
        
        if (data.countries) {
            console.log("=== Countries Array Sample ===");
            console.log(data.countries.slice(0, 10));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
