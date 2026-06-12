const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://www.ysscores.com/ar';

async function test() {
    try {
        const ysscores = require('./ysscores');
        // Let's first ensure session
        const todayStr = new Date().toISOString().split('T')[0];
        const matches = await ysscores.fetchMatchesForDate(todayStr, 'today');
        if (matches.length === 0) {
            console.log('No matches found today.');
            return;
        }
        // Let's find one match code
        const match = matches[0];
        console.log(`Using match: ${match.homeTeam} vs ${match.awayTeam}, code: ${match.id}`);

        // Try fetching lineup API
        const lineupUrl = `${BASE_URL}/match_lineup?match_code=${match.id}`;
        console.log(`Fetching lineup from: ${lineupUrl}`);
        const r = await axios.get(lineupUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': `${BASE_URL}/index`,
                'X-Requested-With': 'XMLHttpRequest',
            },
            timeout: 10000
        });

        console.log('Lineup Response Status:', r.status);
        console.log('Lineup Response keys:', Object.keys(r.data));
        fs.writeFileSync('ys_lineup_response.json', JSON.stringify(r.data, null, 2), 'utf-8');
        console.log('Saved ys_lineup_response.json');
        
        // Print some of the keys under info, lineup, substitutions
        if (r.data.info) {
            console.log('Info:', r.data.info);
        }
        if (r.data.lineup) {
            console.log('Lineup teams:', Object.keys(r.data.lineup));
            for (const team of Object.keys(r.data.lineup)) {
                console.log(`Team ${team} lineup keys:`, Object.keys(r.data.lineup[team]));
            }
        }
    } catch (e) {
        console.error('Error in test:', e.message);
        if (e.response) {
            console.error('Response status:', e.response.status);
            console.error('Response data:', e.response.data);
        }
    }
}
test();
