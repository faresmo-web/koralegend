const axios = require('axios');
async function test() {
  const r = await axios.get('https://www.kooora.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const links = r.data.match(/href="([^"]+)"/g) || [];
  console.log(links.filter(h => h.includes('date=') || h.includes('matches')).slice(0, 20));
}
test();
