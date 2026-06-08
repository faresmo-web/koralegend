const axios = require('axios');
async function test() {
  const r1 = await axios.get('https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  let m1 = r1.data.match(/__NEXT_DATA__.*?({.*?})<\/script>/);
  if (m1) {
    const data = JSON.parse(m1[1]).props?.pageProps?.data || [];
    const count = data.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
    console.log('مباريات اليوم matches:', count);
  }

  const r2 = await axios.get('https://www.kooora.com/?region=-1&area=0', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  let m2 = r2.data.match(/__NEXT_DATA__.*?({.*?})<\/script>/);
  if (m2) {
    const data = JSON.parse(m2[1]).props?.pageProps?.data || [];
    const count = data.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
    console.log('region=-1&area=0 matches:', count);
  }
}
test();
