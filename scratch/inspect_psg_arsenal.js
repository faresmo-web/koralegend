const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
};

(async () => {
    const slug = 'باريس-سان-جيرمان-ضد-آرسنال';
    const id = 'ugWugY2_bPeXkOmUCLC9s';
    const url = `https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${encodeURIComponent(slug)}/${id}`;
    
    const r = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!m) {
        console.log('__NEXT_DATA__ not found');
        return;
    }
    const nd = JSON.parse(m[1]);
    const matchObj = nd.props.pageProps.data.match;
    console.log(JSON.stringify(matchObj, null, 2));
})();
