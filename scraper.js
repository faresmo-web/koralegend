// ============================================================
//  KoraLegend Scraper — Powered by kooora.com
//  Daemon mode: auto-refreshes every 2 minutes
//  Usage:
//    node scraper.js            (run once)
//    node scraper.js --daemon   (continuous, every 2 min)
//    node scraper.js --daemon --interval=5  (every 5 min)
// ============================================================

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');
const path    = require('path');

// ── Config ──────────────────────────────────────────────────
const TIMEZONE = 'Africa/Cairo';
const BASE_URL = 'https://www.kooora.com';
const HEADERS  = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer':         'https://www.kooora.com/',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Get Build ID ─────────────────────────────────────────────
let cachedBuildId = null;
async function getBuildId() {
    if (cachedBuildId) return cachedBuildId;
    const r = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000 });
    const m = r.data.match(/"buildId":"([^"]+)"/);
    if (!m) throw new Error('Could not find Next.js buildId');
    cachedBuildId = m[1];
    return cachedBuildId;
}

// ── Extract __NEXT_DATA__ from HTML page ─────────────────────
function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!m) return null;
    return JSON.parse(m[1]);
}

// ── Fetch Matches for a Date ─────────────────────────────────
async function fetchMatchesForDate(dateStr) {
    // dateStr: YYYY-MM-DD
    const url = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${dateStr}`;
    try {
        const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const nd = extractNextData(r.data);
        return nd?.props?.pageProps?.data || [];
    } catch (e) {
        console.error(`  ✗ Error fetching matches for ${dateStr}:`, e.message);
        return [];
    }
}

// ── Map kooora status → readable ─────────────────────────────
function mapStatus(m) {
    const s = m.status;
    if (s === 'FIXTURE')    return { en: 'Upcoming', ar: 'قادمة',   isLive: false, isFinished: false };
    if (s === 'RESULT')     return { en: 'Finished', ar: 'انتهت',   isLive: false, isFinished: true  };
    if (s === 'POSTPONED')  return { en: 'Postponed', ar: 'مؤجلة',  isLive: false, isFinished: false };
    if (s === 'CANCELLED')  return { en: 'Cancelled', ar: 'ملغاة',  isLive: false, isFinished: false };
    if (s === 'LIVE' || s === 'IN_PROGRESS') {
        const min = m.period?.minute;
        const type = m.period?.type;
        if (type === 'HALF_TIME') return { en: 'HT', ar: 'استراحة', isLive: true, isFinished: false };
        return { en: min ? `${min}'` : 'Live', ar: min ? `${min}'` : 'مباشر', isLive: true, isFinished: false };
    }
    return { en: s || 'Unknown', ar: s || 'غير معروف', isLive: false, isFinished: false };
}

// ── Format match time ─────────────────────────────────────────
function formatTime(startDate) {
    if (!startDate) return '';
    try {
        return new Date(startDate).toLocaleTimeString('ar-EG', {
            hour: '2-digit', minute: '2-digit',
            timeZone: TIMEZONE, hour12: false
        });
    } catch { return ''; }
}

// ── Parse competitions array → flat matches array ─────────────
function parseCompetitions(competitions, dateLabel) {
    const matches = [];
    for (const comp of competitions) {
        const league     = comp.competition?.name || 'Unknown';
        const leagueLogo = comp.competition?.image?.url || '';
        const area       = comp.competition?.area?.name || '';

        for (const m of (comp.matches || [])) {
            const status = mapStatus(m);
            const homeScore = m.score?.teamA ?? null;
            const awayScore = m.score?.teamB ?? null;

            matches.push({
                id:          m.id || '',
                league,
                leagueLogo,
                countryName: area,
                homeTeam:    m.teamA?.name || 'Home',
                awayTeam:    m.teamB?.name || 'Away',
                homeLogo:    m.teamA?.image?.url || '',
                awayLogo:    m.teamB?.image?.url || '',
                homeId:      m.teamA?.id || '',
                awayId:      m.teamB?.id || '',
                homeScore,
                awayScore,
                time:        formatTime(m.startDate),
                status:      dateLabel === 'tomorrow' ? 'Upcoming' : status.en,
                statusAr:    dateLabel === 'tomorrow' ? 'قادمة'    : status.ar,
                isLive:      status.isLive,
                isFinished:  status.isFinished,
                date:        dateLabel,
                startTime:   m.startDate || '',
                // kooora-specific for detail page
                slug:        m.link?.slug || '',
                koooraId:    m.link?.id   || m.id || '',
            });
        }
    }
    return matches;
}

// ── Fetch Match Details from kooora ──────────────────────────
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

    if (!match.slug || !match.koooraId) return details;

    try {
        const slug = encodeURIComponent(match.slug);
        const url  = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${match.koooraId}`;
        const r    = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const nd   = extractNextData(r.data);
        const data = nd?.props?.pageProps?.data;
        if (!data) return details;

        const m    = data.match || {};
        const tabs = data.tabsInfo || {};

        // ── Stadium & Referee ──
        details.info.stadium = m.venue?.name || '';
        details.info.referee = (m.referees && m.referees[0]?.name) || m.referee?.name || '';

        // ── TV Channels ──
        const channels = (data.tvChannels || []).map(c => c.name).filter(Boolean);
        details.info.channel = channels.slice(0, 3).join(' | ');

        // ── Events from commentary ──
        const commentary = m.commentary || [];
        for (const c of commentary) {
            if (!c.event) continue;
            const ev   = c.event;
            const type = ev.__typename;
            const side = ev.side === 'TEAM_A' ? 'home' : 'away';
            const min  = String(ev.period?.minute || '');
            const add  = String(ev.period?.extra  || '');
            const player = ev.player?.name || ev.scorer?.name || '';
            const assist = ev.assist?.name || '';

            let evType = 'other';
            if (type === 'MatchGoalEvent') {
                evType = 'goal';
                if (ev.type === 'GOAL_PENALTY') evType = 'penalty';
                else if (ev.type === 'GOAL_OWN' || ev.type?.includes('OWN')) evType = 'own-goal';
            }
            else if (type === 'MatchCardEvent') {
                evType = ev.type === 'CARD_YELLOW' ? 'yellow' : 'red';
            } else if (type === 'MatchSubstitutionEvent') evType = 'sub';

            const descText = evType === 'sub'
                ? `${ev.playerOut?.name || ''} ↔ ${ev.playerIn?.name || player}`
                : assist ? `${player} (${assist})` : player;

            details.events.push({ min, addedMin: add, type: evType, team: side, descText });
        }

        // ── Stats ──
        const statsArr = tabs.stats || m.stats || [];
        for (const s of statsArr) {
            const name = s.name || s.label || '';
            const home = s.teamA !== undefined ? String(s.teamA) : String(s.home || '');
            const away = s.teamB !== undefined ? String(s.teamB) : String(s.away || '');
            if (name) details.stats.push({ name, home, away });
        }

        // ── Lineups (from match.lineups — has full player data + pitchPosition) ──
        const matchLineups = m.lineups || {};
        details.lineups.confirmed = matchLineups.confirmed === true;

        const parseMatchTeam = (teamData, side) => {
            if (!teamData) return;
            details.lineups[side].formation = teamData.formation || '';
            details.lineups[side].coach     = teamData.coach?.name || '';
            for (const entry of (teamData.lineup || [])) {
                const name = entry.person?.name || entry.player?.name || '';
                if (!name) continue;
                const p = {
                    num:   String(entry.shirtNumber || ''),
                    name,
                    image: entry.person?.image?.url || '',
                    x:     entry.pitchPosition?.x ?? null,
                    y:     entry.pitchPosition?.y ?? null,
                    isCaptain: entry.isCaptain || false,
                };
                // isSubstitute: no pitchPosition means bench
                if (entry.pitchPosition) details.lineups[side].starters.push(p);
                else                     details.lineups[side].subs.push(p);
            }
        };
        parseMatchTeam(matchLineups.teamA, 'home');
        parseMatchTeam(matchLineups.teamB, 'away');

    } catch (e) {
        console.error(`  ⚠️  Detail error for ${match.homeTeam} vs ${match.awayTeam}:`, e.message);
    }

    return details;
}

