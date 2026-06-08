const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const r = await axios.get('https://www.yallakora.com/egyptian-league/2977/match/109939/%D8%A8%D9%8A%D8%B1%D8%A7%D9%85%D9%8A%D8%AF%D8%B2-%D8%B3%D9%85%D9%88%D8%AD%D8%A9-%D8%A7%D9%84%D8%AF%D9%88%D8%B1%D9%8A-%D8%A7%D9%84%D9%85%D8%B5%D8%B1%D9%8A');
  const $ = cheerio.load(r.data);
  // Events
  const events = [];
  $('.eventsList li').each((i, el) => {
    events.push($(el).text().trim().replace(/\s+/g, ' '));
  });
  console.log('Events:', events.slice(0, 5));
  
  // Stats
  const stats = [];
  $('.statsList li').each((i, el) => {
    stats.push($(el).text().trim().replace(/\s+/g, ' '));
  });
  console.log('Stats:', stats.length);
}
test();
