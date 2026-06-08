const axios = require('axios');

async function testDates() {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
    
    const fmt = (date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const fetchGames = async (dStr) => {
        const url = 'https://webws.365scores.com/web/games/allscores/';
        const res = await axios.get(url, {
            params: {
                appTypeId: 5, langId: 1, timezoneName: 'Africa/Cairo',
                userCountryId: 176, sports: 1,
                startDate: dStr, endDate: dStr
            }
        });
        const firstStart = res.data.games && res.data.games[0] ? res.data.games[0].startTime : null;
        return { count: res.data.games ? res.data.games.length : 0, firstStart };
    };

    const yd = fmt(yesterday);
    const td = fmt(today);
    const tm = fmt(tomorrow);

    const ydData = await fetchGames(yd);
    const tdData = await fetchGames(td);
    const tmData = await fetchGames(tm);

    console.log(`Yesterday ${yd}: ${ydData.count} matches, First start: ${ydData.firstStart}`);
    console.log(`Today ${td}: ${tdData.count} matches, First start: ${tdData.firstStart}`);
    console.log(`Tomorrow ${tm}: ${tmData.count} matches, First start: ${tmData.firstStart}`);
}
testDates();
