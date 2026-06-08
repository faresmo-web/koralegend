const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer': 'https://www.kooora.com/',
    'Origin': 'https://www.kooora.com',
    'Content-Type': 'application/json',
};

const MATCH_ID = '2Op6fM0M_itShCoOB9azR';

// Try sportfeeds.io API (the CDN used by kooora)
async function trySportfeeds() {
    const endpoints = [
        `https://cdn.sportfeeds.io/soccer/api/match/${MATCH_ID}/lineups`,
        `https://cdn.sportfeeds.io/soccer/api/match/${MATCH_ID}/expected-lineups`,
        `https://cdn.sportfeeds.io/soccer/api/match/${MATCH_ID}/injuries`,
        `https://cdn.sportfeeds.io/soccer/api/match/${MATCH_ID}`,
        `https://cdn.sportfeeds.io/soccer/api/match?uuid=${MATCH_ID}`,
        `https://api.sportfeeds.io/soccer/match/${MATCH_ID}/lineups`,
    ];
    
    for (const url of endpoints) {
        try {
            const r = await axios.get(url, { headers: HEADERS, timeout: 8000 });
            console.log(`\n✅ ${url}`);
            console.log(JSON.stringify(r.data).substring(0, 1000));
        } catch(e) {
            console.log(`❌ ${url.split('/').slice(-2).join('/')}: ${e.response?.status || e.message}`);
        }
    }
}

// Try kooora's own API
async function tryKoooraAPI() {
    const endpoints = [
        `https://www.kooora.com/api/match/${MATCH_ID}/lineups`,
        `https://www.kooora.com/api/match/${MATCH_ID}/expected-lineups`,
        `https://www.kooora.com/api/match/${MATCH_ID}/injuries`,
        `https://www.kooora.com/api/v1/match/${MATCH_ID}`,
    ];
    
    for (const url of endpoints) {
        try {
            const r = await axios.get(url, { headers: HEADERS, timeout: 8000 });
            console.log(`\n✅ ${url}`);
            console.log(JSON.stringify(r.data).substring(0, 1000));
        } catch(e) {
            console.log(`❌ ${url.split('/').slice(-2).join('/')}: ${e.response?.status || e.message}`);
        }
    }
}

// Try GraphQL
async function tryGraphQL() {
    const gqlEndpoints = [
        'https://www.kooora.com/graphql',
        'https://api.kooora.com/graphql',
        'https://cdn.sportfeeds.io/graphql',
    ];
    
    const query = `{
        match(id: "${MATCH_ID}") {
            lineups { teamA { lineup { player { name } shirtNumber isSubstitute } } }
        }
    }`;
    
    for (const url of gqlEndpoints) {
        try {
            const r = await axios.post(url, { query }, { headers: HEADERS, timeout: 8000 });
            console.log(`\n✅ GraphQL ${url}`);
            console.log(JSON.stringify(r.data).substring(0, 1000));
        } catch(e) {
            console.log(`❌ GraphQL ${url}: ${e.response?.status || e.message}`);
        }
    }
}

// Check what JS chunks load the lineup data
async function checkJSChunks() {
    const html = await axios.get(
        'https://www.kooora.com/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/%D9%81%D8%B1%D8%A7%D9%8A%D8%A8%D9%88%D8%B1%D8%AC-%D8%B6%D8%AF-%D8%A3%D8%B3%D8%AA%D9%88%D9%86-%D9%81%D9%8A%D9%84%D8%A7/2Op6fM0M_itShCoOB9azR',
        { headers: HEADERS, timeout: 15000 }
    );
    
    // Find API calls in the page
    const apiMatches = html.data.match(/["'](https?:\/\/[^"']*(?:lineup|injury|squad|player)[^"']*?)["']/gi) || [];
    console.log('\n=== API URLs found in page ===');
    apiMatches.slice(0, 20).forEach(m => console.log(m));
    
    // Find fetch/axios calls
    const fetchMatches = html.data.match(/fetch\(["']([^"']+)["']/g) || [];
    console.log('\n=== Fetch calls ===');
    fetchMatches.slice(0, 10).forEach(m => console.log(m));
    
    // Look for sportfeeds references
    const sfMatches = html.data.match(/sportfeeds[^"'\s]*/g) || [];
    console.log('\n=== Sportfeeds URLs ===');
    [...new Set(sfMatches)].slice(0, 20).forEach(m => console.log(m));
}

(async () => {
    console.log('=== SPORTFEEDS API ===');
    await trySportfeeds();
    
    console.log('\n=== KOOORA API ===');
    await tryKoooraAPI();
    
    console.log('\n=== GRAPHQL ===');
    await tryGraphQL();
    
    console.log('\n=== JS CHUNKS ===');
    await checkJSChunks();
})();
