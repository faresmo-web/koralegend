const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const BASE_URL = 'https://www.ysscores.com/ar';

async function investigate() {
    try {
        const rIndex = await axios.get(`${BASE_URL}/index`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'arraybuffer'
        });
        
        // Check encoding
        const buf = Buffer.from(rIndex.data);
        const utf8Text = buf.toString('utf-8');
        const $index = cheerio.load(utf8Text);
        
        // Get token
        const sessionToken = $index('meta[name="_token"]').attr('content') || '';
        console.log('Token:', sessionToken ? 'OK' : 'MISSING');
        
        // Check content-type of response
        console.log('Content-Type:', rIndex.headers['content-type']);
        
        // Check cookies
        const cookies = rIndex.headers['set-cookie'];
        const sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
        
        const todayStr = new Date().toISOString().split('T')[0];
        console.log('Date:', todayStr);
        
        // Try with different params - champ_display means only favourite/important leagues
        // Let's try clearing it to get ALL matches
        const formData = new URLSearchParams();
        formData.append('get_date', todayStr);
        formData.append('favorite_status', 'champ_display');
        formData.append('match_status', '1');
        formData.append('order_status', '1');
        formData.append('clear_c', 'yes');

        const r = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'X-CSRF-Token': sessionToken,
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/index`,
                'Accept': 'text/html, */*; q=0.01',
                'Accept-Language': 'ar,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            responseType: 'arraybuffer'
        });
        
        console.log('POST Content-Type:', r.headers['content-type']);
        const postBuf = Buffer.from(r.data);
        const postText = postBuf.toString('utf-8');
        const $ = cheerio.load(postText);
        
        const matchCount = $('.ajax-match-item').length;
        const leagueCount = $('.matches-wrapper').length;
        console.log(`Matches: ${matchCount}, Leagues: ${leagueCount}`);
        
        // Print first league name to check encoding
        const firstLeague = $('a.champ-title b').first().text().trim();
        console.log('First league:', firstLeague);
        
        // Print first team names
        const firstHome = $('.ajax-match-item').first().attr('home_name');
        const firstAway = $('.ajax-match-item').first().attr('away_name');
        console.log('First match:', firstHome, 'vs', firstAway);
        
        // Save HTML for inspection
        require('fs').writeFileSync('post_response.html', postText, 'utf-8');
        console.log('Saved post_response.html');
        
    } catch (e) {
        console.error(e.message);
        if (e.response) console.error('Status:', e.response.status);
    }
}
investigate();