// ── Fetch News from kooora ────────────────────────────────────
async function fetchNews() {
    const newsItems = [];
    try {
        const buildId = await getBuildId();
        const url = `${BASE_URL}/_next/data/${buildId}/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1.json`;
        const r   = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const cards = r.data?.pageProps?.cards || [];

        for (const card of cards.slice(0, 30)) {
            if (!card.headline) continue;

            const title = card.headline;
            const image = card.image?.src || card.mobileImage?.src || '';
            const date  = `${card.publishDateString || ''} ${card.publishTimeString || ''}`.trim();
            const href  = card.href || '';
            const link  = href.startsWith('http') ? href : `${BASE_URL}${href}`;
            const tags  = (card.tags || []).map(t => t.name).filter(Boolean);
            const category = tags[0] || 'أخبار كرة القدم';

            let type = 'international';
            const titleLower = title + category;
            if (titleLower.includes('مصر') || titleLower.includes('الأهلي') ||
                titleLower.includes('الزمالك') || titleLower.includes('بيراميدز') ||
                titleLower.includes('الدوري المصري')) {
                type = 'local';
            }

            newsItems.push({ category, title, description: card.teaser || title, date, icon: type === 'local' ? '⚽' : '🌍', type, image, link });
        }
    } catch (e) {
        console.error('  ✗ News fetch error:', e.message);
    }
    return newsItems;
}

