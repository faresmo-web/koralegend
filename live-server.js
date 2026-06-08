// ============================================================
//  KoraLegend Live Server
//  - Serves static files (HTML/CSS/JS)
//  - Proxies kooora.com data every 60 seconds
//  - Exposes /api/matches and /api/match/:id endpoints
//  Usage: node live-server.js
//  Then open: http://localhost:3000
// ============================================================

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const axios  = require('axios');
const webPush = require('web-push');

const PORT     = 3000;
const TIMEZONE = 'Africa/Cairo';
const BASE_URL = 'https://www.kooora.com';
const HEADERS  = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer':         'https://www.kooora.com/',
};

// ── VAPID / Push Setup ───────────────────────────────────────
const VAPID_FILE = path.join(__dirname, 'vapid-keys.json');
const SUBS_FILE  = path.join(__dirname, 'subscriptions.json');

let vapidKeys;
try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
    console.log('🔑 Loaded existing VAPID keys');
} catch {
    vapidKeys = webPush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), 'utf8');
    console.log('🔑 Generated new VAPID keys');
}

webPush.setVapidDetails(
    'mailto:admin@koralegend.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

function loadSubscriptions() {
    try {
        if (fs.existsSync(SUBS_FILE)) return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    } catch { }
    return [];
}

function saveSubscriptions(subs) {
    try { fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2), 'utf8'); } catch { }
}

async function sendPushToAll(payload) {
    const subs = loadSubscriptions();
    const dead = [];
    await Promise.allSettled(
        subs.map(async sub => {
            try {
                await webPush.sendNotification(sub, JSON.stringify(payload));
            } catch (e) {
                if (e.statusCode === 410 || e.statusCode === 404) dead.push(sub.endpoint);
                else console.warn('[Push] Send error:', e.message);
            }
        })
    );
    if (dead.length) saveSubscriptions(subs.filter(s => !dead.includes(s.endpoint)));
}

// ── In-memory cache ──────────────────────────────────────────
let matchesCache   = null;   // { en: {today,yesterday,tomorrow}, ar: {...} }
let lastFetchTime  = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// ── Helpers ──────────────────────────────────────────────────
function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    return m ? JSON.parse(m[1]) : null;
}

function formatTime(startDate) {
    if (!startDate) return '';
    try {
        return new Date(startDate).toLocaleTimeString('ar-EG', {
            hour: '2-digit', minute: '2-digit',
            timeZone: TIMEZONE, hour12: false,
        });
    } catch { return ''; }
}

function mapStatus(m) {
    const s = m.status;
    if (s === 'FIXTURE')   return { en: 'Upcoming',  ar: 'قادمة',    isLive: false, isFinished: false };
    if (s === 'RESULT')    return { en: 'Finished',  ar: 'انتهت',    isLive: false, isFinished: true  };
    if (s === 'POSTPONED') return { en: 'Postponed', ar: 'مؤجلة',   isLive: false, isFinished: false };
    if (s === 'CANCELLED') return { en: 'Cancelled', ar: 'ملغاة',   isLive: false, isFinished: false };
    if (s === 'LIVE' || s === 'IN_PROGRESS') {
        const min  = m.period?.minute;
        const type = m.period?.type;
        if (type === 'HALF_TIME') return { en: 'HT', ar: 'استراحة', isLive: true, isFinished: false };
        return { en: min ? `${min}'` : 'Live', ar: min ? `${min}'` : 'مباشر', isLive: true, isFinished: false };
    }
    return { en: s || 'Unknown', ar: s || 'غير معروف', isLive: false, isFinished: false };
}

