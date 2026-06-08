const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMatchDetails(relativeLink, matchId) {
    if (!matchId) return null;
    const detailUrl = `https://www.yallakora.com${relativeLink}`;
    const statsUrl = `https://www.yallakora.com/Match/EuroMatchStats2?matchID=${matchId}`;
    const squadUrl = `https://www.yallakora.com/Match/Matchsquad2?matchID=${matchId}`;
    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    const details = {
        stats: [],
        events: [],
        lineups: {
            home: { starters: [], subs: [], coach: '' },
            away: { starters: [], subs: [], coach: '' }
        },
        info: {
            channel: '',
            stadium: '',
            referee: ''
        }
    };
    
    try {
        // 1. Fetch main page (for Events and Info)
        const mainRes = await axios.get(detailUrl, { headers });
        const $main = cheerio.load(mainRes.data);
        
        details.info.channel = $main('.channel.icon-channel').text().trim() || $main('.icon-channel').text().trim();
        details.info.stadium = $main('.stadium.icon-stadium').text().trim() || $main('.icon-stadium').text().trim();
        details.info.referee = $main('.referee.icon-referee').text().trim() || $main('.icon-referee').text().trim();
        
        // Parse events
        $main('.timeline.events ul li').each((i, el) => {
            const min = $main(el).find('.min').text().trim();
            const descText = $main(el).find('.description').text().trim();
            
            const className = $main(el).attr('class') || '';
            let type = 'other';
            if (className.includes('goal')) type = 'goal';
            else if (className.includes('yellowCard')) type = 'yellow';
            else if (className.includes('redCard')) type = 'red';
            else if (className.includes('substitution')) type = 'sub';
            
            let team = 'home';
            if (className.includes('left')) team = 'away';
            
            details.events.push({
                min,
                type,
                team,
                descText
            });
        });
        
    } catch (err) {
        console.error(`Error scraping main details for match ${matchId}:`, err.message);
    }
    
    try {
        // 2. Fetch Stats
        const statsRes = await axios.post(statsUrl, {}, { headers });
        const $stats = cheerio.load(statsRes.data);
        
        $stats('.statsDiv .desc').each((i, el) => {
            const name = $stats(el).text().trim();
            const home = $stats(el).prev('.team.teamA').text().trim();
            const away = $stats(el).next('.team.teamB').text().trim();
            if (name) {
                details.stats.push({ name, home, away });
            }
        });
    } catch (err) {
        console.error(`Error scraping stats for match ${matchId}:`, err.message);
    }
    
    try {
        // 3. Fetch Squads
        const squadRes = await axios.post(squadUrl, {}, { headers });
        const $squad = cheerio.load(squadRes.data);
        
        $squad('.formationTtl').each((i, el) => {
            const title = $squad(el).text().trim();
            if (!title) return;
            
            let teamList = $squad(el).nextAll('.teamList').first();
            if (teamList.length === 0) return;
            
            if (title === 'الأساسي' || title.includes('الأساسي')) {
                // Home starters
                teamList.find('.teamA li').each((j, playerEl) => {
                    const num = $squad(playerEl).find('.playerNum').text().trim() || $squad(playerEl).find('.number').text().trim();
                    const name = $squad(playerEl).find('.playerName').text().trim();
                    if (name) details.lineups.home.starters.push({ num, name });
                });
                // Away starters
                teamList.find('.teamB li').each((j, playerEl) => {
                    const num = $squad(playerEl).find('.playerNum').text().trim() || $squad(playerEl).find('.number').text().trim();
                    const name = $squad(playerEl).find('.playerName').text().trim();
                    if (name) details.lineups.away.starters.push({ num, name });
                });
            } else if (title === 'الإحتياطي' || title.includes('الإحتياطي')) {
                // Home subs
                teamList.find('.teamA li').each((j, playerEl) => {
                    const num = $squad(playerEl).find('.playerNum').text().trim() || $squad(playerEl).find('.number').text().trim();
                    const name = $squad(playerEl).find('.playerName').text().trim();
                    if (name) details.lineups.home.subs.push({ num, name });
                });
                // Away subs
                teamList.find('.teamB li').each((j, playerEl) => {
                    const num = $squad(playerEl).find('.playerNum').text().trim() || $squad(playerEl).find('.number').text().trim();
                    const name = $squad(playerEl).find('.playerName').text().trim();
                    if (name) details.lineups.away.subs.push({ num, name });
                });
            } else if (title === 'المدرب' || title.includes('المدرب')) {
                details.lineups.home.coach = teamList.find('.teamA').text().trim().split('\n')[0].replace(/\s+/g, ' ');
                details.lineups.away.coach = teamList.find('.teamB').text().trim().split('\n')[0].replace(/\s+/g, ' ');
            }
        });
    } catch (err) {
        console.error(`Error scraping squad for match ${matchId}:`, err.message);
    }
    
    return details;
}

async function runTest() {
    const link = '/epl/2968/match/110519/%d8%a8%d9%88%d8%b1%d9%86%d9%85%d9%88%d8%ab-%d9%85%d8%a7%d9%86%d8%b4%d8%b3%d8%aa%d8%b1-%d8%b3%d9%8a%d8%aa%d9%8a-%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d8%a5%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a';
    const matchId = '110519';
    console.log('Scraping match details...');
    const result = await scrapeMatchDetails(link, matchId);
    console.log('=== Parsed Details Output ===');
    console.log(JSON.stringify(result, null, 2));
}

runTest();
