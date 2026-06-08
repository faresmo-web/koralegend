const axios = require('axios');
async function test() {
  try {
    const r = await axios.get('https://api.sofascore.com/api/v1/sport/football/scheduled-events/2026-05-20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/'
      }
    });
    console.log('Events:', r.data.events?.length);
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
