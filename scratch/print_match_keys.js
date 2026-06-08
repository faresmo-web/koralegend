const fs = require('fs');
let content = fs.readFileSync('scratch/psg_arsenal.json', 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const data = JSON.parse(content);
console.log('Top level keys:', Object.keys(data));
console.log('Penalty:', data.penalty);
console.log('Agg:', data.agg);
console.log('HalfTime:', data.halfTime);
console.log('FullTime:', data.fullTime);
console.log('ExtraTime:', data.extraTime);