async function fetchMatchesForDate(dateStr) {
    const url = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D9%8A%D9%88%D9%85?date=${dateStr}`;
    const r   = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const nd  = extractNextData(r.data);
    return nd?.props?.pageProps?.data || [];
}

function parseCompetitions(competitions, dateLabel) {
    const matches = [];
    for (const comp of competitions) {
        const league     = comp.competition?.name || 'Unknown';
        const leagueLogo = comp.competition?.image?.url || '';
        const area       = comp.competition?.area?.name || '';
        for (const m of (comp.matches || [])) {
            const status = mapStatus(m);
            // Extract round from gameset field
            const roundName = m.gameset?.name || '';

            matches.push({
                id:          m.id || '',
                league,
                leagueLogo,
                countryName: area,
                homeTeam:    m.teamA?.name || 'Home',
                awayTeam:    m.teamB?.name || 'Away',
                homeLogo:    m.teamA?.image?.url || '',
                awayLogo:    m.teamB?.image?.url || '',
                homeScore:   m.score?.teamA ?? null,
                awayScore:   m.score?.teamB ?? null,
                time:        formatTime(m.startDate),
                status:      dateLabel === 'tomorrow' ? 'Upcoming' : status.en,
                statusAr:    dateLabel === 'tomorrow' ? 'قادمة'    : status.ar,
                isLive:      status.isLive,
                isFinished:  status.isFinished,
                date:        dateLabel,
                startTime:   m.startDate || '',
                slug:        m.link?.slug || '',
                koooraId:    m.link?.id   || m.id || '',
                round:       roundName,
            });
        }
    }
    return matches;
}

async function refreshMatches() {
    const now = Date.now();
    if (matchesCache && (now - lastFetchTime) < CACHE_TTL_MS) return matchesCache;

    console.log(`[${new Date().toLocaleTimeString('ar-EG', { timeZone: TIMEZONE })}] 🔄 Fetching fresh data from kooora...`);

    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const fmt = d => d.toISOString().split('T')[0];

    const [ydComps, tdComps, tmComps] = await Promise.all([
        fetchMatchesForDate(fmt(yesterday)),
        fetchMatchesForDate(fmt(today)),
        fetchMatchesForDate(fmt(tomorrow)),
    ]);

    const yd = parseCompetitions(ydComps, 'yesterday');
    const td = parseCompetitions(tdComps, 'today');
    const tm = parseCompetitions(tmComps, 'tomorrow');

    matchesCache = {
        en: { today: td, yesterday: yd, tomorrow: tm },
        ar: {
            today:     td.map(m => ({ ...m, status: m.statusAr })),
            yesterday: yd.map(m => ({ ...m, status: m.statusAr })),
            tomorrow:  tm.map(m => ({ ...m, status: 'قادمة' })),
        },
        lastUpdated: new Date().toISOString(),
    };
    lastFetchTime = now;

    const liveCount = td.filter(m => m.isLive).length;
    console.log(`  ✓ Today: ${td.length} matches (${liveCount} live) | Yesterday: ${yd.length} | Tomorrow: ${tm.length}`);
    return matchesCache;
}

// ── Match detail fetch ────────────────────────────────────────
async function fetchMatchDetail(matchId) {
    // Find match in cache to get slug
    if (!matchesCache) await refreshMatches();
    const allMatches = [
        ...(matchesCache?.en?.today     || []),
        ...(matchesCache?.en?.yesterday || []),
        ...(matchesCache?.en?.tomorrow  || []),
    ];
    const match = allMatches.find(m => m.id === matchId);
    if (!match?.slug) return null;

    const slug = encodeURIComponent(match.slug);
    const url  = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9/${slug}/${match.koooraId}`;
    const r    = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const nd   = extractNextData(r.data);
    const data = nd?.props?.pageProps?.data;
    if (!data) return null;

    const m    = data.match || {};
    const tabs = data.tabsInfo || {};

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

    details.info.stadium = m.venue?.name || '';
    details.info.referee = (m.referees && m.referees[0]?.name) || '';
    const channels = (data.tvChannels || []).map(c => c.name).filter(Boolean);
    details.info.channel = channels.slice(0, 3).join(' | ');

    // Extract round/gameweek from gameset field
    const roundName = m.gameset?.name || '';
    details.info.round = roundName;

    for (const c of (m.commentary || [])) {
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
        else if (type === 'MatchCardEvent') evType = ev.type === 'CARD_YELLOW' ? 'yellow' : 'red';
        else if (type === 'MatchSubstitutionEvent') evType = 'sub';
        const descText = evType === 'sub'
            ? `${ev.playerOut?.name || ''} ↔ ${ev.playerIn?.name || player}`
            : assist ? `${player} (${assist})` : player;
        details.events.push({ min, addedMin: add, type: evType, team: side, descText });
    }

    for (const s of (tabs.stats || m.stats || [])) {
        const name = s.name || s.label || '';
        const home = s.teamA !== undefined ? String(s.teamA) : String(s.home || '');
        const away = s.teamB !== undefined ? String(s.teamB) : String(s.away || '');
        if (name) details.stats.push({ name, home, away });
    }

    const matchLineups = m.lineups || {};
    details.lineups.confirmed = matchLineups.confirmed === true;
    const parseTeam = (teamData, side) => {
        if (!teamData) return;
        details.lineups[side].formation = teamData.formation || '';
        details.lineups[side].coach     = teamData.coach?.name || '';
        for (const entry of (teamData.lineup || [])) {
            const name = entry.person?.name || entry.player?.name || '';
            if (!name) continue;
            const p = {
                num:       String(entry.shirtNumber || ''),
                name,
                image:     entry.person?.image?.url || '',
                x:         entry.pitchPosition?.x ?? null,
                y:         entry.pitchPosition?.y ?? null,
                isCaptain: entry.isCaptain || false,
            };

            if (entry.pitchPosition) details.lineups[side].starters.push(p);
            else                     details.lineups[side].subs.push(p);
        }
    };
    parseTeam(matchLineups.teamA, 'home');
    parseTeam(matchLineups.teamB, 'away');

    return details;
}

