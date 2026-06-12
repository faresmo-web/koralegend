const fs = require('fs');

const data = JSON.parse(fs.readFileSync('ys_yesterday_lineup.json', 'utf-8'));
if (data.substitutions) {
    const teamIds = Object.keys(data.substitutions);
    console.log('Team IDs in substitutions:', teamIds);
    for (const teamId of teamIds) {
        console.log(`--- Substitutions for team ${teamId} ---`);
        const subs = data.substitutions[teamId];
        console.log('Type of subs:', typeof subs);
        if (Array.isArray(subs)) {
            console.log('Is Array. Length:', subs.length);
            if (subs.length > 0) {
                console.log('Sample sub player:', JSON.stringify(subs[0], null, 2));
            }
        } else if (subs) {
            const keys = Object.keys(subs);
            console.log('Is Object. Keys:', keys);
            if (keys.length > 0) {
                console.log('Sample sub player:', JSON.stringify(subs[keys[0]], null, 2));
            }
        }
    }
}
