const axios = require('axios');

async function test() {
  // Test if kooora's _next/data JSON endpoint respects the date parameter
  // First get the buildId
  const home = await axios.get('https://m.kooora.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buildId = home.data.match(/"buildId":"([^"]+)"/)[1];
  console.log('Build ID:', buildId);

  // Construct the Next.js data API URL for the matches page
  const encodedPath = '%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85';
  
  for (const d of ['2026-05-19', '2026-05-20', '2026-05-21']) {
    const url = `https://m.kooora.com/_next/data/${buildId}/${encodedPath}.json?date=${d}`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = r.data?.pageProps?.data || [];
    const count = data.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
    const firstDate = data[0]?.matches?.[0]?.startDate;
    console.log(`${d} -> ${count} matches, first startDate: ${firstDate}`);
  }
}
test();
