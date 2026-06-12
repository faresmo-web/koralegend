const http = require('http');
http.get('http://localhost:3000/api/matches?date=today', (res) => {
    let data = '';
    res.on('data', (c) => { data += c; });
    res.on('end', () => {
        const matches = JSON.parse(data).matches;
        const m = matches.find(x => x.id === '4667757');
        if (!m) {
            console.log('Match 4667757 not found. Available IDs:', matches.map(x => x.id));
            return;
        }
        console.log('Full match object keys:', Object.keys(m));
        console.log('time:', JSON.stringify(m.time));
        console.log('status:', JSON.stringify(m.status));
        console.log('statusAr:', JSON.stringify(m.statusAr));
        console.log('isLive:', m.isLive);
        console.log('isFinished:', m.isFinished);
        console.log('slug:', JSON.stringify(m.slug));
        console.log('homeScore:', m.homeScore);
        console.log('awayScore:', m.awayScore);
    });
}).on('error', e => console.error(e));
