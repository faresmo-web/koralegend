const axios = require('axios');

async function testUrl(url) {
    try {
        const response = await axios.head(url, { timeout: 5000 });
        console.log(`URL: ${url}`);
        console.log(`  Status: ${response.status}`);
        console.log(`  Content-Length: ${response.headers['content-length'] || 'unknown'} bytes`);
        return true;
    } catch (error) {
        console.log(`URL: ${url}`);
        console.log(`  Failed: ${error.message}`);
        return false;
    }
}

async function run() {
    const urls = [
        'https://cdn.sportfeeds.io/sdl/images/team/crest/medium/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/small/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/mini/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/tiny/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/thumbnail/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/small_logo/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/badge/NbzrG7zzKNBqVcmkeZZbS.png',
        'https://cdn.sportfeeds.io/sdl/images/team/crest/NbzrG7zzKNBqVcmkeZZbS.png'
    ];

    for (const url of urls) {
        await testUrl(url);
    }
}

run();
