const axios = require('axios');

const BASE_API = 'https://webws.365scores.com/web/games/current/';

async function checkLang(langId) {
    try {
        const res = await axios.get(BASE_API, {
            params: {
                appTypeId: 5,
                langId: langId,
                timezoneName: 'Africa/Cairo',
                userCountryId: 176,
                sports: 1,
                startDate: '20-05-2026',
                endDate: '20-05-2026',
            },
            timeout: 5000
        });
        
        const data = res.data;
        if (data && data.games && data.games.length > 0) {
            const game = data.games[0];
            const homeName = game.homeCompetitor?.name || '';
            const statusText = game.statusText || '';
            
            const hasArabic = /[\u0600-\u06FF]/.test(homeName) || /[\u0600-\u06FF]/.test(statusText);
            const hasHebrew = /[\u0590-\u05FF]/.test(homeName) || /[\u0590-\u05FF]/.test(statusText);
            
            console.log(`langId ${langId}: "${homeName}" | Status: "${statusText}" ${hasArabic ? '-> ARABIC!' : ''} ${hasHebrew ? '-> Hebrew' : ''}`);
            return hasArabic;
        }
    } catch (e) {
        // Skip errors
    }
    return false;
}

async function run() {
    console.log("Probing langId values from 26 to 60...");
    for (let i = 26; i <= 60; i++) {
        const isAr = await checkLang(i);
        if (isAr) {
            console.log(`\n🎉 Found Arabic langId: ${i}\n`);
        }
        await new Promise(r => setTimeout(r, 200));
    }
}

run();
