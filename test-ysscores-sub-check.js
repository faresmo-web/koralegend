const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ys_yesterday_lineup.json', 'utf-8'));
const homeTeamId = data.info?.home_team;
const homeSubs = data.substitutions?.[homeTeamId];
console.log('JSON slice of homeSubs:', JSON.stringify(homeSubs).slice(0, 1000));
