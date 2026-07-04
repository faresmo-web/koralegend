const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ysscores.com/ar';

(async () => {
  try {
    // Get session
    let r = await axios.get(`${BASE_URL}/index`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
      responseType: 'arraybuffer'
    });
    const html = Buffer.from(r.data).toString('utf-8');
    const $ = cheerio.load(html);
    const sessionToken = $('meta[name="_token"]').attr('content') || '';
    const cookies = r.headers['set-cookie'];
    const sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    
    // Fetch today's matches
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
    const formData = new URLSearchParams();
    formData.append('get_date', today);
    formData.append('favorite_status', 'champ_display');
    formData.append('match_status', '1');
    formData.append('order_status', '1');
    formData.append('clear_c', 'yes');

    r = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-CSRF-Token': sessionToken,
        'Cookie': sessionCookie,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${BASE_URL}/index`,
        'Accept-Language': 'ar,en;q=0.9',
      },
      timeout: 15000,
      responseType: 'arraybuffer'
    });

    const matchHtml = Buffer.from(r.data).toString('utf-8');
    const $m = cheerio.load(matchHtml);
    
    const allMatches = $m('.ajax-match-item');
    console.log(`Total matches: ${allMatches.length}\n`);
    
    let liveCount = 0;
    allMatches.each((i, el) => {
      const $el = $m(el);
      const hasLiveClass = $el.hasClass('live-match');
      const hasLiveIcon = $el.find('.live-icon, .live-label').length > 0;
      const isLive = hasLiveClass || hasLiveIcon;
      
      if (i < 5) {
        console.log(`Match ${i+1}:`);
        console.log(`  hasLiveClass: ${hasLiveClass}`);
        console.log(`  hasLiveIcon: ${hasLiveIcon}`);
        console.log(`  isLive: ${isLive}`);
        console.log(`  Classes: ${$el.attr('class')}`);
      }
      
      if (isLive) {
        liveCount++;
        const homeTeam = $el.attr('home_name') || '?';
        const awayTeam = $el.attr('away_name') || '?';
        console.log(`Live: ${homeTeam} vs ${awayTeam}`);
      }
    });
    
    console.log(`\nTotal live matches: ${liveCount}`);
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
