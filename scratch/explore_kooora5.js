const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

async function get(url) {
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return r.data;
}

(async () => {
    // Get match detail page __NEXT_DATA__
    const matchPage = await get('https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/%D9%81%D8%B1%D8%A7%D9%8A%D8%A8%D9%88%D8%B1%D8%AC-%D8%B6%D8%AF-%D8%A3%D8%B3%D8%AA%D9%88%D9%86-%D9%81%D9%8A%D9%84%D8%A7/2Op6fM0M_itShCoOB9azR');
    const nd = JSON.parse(matchPage.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)[1]);
    const data = nd.props.pageProps.data;

    // Print match structure
    console.log('=== MATCH OBJECT ===');
    console.log(JSON.stringify(data.match, null, 2).substring(0, 3000));

    console.log('\n=== TABS INFO ===');
    console.log(JSON.stringify(data.tabsInfo, null, 2).substring(0, 1000));

    console.log('\n=== TV CHANNELS ===');
    console.log(JSON.stringify(data.tvChannels, null, 2).substring(0, 500));

    // Find a finished match with events/stats
    console.log('\n\n=== FINDING FINISHED MATCH ===');
    const home = await get('https://www.kooora.com/');
    const buildId = home.match(/"buildId":"([^"]+)"/)[1];
    const BASE = `https://www.kooora.com/_next/data/${buildId}`;

    // Get yesterday matches
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];
    const yData = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${yDate}`);
    const ynd = JSON.parse(yData.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)[1]);
    const comps = ynd.props.pageProps.data || [];

    // Find a finished match
    let finishedMatch = null;
    for (const comp of comps) {
        for (const m of (comp.matches || [])) {
            if (m.status === 'RESULT' && m.link?.slug && m.link?.id) {
                finishedMatch = m;
                break;
            }
        }
        if (finishedMatch) break;
    }

    if (finishedMatch) {
        console.log('Found finished match:', finishedMatch.teamA?.name, 'vs', finishedMatch.teamB?.name);
        console.log('Score:', finishedMatch.score?.teamA, '-', finishedMatch.score?.teamB);
        const slug = encodeURIComponent(finishedMatch.link.slug);
        const id = finishedMatch.link.id;
        const detailPage = await get(`https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${id}`);
        const dnd = JSON.parse(detailPage.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)[1]);
        const ddata = dnd.props.pageProps.data;
        console.log('\nFinished match data keys:', Object.keys(ddata));
        console.log('\nMatch object:');
        console.log(JSON.stringify(ddata.match, null, 2).substring(0, 3000));
    }
})();
