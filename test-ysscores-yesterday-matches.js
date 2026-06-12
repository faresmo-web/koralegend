const ysscores = require('./ysscores');

async function test() {
    try {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yesterdayStr = d.toISOString().split('T')[0];
        console.log('Yesterday:', yesterdayStr);
        const matches = await ysscores.fetchMatchesForDate(yesterdayStr, 'yesterday');
        console.log(`Found ${matches.length} matches.`);
        for (const m of matches) {
            console.log(`- ID: ${m.id}, League: ${m.league}, Teams: ${m.homeTeam} vs ${m.awayTeam}, Status: ${m.status}, isLive: ${m.isLive}, isFinished: ${m.isFinished}`);
        }
    } catch(e) {
        console.error(e);
    }
}
test();
