const ysscores = require('./ysscores.js');

(async () => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  console.log('Date in Cairo:', today);
  
  const matches = await ysscores.fetchMatchesForDate(today, 'today');
  console.log('Total matches:', matches.length);
  
  const live = matches.filter(m => m.isLive);
  console.log('Live matches:', live.length);
  
  console.log('\n--- First 10 matches ---');
  matches.slice(0, 10).forEach(m => {
    console.log(`${m.homeTeam} vs ${m.awayTeam} | isLive: ${m.isLive} | time: ${m.time} | status: ${m.status}`);
  });
  
  if (live.length > 0) {
    console.log('\n--- Live matches ---');
    live.forEach(m => {
      console.log(`${m.homeTeam} vs ${m.awayTeam} | time: ${m.time}`);
    });
  }
})().catch(e => console.error('Error:', e.message));
