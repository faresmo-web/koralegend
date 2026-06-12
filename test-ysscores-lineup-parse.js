const cheerio = require('cheerio');
const fs = require('fs');

function test() {
    const html = fs.readFileSync('ys_match_detail.html', 'utf-8');
    const $ = cheerio.load(html);
    
    console.log('=== LINEUP WRAPPER ===');
    const lineupWrap = $('.lineup-wrap');
    console.log('lineupWrap length:', lineupWrap.length);
    
    // Let's print out the HTML of lineupWrap or its child structures
    if (lineupWrap.length > 0) {
        fs.writeFileSync('lineup_wrap.html', lineupWrap.html(), 'utf-8');
        console.log('Saved lineup_wrap.html');
    }
    
    console.log('=== TEAMS LINEUP ===');
    const teamsLineup = $('.teams-lineup');
    console.log('teamsLineup length:', teamsLineup.length);
    if (teamsLineup.length > 0) {
        fs.writeFileSync('teams_lineup.html', teamsLineup.html(), 'utf-8');
        console.log('Saved teams_lineup.html');
        
        // Let's look at the elements inside
        teamsLineup.find('*').each((i, el) => {
            const tag = el.tagName;
            const cls = $(el).attr('class');
            const txt = $(el).text().trim().replace(/\s+/g, ' ');
            if (cls && (cls.includes('coach') || cls.includes('formation') || cls.includes('player') || cls.includes('title') || cls.includes('starters') || cls.includes('subs'))) {
                console.log(`${tag}.${cls}:`, txt.slice(0, 100));
            }
        });
    }

    // Let's search for "coach" or "المدرب" or "formation" in the entire document text
    console.log('=== SEARCHING FOR KEYWORDS IN TEXT ===');
    $('*').each((i, el) => {
        const txt = $(el).text().trim();
        if ($(el).children().length === 0) { // leaf nodes
            if (txt.includes('مدرب') || txt.includes('تشكيل') || txt.includes('خطة') || txt.includes('Coach') || txt.includes('Formation')) {
                console.log(`Leaf [${el.tagName}.${$(el).attr('class') || ''}]:`, txt);
            }
        }
    });
}
test();
