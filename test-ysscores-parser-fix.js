const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('yesterday_matches.html', 'utf-8');
    const $ = cheerio.load(html);
    
    $('.ajax-match-item').each((i, matchEl) => {
        const id = $(matchEl).attr('match_id') || '';
        const homeTeam = $(matchEl).attr('home_name') || '';
        const awayTeam = $(matchEl).attr('away_name') || '';
        
        const resultWrap = $(matchEl).find('.result-wrap');
        const timeEl = resultWrap.find('.match-date, .match-time-before');
        const time = timeEl.text().trim() || '';

        let homeScore = null;
        let awayScore = null;
        
        // Find score elements
        const scoreEls = resultWrap.find('.first-team-result, .second-team-result, .score-num, .result-score .score');
        if (scoreEls.length >= 2) {
            const h = parseInt(scoreEls.eq(0).text().trim());
            const a = parseInt(scoreEls.eq(1).text().trim());
            if (!isNaN(h)) homeScore = h;
            if (!isNaN(a)) awayScore = a;
        }

        const isLive = $(matchEl).hasClass('live-match') ||
                       $(matchEl).find('.live-icon, .live-label').length > 0;

        let isFinished = false;
        let statusAr = 'قادمة';

        const statusEl = resultWrap.find('.match-status, .match-status-end, .match-time-text, .result-status-text, .result-status');
        const statusText = statusEl.text().trim();
        if (statusText) {
            statusAr = statusText;
            if (statusText.includes('انتهت') || statusText.includes('انتهى')) {
                isFinished = true;
                statusAr = 'انتهت';
            } else if (statusText.includes('الغيت') || statusText.includes('ملغاة')) {
                statusAr = 'ملغاة';
            } else if (statusText.includes('مؤجلة')) {
                statusAr = 'مؤجلة';
            }
        }

        console.log(`Match ${id}: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam} | Status: ${statusAr} | isFinished: ${isFinished}`);
    });
}
test();
