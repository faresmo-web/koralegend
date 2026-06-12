const { fetchMatchesForDate, fetchMatchDetails, resolveMatchUrl } = require('./ysscores');

async function run() {
    console.log("=== Testing fetchMatchesForDate ===");
    // test yesterday matches
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const dateStr = d.toISOString().split('T')[0];
    
    const matches = await fetchMatchesForDate(dateStr, 'الأمس');
    console.log(`Found ${matches.length} matches for ${dateStr}.`);
    
    // find a match that is finished
    const finishedMatch = matches.find(m => m.isFinished && m.homeScore !== null);
    if (finishedMatch) {
        console.log("Finished match found:", finishedMatch.homeTeam, finishedMatch.homeScore, "-", finishedMatch.awayScore, finishedMatch.awayTeam, "Status:", finishedMatch.statusAr);
        const url = resolveMatchUrl(finishedMatch.matchUrl || finishedMatch.slug);
        console.log("Details URL:", url);
        
        console.log("=== Testing fetchMatchDetails ===");
        const details = await fetchMatchDetails(url);
        console.log("Info:", details.info);
        console.log("Stats count:", details.stats.length);
        console.log("Events count:", details.events.length);
        console.log("Lineup Confirmed:", details.lineups.confirmed);
        console.log("Home Starters:", details.lineups.home.starters.length, "Subs:", details.lineups.home.subs.length, "Coach:", details.lineups.home.coach);
        console.log("Away Starters:", details.lineups.away.starters.length, "Subs:", details.lineups.away.subs.length, "Coach:", details.lineups.away.coach);
    } else {
        console.log("No finished match found.");
    }
}
run();
