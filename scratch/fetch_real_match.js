const axios = require('axios');

(async () => {
    const matchId = 'ugWugY2_bPeXkOmUCLC9s';
    const slug = 'باريس-سان-جيرمان-ضد-آرسنال';
    const url = `http://localhost:3001/api/details?id=${matchId}&slug=${encodeURIComponent(slug)}&koooraId=${matchId}&live=1`;
    
    console.log('Fetching live details from:', url);
    const r = await axios.get(url);
    console.log(JSON.stringify(r.data, null, 2));
})().catch(console.error);
