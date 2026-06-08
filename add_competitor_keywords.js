const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\EssaM\\Documents\\GitHub\\koralegend2';
const files = ['index.html', 'matches.html', 'news.html', 'match-details.html', 'team.html', 'league.html', 'player.html', 'article.html'];

const competitorKeywords = "يلا شوت, كووورة, kooora, yalla shoot, في الجول, filgoal, كورة لايف, kora live, يلا كورة, yallakora, 365scores, بطولات, مباريات اليوم بث مباشر, كورة 365, بث مباشر مباريات";

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find existing meta keywords
        const keywordsRegex = /<meta name="keywords" content="([^"]+)">/g;
        let match;
        let hasKeywords = false;
        
        content = content.replace(keywordsRegex, (match, p1) => {
            hasKeywords = true;
            // Check if competitor keywords are already there
            if (!p1.includes('yalla shoot')) {
                return `<meta name="keywords" content="${p1}, ${competitorKeywords}">`;
            }
            return match;
        });
        
        if (!hasKeywords) {
            // Add if it doesn't exist, before robots or author
            content = content.replace('<meta name="robots"', `<meta name="keywords" content="kora legend, ${competitorKeywords}">\n    <meta name="robots"`);
        }
        
        // Also update description slightly to rank for those searches 
        // e.g., adding "البديل الأفضل لمواقع يلا شوت وكووورة"
        const descRegex = /<meta name="description" content="([^"]+)">/g;
        content = content.replace(descRegex, (match, p1) => {
            if (!p1.includes('يلا شوت')) {
                return `<meta name="description" content="${p1} بديلك الأفضل لمتابعة المباريات مثل يلا شوت وكووورة.">`;
            }
            return match;
        });

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
