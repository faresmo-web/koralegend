const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ysscores.com/ar';

async function testFetchMatchesAll() {
    try {
        const rIndex = await axios.get(`${BASE_URL}/index`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $index = cheerio.load(rIndex.data);
        const sessionToken = $index('meta[name="_token"]').attr('content') || '';
        const cookies = rIndex.headers['set-cookie'];
        const sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

        const formData = new URLSearchParams();
        const todayStr = new Date().toISOString().split('T')[0];
        formData.append('get_date', todayStr);
        formData.append('favorite_status', '0'); // 0 means ALL matches!
        formData.append('match_status', '0'); // 0 means ALL (1 was probably filtering too? let's see)
        formData.append('order_status', '0'); // 0
        formData.append('clear_c', 'yes');

        const r = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'X-CSRF-Token': sessionToken,
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/index`
            }
        });

        const $ = cheerio.load(r.data);
        const matchesCount = $('.ajax-match-item').length;
        console.log(`With favorite_status=0, match_status=0: ${matchesCount} matches`);

    } catch (e) {
        console.error(e.message);
    }
}
testFetchMatchesAll();
