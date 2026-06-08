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
        
        console.log('--- Printing all script src attributes ---');
        $('script[src]').each((i, el) => {
            console.log(`Script src: ${$(el).attr('src')}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
