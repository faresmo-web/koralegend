const axios = require('axios');
async function test() {
  try {
    const r = await axios.get('https://api.filgoal.com/api/api/Matches?Date=2026-05-20', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('Filgoal events:', r.data.length);
    if(r.data.length > 0) {
      console.log('First:', r.data[0].HomeTeamName, 'vs', r.data[0].AwayTeamName, '(', r.data[0].ChampionshipName, ')');
    }
  } catch(e) { console.log('Error:', e.message); }
}
test();
