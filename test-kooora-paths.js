const axios = require('axios');
async function test() {
  const home = await axios.get('https://m.kooora.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buildId = home.data.match(/"buildId":"([^"]+)"/)[1];
  console.log('Build ID:', buildId);
  const paths = [
    '%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%A3%D9%85%D8%B3',
    '%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%BA%D8%AF'
  ];
  for (const p of paths) {
    try {
      const r = await axios.get('https://m.kooora.com/_next/data/' + buildId + '/' + p + '.json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = r.data?.pageProps?.data || [];
      const count = data.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
      const firstDate = data[0]?.matches?.[0]?.startDate;
      console.log(decodeURIComponent(p) + ' -> ' + count + ' matches, start: ' + firstDate);
    } catch(e) {
      console.log(decodeURIComponent(p) + ' error:', e.response ? e.response.status : e.message);
    }
  }
}
test();
