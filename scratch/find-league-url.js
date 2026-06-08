const axios = require('axios');

async function main() {
    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/json,*/*'
    };

    // Get the real URL from the actual kooora matches page to see what league links look like
    const r0 = await axios.get('https://www.kooora.com/كرة-القدم/مباريات-اليوم', { headers: HEADERS, responseType: 'arraybuffer' });
    const html = Buffer.from(r0.data).toString('utf8');
    
    // Find competition links
    const links = [...html.matchAll(/href="([^"]*(?:مسابقة|بطولة|league)[^"]*)"/g)];
    const unique = [...new Set(links.map(l => l[1]))].slice(0, 20);
    console.log('Competition links found:', unique);

    // Also get buildId
    const m = html.match(/"buildId":"([^"]+)"/);
    const buildId = m?.[1];
    console.log('\nBuild ID:', buildId);
}
main().catch(console.error);
