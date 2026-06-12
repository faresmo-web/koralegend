const fs = require('fs');

const data = JSON.parse(fs.readFileSync('ys_lineup_response.json', 'utf-8'));
console.log('Keys:', Object.keys(data));
if (data.lineup) {
    const teamIds = Object.keys(data.lineup);
    console.log('Team IDs in lineup:', teamIds);
    for (const id of teamIds) {
        console.log(`--- Team ${id} ---`);
        const positions = Object.keys(data.lineup[id]);
        console.log('Positions:', positions);
        for (const pos of positions) {
            const players = data.lineup[id][pos];
            const indices = Object.keys(players);
            console.log(`Position ${pos} has indices:`, indices);
            const firstPlayer = players[indices[0]];
            console.log(`Sample player for ${pos}:`, JSON.stringify(firstPlayer, null, 2));
        }
    }
}
