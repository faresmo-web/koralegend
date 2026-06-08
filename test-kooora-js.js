const axios = require('axios');
async function test() {
  const r = await axios.get('https://www.kooora.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = r.data;
  // find the JS files
  const jsFiles = html.match(/src="(\/_next\/static\/chunks\/pages\/[^\"]+\.js)"/g) || [];
  console.log('JS Files:', jsFiles);
}
test();
