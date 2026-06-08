const axios = require('axios');

// Test ESPN API with explicit dates for different leagues
async function test() {
  const leagues = ['eng.1','esp.1','ita.1','ger.1','fra.1','ksa.1','bra.1','arg.1','ned.1','por.1','tur.1','mex.1','usa.1','sco.1','gre.1','afc.champions','concacaf.league'];
  const dates = { yesterday: '20260520', today: '20260521', tomorrow: '20260522' };
  
  for (const [label, d] of Object.entries(dates)) {
    const results = await Promise.all(leagues.map(lid =>
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lid}/scoreboard?dates=${d}`)
        .then(r => ({ lid, count: r.data?.events?.length || 0 }))
        .catch(() => ({ lid, count: 0 }))
    ));
    const total = results.reduce((s, r) => s + r.count, 0);
    const found = results.filter(r => r.count > 0).map(r => `${r.lid}:${r.count}`);
    console.log(`${label} (${d}) -> ${total} matches from [${found.join(', ')}]`);
  }
}
test();
