const ysscores = require('./ysscores');

async function test() {
    const d = new Date().toISOString().split('T')[0];
    const matches = await ysscores.fetchMatchesForDate(d, 'today');
    const json = JSON.stringify(matches.slice(0, 2), null, 2);
    console.log(json);
}
test().catch(console.error);
