const axios = require('axios');
const fs = require('fs');

async function downloadESPN() {
  const r = await axios.get('https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=705199');
  fs.writeFileSync('espn-summary.json', JSON.stringify(r.data, null, 2));
}
downloadESPN();
