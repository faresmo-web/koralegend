const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    const matchId = '110519';
    const squadUrl = `https://www.yallakora.com/Match/Matchsquad2?matchID=${matchId}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    try {
        const response = await axios.post(squadUrl, {}, { headers });
        const $ = cheerio.load(response.data);
        
        // Find Starting XI, Substitutes, Coach
        // The formationTtl is "الأساسي", "الإحتياطي", "المدرب"
        $('.formationTtl').each((i, el) => {
            const title = $(el).text().trim();
            if (!title) return; // Skip empty ones
            
            console.log(`\n=================== ${title} ===================`);
            
            // Find the teamList sibling (it might be the sibling of the parent or next sibling)
            let teamList = $(el).nextAll('.teamList').first();
            
            const teamAPlayers = [];
            const teamBPlayers = [];
            
            teamList.find('.teamA .player').each((j, playerEl) => {
                const num = $(playerEl).find('.number').text().trim();
                const name = $(playerEl).find('.playerName').text().trim();
                teamAPlayers.push({ num, name });
            });
            
            teamList.find('.teamB .player').each((j, playerEl) => {
                const num = $(playerEl).find('.number').text().trim();
                const name = $(playerEl).find('.playerName').text().trim();
                teamBPlayers.push({ num, name });
            });
            
            console.log('Team A:', teamAPlayers.slice(0, 5));
            console.log('Team B:', teamBPlayers.slice(0, 5));
            
            if (title === 'المدرب' || title.includes('مدرب')) {
                console.log('Team A Coach:', teamList.find('.teamA').text().trim().split('\n')[0]);
                console.log('Team B Coach:', teamList.find('.teamB').text().trim().split('\n')[0]);
            }
        });
        
    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspect();
