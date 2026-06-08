const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    // Relative link we found:
    const relativeUrl = '/epl/2968/match/110519/%d8%a8%d9%88%d8%b1%d9%86%d9%85%d9%88%d8%ab-%d9%85%d8%a7%d9%86%d8%b4%d8%b3%d8%aa%d8%b1-%d8%b3%d9%8a%d8%aa%d9%8a-%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d8%a5%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a';
    const url = `https://www.yallakora.com${relativeUrl}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    try {
        console.log('Fetching:', url);
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        
        console.log('--- Document Title ---');
        console.log($('title').text().trim());
        
        console.log('--- Tabs / Navigation inside details page ---');
        $('nav, .tabs, .menu, .subNavigation').find('a').each((i, el) => {
            console.log(`Tab ${i}: href="${$(el).attr('href')}" text="${$(el).text().trim()}"`);
        });
        
        console.log('--- Printing main divs or containers ---');
        $('div').each((i, el) => {
            const className = $(el).attr('class');
            const id = $(el).attr('id');
            if (className && (className.includes('stats') || className.includes('squad') || className.includes('lineup') || className.includes('event') || className.includes('details'))) {
                console.log(`Div index ${i}: class="${className}" id="${id}" text_length=${$(el).text().trim().length}`);
            }
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
