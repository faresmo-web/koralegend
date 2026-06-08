const fs = require('fs');
const content = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');

const term = 'مدرب';
const idx = content.indexOf(term);
if (idx !== -1) {
    console.log(content.slice(idx - 200, idx + 800));
} else {
    console.log('Term not found');
}
