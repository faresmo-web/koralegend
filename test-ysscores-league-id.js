const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    try {
        const url = 'https://www.ysscores.com/ar/match/4667751/Mexico-vs-South-Africa';
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(res.data);
        console.log('match_league val:', $('#match_league').val());
        console.log('All inputs starting with match_:');
        $('input').each((i, el) => {
            const id = $(el).attr('id');
            const val = $(el).val();
            if (id && id.startsWith('match_')) {
                console.log(`- ${id} = ${val}`);
            }
        });
    } catch (e) {
        console.error(e);
    }
}
test();
