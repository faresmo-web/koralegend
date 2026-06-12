const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ysscores.com/ar';

async function test() {
    try {
        const ysscores = require('./ysscores');
        await ysscores.fetchMatchesForDate('2026-06-11', 'yesterday');
        
        // Let's manually fetch the yesterday URL to inspect the exact html returned.
        const token = ysscores.__token || ''; // wait, how do we access sessionToken? Let's check session token from index.
        const rIndex = await axios.get(`${BASE_URL}/index`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'arraybuffer'
        });
        const htmlIndex = Buffer.from(rIndex.data).toString('utf-8');
        const $index = cheerio.load(htmlIndex);
        const sessionToken = $index('meta[name="_token"]').attr('content') || '';
        const cookies = rIndex.headers['set-cookie'];
        const sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

        const formData = new URLSearchParams();
        formData.append('get_date', '2026-06-11');
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
            },
            responseType: 'arraybuffer'
        });
        const html = Buffer.from(r.data).toString('utf-8');
        fs.writeFileSync('yesterday_matches.html', html, 'utf-8');
        console.log('Saved yesterday_matches.html');

        const $ = cheerio.load(html);
        $('.ajax-match-item').each((i, matchEl) => {
            const id = $(matchEl).attr('match_id') || '';
            const homeTeam = $(matchEl).attr('home_name') || '';
            const awayTeam = $(matchEl).attr('away_name') || '';
            const resultWrap = $(matchEl).find('.result-wrap');
            console.log(`Match ${id}: ${homeTeam} vs ${awayTeam}`);
            console.log(`  HTML of result-wrap:`, resultWrap.html().trim().replace(/\s+/g, ' '));
        });
    } catch (e) {
        console.error(e);
    }
}
test();
