const axios = require('axios');

async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/json,*/*'
    };

    const r0 = await axios.get('https://www.kooora.com', { headers: HEADERS, responseType: 'arraybuffer' });
    const html = Buffer.from(r0.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    const buildId = m[1];

    const id = '8k1xcsyvxapl4jlsluh3eomre';
    const slug = 'الدوري-المصري-الممتاز';
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/${encodeURIComponent(slug)}/${id}.json`;

    const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const data = r.data.pageProps?.data;

    // Inspect summaryStandings fully
    console.log('\n=== summaryStandings ===');
    console.log(JSON.stringify(data.summaryStandings).substring(0, 800));

    console.log('\n=== tabsInfoTotalStandings ===');
    console.log(JSON.stringify(data.tabsInfoTotalStandings).substring(0, 800));

    console.log('\n=== tabsInfoTopPlayers.goals (first 2) ===');
    console.log(JSON.stringify((data.tabsInfoTopPlayers?.goals || []).slice(0,2)));
}
main().catch(console.error);
