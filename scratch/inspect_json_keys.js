const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/psg_arsenal.json', 'utf16le'));
console.log('Keys in match object:', Object.keys(data));
if (data.score) {
    console.log('Score:', data.score);
}
// Find any keys containing "pen" or "shootout" or "score" case-insensitively
const keys = [];
function findKeys(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
        const newPath = path ? `${path}.${k}` : k;
        if (k.toLowerCase().includes('pen') || k.toLowerCase().includes('shoot') || k.toLowerCase().includes('score') || k.includes('ترجيح')) {
            keys.push({ path: newPath, value: obj[k] });
        }
        if (typeof obj[k] === 'object') {
            findKeys(obj[k], newPath);
        }
    }
}
findKeys(data);
console.log('Found matching keys/paths:');
keys.forEach(x => {
    console.log(`- ${x.path}:`, JSON.stringify(x.value, null, 2));
});
