const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/json,*/*'
    };
    
    // Test URLs that might match a league
    const urlsToTest = [
        `https://www.kooora.com/كرة-القدم/بطولة/دوري-روشن-السعودي/ea0h6cf3bhl698hkxhpulh2zz`,
        `https://www.kooora.com/كرة-القدم/دوري-روشن-السعودي/ea0h6cf3bhl698hkxhpulh2zz`,
        `https://www.kooora.com/بطولة/دوري-روشن-السعودي/ea0h6cf3bhl698hkxhpulh2zz`,
        `https://www.kooora.com/كرة-القدم/ea0h6cf3bhl698hkxhpulh2zz`
    ];

    for (const url of urlsToTest) {
        console.log('Testing:', url);
        try {
            const r = await axios.get(encodeURI(url), { headers: HEADERS, maxRedirects: 0 });
            console.log('Status:', r.status);
            // If it returns HTML, check if it's the 404 page or actual page
            const html = r.data.substring(0, 500);
            if (html.includes('404')) console.log('Looks like 404 page');
            else console.log('Success!');
        } catch(e) {
            console.log('Error:', e.response?.status || e.message);
            if (e.response?.status === 301 || e.response?.status === 308) {
                console.log('Redirect to:', e.response.headers.location);
            }
        }
    }
}
main();
