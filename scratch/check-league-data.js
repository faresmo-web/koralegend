const axios = require('axios');
async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/json,*/*'
    };
    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html0 = Buffer.from(r0.data).toString('utf8');
    const buildId = html0.match(/"buildId":"([^"]+)"/)[1];

    const slug = 'دوري-روشن-السعودي';
    const id = 'ea0h6cf3bhl698hkxhpulh2zz';
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/${encodeURIComponent(slug)}/${id}.json`;
    const r = await axios.get(url, { headers: HEADERS });
    const data = r.data?.pageProps?.data;

    console.log('=== latestNews ===');
    const ln = data.latestNews;
    console.log(JSON.stringify(ln).substring(0, 1000));
    console.log('\n=== summaryStandings ===');
    const ss = data.summaryStandings;
    console.log(JSON.stringify(ss).substring(0, 1000));
    console.log('\n=== summaryMatches ===');
    const sm = data.summaryMatches;
    console.log(JSON.stringify(sm).substring(0, 1000));
    console.log('\n=== competition (teams?) ===');
    console.log(JSON.stringify(data.competition).substring(0, 500));
    console.log('\n=== teams ===');
    console.log(JSON.stringify(data.teams).substring(0, 500));
}
main().catch(console.error);
