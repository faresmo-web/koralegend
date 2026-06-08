const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    const relativeUrl = '/epl/2968/match/110519/%d8%a8%d9%88%d8%b1%d9%86%d9%85%d9%88%d8%ab-%d9%85%d8%a7%d9%86%d8%b4%d8%b3%d8%aa%d8%b1-%d8%b3%d9%8a%d8%aa%d9%8a-%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d8%a5%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a';
    const url = `https://www.yallakora.com${relativeUrl}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        
        console.log('--- Scanning all script tags for ajax/fetch/url ---');
        $('script').each((i, el) => {
            const html = $(el).html();
            if (html && (html.includes('ajax') || html.includes('get') || html.includes('url') || html.includes('squad') || html.includes('stats'))) {
                // If it contains ajax count or something interesting
                if (html.includes('MatchCenter') || html.includes('/match') || html.includes('squad') || html.includes('stats') || html.includes('details')) {
                    console.log(`Script index ${i}: length=${html.length}`);
                    console.log(html);
                    console.log('==================================================');
                }
            }
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
