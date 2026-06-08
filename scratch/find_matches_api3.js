const axios = require('axios');
const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'ar,en-US;q=0.7',
    'Referer': 'https://www.kooora.com/',
};

async function main() {
    // Fetch the live-scores chunk which handles the matches page
    const chunkUrl = 'https://www.kooora.com/_next/static/chunks/pages/%5Bsports-category%5D/live-scores-b9cdfd005509d431.js';
    console.log('Fetching chunk:', chunkUrl);
    const r = await axios.get(chunkUrl, { headers: H, timeout: 15000 });
    const code = r.data;
    
    // Look for API base URL
    const apiBase = code.match(/["'](https?:\/\/[a-z0-9.-]+\.kooora\.com[^"']*api[^"']*?)["']/gi) || [];
    console.log('\nAPI base URLs:', [...new Set(apiBase)].slice(0, 10));
    
    // Look for fetch with date
    const datePatterns = code.match(/.{0,50}date.{0,100}/g) || [];
    const interesting = datePatterns.filter(p => p.includes('fetch') || p.includes('http') || p.includes('url') || p.includes('param'));
    console.log('\nDate patterns:', interesting.slice(0, 10));
    
    // Look for any URL construction with date
    const urlWithDate = code.match(/[`"'][^`"']*\$\{[^}]*date[^}]*\}[^`"']*[`"']/g) || [];
    console.log('\nURL templates with date:', urlWithDate.slice(0, 5));
    
    // Look for graphql
    const gql = code.match(/graphql|gql|query.*match/gi) || [];
    console.log('\nGraphQL mentions:', [...new Set(gql)].slice(0, 5));
    
    // Look for any endpoint pattern
    const endpoints = code.match(/["']\/(api|v\d|rest)[^"']{5,60}["']/g) || [];
    console.log('\nEndpoints:', [...new Set(endpoints)].slice(0, 10));
    
    // Look for kooora internal API
    const kooApi = code.match(/["']https?:\/\/[^"']*kooora[^"']*["']/gi) || [];
    console.log('\nKooora URLs:', [...new Set(kooApi)].slice(0, 10));
}
main().catch(console.error);
