const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'matches-data.js'), 'utf-8');
const start = content.indexOf('{');
const db = JSON.parse(content.slice(start));

const dates = ['today', 'yesterday', 'tomorrow'];
let found = 0;

for (const lang of ['en', 'ar']) {
    for (const date of dates) {
        const matches = db[lang]?.[date] || [];
        for (const m of matches) {
            const combined = JSON.stringify(m);
            if (combined.toLowerCase().includes('pen') || combined.includes('ترجيح') || combined.includes('جزاء')) {
                console.log(`Found candidate match in matches-data.js: ${m.homeTeam} vs ${m.awayTeam} | status: ${m.status} | score: ${m.homeScore}-${m.awayScore}`);
                console.log(JSON.stringify(m, null, 2));
                found++;
            }
        }
    }
}
console.log('Total candidates found:', found);
