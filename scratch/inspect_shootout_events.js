const fs = require('fs');
let content = fs.readFileSync('scratch/psg_arsenal.json', 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const data = JSON.parse(content);
const allEvents = [];
const collect = (arr) => {
    if (!arr) return;
    for (const player of arr) {
        for (const ev of (player.events || [])) {
            allEvents.push({ player: player.name, ...ev });
        }
    }
};
collect(data.lineups?.teamA?.lineup);
collect(data.lineups?.teamA?.substitutes);
collect(data.lineups?.teamB?.lineup);
collect(data.lineups?.teamB?.substitutes);

console.log('--- ALL EVENTS COLLECTED ---');
allEvents.forEach(ev => {
    if (ev.__typename === 'MatchGoalEvent') {
        console.log(`Goal: Scorer=${ev.player} (or ${ev.scorer?.name}), Type=${ev.type}, Min=${ev.period?.minute}, Extra=${ev.period?.extra}, Score=${JSON.stringify(ev.score)}`);
    }
});
