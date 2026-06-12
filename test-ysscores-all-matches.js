const ysscores = require('./ysscores');

async function test() {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const matches = await ysscores.fetchMatchesForDate(todayStr, 'today');
        console.log(`Found ${matches.length} matches.`);
        for (const m of matches) {
            console.log(`- ID: ${m.id}, League: ${m.league}, Teams: ${m.homeTeam} vs ${m.awayTeam}, Status: ${m.status}, isLive: ${m.isLive}, isFinished: ${m.isFinished}`);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
