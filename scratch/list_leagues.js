const fs = require('fs');
const code = fs.readFileSync('matches-data.js', 'utf-8');
const regex = /"league":\s*"([^"]+)"/g;
let match;
const leagues = new Set();
while ((match = regex.exec(code)) !== null) {
    leagues.add(match[1]);
}
console.log([...leagues].join('\n'));