// ── Push API handlers ────────────────────────────────────────
function handleVapidPublicKey(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ publicKey: vapidKeys.publicKey }));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
        req.on('error', reject);
    });
}

function jsonOk(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
}

function jsonErr(res, code, msg) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
}

async function handleSubscribeLive(req, res) {
    try {
        const sub = await readBody(req);
        if (!sub || !sub.endpoint) return jsonErr(res, 400, 'Invalid subscription');
        const subs = loadSubscriptions();
        if (!subs.some(s => s.endpoint === sub.endpoint)) {
            subs.push(sub);
            saveSubscriptions(subs);
            console.log(`[Push] New subscriber. Total: ${subs.length}`);
        }
        jsonOk(res, { ok: true, total: subs.length });
    } catch (e) { jsonErr(res, 400, e.message); }
}

async function handleUnsubscribeLive(req, res) {
    try {
        const { endpoint } = await readBody(req);
        if (!endpoint) return jsonErr(res, 400, 'endpoint required');
        const subs    = loadSubscriptions();
        const cleaned = subs.filter(s => s.endpoint !== endpoint);
        saveSubscriptions(cleaned);
        console.log(`[Push] Unsubscribed. Remaining: ${cleaned.length}`);
        jsonOk(res, { ok: true, total: cleaned.length });
    } catch (e) { jsonErr(res, 400, e.message); }
}

// ── Push Notification Daemon ──────────────────────────────────
const livePushState = {
    scores:      {},
    initialized: false,
};

async function livePushDaemonTick() {
    try {
        let allMatches = [];
        if (matchesCache) {
            allMatches = matchesCache.en.today || [];
        } else {
            const d = await refreshMatches().catch(() => null);
            if (d) allMatches = d.en.today || [];
        }

        for (const m of allMatches) {
            const key   = String(m.id || (m.homeTeam + '-' + m.awayTeam));
            const score = `${m.homeScore ?? '-'}-${m.awayScore ?? '-'}`;
            const prev  = livePushState.scores[key];

            if (!livePushState.initialized) {
                livePushState.scores[key] = { score, isLive: m.isLive };
                continue;
            }

            if (!prev) {
                livePushState.scores[key] = { score, isLive: m.isLive };
                if (m.isLive) {
                    await sendPushToAll({ title: `⚽ بدأت المباراة!`, body: `${m.homeTeam} 🆚 ${m.awayTeam}`, icon: m.homeLogo || '/logo.png', data: { url: `/match-details?id=${m.id}` } });
                }
            } else {
                if (!prev.isLive && m.isLive) {
                    await sendPushToAll({ title: `🏁 انطلقت المباراة!`, body: `${m.homeTeam} ضد ${m.awayTeam}`, icon: m.homeLogo || '/logo.png', data: { url: `/match-details?id=${m.id}` } });
                }
                if (prev.score !== score && m.isLive) {
                    await sendPushToAll({ title: `🔥 هدف!`, body: `${m.homeTeam} ${m.homeScore ?? 0} - ${m.awayScore ?? 0} ${m.awayTeam}`, icon: m.homeLogo || '/logo.png', data: { url: `/match-details?id=${m.id}` } });
                }
                livePushState.scores[key] = { score, isLive: m.isLive };
            }
        }
        livePushState.initialized = true;
    } catch (e) {
        console.error('[PushDaemon] Tick error:', e.message);
    }
}

