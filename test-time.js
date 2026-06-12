const { fetchMatchesForDate } = require('./ysscores');

async function run() {
    const d = new Date();
    const dateStr = d.toISOString().split('T')[0];
    const matches = await fetchMatchesForDate(dateStr, 'اليوم');
    console.log(`Found ${matches.length} matches for today.`);
    
    // Pick the first 3 matches that are not finished
    const upcoming = matches.filter(m => !m.isFinished).slice(0, 5);
    upcoming.forEach(m => {
        console.log(`${m.homeTeam} vs ${m.awayTeam} | Time: "${m.time}" | Status: ${m.statusAr}`);
    });
}
run();
