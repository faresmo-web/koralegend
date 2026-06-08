const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  for (const dateStr of ['2026-05-19', '2026-05-20', '2026-05-21']) {
    try {
      const parts = dateStr.split('-');
      const d = parts[2];
      const m = parts[1];
      const y = parts[0];
      const url = `https://www.kooora.com/?region=-1&area=0&d=${d}&m=${m}&y=${y}`;
      const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
      console.log(`${dateStr} html length:`, r.data.length);
      const match = r.data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
      if (match) {
        const nd = JSON.parse(match[1]);
        const data = nd.props?.pageProps?.data || [];
        const count = data.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
        console.log(`  -> ${count} matches found in Next_Data`);
      } else {
        console.log('  -> No NEXT_DATA');
      }
    } catch(e) { console.log('Error:', e.message); }
  }
}
test();
