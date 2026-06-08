const axios = require('axios');
const headers = { 'User-Agent': 'Mozilla/5.0' };
async function test() {
  const dates = ['2026-05-19', '2026-05-20', '2026-05-21', '20260519', '19-05-2026'];
  for (const d of dates) {
    try {
      const url = 'https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date='+d;
      const r = await axios.get(url, {headers});
      const match = r.data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
      if (!match) continue;
      const nd = JSON.parse(match[1]);
      const data = nd.props?.pageProps?.data || [];
      console.log(d, data.reduce((acc, c) => acc + (c.matches?.length || 0), 0));
    } catch(e) { console.error(e.message); }
  }
}
test();
