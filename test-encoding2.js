const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ysscores.com/ar';

async function checkEncoding() {
    try {
        const rIndex = await axios.get(`${BASE_URL}/index`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'arraybuffer'
        });
        
        const buf = Buffer.from(rIndex.data);
        const utf8 = buf.toString('utf-8');
        const $index = cheerio.load(utf8);
        
        const sessionToken = $index('meta[name="_token"]').attr('content') || '';
        const cookies = rIndex.headers['set-cookie'];
        const sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

        const todayStr = new Date().toISOString().split('T')[0];
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
                'Accept-Encoding': 'identity'  // no compression to rule out decompression issues
            },
            responseType: 'arraybuffer'
        });
        
        const postBuf = Buffer.from(r.data);
        const postUtf8 = postBuf.toString('utf-8');
        const $ = cheerio.load(postUtf8);
        
        // Check attributes specifically
        const firstItem = $('.ajax-match-item').first();
        console.log('home_name raw attr:', firstItem.attr('home_name'));
        console.log('away_name raw attr:', firstItem.attr('away_name'));
        
        // Try parsing the raw buffer as latin1 then decode
        const postLatin1 = postBuf.toString('latin1');
        const $latin = cheerio.load(postLatin1);
        const firstLatin = $latin('.ajax-match-item').first();
        console.log('home_name (latin1):', firstLatin.attr('home_name'));
        
        // Check league name
        console.log('League UTF8:', $('a.champ-title b').first().text().trim());
        console.log('League Latin1:', $latin('a.champ-title b').first().text().trim());
        
        // Print raw bytes of "home_name" attr
        const rawAttr = firstItem.attr('home_name');
        if (rawAttr) {
            const bytes = Buffer.from(rawAttr, 'utf-8');
            console.log('home_name bytes:', bytes.slice(0, 20));
        }
    } catch(e) {
        console.error(e.message);
    }
}
checkEncoding();
