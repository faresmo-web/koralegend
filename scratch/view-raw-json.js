const fs = require('fs');
const content = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');

// Find index of tabsInfoSquad
const idx = content.indexOf('tabsInfoSquad');
if (idx !== -1) {
    console.log(content.slice(idx - 50, idx + 1000));
} else {
    console.log('tabsInfoSquad not found in raw content');
}
