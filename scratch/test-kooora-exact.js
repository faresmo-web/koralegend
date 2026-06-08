const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/json,*/*'
    };
    try {
        const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS });
        const buildId = r0.data.match(/"buildId":"([^"]+)"/)[1];
        
        const slug = 'دوري-روشن-السعودي';
        const id = 'ea0h6cf3bhl698hkxhpulh2zz';
        
        const jsonUrl = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/${encodeURIComponent(slug)}/${id}.json`;
        
        console.log('Fetching:', jsonUrl);
        const r = await axios.get(jsonUrl, { headers: HEADERS });
        console.log('Keys:', Object.keys(r.data?.pageProps?.data || {}));
        const data = r.data?.pageProps?.data;
        if(data && data.tabsInfo) {
            console.log('Tabs:', data.tabsInfo.tabs.map(t => t.name).join(', '));
        }
        
    } catch(e) {
        console.log('Error:', e.response?.status || e.message);
    }
}
main();