// ── MIME types ────────────────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
};

// ── HTTP Server ───────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];

    // CORS headers (for local dev)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    // ── API: GET /api/matches ──────────────────────────────────
    if (url === '/api/matches') {
        try {
            const data = await refreshMatches();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) {
            console.error('API error:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // ── API: GET /api/match/:id ────────────────────────────────
    const detailMatch = url.match(/^\/api\/match\/(.+)$/);
    if (detailMatch) {
        try {
            const matchId = detailMatch[1];
            const detail  = await fetchMatchDetail(matchId);
            if (!detail) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Match not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(detail));
        } catch (e) {
            console.error('Detail API error:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // ── API: GET /api/details?id=... (alias used by match-details.js) ──
    if (url === '/api/details') {
        const qs      = new URLSearchParams(req.url.split('?')[1] || '');
        const matchId = qs.get('id') || '';
        try {
            const detail = await fetchMatchDetail(matchId);
            if (!detail) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Match not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(detail));
        } catch (e) {
            console.error('Details API error:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // ── Push API endpoints ──────────────────────────────────
    if (url === '/api/vapid-public-key') return handleVapidPublicKey(req, res);
    if (url === '/api/subscribe')        return handleSubscribeLive(req, res);
    if (url === '/api/unsubscribe')      return handleUnsubscribeLive(req, res);

    // ── Static files ───────────────────────────────────────────
    const urlParts = url.split('?');
    const urlPath = urlParts[0];
    const queryString = urlParts[1] ? '?' + urlParts[1] : '';

    // 1. Redirect from .html to clean URL (except index.html)
    if (urlPath.endsWith('.html') && urlPath !== '/index.html') {
        const cleanPath = urlPath.slice(0, -5) + queryString;
        res.writeHead(301, { 'Location': cleanPath });
        res.end();
        return;
    }

    // 2. Resolve target file path
    let fileToServe = '';
    let ext = '';

    if (urlPath === '/' || urlPath === '') {
        fileToServe = path.join(__dirname, 'matches.html');
        ext = '.html';
    } else {
        const diskPath = path.join(__dirname, urlPath);
        ext = path.extname(diskPath);

        if (ext === '') {
            const htmlFilePath = diskPath + '.html';
            if (fs.existsSync(htmlFilePath)) {
                fileToServe = htmlFilePath;
                ext = '.html';
            } else {
                fileToServe = diskPath;
            }
        } else {
            fileToServe = diskPath;
        }
    }

    // Security check: only serve files inside project dir
    if (!fileToServe.startsWith(__dirname)) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    // 3. Serve the file
    fs.readFile(fileToServe, (err, data) => {
        if (err) {
            // Serve 404.html page
            const notFoundPath = path.join(__dirname, '404.html');
            fs.readFile(notFoundPath, (err2, html) => {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(err2 ? '<h1>404 - Not Found</h1>' : html);
            });
            return;
        }
        const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
        // Cache configuration: do not hard-cache CSS/JS during updates, cache images for 1 day
        if (ext === '.css' || ext === '.js') {
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        } else if (ext === '.png' || ext === '.jpg' || ext === '.ico' || ext === '.svg' || ext === '.webp') {
            headers['Cache-Control'] = 'public, max-age=86400, must-revalidate';
        } else if (ext === '.html') {
            headers['Cache-Control'] = 'no-cache';
        }
        res.writeHead(200, headers);
        res.end(data);
    });
});

// ── Start ─────────────────────────────────────────────────────
server.listen(PORT, async () => {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  ⚡ KoraLegend Live Server                    ║');
    console.log(`║  🌐 http://localhost:${PORT}                     ║`);
    console.log('║  🔄 Auto-refresh every 60 seconds             ║');
    console.log('║  🔔 Push notifications enabled                ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    // Pre-warm cache on startup
    try {
        await refreshMatches();
    } catch (e) {
        console.error('Initial fetch failed:', e.message);
    }

    // Seed push state and start intervals
    await livePushDaemonTick().catch(err => console.error('[PushDaemon] Initial seed failed:', err.message));
    setInterval(livePushDaemonTick, 60_000);
});
