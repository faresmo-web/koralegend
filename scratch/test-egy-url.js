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

    // Test the correct Egyptian league URL (correct ID from live page)
    const id = '8k1xcsyvxapl4jlsluh3eomre';
    const slug = 'الدوري-المصري-الممتاز';
    const url = `https://www.kooora.com/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/${encodeURIComponent(slug)}/${id}.json`;
    console.log('Trying URL:', url);

    try {
        const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });
        const data = r.data.pageProps?.data;
        console.log('SUCCESS! Keys:', Object.keys(data));
        const ss = data.summaryStandings;
        console.log('\nsummaryStandings type:', typeof ss, Array.isArray(ss));
        if (ss) {
            console.log('summaryStandings keys:', Object.keys(ss));
            if (ss.tables) console.log('tables[0] keys:', Object.keys(ss.tables[0]));
            if (ss.tables?.[0]?.rankings) console.log('rankings[0]:', JSON.stringify(ss.tables[0].rankings[0]).substring(0,200));
        }
        
        const tp = data.tabsInfoTopPlayers;
        console.log('\ntabsInfoTopPlayers type:', typeof tp, Array.isArray(tp));
        if (tp) console.log('topPlayers keys:', Object.keys(tp));
        if (tp?.goals) console.log('goals[0] keys:', Object.keys(tp.goals[0] || {}));
    } catch(e) {
        console.log('Failed:', e.response?.status, e.message);
    }
}
main().catch(console.error);
