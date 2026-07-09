const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ysscores.com/ar';

async function test() {
    console.log('=== Step 1: Fetch initial page ===');
    const r = await axios.get(`${BASE_URL}/index`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
        responseType: 'arraybuffer'
    });

    const html = Buffer.from(r.data).toString('utf-8');
    const $ = cheerio.load(html);
    const token = $('meta[name="_token"]').attr('content') || '';
    const cookies = r.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

    console.log('Token:', token ? token.substring(0, 10) + '...' : 'MISSING');
    console.log('Cookies:', cookieStr ? cookieStr.substring(0, 80) + '...' : 'NONE');
    console.log('Response headers:', JSON.stringify(r.headers, null, 2).substring(0, 500));

    // Check for XSRF-TOKEN cookie specifically
    const xsrfCookie = cookies?.find(c => c.includes('XSRF-TOKEN'));
    let xsrfToken = '';
    if (xsrfCookie) {
        xsrfToken = decodeURIComponent(xsrfCookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '');
        console.log('XSRF-TOKEN cookie found:', xsrfToken.substring(0, 20) + '...');
    } else {
        console.log('No XSRF-TOKEN cookie found');
    }

    console.log('\n=== Step 2: Test timezone endpoint ===');
    try {
        const tzUrl = `${BASE_URL.replace('/ar', '')}/change_timezone/ksa`;
        console.log('Trying:', tzUrl);
        const tzR = await axios.get(tzUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieStr,
                'Referer': `${BASE_URL}/index`,
                'X-Requested-With': 'XMLHttpRequest',
            },
            timeout: 8000,
            validateStatus: () => true, // Don't throw on error status
        });
        console.log('Timezone response status:', tzR.status);
        console.log('Timezone response data:', typeof tzR.data === 'string' ? tzR.data.substring(0, 200) : JSON.stringify(tzR.data).substring(0, 200));
    } catch (e) {
        console.log('Timezone error:', e.message);
    }

    // Try alternative timezone URLs
    for (const tzPath of [
        '/ar/change_timezone/ksa',
        '/change-timezone/ksa',
        '/ar/change-timezone/ksa',
        '/timezone/ksa',
        '/ar/timezone/ksa',
        '/set-timezone',
    ]) {
        try {
            const tzUrl = `https://www.ysscores.com${tzPath}`;
            const tzR = await axios.get(tzUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Cookie': cookieStr,
                    'Referer': `${BASE_URL}/index`,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 5000,
                validateStatus: () => true,
            });
            console.log(`  ${tzPath} => ${tzR.status}`);
        } catch (e) {
            console.log(`  ${tzPath} => ERROR: ${e.message}`);
        }
    }

    console.log('\n=== Step 3: Test match_date_to POST (the 419 endpoint) ===');
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
    console.log('Date:', today);

    // Test A: Using X-CSRF-Token from meta tag
    const formData = new URLSearchParams();
    formData.append('get_date', today);
    formData.append('favorite_status', 'champ_display');
    formData.append('match_status', '1');
    formData.append('order_status', '1');
    formData.append('clear_c', 'yes');

    try {
        const rA = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-CSRF-Token': token,
                'Cookie': cookieStr,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/index`,
                'Accept': 'text/html, */*; q=0.01',
            },
            timeout: 15000,
            validateStatus: () => true,
            responseType: 'arraybuffer'
        });
        console.log('Test A (X-CSRF-Token from meta):', rA.status);
        if (rA.status === 200) {
            const respHtml = Buffer.from(rA.data).toString('utf-8');
            console.log('Response length:', respHtml.length, 'chars');
            console.log('Has matches-wrapper?', respHtml.includes('matches-wrapper'));
        } else {
            console.log('Response:', Buffer.from(rA.data).toString('utf-8').substring(0, 200));
        }
    } catch (e) {
        console.log('Test A error:', e.message);
    }

    // Test B: Using X-XSRF-TOKEN header (Laravel convention)
    if (xsrfToken) {
        try {
            const rB = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-XSRF-TOKEN': xsrfToken,
                    'Cookie': cookieStr,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${BASE_URL}/index`,
                    'Accept': 'text/html, */*; q=0.01',
                },
                timeout: 15000,
                validateStatus: () => true,
                responseType: 'arraybuffer'
            });
            console.log('Test B (X-XSRF-TOKEN from cookie):', rB.status);
            if (rB.status === 200) {
                const respHtml = Buffer.from(rB.data).toString('utf-8');
                console.log('Response length:', respHtml.length, 'chars');
                console.log('Has matches-wrapper?', respHtml.includes('matches-wrapper'));
            }
        } catch (e) {
            console.log('Test B error:', e.message);
        }
    }

    // Test C: Include _token in form body
    try {
        const formC = new URLSearchParams();
        formC.append('_token', token);
        formC.append('get_date', today);
        formC.append('favorite_status', 'champ_display');
        formC.append('match_status', '1');
        formC.append('order_status', '1');
        formC.append('clear_c', 'yes');

        const rC = await axios.post(`${BASE_URL}/match_date_to`, formC.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-CSRF-Token': token,
                'Cookie': cookieStr,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/index`,
                'Accept': 'text/html, */*; q=0.01',
            },
            timeout: 15000,
            validateStatus: () => true,
            responseType: 'arraybuffer'
        });
        console.log('Test C (_token in body + header):', rC.status);
        if (rC.status === 200) {
            const respHtml = Buffer.from(rC.data).toString('utf-8');
            console.log('Response length:', respHtml.length, 'chars');
            console.log('Has matches-wrapper?', respHtml.includes('matches-wrapper'));
        }
    } catch (e) {
        console.log('Test C error:', e.message);
    }

    // Test D: Both X-XSRF-TOKEN and X-CSRF-Token
    if (xsrfToken) {
        try {
            const formD = new URLSearchParams();
            formD.append('_token', token);
            formD.append('get_date', today);
            formD.append('favorite_status', 'champ_display');
            formD.append('match_status', '1');
            formD.append('order_status', '1');
            formD.append('clear_c', 'yes');

            const rD = await axios.post(`${BASE_URL}/match_date_to`, formD.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-XSRF-TOKEN': xsrfToken,
                    'X-CSRF-Token': token,
                    'Cookie': cookieStr,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': `${BASE_URL}/index`,
                    'Accept': 'text/html, */*; q=0.01',
                },
                timeout: 15000,
                validateStatus: () => true,
                responseType: 'arraybuffer'
            });
            console.log('Test D (both XSRF + CSRF + body _token):', rD.status);
            if (rD.status === 200) {
                const respHtml = Buffer.from(rD.data).toString('utf-8');
                console.log('Response length:', respHtml.length, 'chars');
                console.log('Has matches-wrapper?', respHtml.includes('matches-wrapper'));
            }
        } catch (e) {
            console.log('Test D error:', e.message);
        }
    }

    console.log('\n=== Done ===');
}

test().catch(e => console.error('Fatal:', e.message));
