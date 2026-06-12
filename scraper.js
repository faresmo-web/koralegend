// ============================================================
//  KoraLegend Scraper — Powered by YSScores (ysscores.com)
//  Daemon mode: auto-refreshes every 2 minutes
//  Usage:
//    node scraper.js            (run once)
//    node scraper.js --daemon   (continuous, every 2 min)
// ============================================================

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');
const path    = require('path');

// ── Config ──────────────────────────────────────────────────
const TIMEZONE = 'Africa/Cairo';
const BASE_URL = 'https://www.ysscores.com/ar';

const sleep = ms => new Promise(r => setTimeout(r, ms));

let sessionToken = '';
let sessionCookie = '';

// ── Initialize Session (Get CSRF Token) ─────────────────────
async function initSession() {
    try {
        const r = await axios.get(`${BASE_URL}/index`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(r.data);
        sessionToken = $('meta[name="_token"]').attr('content') || '';
        const cookies = r.headers['set-cookie'];
        sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
        return $;
    } catch (e) {
        console.error('  ✗ Error initializing session:', e.message);
        return null;
    }
}

// ── Fetch Matches for a Date ─────────────────────────────────
async function fetchMatchesForDate(dateStr) {
    if (!sessionToken) return [];
    
    try {
        const formData = new URLSearchParams();
        formData.append('get_date', dateStr);
        formData.append('favorite_status', 'champ_display');
        formData.append('match_status', '1');
        formData.append('order_status', '1');
        formData.append('clear_c', 'yes');

        const r = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'X-CSRF-Token': sessionToken,
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${BASE_URL}/index`
            },
            timeout: 15000
        });
        
        return cheerio.load(r.data);
    } catch (e) {
        console.error(`  ✗ Error fetching matches for ${dateStr}:`, e.message);
        return null;
    }
}

// ── Extract Matches from Cheerio object ─────────────────────
function extractMatchesFromHTML($, dateLabel, dateStr) {
    const matches = [];
    if (!$) return matches;

    $('.matches-wrapper').each((i, el) => {
        const league = $(el).find('a.champ-title b').text().trim();
        const leagueLogo = $(el).find('a.champ-title img').attr('src') || '';
        
        $(el).find('.ajax-match-item').each((j, matchEl) => {
            const id = $(matchEl).attr('match_id');
            const homeTeam = $(matchEl).attr('home_name');
            const awayTeam = $(matchEl).attr('away_name');
            const homeLogo = $(matchEl).attr('home_image') || '';
            const awayLogo = $(matchEl).attr('away_image') || '';
            const matchLink = $(matchEl).attr('href') || '';
            
            let time = '';
            let isLive = $(matchEl).hasClass('live-match');
            let isFinished = false;
            let status = 'قادمة'; // default upcoming
            let statusEn = 'Upcoming';
            
            const resultWrap = $(matchEl).find('.result-wrap');
            const matchDate = resultWrap.find('.match-date').text().trim();
            if (matchDate) {
                time = matchDate; // e.g. "05:00 م"
            }
            
            // Extract Score if finished or live
            let homeScore = '-';
            let awayScore = '-';
            const scoreWrap = resultWrap.find('.match-score');
            if (scoreWrap.length) {
                homeScore = scoreWrap.find('.score-num').first().text().trim();
                awayScore = scoreWrap.find('.score-num').last().text().trim();
            }

            const statusText = resultWrap.find('.match-status').text().trim() || resultWrap.find('.match-status-end').text().trim();
            if (statusText) {
                status = statusText;
                if (statusText.includes('انتهت')) {
                    isFinished = true;
                    statusEn = 'Finished';
                }
            }
            if (isLive) {
                status = 'مباشر';
                statusEn = 'Live';
                // Try to get live minute
                const liveMin = $(matchEl).find('.match-time').text().trim();
                if (liveMin) {
                    status = liveMin;
                    statusEn = liveMin;
                }
            }
            
            matches.push({
                id,
                league,
                leagueLogo,
                homeTeam,
                awayTeam,
                homeLogo,
                awayLogo,
                homeScore: homeScore !== '-' ? homeScore : null,
                awayScore: awayScore !== '-' ? awayScore : null,
                time,
                statusEn,
                statusAr: status,
                status: status,
                isLive,
                isFinished,
                date: dateLabel,
                matchLink,
                startTime: `${dateStr}T00:00:00` // Mocked start time for now
            });
        });
    });
    
    return matches;
}

// ── Fetch Match Details from YSScores ──────────────────────────
async function fetchMatchDetails(match) {
    const details = {
        stats:   [],
        events:  [],
        lineups: {
            confirmed: false,
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' },
    };

    if (!match.matchLink) return details;

    try {
        const r = await axios.get(match.matchLink, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const $ = cheerio.load(r.data);
        
        // Channel / Info parsing (stubbed as YSScores uses different layout)
        details.info.stadium = $('.stadium-name').text().trim();
        details.info.channel = $('.channel-name').text().trim();
        details.info.referee = $('.referee-name').text().trim();
        
        // Stats parsing stub
        // YSScores loads stats via ajax tabs, so we might need extra POST requests
        // We'll leave it empty for now to keep it lightweight.

    } catch (e) {
        console.error(`  ⚠️  Detail error for ${match.homeTeam} vs ${match.awayTeam}:`, e.message);
    }

    return details;
}

// ── Load Existing Match Details Cache ────────────────────────
function loadExistingDetails() {
    const filePath = path.join(__dirname, 'match-details-data.js');
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const start = content.indexOf('{');
            const end   = content.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                return JSON.parse(content.slice(start, end + 1));
            }
        }
    } catch (e) {
        console.log('  ⚠️  Cache load failed:', e.message);
    }
    return {};
}

// ── Main Run ──────────────────────────────────────────────────
async function run() {
    const startTime = Date.now();

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  🏟️  KoraLegend Scraper — YSScores           ║');
    console.log('╚══════════════════════════════════════════════╝');

    console.log('\n🔑 Initializing Session...');
    const $today = await initSession();
    if (!$today) {
        console.log('Failed to initialize session. Exiting.');
        return;
    }
    console.log(`  ✓ Token: ${sessionToken}`);

    // ── Fetch Matches ──────────────────────────────────────
    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const fmt = d => d.toISOString().split('T')[0];

    console.log(`\n⚡ Fetching matches: ${fmt(yesterday)} | ${fmt(today)} | ${fmt(tomorrow)}`);
    
    // Today's matches are already in $today HTML
    const todayMatches = extractMatchesFromHTML($today, 'today', fmt(today));

    // Fetch Yesterday & Tomorrow via POST
    const [$yesterday, $tomorrow] = await Promise.all([
        fetchMatchesForDate(fmt(yesterday)),
        fetchMatchesForDate(fmt(tomorrow)),
    ]);

    const yesterdayMatches = extractMatchesFromHTML($yesterday, 'yesterday', fmt(yesterday));
    const tomorrowMatches  = extractMatchesFromHTML($tomorrow, 'tomorrow', fmt(tomorrow));

    console.log(`  ✓ Yesterday: ${yesterdayMatches.length} | Today: ${todayMatches.length} | Tomorrow: ${tomorrowMatches.length}`);

    // ── Build Matches Database ─────────────────────────────
    const matchesDatabase = {
        en: {
            today:     todayMatches.map(m => ({ ...m, status: m.statusEn })),
            yesterday: yesterdayMatches.map(m => ({ ...m, status: m.statusEn })),
            tomorrow:  tomorrowMatches.map(m => ({ ...m, status: m.statusEn })),
        },
        ar: {
            today:     todayMatches,
            yesterday: yesterdayMatches,
            tomorrow:  tomorrowMatches,
        },
    };

    // ── Write matches-data.js ──────────────────────────────
    const matchesFilePath = path.join(__dirname, 'matches-data.js');
    const matchesCode = `// Matches Database (Auto-generated by KoraLegend Scraper — YSScores)
// Last updated: ${new Date().toISOString()}
const matchesDatabase = ${JSON.stringify(matchesDatabase, null, 4)};

// Filters
let selectedLeague = 'all';
let selectedDate = 'today';

document.addEventListener('DOMContentLoaded', function() {
    const leagueFilter = document.getElementById('leagueFilter');
    const dateFilter = document.getElementById('dateFilter');
    if (leagueFilter) leagueFilter.addEventListener('change', e => { selectedLeague = e.target.value; loadMatchesContent(); });
    if (dateFilter)   dateFilter.addEventListener('change',   e => { selectedDate   = e.target.value; loadMatchesContent(); });
});

function loadMatchesContent() {
    const container = document.getElementById('matchesList');
    if (!container) return;
    const matches = matchesDatabase[currentLang][selectedDate];
    container.innerHTML = '';
    const filteredMatches = selectedLeague === 'all' ? matches : matches.filter(m => matchesLeagueFilter(m.league, selectedLeague));
    if (filteredMatches.length === 0) {
        container.innerHTML = \`<div style="text-align:center;padding:3rem;color:var(--text-secondary);"><h3>\${currentLang==='en'?'No matches found':'لا توجد مباريات'}</h3></div>\`;
        return;
    }
    const groups = {};
    filteredMatches.forEach(match => {
        if (!groups[match.league]) groups[match.league] = { name: match.league, logo: match.leagueLogo, matches: [] };
        groups[match.league].matches.push(match);
    });
    Object.values(groups).forEach((group, gi) => {
        const lg = document.createElement('div');
        lg.className = 'league-group';
        lg.style.animation = \`slideUp 0.6s ease-out \${gi*0.15}s backwards\`;
        const logoHtml = group.logo ? \`<img src="\${group.logo}" alt="\${group.name}" class="league-group-logo" onerror="this.style.display='none';" loading="lazy">\` : '';
        lg.innerHTML = \`<div class="league-group-header">\${logoHtml}<span class="league-group-title">\${group.name}</span></div><div class="league-matches-list"></div>\`;
        const list = lg.querySelector('.league-matches-list');
        group.matches.forEach(match => list.appendChild(createMatchRow(match, selectedDate)));
        container.appendChild(lg);
    });
}

function matchesLeagueFilter(league, filter) {
    const map = {
        'premier':    ['الدوري الإنجليزي','Premier League'],
        'laliga':     ['الدوري الإسباني','La Liga','LaLiga'],
        'seriea':     ['الدوري الإيطالي','Serie A'],
        'bundesliga': ['الدوري الألماني','Bundesliga'],
        'ligue1':     ['الدوري الفرنسي','Ligue 1'],
        'egyptian':   ['الدوري المصري','Egyptian Premier League','كأس مصر'],
        'worldcup':   ['كأس العالم','World Cup'],
        'spl':        ['الدوري السعودي','Saudi Pro League','دوري روشن'],
        'ucl':        ['دوري أبطال أوروبا','Champions League'],
        'uel':        ['الدوري الأوروبي','Europa League'],
    };
    if (!map[filter]) return false;
    return map[filter].some(l => league.toLowerCase().includes(l.toLowerCase()));
}

function createMatchRow(match, dateType) {
    const row = document.createElement('div');
    row.className = 'match-row-item';
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => { if (match.id) window.location.href = \`match-details.html?id=\${match.id}\`; });
    const renderLogo = (logo, name) => logo
        ? \`<img src="\${logo}" alt="\${name}" class="team-logo-small" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=emoji-logo-small>⚽</span>';">\`
        : '<span class="emoji-logo-small">⚽</span>';

    let centerHtml = '', statusBadge = '';
    const isLive = match.isLive;
    const isFinished = match.isFinished;
    const isUpcoming = !isLive && !isFinished;

    if (dateType === 'tomorrow' || isUpcoming) {
        centerHtml  = \`<div class="match-time-badge">\${match.time}</div><div class="match-vs-badge">\${currentLang==='en'?'VS':'ضد'}</div>\`;
        statusBadge = \`<span class="match-status-badge status-upcoming">\${match.status}</span>\`;
    } else {
        const hs = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '-';
        const as = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '-';
        centerHtml  = \`<div class="match-time-badge">\${match.time}</div><div class="match-score-badge \${isLive?'live':''}"><span class="score-num">\${hs}</span><span class="score-divider">-</span><span class="score-num">\${as}</span></div>\`;
        statusBadge = \`<span class="match-status-badge \${isLive?'status-live':'status-finished'}">\${match.status}</span>\`;
    }
    row.innerHTML = \`
        <div class="match-team home"><span class="match-team-name">\${match.homeTeam}</span><div class="team-logo-container">\${renderLogo(match.homeLogo,match.homeTeam)}</div></div>
        <div class="match-info-center">\${centerHtml}\${statusBadge}</div>
        <div class="match-team away"><div class="team-logo-container">\${renderLogo(match.awayLogo,match.awayTeam)}</div><span class="match-team-name">\${match.awayTeam}</span></div>
    \`;
    return row;
}
`;
    fs.writeFileSync(matchesFilePath, matchesCode, 'utf-8');
    console.log('  ✓ Wrote matches-data.js');

    // ── Fetch Match Details ────────────────────────────────
    const allMatches = [...yesterdayMatches, ...todayMatches, ...tomorrowMatches];
    const existingDetails = loadExistingDetails();
    const matchDetailsDatabase = {};
    const MAX_SCRAPES = 40;
    let scraped = 0, cached = 0, skipped = 0;

    const deduped = allMatches.filter((m, i, self) => m.id && self.findIndex(s => s.id === m.id) === i);

    console.log(`\n📊 Fetching details for ${deduped.length} matches (max ${MAX_SCRAPES} fresh)...`);

    for (let i = 0; i < deduped.length; i++) {
        const m = deduped[i];
        if (!m.id) { skipped++; continue; }

        const alreadyHas = existingDetails[m.id];
        // Only use cache if the match is finished (so details don't change)
        if (alreadyHas && (m.isFinished || m.date === 'tomorrow')) {
            matchDetailsDatabase[m.id] = alreadyHas;
            cached++;
            continue;
        }
        if (scraped >= MAX_SCRAPES) {
            if (alreadyHas) matchDetailsDatabase[m.id] = alreadyHas;
            skipped++;
            continue;
        }

        process.stdout.write(`  ⚡ [${i+1}/${deduped.length}] ${m.homeTeam} vs ${m.awayTeam}...`);
        const details = await fetchMatchDetails(m);
        matchDetailsDatabase[m.id] = details;
        scraped++;
        process.stdout.write(' ✓\n');
        await sleep(300);
    }

    console.log(`\n  📈 ${scraped} scraped | ${cached} cached | ${skipped} skipped`);

    // ── Write match-details-data.js ────────────────────────
    const detailsCode = `// Match Details Database (Auto-generated by KoraLegend Scraper — YSScores)
// Last updated: ${new Date().toISOString()}
const matchDetailsDatabase = ${JSON.stringify(matchDetailsDatabase, null, 4)};
`;
    fs.writeFileSync(path.join(__dirname, 'match-details-data.js'), detailsCode, 'utf-8');
    console.log('  ✓ Wrote match-details-data.js');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done in ${elapsed}s — ${new Date().toLocaleTimeString('ar-EG', { timeZone: TIMEZONE })}\n`);
    return elapsed;
}

// ── Daemon Mode ───────────────────────────────────────────────
(async () => {
    const args        = process.argv.slice(2);
    const isDaemon    = args.includes('--daemon') || args.includes('-d');
    const intervalArg = args.find(a => a.startsWith('--interval='));
    const intervalMin = intervalArg ? parseInt(intervalArg.split('=')[1]) || 2 : 2;
    const intervalMs  = intervalMin * 60 * 1000;

    if (isDaemon) {
        console.log(`\n🤖 Daemon Mode — every ${intervalMin} min. Ctrl+C to stop.\n`);
        while (true) {
            try { await run(); } catch (e) { console.error('Run error:', e.message); }
            let remaining = intervalMs / 1000;
            const iv = setInterval(() => {
                remaining--;
                if (remaining <= 0) { clearInterval(iv); return; }
                const m = String(Math.floor(remaining/60)).padStart(2,'0');
                const s = String(remaining%60).padStart(2,'0');
                process.stdout.write(`\r  ⏱️  Next run in: ${m}:${s}   `);
            }, 1000);
            await sleep(intervalMs);
        }
    } else {
        try { await run(); } catch (e) { console.error('Fatal error:', e.message); process.exit(1); }
    }
})();
