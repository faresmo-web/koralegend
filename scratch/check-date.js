const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/json,*/*'
    };
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html = Buffer.from(r0.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    if (!m) return console.log('No build id');
    const buildId = m[1];
    
    try {
        const urlY = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%A7%D9%85%D8%B3.json`;
        const rY = await axios.get(urlY, { headers: HEADERS });
        console.log('Yesterday (الامس):', Object.keys(rY.data.pageProps.data).length);
    } catch(e) { console.log('Yesterday error:', e.message); }

    try {
        const urlT = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%BA%D8%AF.json`;
        const rT = await axios.get(urlT, { headers: HEADERS });
        console.log('Tomorrow (الغد):', Object.keys(rT.data.pageProps.data).length);
    } catch(e) { console.log('Tomorrow error:', e.message); }
}
main().catch(console.error);
