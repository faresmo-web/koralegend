const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

async function testDate(dateStr) {
    const url = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${dateStr}`;
    const r = await axios.get(url, { headers: H, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    const d = JSON.parse(m[1]);
    const comps = d?.props?.pageProps?.data || [];
    const totalMatches = comps.reduce((s, c) => s + (c.matches?.length || 0), 0);
    console.log(`Date ${dateStr}: ${comps.length} leagues, ${totalMatches} matches`);
    if (comps[0]) console.log('  First league:', comps[0]?.competition?.name, '| First match:', comps[0]?.matches?.[0]?.teamA?.name, 'vs', comps[0]?.matches?.[0]?.teamB?.name);
}

async function main() {
    await testDate('2026-05-19');
    await testDate('2026-05-20');
    await testDate('2026-05-21');
}
main().catch(console.error);
