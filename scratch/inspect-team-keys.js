const fs = require('fs');

const raw = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');
const json = JSON.parse(raw);
const data = json.pageProps?.data || {};

console.log('--- TEAM INFO DETAILS ---');
const team = data.team || {};
console.log('team keys:', Object.keys(team));
console.log('team basic:', {
    id: team.id,
    name: team.name,
    codeName: team.codeName,
    image: team.image,
    country: team.country,
    type: team.type,
    sport: team.sport,
    slug: team.link?.slug
});

console.log('\n--- SQUAD DETAILS ---');
const squad = data.tabsInfoSquad || {};
console.log('squad keys:', Object.keys(squad));
if (squad.coach) {
    console.log('coach:', squad.coach);
}
if (Array.isArray(squad.players)) {
    console.log('Players count:', squad.players.length);
    const p0 = squad.players[0] || {};
    console.log('Player 0 structure:', {
        __typename: p0.__typename,
        shirtNumber: p0.shirtNumber,
        position: p0.position,
        person: p0.person ? {
            id: p0.person.id,
            name: p0.person.name,
            image: p0.person.image,
            age: p0.person.age,
            nationality: p0.person.nationality,
            slug: p0.person.link?.slug
        } : null
    });
    // Print all unique positions in the players list
    const positions = [...new Set(squad.players.map(p => p.position))];
    console.log('Unique positions in squad:', positions);
}

console.log('\n--- MATCHES DETAILS ---');
const matches = data.tabsInfoMatches || data.summaryMatches || {};
// Wait, the previous script printed matches keys as [ '0', '1', '2', '3' ... ] meaning it's an array or an object-array.
// Let's print the first item if it's an array, or if it's an object with keys.
const matchesArray = Array.isArray(matches) ? matches : Object.values(matches);
console.log('Matches length:', matchesArray.length);
if (matchesArray.length > 0) {
    const m0 = matchesArray[0] || {};
    console.log('Match 0 competition:', m0.competition?.name);
    console.log('Match 0 matches (if any):', Array.isArray(m0.matches) ? m0.matches.length : 'No matches array');
    const actualMatch = Array.isArray(m0.matches) ? m0.matches[0] : m0;
    console.log('Actual match sample:', {
        id: actualMatch.id,
        startDate: actualMatch.startDate,
        status: actualMatch.status,
        teamA: actualMatch.teamA ? { id: actualMatch.teamA.id, name: actualMatch.teamA.name, logo: actualMatch.teamA.image?.url } : null,
        teamB: actualMatch.teamB ? { id: actualMatch.teamB.id, name: actualMatch.teamB.name, logo: actualMatch.teamB.image?.url } : null,
        score: actualMatch.score,
        link: actualMatch.link
    });
}

console.log('\n--- STANDINGS DETAILS ---');
const standings = data.tabsInfoStandings || data.summaryStandings || {};
const standingsArray = Array.isArray(standings) ? standings : Object.values(standings);
console.log('Standings length:', standingsArray.length);
if (standingsArray.length > 0) {
    const s0 = standingsArray[0] || {};
    console.log('Standing 0 keys:', Object.keys(s0));
    console.log('Standing 0 table keys:', s0.table ? Object.keys(s0.table) : 'No table');
    if (s0.table) {
        console.log('Competition details:', s0.table.competition?.name);
        console.log('Rankings count:', Array.isArray(s0.table.rankings) ? s0.table.rankings.length : 'No rankings');
        if (Array.isArray(s0.table.rankings) && s0.table.rankings.length > 0) {
            const r0 = s0.table.rankings[0];
            console.log('Ranking 0 sample:', {
                position: r0.position,
                played: r0.played,
                won: r0.won,
                drawn: r0.drawn,
                lost: r0.lost,
                points: r0.points,
                team: r0.team ? { id: r0.team.id, name: r0.team.name, logo: r0.team.image?.url } : null
            });
        }
    }
}

console.log('\n--- TOP PLAYERS DETAILS ---');
const topPlayers = data.tabsInfoTopPlayers || {};
console.log('topPlayers keys:', Object.keys(topPlayers));
if (topPlayers.categories) {
    console.log('Categories count:', topPlayers.categories.length);
    topPlayers.categories.forEach(c => {
        console.log(`  Category ${c.name || c.type}:`, Array.isArray(c.players) ? c.players.length : 'No players');
        if (Array.isArray(c.players) && c.players.length > 0) {
            const cp = c.players[0];
            console.log('    Sample player:', {
                value: cp.value,
                player: cp.player ? { id: cp.player.id, name: cp.player.name, image: cp.player.image?.url } : null,
                team: cp.team ? { id: cp.team.id, name: cp.team.name } : null
            });
        }
    });
}
