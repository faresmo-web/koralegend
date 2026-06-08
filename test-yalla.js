const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  try {
    const url = 'https://www.yallakora.com/match-center/%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA?date=5/20/2026';
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(r.data);
    const matches = [];
    $('.matchCard').each((i, el) => {
      const league = $(el).find('.title h2').text().trim();
      $(el).find('.item').each((j, matchEl) => {
        const home = $(matchEl).find('.teamA p').text().trim();
        const away = $(matchEl).find('.teamB p').text().trim();
        const score = $(matchEl).find('.matchResult span').map((idx, s) => $(s).text().trim()).get().join('-');
        const time = $(matchEl).find('.matchTime').text().trim();
        matches.push(`${league}: ${home} ${score} ${away} @ ${time}`);
      });
    });
    console.log(`Found ${matches.length} matches on Yallakora`);
    console.log(matches.slice(0, 15).join('\n'));
  } catch(e) { console.log('Error:', e.message); }
}
test();