// ── Load Existing Match Details Cache ────────────────────────
function loadExistingDetails() {
    const filePath = path.join(__dirname, 'match-details-data.js');
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Find the JSON object - everything between first { and last }
            const start = content.indexOf('{');
            const end   = content.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                return JSON.parse(content.slice(start, end + 1));
            }
        }
    } catch (e) {
        console.log('  ⚠️  Cache load failed, starting fresh:', e.message);
    }
    return {};
}

// ── Main Run ──────────────────────────────────────────────────
async function run() {
    const startTime = Date.now();

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  🏟️  KoraLegend Scraper — kooora.com         ║');
    console.log('╚══════════════════════════════════════════════╝');

    // ── 1. Get Build ID ───────────────────────────────────────
    console.log('\n🔑 Getting build ID...');
    cachedBuildId = null; // reset each run
    const buildId = await getBuildId();
    console.log(`  ✓ Build ID: ${buildId}`);

    // ── 2. Fetch Matches ──────────────────────────────────────
    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const fmt = d => d.toISOString().split('T')[0];

    console.log(`\n⚡ Fetching matches: ${fmt(yesterday)} | ${fmt(today)} | ${fmt(tomorrow)}`);
    const [ydComps, tdComps, tmComps] = await Promise.all([
        fetchMatchesForDate(fmt(yesterday)),
        fetchMatchesForDate(fmt(today)),
        fetchMatchesForDate(fmt(tomorrow)),
    ]);

    const yesterdayMatches = parseCompetitions(ydComps, 'yesterday');
    const todayMatches     = parseCompetitions(tdComps, 'today');
    const tomorrowMatches  = parseCompetitions(tmComps, 'tomorrow');

    console.log(`  ✓ Yesterday: ${yesterdayMatches.length} | Today: ${todayMatches.length} | Tomorrow: ${tomorrowMatches.length}`);

    // ── 3. Build Matches Database ─────────────────────────────
    const matchesDatabase = {
        en: {
            today:     todayMatches,
            yesterday: yesterdayMatches,
            tomorrow:  tomorrowMatches,
        },
        ar: {
            today:     todayMatches.map(m => ({ ...m, status: m.statusAr })),
            yesterday: yesterdayMatches.map(m => ({ ...m, status: m.statusAr })),
            tomorrow:  tomorrowMatches.map(m => ({ ...m, status: 'قادمة' })),
        },
    };

    // ── 4. Write matches-data.js ──────────────────────────────

    const matchesFilePath = path.join(__dirname, 'matches-data.js');
    const matchesCode = `// Matches Database (Auto-generated by KoraLegend Scraper — kooora.com)
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

    // ── Smart status: if data says "Upcoming" but match start time has passed by 2h+, treat as stale ──
    let isLive = match.isLive, isFinished = match.isFinished;
    let isUpcoming = !isLive && !isFinished;
    let isStale = false;

    if (isUpcoming && match.startTime) {
        const startMs = new Date(match.startTime).getTime();
        const nowMs   = Date.now();
        // If match was supposed to start more than 2 hours ago, data is stale
        if (nowMs > startMs + 2 * 60 * 60 * 1000) {
            isStale   = true;
            isUpcoming = false;
        }
    }

    let centerHtml = '', statusBadge = '';
    if (dateType === 'tomorrow' || isUpcoming) {
        centerHtml  = \`<div class="match-time-badge">\${match.time}</div><div class="match-vs-badge">\${currentLang==='en'?'VS':'ضد'}</div>\`;
        statusBadge = \`<span class="match-status-badge status-upcoming">\${currentLang==='en'?'Upcoming':'قادمة'}</span>\`;
    } else if (isStale) {
        // Data is outdated — show time but no score, with a "?" indicator
        centerHtml  = \`<div class="match-time-badge">\${match.time}</div><div class="match-score-badge" style="opacity:0.5;"><span class="score-num">?</span><span class="score-divider">-</span><span class="score-num">?</span></div>\`;
        statusBadge = \`<span class="match-status-badge status-finished" style="opacity:0.6;">\${currentLang==='en'?'Result N/A':'النتيجة غير متوفرة'}</span>\`;
    } else {
        const hs = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '-';
        const as = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '-';
        centerHtml  = \`<div class="match-time-badge">\${match.time}</div><div class="match-score-badge \${isLive?'live':''}"><span class="score-num">\${hs}</span><span class="score-divider">-</span><span class="score-num">\${as}</span></div>\`;
        const displayStatus = currentLang==='ar' ? (match.statusAr||match.status) : match.status;
        statusBadge = \`<span class="match-status-badge \${isLive?'status-live':'status-finished'}">\${displayStatus}</span>\`;
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

    // ── 5. Fetch Match Details ────────────────────────────────
    const allMatches = [...yesterdayMatches, ...todayMatches, ...tomorrowMatches];
    const existingDetails = loadExistingDetails();
    const matchDetailsDatabase = {};
    const MAX_SCRAPES = 40;
    let scraped = 0, cached = 0, skipped = 0;

    // Prioritize: live > today upcoming > today finished > yesterday > tomorrow
    const prioritized = [
        ...allMatches.filter(m => m.isLive),
        ...allMatches.filter(m => m.date === 'today' && !m.isLive && !m.isFinished),
        ...allMatches.filter(m => m.date === 'today' && m.isFinished),
        ...allMatches.filter(m => m.date === 'yesterday'),
        ...allMatches.filter(m => m.date === 'tomorrow'),
    ];
    const seen = new Set();
    const deduped = prioritized.filter(m => { if (!m.id || seen.has(m.id)) return false; seen.add(m.id); return true; });

    console.log(`\n📊 Fetching details for ${deduped.length} matches (max ${MAX_SCRAPES} fresh)...`);

    for (let i = 0; i < deduped.length; i++) {
        const m = deduped[i];
        if (!m.id) { skipped++; continue; }

        const alreadyHas = existingDetails[m.id];
        // Use cache only if: match is finished/tomorrow AND cache has actual lineup data
        const cacheHasLineups = alreadyHas?.lineups?.home?.starters?.length > 0 || alreadyHas?.lineups?.away?.starters?.length > 0;
        const cacheHasEvents  = alreadyHas?.events?.length > 0;
        const cacheIsRich     = cacheHasLineups || cacheHasEvents;

        if (alreadyHas && (m.isFinished || m.date === 'tomorrow') && cacheIsRich) {
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

    // ── 6. Write match-details-data.js ────────────────────────
    const detailsCode = `// Match Details Database (Auto-generated by KoraLegend Scraper — kooora.com)
// Last updated: ${new Date().toISOString()}
const matchDetailsDatabase = ${JSON.stringify(matchDetailsDatabase, null, 4)};
`;
    fs.writeFileSync(path.join(__dirname, 'match-details-data.js'), detailsCode, 'utf-8');
    console.log('  ✓ Wrote match-details-data.js');

    // ── 7. Fetch & Write News ─────────────────────────────────
    console.log('\n📰 Fetching news from kooora...');
    const newsItems = await fetchNews();
    console.log(`  ✓ Got ${newsItems.length} news articles`);

    const newsDatabase = { en: { all: newsItems }, ar: { all: newsItems } };
    const newsCode = `// News Database (Auto-generated by KoraLegend Scraper — kooora.com)
// Last updated: ${new Date().toISOString()}
const newsDatabase = ${JSON.stringify(newsDatabase, null, 4)};

let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedCategory = this.getAttribute('data-category');
            loadNewsContent();
        });
    });
});

