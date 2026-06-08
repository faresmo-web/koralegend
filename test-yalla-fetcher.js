const axios = require('axios');
const cheerio = require('cheerio');

async function fetchYallakora(dateStr) {
  // dateStr format: YYYY-MM-DD -> M/D/YYYY
  const d = new Date(dateStr);
  const yDate = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
  const url = `https://www.yallakora.com/match-center/%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA?date=${yDate}`;
  
  try {
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const $ = cheerio.load(r.data);
    const matches = [];
    
    $('.matchCard').each((i, el) => {
      const league = $(el).find('.title h2').text().trim();
      $(el).find('.item').each((j, matchEl) => {
        const home = $(matchEl).find('.teamA p').text().trim();
        const away = $(matchEl).find('.teamB p').text().trim();
        const scoreSpans = $(matchEl).find('.matchResult span').map((idx, s) => $(s).text().trim()).get();
        let homeScore = null, awayScore = null;
        if (scoreSpans.length >= 3 && scoreSpans[0] !== '-' && scoreSpans[2] !== '-') {
          homeScore = parseInt(scoreSpans[0]);
          awayScore = parseInt(scoreSpans[2]);
        }
        const time = $(matchEl).find('.matchTime').text().trim();
        let status = $(matchEl).find('.matchStatus').text().trim() || 'Upcoming';
        
        // Map status
        let statusAr = 'قادمة';
        let isLive = false, isFinished = false;
        if ($(matchEl).hasClass('finish')) { statusAr = 'انتهت'; isFinished = true; }
        else if ($(matchEl).hasClass('now')) { statusAr = 'مباشر'; isLive = true; }
        
        matches.push({
          id: `yk_${Math.random().toString(36).substr(2, 9)}`,
          league, leagueLogo: '', countryName: 'Arab',
          homeTeam: home, awayTeam: away, homeLogo: '', awayLogo: '',
          homeScore, awayScore, time, status: statusAr, statusAr, isLive, isFinished,
          date: dateStr, startTime: ''
        });
      });
    });
    return matches;
  } catch(e) {
    console.error('Yallakora error:', e.message);
    return [];
  }
}

fetchYallakora('2026-05-20').then(res => console.log(res.length, 'matches found on Yallakora. First:', res[0]));
