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
    
    // Check first match structure
    const firstMatch = $m('.ajax-match-item').eq(0);
    console.log('=== First Match HTML ===');
    console.log(firstMatch.html());
    
    // Check for live indicators
    const allMatches = $m('.ajax-match-item');
    console.log(`\nTotal matches found: ${allMatches.length}`);
    
    // Sample a few
    allMatches.slice(0, 3).each((i, el) => {
      const $el = $m(el);
      console.log(`\nMatch ${i+1}:`);
      console.log('  Classes:', $el.attr('class'));
      console.log('  Has .live-match:', $el.hasClass('live-match'));
      console.log('  HTML:', $el.html().substring(0, 200));
    });
    
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