function loadNewsContent() {
    const container = document.getElementById('newsGrid');
    if (!container) return;
    let news = newsDatabase[currentLang].all;
    if (selectedCategory !== 'all') news = news.filter(item => item.type === selectedCategory);
    container.innerHTML = '';
    if (news.length === 0) {
        container.innerHTML = \`<div style="text-align:center;padding:3rem;color:var(--text-secondary);grid-column:1/-1;"><h3>\${currentLang==='en'?'No news found':'لا توجد أخبار'}</h3></div>\`;
        return;
    }
    news.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.animation = \`slideUp 0.6s ease-out \${index*0.08}s backwards\`;
        const imageHtml = item.image
            ? \`<img src="\${item.image}" alt="\${item.title}" class="news-image-img" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=font-size:3rem>📰</span>';">\`
            : \`<span style="font-size:3rem;">📰</span>\`;
        const cardContent = \`
            <div class="news-image" style="height:240px;display:flex;align-items:center;justify-content:center;background:rgba(0,102,255,0.1);overflow:hidden;">\${imageHtml}</div>
            <div class="news-content">
                <span class="news-category">\${item.category}</span>
                <h3 class="news-title">\${item.title}</h3>
                <p class="news-description">\${item.description||''}</p>
                <div class="news-date">\${item.date}</div>
            </div>\`;
        if (item.link) {
            const a = document.createElement('a');
            a.href = item.link; a.target = '_blank';
            a.className = 'news-card-link';
            a.style.cssText = 'text-decoration:none;color:inherit;display:block;';
            a.appendChild(card);
            card.innerHTML = cardContent;
            container.appendChild(a);
        } else {
            card.innerHTML = cardContent;
            container.appendChild(card);
        }
    });
}
`;
    fs.writeFileSync(path.join(__dirname, 'news-data.js'), newsCode, 'utf-8');
    console.log('  ✓ Wrote news-data.js');

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
